import { detectRegion, extractStacks, normalizeType } from '../normalize.js'

export async function scrapeRemotive() {
  console.log('[Scraper:Remotive] Fetching jobs from remotive.com/api...');
  try {
    const res = await fetch(
      'https://remotive.com/api/remote-jobs?limit=100',
      {
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 1800 }
      }
    );

    if (!res.ok) {
      console.warn(`[Scraper:Remotive] HTTP response failed with status ${res.status}`);
      return [];
    }

    const data = await res.json();
    const jobs = data.jobs || [];

    const mapped = jobs.map(job => {
      const location = job.candidate_required_location || 'Remote';
      return {
        id: `remotive-${job.id}`,
        title: job.title || '',
        company: job.company_name || '',
        location,
        region: detectRegion(location),
        type: normalizeType(job.job_type),
        stacks: [
          ...(job.tags || []).map(t => t.name || t),
          ...extractStacks(job.title),
        ],
        salary: job.salary || '',
        url: job.url || '',
        postedAt: job.publication_date || '',
        source: 'Remotive',
        logo: job.company_logo_url || '',
      };
    });

    console.log(`[Scraper:Remotive] Successfully scraped ${mapped.length} jobs`);
    return mapped;
  } catch (err) {
    console.warn(`[Scraper:Remotive] Failed to fetch: ${err.message}`);
    return [];
  }
}
