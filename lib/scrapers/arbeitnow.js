import { detectRegion, extractStacks } from '../normalize.js'

export async function scrapeArbeitnow() {
  console.log('[Scraper:Arbeitnow] Fetching jobs from arbeitnow.com/api...');
  try {
    const res = await fetch('https://arbeitnow.com/api/job-board-api', {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      console.warn(`[Scraper:Arbeitnow] HTTP response failed with status ${res.status}`);
      return [];
    }

    const data = await res.json();
    const jobs = data.data || [];

    const mapped = jobs.map(job => {
      const location = job.location || 'Remote';
      return {
        id: `arbeitnow-${job.slug}`,
        title: job.title || '',
        company: job.company_name || '',
        location,
        region: job.remote ? 'Remote' : detectRegion(location),
        type: job.remote ? 'Remote' : 'Full Time',
        stacks: [
          ...(job.tags || []),
          ...extractStacks(job.title),
        ],
        salary: '',
        url: job.url || '',
        postedAt: job.created_at ? new Date(job.created_at * 1000).toISOString() : '',
        source: 'Arbeitnow',
        logo: '',
      };
    });

    console.log(`[Scraper:Arbeitnow] Successfully scraped ${mapped.length} jobs`);
    return mapped;
  } catch (err) {
    console.warn(`[Scraper:Arbeitnow] Failed to fetch: ${err.message}`);
    return [];
  }
}
