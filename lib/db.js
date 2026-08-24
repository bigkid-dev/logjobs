import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { INITIAL_JOBS } from './seedData.js';

// Vercel / Serverless compatible store location
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production';
const DATA_DIR = isServerless ? path.join('/tmp', '.data') : path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// In-memory fallback
if (!globalThis.__LOGJOBS_STORE__) {
  globalThis.__LOGJOBS_STORE__ = {
    users: [],
    jobs: [],
    applications: [],
    resumes: []
  };
}

function ensureLocalDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    // Read-only filesystem, use in-memory fallback
  }
}

function getLocalStore() {
  ensureLocalDataDir();
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(data);
      globalThis.__LOGJOBS_STORE__ = parsed;
      return parsed;
    }
  } catch (e) {
    // If fs reading fails, fallback to in-memory store
  }
  return globalThis.__LOGJOBS_STORE__;
}

function saveLocalStore(data) {
  globalThis.__LOGJOBS_STORE__ = data;
  try {
    ensureLocalDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    // Ignored in read-only environments
  }
}

let isMigrated = false;

// Auto-run schema migration on Neon Postgres
async function migrateNeon(sql) {
  if (isMigrated) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'applicant',
        company_name TEXT,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        slug TEXT,
        hirer_id TEXT NOT NULL,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        logo_url TEXT,
        location TEXT NOT NULL,
        region TEXT NOT NULL,
        workplace_type TEXT NOT NULL DEFAULT 'Remote',
        job_type TEXT NOT NULL DEFAULT 'Full Time',
        salary TEXT,
        description TEXT NOT NULL,
        stacks JSONB DEFAULT '[]'::jsonb,
        custom_questions JSONB DEFAULT '[]'::jsonb,
        status TEXT NOT NULL DEFAULT 'active',
        views INTEGER DEFAULT 0,
        source TEXT DEFAULT 'Direct Hirer',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        applicant_id TEXT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        linkedin TEXT,
        github TEXT,
        portfolio TEXT,
        resume_data TEXT,
        resume_filename TEXT,
        resume_size INTEGER,
        cover_note TEXT,
        custom_answers JSONB DEFAULT '[]'::jsonb,
        status TEXT NOT NULL DEFAULT 'applied',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    isMigrated = true;
  } catch (err) {
    console.error('Neon DB migration error (will use fallback if needed):', err.message);
  }
}

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl && !databaseUrl.includes('placeholder') && !databaseUrl.includes('example')) {
    try {
      const sql = neon(databaseUrl);
      migrateNeon(sql);
      return { type: 'neon', sql };
    } catch {
      return { type: 'local' };
    }
  }
  return { type: 'local' };
}

// ──────────────── User Operations ────────────────

export async function getUserByEmail(email) {
  const db = getDb();
  const normalizedEmail = email.toLowerCase().trim();

  if (db.type === 'neon') {
    try {
      const rows = await db.sql`SELECT * FROM users WHERE LOWER(email) = ${normalizedEmail} LIMIT 1`;
      return rows[0] || null;
    } catch (e) {
      console.warn('Neon query fallback to local:', e.message);
    }
  }

  const store = getLocalStore();
  return store.users.find(u => u.email.toLowerCase() === normalizedEmail) || null;
}

export async function getUserById(id) {
  const db = getDb();
  if (db.type === 'neon') {
    try {
      const rows = await db.sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
      return rows[0] || null;
    } catch (e) {
      console.warn('Neon query fallback to local:', e.message);
    }
  }

  const store = getLocalStore();
  return store.users.find(u => u.id === id) || null;
}

