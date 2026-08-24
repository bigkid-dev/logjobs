import { detectRegion, extractStacks, normalizeType } from '../normalize.js';

export async function scrapeHimalayas() {
  console.log('[Scraper:Himalayas] Fetching jobs from himalayas.app/jobs/api...');
  try {
    const res = await fetch('https://himalayas.app/jobs/api?limit=100', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LogJobsNG/1.0; +https://logjob.ng)',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 1800 }, // cache 30 mins
    });

    if (!res.ok) {
      console.warn(`[Scraper:Himalayas] HTTP response failed with status ${res.status}`);
      return [];
    }

    const data = await res.json();
    const jobs = data.jobs || [];

    const mapped = jobs.map((job) => {
      const location = Array.isArray(job.locationRestrictions) && job.locationRestrictions.length > 0
        ? job.locationRestrictions.join(', ')
        : (job.location || 'Remote (Worldwide)');

      const salaryMin = job.minSalary;
      const salaryMax = job.maxSalary;
      let salaryStr = '';
      if (salaryMin && salaryMax) {
        salaryStr = `$${Number(salaryMin).toLocaleString()} – $${Number(salaryMax).toLocaleString()} / yr`;
      } else if (salaryMin) {
        salaryStr = `From $${Number(salaryMin).toLocaleString()} / yr`;
      }

      return {
        id: `himalayas-${job.slug || job.id || Math.random().toString(36).substring(7)}`,
        title: job.title || '',
        company: job.companyName || '',
        location,
        region: detectRegion(location),
        type: normalizeType(job.employmentType || 'Full Time'),
        stacks: [
          ...(Array.isArray(job.categories) ? job.categories : []),
          ...(Array.isArray(job.skills) ? job.skills : []),
          ...extractStacks(job.title)
        ],
        salary: salaryStr,
        url: job.applicationLink || `https://himalayas.app/companies/${job.companySlug}/jobs/${job.slug}`,
        postedAt: job.pubDate ? new Date(job.pubDate).toISOString() : new Date().toISOString(),
        source: 'Himalayas',
        logo: job.companyLogo || '',
      };
    });

    console.log(`[Scraper:Himalayas] Successfully scraped ${mapped.length} jobs`);
    return mapped;
  } catch (err) {
    console.warn(`[Scraper:Himalayas] Failed to fetch: ${err.message}`);
    return [];
  }
}
