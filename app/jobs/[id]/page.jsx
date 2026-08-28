import { getJobById } from '../../../lib/db.js';
import { generateJobPostingSchema, generateBreadcrumbSchema, SITE_URL, DEFAULT_SEO } from '../../../lib/seo.js';
import JobDetailClient from '../../../components/pleurat/JobDetailClient';

export async function generateMetadata({ params }) {
  const { id } = params;
  const job = await getJobById(id);

  if (!job) {
    return {
      title: 'Job Not Found',
      description: 'The requested job posting may have been filled or removed from LogJobs.'
    };
  }

  const companyName = job.is_anonymous ? 'Confidential Employer' : (job.company || 'Direct Employer');
  const pageTitle = `${job.title} at ${companyName} — Apply on LogJobs`;
  const cleanSnippet = (job.description || '')
    .replace(/\s+/g, ' ')
    .slice(0, 160)
    .trim();
  const pageDescription = cleanSnippet
    ? `${cleanSnippet}... Apply directly on LogJobs.`
    : `Apply for ${job.title} at ${companyName} in ${job.location || 'Remote'}. Verified direct employer hiring across Nigeria and Global Remote on LogJobs.`;

  const canonicalUrl = `${SITE_URL}/jobs/${job.id}`;
  const ogImage = job.logo_url || job.logo || `${SITE_URL}/logo.png`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName: 'LogJobs',
      images: [
        {
          url: ogImage,
          width: 512,
          height: 512,
          alt: `${job.title} at ${companyName}`
        }
      ],
      locale: 'en_NG',
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [ogImage],
      creator: '@LogJobsBlog'
    }
  };
}

export default async function JobDetailPage({ params }) {
  const { id } = params;
  let job = null;

  try {
    job = await getJobById(id);
  } catch (err) {
    console.error('Server error fetching job for SSR:', err);
  }

  const jobPostingSchema = job ? generateJobPostingSchema(job) : null;
  const breadcrumbSchema = job
    ? generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Jobs', url: '/' },
        { name: job.title, url: `/jobs/${job.id}` }
      ])
    : null;

  return (
    <>
      {jobPostingSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <JobDetailClient initialJob={job} jobId={id} />
    </>
  );
}