export async function createUser({ email, passwordHash, name, role = 'applicant', companyName = '' }) {
  const db = getDb();
  const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const normalizedEmail = email.toLowerCase().trim();
  const createdAt = new Date().toISOString();

  if (db.type === 'neon') {
    try {
      const rows = await db.sql`
        INSERT INTO users (id, email, password_hash, name, role, company_name, created_at)
        VALUES (${id}, ${normalizedEmail}, ${passwordHash}, ${name}, ${role}, ${companyName}, ${createdAt})
        RETURNING *
      `;
      return rows[0];
    } catch (e) {
      console.warn('Neon insert fallback to local:', e.message);
    }
  }

  const store = getLocalStore();
  const newUser = {
    id,
    email: normalizedEmail,
    password_hash: passwordHash,
    name,
    role,
    company_name: companyName,
    email_verified: false,
    created_at: createdAt
  };
  store.users.push(newUser);
  saveLocalStore(store);
  return newUser;
}

// ──────────────── Job Operations ────────────────

export async function createJob({
  hirerId,
  title,
  company,
  logoUrl = '',
  location,
  region = 'Remote',
  workplaceType = 'Remote',
  jobType = 'Full Time',
  salary = '',
  description,
  stacks = [],
  customQuestions = []
}) {
  const db = getDb();
  const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${id.slice(-6)}`;
  const createdAt = new Date().toISOString();

  if (db.type === 'neon') {
    try {
      const rows = await db.sql`
        INSERT INTO jobs (
          id, slug, hirer_id, title, company, logo_url, location, region,
          workplace_type, job_type, salary, description, stacks, custom_questions,
          status, views, source, created_at
        ) VALUES (
          ${id}, ${slug}, ${hirerId}, ${title}, ${company}, ${logoUrl}, ${location},
          ${region}, ${workplaceType}, ${jobType}, ${salary}, ${description},
          ${JSON.stringify(stacks)}, ${JSON.stringify(customQuestions)},
          'active', 0, 'Direct Hirer', ${createdAt}
        ) RETURNING *
      `;
      return rows[0];
    } catch (e) {
      console.warn('Neon createJob fallback to local:', e.message);
    }
  }

  const store = getLocalStore();
  const newJob = {
    id,
    slug,
    hirer_id: hirerId,
    title,
    company,
    logo_url: logoUrl,
    location,
    region,
    workplace_type: workplaceType,
    job_type: jobType,
    salary,
    description,
    stacks,
    custom_questions: customQuestions,
    status: 'active',
    views: 0,
    source: 'Direct Hirer',
    created_at: createdAt
  };
  store.jobs.unshift(newJob);
  saveLocalStore(store);
  return newJob;
}

export async function getJobById(id) {
  const db = getDb();
  if (db.type === 'neon') {
    try {
      const rows = await db.sql`SELECT * FROM jobs WHERE id = ${id} OR slug = ${id} LIMIT 1`;
      if (rows[0]) {
        // Increment views
        await db.sql`UPDATE jobs SET views = views + 1 WHERE id = ${rows[0].id}`;
        return {
          ...rows[0],
          stacks: typeof rows[0].stacks === 'string' ? JSON.parse(rows[0].stacks) : (rows[0].stacks || []),
          custom_questions: typeof rows[0].custom_questions === 'string' ? JSON.parse(rows[0].custom_questions) : (rows[0].custom_questions || [])
        };
      }
    } catch (e) {
      console.warn('Neon getJobById fallback to local:', e.message);
    }
  }

  const store = getLocalStore();
  const job = store.jobs.find(j => j.id === id || j.slug === id);
  if (job) {
    job.views = (job.views || 0) + 1;
    saveLocalStore(store);
  }
  return job || null;
}

export async function getJobsByHirerId(hirerId) {
  const db = getDb();
  if (db.type === 'neon') {
    try {
      const rows = await db.sql`
        SELECT j.*, 
          (SELECT COUNT(*)::int FROM applications a WHERE a.job_id = j.id) AS applications_count
        FROM jobs j 
        WHERE j.hirer_id = ${hirerId} 
        ORDER BY j.created_at DESC
      `;
      return rows.map(r => ({
        ...r,
        stacks: typeof r.stacks === 'string' ? JSON.parse(r.stacks) : (r.stacks || []),
        custom_questions: typeof r.custom_questions === 'string' ? JSON.parse(r.custom_questions) : (r.custom_questions || [])
      }));
    } catch (e) {
      console.warn('Neon getJobsByHirerId fallback to local:', e.message);
    }
  }

  const store = getLocalStore();
  return store.jobs
    .filter(j => j.hirer_id === hirerId)
    .map(j => {
      const appsCount = store.applications.filter(a => a.job_id === j.id).length;
      return { ...j, applications_count: appsCount };
    });
}

export async function updateJob(id, updates) {
  const db = getDb();
  if (db.type === 'neon') {
    try {
      if (updates.status !== undefined) {
        await db.sql`UPDATE jobs SET status = ${updates.status} WHERE id = ${id}`;
      }
      return getJobById(id);
    } catch (e) {
      console.warn('Neon updateJob fallback to local:', e.message);
    }
  }

  const store = getLocalStore();
  const idx = store.jobs.findIndex(j => j.id === id);
  if (idx !== -1) {
    store.jobs[idx] = { ...store.jobs[idx], ...updates };
    saveLocalStore(store);
    return store.jobs[idx];
  }
  return null;
}

export async function deleteJob(id, hirerId) {
  const db = getDb();
  if (db.type === 'neon') {
    try {
      await db.sql`DELETE FROM jobs WHERE id = ${id} AND hirer_id = ${hirerId}`;
      return true;
    } catch (e) {
      console.warn('Neon deleteJob fallback to local:', e.message);
    }
  }

  const store = getLocalStore();
  store.jobs = store.jobs.filter(j => !(j.id === id && j.hirer_id === hirerId));
  saveLocalStore(store);
  return true;
}

export async function getDbJobs({ region = '', category = '' } = {}) {
  console.log(`[DB] getDbJobs called with category: "${category}", region: "${region}"`);
  const db = getDb();
  let jobs = [];

  if (db.type === 'neon') {
    try {
      const rows = await db.sql`SELECT * FROM jobs WHERE status = 'active' ORDER BY created_at DESC`;
      jobs = rows.map(r => ({
        ...r,
        stacks: typeof r.stacks === 'string' ? JSON.parse(r.stacks) : (r.stacks || []),
        custom_questions: typeof r.custom_questions === 'string' ? JSON.parse(r.custom_questions) : (r.custom_questions || []),
        postedAt: r.created_at,
        url: `/jobs/${r.id}`
      }));
      console.log(`[DB:Neon] Fetched ${jobs.length} active jobs`);
    } catch (e) {
      console.warn('[DB:Neon] Neon getDbJobs fallback to local:', e.message);
    }
  }

  if (!jobs.length) {
    const store = getLocalStore();
    jobs = (store.jobs || [])
      .filter(j => j.status === 'active')
      .map(j => ({
        ...j,
        postedAt: j.created_at,
        url: `/jobs/${j.id}`
      }));
    console.log(`[DB:Local] Fetched ${jobs.length} local jobs from store`);
  }

  let filtered = jobs;
  if (category === 'nigerian') {
    filtered = jobs.filter(j => 
      j.region === 'Nigeria' || 
      (j.location && j.location.toLowerCase().includes('nigeria')) ||
      (j.location && (j.location.toLowerCase().includes('lagos') || j.location.toLowerCase().includes('abuja') || j.location.toLowerCase().includes('ibadan') || j.location.toLowerCase().includes('port harcourt')))
    );
  } else if (category === 'global') {
    filtered = jobs.filter(j => j.region !== 'Nigeria');
  }

  console.log(`[DB] Filtered to ${filtered.length} DB jobs for category "${category}"`);
  return filtered;
}

// ──────────────── Application Operations ────────────────

export async function createApplication({
  jobId,
  applicantId = null,
  name,
  email,
  phone = '',
  linkedin = '',
  github = '',
  portfolio = '',
  resumeData = '',
  resumeFilename = '',
  resumeSize = 0,
  coverNote = '',
  customAnswers = []
}) {
  const db = getDb();
  const id = `app_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
  const createdAt = new Date().toISOString();

  if (db.type === 'neon') {
    try {
      const rows = await db.sql`
        INSERT INTO applications (
          id, job_id, applicant_id, name, email, phone, linkedin, github,
          portfolio, resume_data, resume_filename, resume_size, cover_note,
          custom_answers, status, created_at
        ) VALUES (
          ${id}, ${jobId}, ${applicantId}, ${name}, ${email}, ${phone}, ${linkedin}, ${github},
          ${portfolio}, ${resumeData}, ${resumeFilename}, ${resumeSize}, ${coverNote},
          ${JSON.stringify(customAnswers)}, 'applied', ${createdAt}
        ) RETURNING *
      `;
      return rows[0];
    } catch (e) {
      console.warn('Neon createApplication fallback to local:', e.message);
    }
  }

  const store = getLocalStore();
  const newApp = {
    id,
    job_id: jobId,
    applicant_id: applicantId,
    name,
    email,
    phone,
    linkedin,
    github,
    portfolio,
    resume_data: resumeData,
    resume_filename: resumeFilename,
    resume_size: resumeSize,
    cover_note: coverNote,
    custom_answers: customAnswers,
    status: 'applied',
    created_at: createdAt
  };
  store.applications.unshift(newApp);
  saveLocalStore(store);
  return newApp;
}

