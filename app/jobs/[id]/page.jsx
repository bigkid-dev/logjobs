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
  const pageTitle = `Hiring: ${job.title} at ${companyName} — Apply on LogJobs`;
  const cleanSnippet = (job.description || '')
    .replace(/\s+/g, ' ')
    .slice(0, 140)
    .trim();
  
  const metaDetails = [
    job.location || 'Remote',
    job.job_type || 'Full Time',
    job.salary ? `Compensation: ${job.salary}` : null
  ].filter(Boolean).join(' • ');

  const pageDescription = cleanSnippet
    ? `${metaDetails}. ${cleanSnippet}... Apply directly to hiring team on LogJobs.`
    : `Apply for ${job.title} at ${companyName} in ${job.location || 'Remote'}. Verified direct employer hiring across Nigeria and Global Remote on LogJobs.`;

  const canonicalUrl = `${SITE_URL}/jobs/${job.id}`;
  const ogImageUrl = `${SITE_URL}/jobs/${job.id}/opengraph-image`;

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
          url: ogImageUrl,
          width: 1200,
          height: 630,
          type: 'image/png',
          alt: `${job.title} at ${companyName} on LogJobs`
        }
      ],
      locale: 'en_NG',
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [ogImageUrl],
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
