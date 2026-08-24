import { detectRegion, extractStacks } from '../normalize.js'

export async function scrapeRemoteOK() {
  console.log('[Scraper:RemoteOK] Fetching jobs from remoteok.com/api...');
  try {
    const res = await fetch('https://remoteok.com/api', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LogJobNG/1.0; +https://logjob.ng)',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 1800 }, // cache 30 mins
    });

    if (!res.ok) {
      console.warn(`[Scraper:RemoteOK] HTTP response failed with status ${res.status}`);
      return [];
    }

    const raw = await res.json();
    // First item is always metadata, skip it
    const jobs = Array.isArray(raw) ? raw.slice(1) : [];

    const mapped = jobs
      .filter(job => job.position)
      .map(job => ({
        id: `remoteok-${job.id}`,
        title: job.position || '',
        company: job.company || '',
        location: 'Remote',
        region: 'Remote',
        type: 'Remote',
        stacks: [...(job.tags || []), ...extractStacks(job.position)],
        salary: job.salary_min
          ? `$${Number(job.salary_min).toLocaleString()} – $${Number(job.salary_max).toLocaleString()}`
          : '',
        url: job.url || `https://remoteok.com/remote-jobs/${job.slug}`,
        postedAt: job.date || '',
        source: 'RemoteOK',
        logo: job.company_logo || '',
      }));

    console.log(`[Scraper:RemoteOK] Successfully scraped ${mapped.length} jobs`);
    return mapped;
  } catch (err) {
    console.warn(`[Scraper:RemoteOK] Failed to fetch: ${err.message}`);
    return [];
  }
}
