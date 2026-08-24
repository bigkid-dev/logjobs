import { detectRegion, extractStacks, normalizeType, NIGERIAN_LOCATION_CLUSTERS } from '../normalize.js';

function decodeHtmlEntities(str = '') {
  return str
    .replace(/&#8211;/g, '–')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '...')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/<[^>]*>/g, '')
    .trim();
}

function parseCompanyAndTitle(rawTitle) {
  let title = decodeHtmlEntities(rawTitle);
  let company = 'Verified Employer';

  // Pattern: "Job Title at Company Name"
  if (title.includes(' at ')) {
    const parts = title.split(' at ');
    title = parts[0].trim();
    company = parts.slice(1).join(' at ').trim();
  } else if (title.includes(' | ')) {
    const parts = title.split(' | ');
    title = parts[0].trim();
    company = parts.slice(1).join(' | ').trim();
  } else if (title.toLowerCase().includes('recruitment') || title.toLowerCase().includes('program') || title.toLowerCase().includes('is hiring')) {
    const firstWord = title.split(' ')[0];
    if (firstWord && firstWord.length > 2) {
      company = firstWord;
    }
  }

  return { title, company };
}

function detectLocation(text = '') {
  const lower = ` ${text.toLowerCase()} `;

  if (lower.includes('remote')) return 'Remote (Nigeria)';

  for (const [state, aliases] of Object.entries(NIGERIAN_LOCATION_CLUSTERS)) {
    if (aliases.some(alias => lower.includes(alias))) {
      return `${state}, Nigeria`;
    }
  }

  return 'Nigeria (Regional / Remote)';
}

export async function scrapeSmartyAcad() {
  console.log('[Scraper:SmartyAcad] Fetching jobs from jobs.smartyacad.com/wp-json/wp/v2/posts...');
  try {
    const res = await fetch('https://jobs.smartyacad.com/wp-json/wp/v2/posts?per_page=50&_embed', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LogJobsNG/1.0; +https://logjob.ng)',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 1800 }, // cache 30 mins
    });

    if (!res.ok) {
      console.warn(`[Scraper:SmartyAcad] HTTP response failed with status ${res.status}`);
      return [];
    }

    const posts = await res.json();
    if (!Array.isArray(posts)) return [];

    const mapped = posts
      .filter((post) => {
        const rawTitle = post.title?.rendered || '';
        // Skip pure undergraduate scholarships or pure grant posts if user is browsing job vacancies
        const lower = rawTitle.toLowerCase();
        return !lower.includes('undergraduate scholarship') && !lower.includes('tuition support');
      })
      .map((post) => {
        const rawTitle = post.title?.rendered || '';
        const excerpt = decodeHtmlEntities(post.excerpt?.rendered || '');
        const { title, company } = parseCompanyAndTitle(rawTitle);
        const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';

        const location = detectLocation(`${title} ${excerpt}`);

        let type = 'Full Time';
        const lower = `${title} ${excerpt}`.toLowerCase();
        if (lower.includes('internship') || lower.includes('intern')) type = 'Internship';
        else if (lower.includes('graduate trainee') || lower.includes('trainee')) type = 'Graduate Trainee';
        else if (lower.includes('contract')) type = 'Contract';
        else if (lower.includes('part-time') || lower.includes('part time')) type = 'Part Time';

        const stacks = extractStacks(`${title} ${excerpt}`);

        return {
          id: `smartyacad-${post.id}`,
          title: decodeHtmlEntities(title),
          company: decodeHtmlEntities(company),
          location,
          region: detectRegion(location),
          type: normalizeType(type),
          stacks: stacks.length > 0 ? stacks : ['Operations & HR'],
          salary: 'Competitive Pay',
          url: post.link || `https://jobs.smartyacad.com/?p=${post.id}`,
          postedAt: post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
          source: 'SmartyAcad',
          logo: featuredMedia,
          description: excerpt
        };
      });

    console.log(`[Scraper:SmartyAcad] Successfully scraped ${mapped.length} jobs`);
    return mapped;
  } catch (err) {
    console.warn(`[Scraper:SmartyAcad] Failed to fetch: ${err.message}`);
    return [];
  }
}
