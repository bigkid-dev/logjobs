export const STACK_KEYWORDS = {
  'Tech & Software': ['tech', 'software', 'developer', 'engineer', 'frontend', 'backend', 'fullstack', 'react', 'python', 'node', 'javascript', 'typescript', 'mobile', 'devops', 'cloud', 'data'],
  'Design & Creative': ['design', 'designer', 'ui/ux', 'product design', 'graphic design', 'figma', 'creative', 'art director', 'illustrator', 'motion'],
  'Marketing & Sales': ['marketing', 'sales', 'seo', 'social media', 'growth', 'brand', 'content marketing', 'account executive', 'bdr', 'sdr', 'business development'],
  'Finance & Accounting': ['finance', 'accounting', 'accountant', 'audit', 'tax', 'bookkeeper', 'financial analyst', 'cfo', 'payroll', 'banking'],
  'Customer Support': ['support', 'customer service', 'customer success', 'helpdesk', 'client services', 'call center'],
  'Operations & HR': ['operations', 'hr', 'human resources', 'recruiter', 'talent', 'people', 'admin', 'office manager', 'logistics', 'supply chain'],
  'Product & Management': ['product manager', 'project manager', 'scrum', 'agile', 'program manager', 'product owner', 'strategy'],
  'Healthcare & Medical': ['health', 'medical', 'nurse', 'doctor', 'clinical', 'pharmacy', 'caregiver', 'therapist'],
  'Writing & Content': ['writer', 'copywriter', 'editor', 'content creator', 'journalism', 'technical writer'],
  'Legal & Compliance': ['legal', 'lawyer', 'compliance', 'paralegal', 'contracts', 'counsel'],
  'Education & Training': ['education', 'teacher', 'tutor', 'instructor', 'trainer', 'curriculum', 'academic']
}

export const CATEGORY_KEYWORDS = STACK_KEYWORDS

export const REGIONS = ['Nigeria', 'Africa', 'Remote', 'Europe', 'America']

export const JOB_TYPES = ['Full Time', 'Contract', 'Part Time', 'Freelance', 'Internship']

export const NIGERIAN_LOCATION_CLUSTERS = {
  'Ogun': ['ogun', 'abeokuta', 'ota', 'otta', 'agbara', 'sagamu', 'shagamu', 'ibafo', 'mowe', 'ijebu ode', 'ijebu', 'ilishan', 'ogere', 'sango ota', 'sango-ota'],
  'Lagos': ['lagos', 'ikeja', 'lekki', 'victoria island', ' vi ', 'yaba', 'surulere', 'ikoyi', 'maryland', 'gbagada', 'ikorodu', 'epe', 'badagry', 'ajah', 'alaba', 'marina', 'apapa', 'oshodi', 'magodo', 'festac', 'ojodu', 'ogudu', 'anthony', 'ilupeju'],
  'Oyo / Ibadan': ['ibadan', 'oyo', 'bodija', 'dugbe', 'ring road', 'iwo road', 'moniya', 'ogbomoso', 'agodi', 'mokola', 'eleyele', 'samonda', 'jericho'],
  'Abuja (FCT)': ['abuja', 'fct', 'wuse', 'maitama', 'garki', 'asokoro', 'gwarinpa', 'jabi', 'kubwa', 'lugbe', 'utako', 'central business district'],
  'Rivers / PH': ['port harcourt', 'phc', 'rivers', 'trans amadi', 'diobu', 'eleme', 'obio akpor'],
  'Edo / Delta': ['benin city', 'benin', 'edo', 'warri', 'asaba', 'delta'],
  'Enugu / Anambra': ['enugu', 'nsukka', 'anambra', 'awka', 'onitsha', 'nnewi'],
  'Kano / Kaduna': ['kano', 'kaduna', 'zaria'],
  'Kwara': ['kwara', 'ilorin', 'offa']
};

export function detectRegion(location = '') {
  const loc = ` ${location.toLowerCase()} `;

  // 1. Check all Nigerian state clusters
  for (const [state, aliases] of Object.entries(NIGERIAN_LOCATION_CLUSTERS)) {
    if (aliases.some(alias => loc.includes(alias))) return 'Nigeria';
  }
  if (loc.includes('nigeria') || loc.includes('nigerian')) return 'Nigeria';

  if (
    loc.includes('africa') || loc.includes('kenya') || loc.includes('ghana') ||
    loc.includes('south africa') || loc.includes('rwanda') || loc.includes('ethiopia') ||
    loc.includes('egypt') || loc.includes('tanzania') || loc.includes('uganda')
  ) return 'Africa';

  if (
    loc.includes('uk') || loc.includes('united kingdom') || loc.includes('london') || loc.includes('germany') ||
    loc.includes('france') || loc.includes('europe') || loc.includes('netherlands') ||
    loc.includes('spain') || loc.includes('portugal') || loc.includes('ireland') ||
    loc.includes('sweden') || loc.includes('poland') || loc.includes('berlin') || loc.includes('munich')
  ) return 'Europe';

  if (
    loc.includes('usa') || loc.includes('united states') || loc.includes('canada') ||
    loc.includes('america') || loc.includes('new york') || loc.includes('san francisco') ||
    loc.includes('california') || loc.includes('texas')
  ) return 'America';

  return 'Remote';
}

export function matchesLocationQuery(jobLocation = '', jobTitle = '', jobDesc = '', query = '') {
  const q = query.toLowerCase().trim();
  if (!q) return true;

  const haystack = `${jobLocation} ${jobTitle} ${jobDesc}`.toLowerCase();

  // Direct match
  if (haystack.includes(q)) return true;

  // Check if query is targeting a specific Nigerian State cluster (e.g. searching 'ogun' should match 'agbara', 'ota', etc.)
  for (const [state, aliases] of Object.entries(NIGERIAN_LOCATION_CLUSTERS)) {
    if (state.toLowerCase().includes(q) || aliases.some(a => a === q)) {
      if (aliases.some(alias => haystack.includes(alias))) return true;
    }
  }

  return false;
}

export function extractStacks(text = '') {
  const lower = text.toLowerCase()
  return Object.entries(STACK_KEYWORDS)
    .filter(([_, keywords]) => keywords.some(k => lower.includes(k)))
    .map(([category]) => category)
}

export function matchesStack(job, selectedStacks) {
  if (!selectedStacks.length) return true
  const haystack = [
    ...(job.stacks || []),
    job.title,
    job.description || '',
    job.company || ''
  ].join(' ').toLowerCase()

  return selectedStacks.some(selected => {
    const selLower = selected.toLowerCase()
    // 1. Direct match in tags/title/desc
    if (haystack.includes(selLower)) return true

    // 2. Category keywords match
    const keywords = STACK_KEYWORDS[selected]
    if (keywords && keywords.some(k => haystack.includes(k))) return true

    return false
  })
}

export function deduplicateJobs(jobs) {
  const seen = new Set()
  return jobs.filter(job => {
    const key = `${job.title.toLowerCase().trim()}-${job.company.toLowerCase().trim()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function normalizeType(type = '') {
  const t = type.toLowerCase()
  if (t.includes('contract') || t.includes('freelance')) return 'Contract'
  if (t.includes('part')) return 'Part Time'
  if (t.includes('intern')) return 'Internship'
  return 'Full Time'
}