export async function getApplicationsByJobId(jobId) {
  const db = getDb();
  if (db.type === 'neon') {
    try {
      const rows = await db.sql`
        SELECT * FROM applications WHERE job_id = ${jobId} ORDER BY created_at DESC
      `;
      return rows.map(r => ({
        ...r,
        custom_answers: typeof r.custom_answers === 'string' ? JSON.parse(r.custom_answers) : (r.custom_answers || [])
      }));
    } catch (e) {
      console.warn('Neon getApplicationsByJobId fallback to local:', e.message);
    }
  }

  const store = getLocalStore();
  return store.applications.filter(a => a.job_id === jobId);
}

export async function getApplicationsByApplicantId(applicantId, applicantEmail = '') {
  const db = getDb();
  if (db.type === 'neon') {
    try {
      const rows = await db.sql`
        SELECT a.*, j.title as job_title, j.company as job_company, j.location as job_location, j.region as job_region
        FROM applications a
        LEFT JOIN jobs j ON a.job_id = j.id
        WHERE a.applicant_id = ${applicantId} OR LOWER(a.email) = ${applicantEmail.toLowerCase()}
        ORDER BY a.created_at DESC
      `;
      return rows;
    } catch (e) {
      console.warn('Neon getApplicationsByApplicantId fallback to local:', e.message);
    }
  }

  const store = getLocalStore();
  return store.applications
    .filter(a => (applicantId && a.applicant_id === applicantId) || (applicantEmail && a.email.toLowerCase() === applicantEmail.toLowerCase()))
    .map(a => {
      const job = store.jobs.find(j => j.id === a.job_id) || {};
      return {
        ...a,
        job_title: job.title || 'Tech Job',
        job_company: job.company || 'Company',
        job_location: job.location || 'Remote',
        job_region: job.region || 'Remote'
      };
    });
}

export async function updateApplicationStatus(id, status) {
  const db = getDb();
  if (db.type === 'neon') {
    try {
      await db.sql`UPDATE applications SET status = ${status} WHERE id = ${id}`;
      return true;
    } catch (e) {
      console.warn('Neon updateApplicationStatus fallback to local:', e.message);
    }
  }

  const store = getLocalStore();
  const app = store.applications.find(a => a.id === id);
  if (app) {
    app.status = status;
    saveLocalStore(store);
    return true;
  }
  return false;
}
