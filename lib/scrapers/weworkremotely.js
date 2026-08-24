import { detectRegion, extractStacks, normalizeType } from '../normalize.js';

const FEEDS = [
  { url: 'https://weworkremotely.com/categories/remote-programming-jobs.rss', category: 'Tech & Software' },
  { url: 'https://weworkremotely.com/categories/remote-customer-support-jobs.rss', category: 'Customer Support' },
  { url: 'https://weworkremotely.com/categories/remote-management-and-finance-jobs.rss', category: 'Finance & Accounting' },
  { url: 'https://weworkremotely.com/categories/remote-marketing-jobs.rss', category: 'Marketing & Sales' },
  { url: 'https://weworkremotely.com/categories/remote-design-jobs.rss', category: 'Design & Creative' },
];

function parseXmlTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (!match) return '';
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim();
}

export async function scrapeWeWorkRemotely() {
  console.log('[Scraper:WeWorkRemotely] Fetching RSS feeds...');
  try {
    const results = await Promise.allSettled(
      FEEDS.map(async (feed) => {
        const res = await fetch(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LogJobsNG/1.0; +https://logjob.ng)',
            'Accept': 'application/rss+xml, application/xml, text/xml',
          },
          signal: AbortSignal.timeout(8000),
          next: { revalidate: 1800 },
        });

        if (!res.ok) return [];
        const xml = await res.text();
        const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

        return items.map((itemXml) => {
          const titleRaw = parseXmlTag(itemXml, 'title');
          // Format usually: "Company: Job Title"
          let company = '';
          let title = titleRaw;
          if (titleRaw.includes(':')) {
            const parts = titleRaw.split(':');
            company = parts[0].trim();
            title = parts.slice(1).join(':').trim();
          }

          const link = parseXmlTag(itemXml, 'link') || parseXmlTag(itemXml, 'guid');
          const pubDate = parseXmlTag(itemXml, 'pubDate');
          const description = parseXmlTag(itemXml, 'description');

          return {
            id: `wwr-${Buffer.from(link || title).toString('base64').substring(0, 16)}`,
            title: title || titleRaw,
            company: company || 'Verified Global Employer',
            location: 'Remote (Worldwide)',
            region: 'Remote',
            type: normalizeType(parseXmlTag(itemXml, 'type') || 'Full Time'),
            stacks: [
              feed.category,
              ...extractStacks(`${title} ${description}`),
            ],
            salary: '',
            url: link,
            postedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            source: 'WeWorkRemotely',
            logo: '',
          };
        });
      })
    );

    const allJobs = results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    console.log(`[Scraper:WeWorkRemotely] Successfully scraped ${allJobs.length} jobs`);
    return allJobs;
  } catch (err) {
    console.warn(`[Scraper:WeWorkRemotely] Failed to fetch: ${err.message}`);
    return [];
  }
}
