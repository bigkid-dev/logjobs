/**
 * LogJobs — Comprehensive Search Engine Optimization & Google for Jobs Structured Data Engine
 * Standardized to schema.org & Google Search Central specifications.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
  ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  : 'https://logjobs.blog';

export const DEFAULT_SEO = {
  title: 'LogJobs — Direct Career Opportunities Across Nigeria & Global Remote Jobs',
  description: 'LogJobs is Nigeria’s premier career platform connecting ambitious talent with direct employers across Lagos, Abuja, Port Harcourt, Ibadan, nationwide in Nigeria, and global remote companies. Zero recruiter spam.',
  keywords: [
    'jobs in nigeria',
    'career opportunities nigeria',
    'remote jobs worldwide',
    'tech jobs lagos',
    'abuja jobs',
    'port harcourt jobs',
    'ibadan career openings',
    'finance and accounting jobs nigeria',
    'marketing jobs lagos',
    'design and creative jobs',
    'direct employer hiring',
    'verified jobs in nigeria',
    'work from home jobs nigeria',
    'global remote careers',
    'logjobs',
    'logjob'
  ],
  siteName: 'LogJobs',
  locale: 'en_NG',
  twitterHandle: '@LogJobsBlog'
};

/**
 * Format employment type according to Google Schema.org requirements
 */
export function normalizeEmploymentType(jobType = '') {
  const t = jobType.toLowerCase();
  if (t.includes('part')) return 'PART_TIME';
  if (t.includes('contract') || t.includes('freelance')) return 'CONTRACTOR';
  if (t.includes('intern')) return 'INTERN';
  return 'FULL_TIME';
}

/**
 * Parse salary strings to structured schema.org/MonetaryAmount
 */
export function parseSalarySchema(salaryStr = '') {
  if (!salaryStr || salaryStr.toLowerCase().includes('undisclosed') || salaryStr.toLowerCase().includes('negotiable')) {
    return null;
  }

  let currency = 'NGN';
  if (salaryStr.includes('$') || salaryStr.toLowerCase().includes('usd')) currency = 'USD';
  else if (salaryStr.includes('£') || salaryStr.toLowerCase().includes('gbp')) currency = 'GBP';
  else if (salaryStr.includes('€') || salaryStr.toLowerCase().includes('eur')) currency = 'EUR';

  // Extract digits
  const numbers = salaryStr.replace(/,/g, '').match(/\d+/g);
  if (!numbers || numbers.length === 0) return null;

  const min = parseInt(numbers[0], 10);
  const max = numbers.length > 1 ? parseInt(numbers[1], 10) : min;

  return {
    '@type': 'MonetaryAmount',
    currency,
    value: {
      '@type': 'QuantitativeValue',
      minValue: min,
      maxValue: max,
      unitText: min > 50000 && currency === 'NGN' ? 'MONTH' : min > 10000 && currency === 'USD' ? 'YEAR' : 'MONTH'
    }
  };
}

/**
 * Convert plain text description to clean Google-compliant HTML description
 */
export function formatDescriptionToHtml(text = '') {
  if (!text) return '<p>No description provided.</p>';
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => `<p>${p.trim().replace(/\n/g, '<br/>')}</p>`)
    .join('');
  return paragraphs || `<p>${text}</p>`;
}

/**
 * Generates official schema.org/JobPosting JSON-LD for Google Jobs indexing
 */
export function generateJobPostingSchema(job, baseUrl = SITE_URL) {
  if (!job) return null;

  const isRemote =
    (job.workplace_type || '').toLowerCase().includes('remote') ||
    (job.location || '').toLowerCase().includes('remote') ||
    (job.region || '').toLowerCase().includes('remote');

  const postedDate = job.created_at || job.postedAt || new Date().toISOString();
  const validThroughDate = new Date(new Date(postedDate).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

  const salarySchema = parseSalarySchema(job.salary);

  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: formatDescriptionToHtml(job.description),
    identifier: {
      '@type': 'PropertyValue',
      name: 'LogJobs',
      value: job.id
    },
    datePosted: postedDate,
    validThrough: validThroughDate,
    employmentType: normalizeEmploymentType(job.job_type || job.type),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.is_anonymous ? 'Confidential Employer' : (job.company || 'Direct Employer'),
      sameAs: baseUrl,
      logo: job.logo_url || job.logo || `${baseUrl}/logo.png`
    },
    directApply: true,
    url: `${baseUrl}/jobs/${job.id}`
  };

  if (salarySchema) {
    schema.baseSalary = salarySchema;
  }

  // Location configuration for Google Jobs
  if (isRemote) {
    schema.jobLocationType = 'TELECOMMUTE';
    schema.applicantLocationRequirements = {
      '@type': 'Country',
      name: job.region === 'Nigeria' ? 'Nigeria' : 'Worldwide'
    };
  }

  // Physical Location fallback or specification
  schema.jobLocation = {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: job.location || (job.region === 'Nigeria' ? 'Lagos' : 'Worldwide'),
      addressRegion: job.region || 'Nigeria',
      addressCountry: job.region === 'Nigeria' || (job.location && job.location.toLowerCase().includes('nigeria')) ? 'NG' : 'NG'
    }
  };

  return schema;
}

/**
 * Generates schema.org/WebSite structured data with Searchbox action
 */
export function generateWebsiteSchema(baseUrl = SITE_URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LogJobs',
    alternateName: ['LogJobs Nigeria', 'LogJobs Blog', 'LogJobs Global'],
    url: baseUrl,
    description: DEFAULT_SEO.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Generates schema.org/Organization structured data
 */
export function generateOrganizationSchema(baseUrl = SITE_URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LogJobs',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Premier career discovery platform across Nigeria and Global Remote roles.',
    sameAs: [
      'https://twitter.com/logjobs',
      'https://linkedin.com/company/logjobs',
      'https://facebook.com/logjobs'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      url: baseUrl
    }
  };
}

/**
 * Generates schema.org/BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(items = [], baseUrl = SITE_URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };
}
