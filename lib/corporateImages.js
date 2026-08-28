/**
 * Curated high-resolution royalty-free corporate professional images across multiple industries.
 * Optimized for OpenGraph and WhatsApp social preview cards.
 */

export const CORPORATE_IMAGES = [
  {
    id: 'corp-exec-1',
    category: 'Executive & Management',
    label: 'Corporate Leader (Female)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&h=630&q=80',
    tags: ['Executive', 'Operations', 'Management', 'Corporate', 'Leadership']
  },
  {
    id: 'corp-exec-2',
    category: 'Executive & Management',
    label: 'Business Director (Male)',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&h=630&q=80',
    tags: ['Executive', 'Strategy', 'Director', 'Management']
  },
  {
    id: 'corp-tech-1',
    category: 'Tech & Software',
    label: 'Software Developer (Female)',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&h=630&q=80',
    tags: ['Tech & Software', 'Software', 'Engineer', 'Developer', 'Frontend', 'Backend']
  },
  {
    id: 'corp-tech-2',
    category: 'Tech & Software',
    label: 'Engineering Team Workspace',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&h=630&q=80',
    tags: ['Tech & Software', 'Fullstack', 'DevOps', 'Data', 'Cloud', 'Team']
  },
  {
    id: 'corp-mkt-1',
    category: 'Marketing & Sales',
    label: 'Growth Specialist (Female)',
    url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&h=630&q=80',
    tags: ['Marketing & Sales', 'Marketing', 'Sales', 'Growth', 'Brand', 'SEO']
  },
  {
    id: 'corp-mkt-2',
    category: 'Marketing & Sales',
    label: 'Commercial & Sales Professional',
    url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&h=630&q=80',
    tags: ['Marketing & Sales', 'Sales', 'Business Development', 'Account Executive']
  },
  {
    id: 'corp-fin-1',
    category: 'Finance & Accounting',
    label: 'Financial Analyst (Corporate)',
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&h=630&q=80',
    tags: ['Finance & Accounting', 'Finance', 'Accounting', 'Audit', 'Tax', 'Banking']
  },
  {
    id: 'corp-fin-2',
    category: 'Finance & Accounting',
    label: 'Senior Finance Professional',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&h=630&q=80',
    tags: ['Finance & Accounting', 'Financial Analyst', 'CFO', 'Payroll', 'Accountant']
  },
  {
    id: 'corp-des-1',
    category: 'Design & Creative',
    label: 'Product Designer (Modern Studio)',
    url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1200&h=630&q=80',
    tags: ['Design & Creative', 'UI/UX', 'Product Design', 'Graphic Design', 'Figma']
  },
  {
    id: 'corp-des-2',
    category: 'Design & Creative',
    label: 'Creative Director',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&h=630&q=80',
    tags: ['Design & Creative', 'Art Director', 'Illustrator', 'Creative', 'Motion']
  },
  {
    id: 'corp-med-1',
    category: 'Healthcare & Medical',
    label: 'Medical Professional / Clinician',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&h=630&q=80',
    tags: ['Healthcare & Medical', 'Healthcare', 'Medical', 'Doctor', 'Nurse', 'Clinical', 'Pharmacy']
  },
  {
    id: 'corp-hr-1',
    category: 'Customer Support & HR',
    label: 'Human Resources & Talent Lead',
    url: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?auto=format&fit=crop&w=1200&h=630&q=80',
    tags: ['Operations & HR', 'Customer Support', 'Support', 'Human Resources', 'Recruiter', 'People']
  },
  {
    id: 'corp-ops-1',
    category: 'Operations & Logistics',
    label: 'Corporate Operations Manager',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&h=630&q=80',
    tags: ['Operations', 'Logistics', 'Supply Chain', 'Project Manager', 'Product Manager']
  }
];

export const DEFAULT_CORP_IMAGE = CORPORATE_IMAGES[0].url;

/**
 * Returns the best matching corporate image for a job based on its category/title
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
