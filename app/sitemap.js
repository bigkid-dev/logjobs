import { getDbJobs } from '../lib/db.js';
import { SITE_URL } from '../lib/seo.js';
import { STACK_KEYWORDS } from '../lib/normalize.js';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const baseUrl = SITE_URL;

  // 1. Static Core Routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/?tab=nigerian`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?tab=global`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // 2. Category / Tag Landing Routes (for Google Search indexing)
  const categoryRoutes = Object.keys(STACK_KEYWORDS).map((cat) => ({
    url: `${baseUrl}/?stacks=${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  // 3. Dynamic Job Posting Routes
  let jobRoutes = [];
  try {
    const jobs = await getDbJobs({ category: 'all' });
    jobRoutes = jobs.map((job) => ({
      url: `${baseUrl}/jobs/${job.id}`,
      lastModified: job.created_at ? new Date(job.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (err) {
    console.error('Sitemap generation error fetching jobs:', err);
  }

  return [...staticRoutes, ...categoryRoutes, ...jobRoutes];
}
