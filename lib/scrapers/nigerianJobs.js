import { detectRegion, extractStacks, normalizeType, NIGERIAN_LOCATION_CLUSTERS } from '../normalize.js';

function parseXmlTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (!match) return '';
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim();
}

function detectNigerianCity(text = '') {
  const lower = text.toLowerCase();
  for (const [state, aliases] of Object.entries(NIGERIAN_LOCATION_CLUSTERS)) {
    if (aliases.some(alias => lower.includes(alias))) {
      return state;
    }
  }
  return 'Lagos, Nigeria';
}

export async function scrapeNigerianJobs() {
  console.log('[Scraper:NigerianJobs] Fetching Nigerian job feeds...');
  const nigerianFeeds = [
    'https://www.hotnigerianjobs.com/rss.xml'
  ];

  try {
    const results = await Promise.allSettled(
      nigerianFeeds.map(async (feedUrl) => {
        const res = await fetch(feedUrl, {
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
          const title = parseXmlTag(itemXml, 'title');
          const link = parseXmlTag(itemXml, 'link') || parseXmlTag(itemXml, 'guid');
          const pubDate = parseXmlTag(itemXml, 'pubDate');
          const description = parseXmlTag(itemXml, 'description');

          const detectedLocation = detectNigerianCity(`${title} ${description}`);

          return {
            id: `ngjob-${Buffer.from(link || title).toString('base64').substring(0, 16)}`,
            title: title || 'Career Opportunity',
            company: 'Verified Nigerian Employer',
            location: detectedLocation,
            region: 'Nigeria',
            type: 'Full Time',
            stacks: extractStacks(`${title} ${description}`),
            salary: 'Competitive Compensation',
            url: link,
            postedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            source: 'HotNigerianJobs',
            logo: '',
          };
        });
      })
    );

    const allJobs = results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    console.log(`[Scraper:NigerianJobs] Successfully scraped ${allJobs.length} Nigerian jobs`);
    return allJobs;
  } catch (err) {
    console.warn(`[Scraper:NigerianJobs] Failed to fetch: ${err.message}`);
    return [];
  }
}
