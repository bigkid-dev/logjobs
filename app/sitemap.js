import { getDbJobs } from '../lib/db.js';
import { SITE_URL } from '../lib/seo.js';

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

  // 2. Dynamic Job Posting Routes
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

  return [...staticRoutes, ...jobRoutes];
}
