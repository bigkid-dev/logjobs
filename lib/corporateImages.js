import { SITE_URL } from './seo.js';

/**
 * Curated high-resolution royalty-free corporate professional images featuring Black & African professionals.
 * Stored locally on the server in /public/images/corporate/ for ultra-fast, 100% reliable OpenGraph and WhatsApp previews.
 */
export const CORPORATE_IMAGES = [
  {
    id: 'corp-exec-1',
    category: 'Executive & Management',
    label: 'Corporate Leader (Female)',
    url: '/images/corporate/black_exec_female.jpg',
    tags: ['Executive', 'Operations', 'Management', 'Corporate', 'Leadership', 'Director', 'CEO', 'Manager']
  },
  {
    id: 'corp-exec-2',
    category: 'Executive & Management',
    label: 'Business Director (Male)',
    url: '/images/corporate/black_exec_male.jpg',
    tags: ['Executive', 'Strategy', 'Director', 'Management', 'Corporate', 'Leadership']
  },
  {
    id: 'corp-tech-1',
    category: 'Tech & Software',
    label: 'Software Developer (Female)',
    url: '/images/corporate/black_tech_female.jpg',
    tags: ['Tech & Software', 'Software', 'Engineer', 'Developer', 'Frontend', 'Backend', 'Fullstack', 'Mobile']
  },
  {
    id: 'corp-tech-2',
    category: 'Tech & Software',
    label: 'Software Engineer (Male)',
    url: '/images/corporate/black_tech_male.jpg',
    tags: ['Tech & Software', 'Fullstack', 'DevOps', 'Data', 'Cloud', 'Developer', 'Engineer', 'Python', 'React', 'Node']
  },
  {
    id: 'corp-mkt-1',
    category: 'Marketing & Sales',
    label: 'Growth & Marketing Specialist',
    url: '/images/corporate/black_marketing.jpg',
    tags: ['Marketing & Sales', 'Marketing', 'Sales', 'Growth', 'Brand', 'SEO', 'Content', 'Social Media']
  },
  {
    id: 'corp-mkt-2',
    category: 'Marketing & Sales',
    label: 'Commercial & Sales Professional',
    url: '/images/corporate/black_sales.jpg',
    tags: ['Marketing & Sales', 'Sales', 'Business Development', 'Account Executive', 'Commercial']
  },
  {
    id: 'corp-fin-1',
    category: 'Finance & Accounting',
    label: 'Financial Analyst & Accountant',
    url: '/images/corporate/black_finance.jpg',
    tags: ['Finance & Accounting', 'Finance', 'Accounting', 'Audit', 'Tax', 'Banking', 'Payroll', 'Accountant', 'CFO']
  },
  {
    id: 'corp-des-1',
    category: 'Design & Creative',
    label: 'Product & UI/UX Designer',
    url: '/images/corporate/black_design.jpg',
    tags: ['Design & Creative', 'UI/UX', 'Product Design', 'Graphic Design', 'Figma', 'Creative', 'Art Director']
  },
  {
    id: 'corp-med-1',
    category: 'Healthcare & Medical',
    label: 'Healthcare & Medical Clinician',
    url: '/images/corporate/black_healthcare.jpg',
    tags: ['Healthcare & Medical', 'Healthcare', 'Medical', 'Nurse', 'Clinical', 'Pharmacy', 'Health']
  },
  {
    id: 'corp-med-2',
    category: 'Healthcare & Medical',
    label: 'Medical Doctor & Practitioner',
    url: '/images/corporate/black_doctor.jpg',
    tags: ['Healthcare & Medical', 'Doctor', 'Physician', 'Medical', 'Clinical', 'Healthcare']
  },
  {
    id: 'corp-hr-1',
    category: 'Customer Support & HR',
    label: 'Human Resources & Talent Lead',
    url: '/images/corporate/black_hr.jpg',
    tags: ['Operations & HR', 'Customer Support', 'Support', 'Human Resources', 'HR', 'Recruiter', 'People', 'Talent']
  },
  {
    id: 'corp-ops-1',
    category: 'Operations & Logistics',
    label: 'Corporate Operations Manager',
    url: '/images/corporate/black_ops.jpg',
    tags: ['Operations', 'Logistics', 'Supply Chain', 'Project Manager', 'Product Manager', 'Operations & HR']
  }
];

export const DEFAULT_CORP_IMAGE = CORPORATE_IMAGES[0].url;

/**
 * Returns the best matching corporate image URL for a job based on its category/title
 */
export function getMatchingCorporateImage(job) {
  if (job?.og_image_url) return job.og_image_url;
  if (job?.cover_image) return job.cover_image;

  const text = `${job?.title || ''} ${(job?.stacks || []).join(' ')} ${job?.company || ''}`.toLowerCase();

  for (const item of CORPORATE_IMAGES) {
    if (item.tags.some(tag => text.includes(tag.toLowerCase()))) {
      return item.url;
    }
  }

  return DEFAULT_CORP_IMAGE;
}

/**
 * Returns the absolute URL of the matching corporate image for OpenGraph / WhatsApp meta tags
 */
export function getAbsoluteCorporateImageUrl(job) {
  const relativeOrAbsolute = getMatchingCorporateImage(job);
  if (relativeOrAbsolute.startsWith('http://') || relativeOrAbsolute.startsWith('https://')) {
    return relativeOrAbsolute;
  }
  const cleanPath = relativeOrAbsolute.startsWith('/') ? relativeOrAbsolute : `/${relativeOrAbsolute}`;
  const base = (SITE_URL || 'https://logjobs.blog').replace(/\/$/, '');
  return `${base}${cleanPath}`;
}
