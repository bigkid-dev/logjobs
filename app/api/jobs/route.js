import { scrapeRemoteOK } from "../../../lib/scrapers/remoteok.js";
import { scrapeRemotive } from "../../../lib/scrapers/remotive.js";
import { scrapeArbeitnow } from "../../../lib/scrapers/arbeitnow.js";
import { scrapeHimalayas } from "../../../lib/scrapers/himalayas.js";
import { scrapeWeWorkRemotely } from "../../../lib/scrapers/weworkremotely.js";
import { scrapeNigerianJobs } from "../../../lib/scrapers/nigerianJobs.js";
import { scrapeSmartyAcad } from "../../../lib/scrapers/smartyacad.js";
import {
  deduplicateJobs,
  matchesStack,
  extractStacks,
  detectRegion,
  matchesLocationQuery,
  sanitizeStacks
} from "../../../lib/normalize.js";
import { getDbJobs, createJob, getJobsByHirerId } from "../../../lib/db.js";
import { getSessionUser } from "../../../lib/auth.js";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

// In-memory scraper cache to make responses instantaneous on Vercel
let cachedScrapedJobs = null;
let lastScrapeTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

async function fetchExternalScrapedJobs() {
  const now = Date.now();
  if (cachedScrapedJobs && (now - lastScrapeTime) < CACHE_TTL_MS) {
    console.log(`[API /api/jobs] Serving ${cachedScrapedJobs.length} external jobs from in-memory cache`);
    return cachedScrapedJobs;
  }

  let scrapedJobs = [];
  try {
    const [remoteok, remotive, arbeitnow, himalayas, wwr, nigerianJobs, smartyacad] = await Promise.allSettled([
      scrapeRemoteOK(),
      scrapeRemotive(),
      scrapeArbeitnow(),
      scrapeHimalayas(),
      scrapeWeWorkRemotely(),
      scrapeNigerianJobs(),
      scrapeSmartyAcad()
    ]);

    const rOkCount = remoteok.status === "fulfilled" ? remoteok.value.length : 0;
    const remotiveCount = remotive.status === "fulfilled" ? remotive.value.length : 0;
    const arbeitnowCount = arbeitnow.status === "fulfilled" ? arbeitnow.value.length : 0;
    const himalayasCount = himalayas.status === "fulfilled" ? himalayas.value.length : 0;
    const wwrCount = wwr.status === "fulfilled" ? wwr.value.length : 0;
    const ngCount = nigerianJobs.status === "fulfilled" ? nigerianJobs.value.length : 0;
    const smartyCount = smartyacad.status === "fulfilled" ? smartyacad.value.length : 0;

    console.log(`[API /api/jobs] Scraper fresh results: RemoteOK (${rOkCount}), Remotive (${remotiveCount}), Arbeitnow (${arbeitnowCount}), Himalayas (${himalayasCount}), WWR (${wwrCount}), NigerianJobs (${ngCount}), SmartyAcad (${smartyCount})`);

    scrapedJobs = [
      ...(remoteok.status === "fulfilled" ? remoteok.value : []),
      ...(remotive.status === "fulfilled" ? remotive.value : []),
      ...(arbeitnow.status === "fulfilled" ? arbeitnow.value : []),
      ...(himalayas.status === "fulfilled" ? himalayas.value : []),
      ...(wwr.status === "fulfilled" ? wwr.value : []),
      ...(nigerianJobs.status === "fulfilled" ? nigerianJobs.value : []),
      ...(smartyacad.status === "fulfilled" ? smartyacad.value : [])
    ];
  } catch (scrapeErr) {
    console.warn("[API /api/jobs] External scraping warning:", scrapeErr.message);
  }

  const normalized = scrapedJobs.map((job) => ({
    ...job,
    stacks: sanitizeStacks([...(job.stacks || []), ...extractStacks(job.title)]),
    region: job.region || detectRegion(job.location)
  }));

  if (normalized.length > 0) {
    cachedScrapedJobs = normalized;
    lastScrapeTime = now;
  }

  return cachedScrapedJobs || normalized;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "nigerian"; // 'nigerian' | 'global' | 'my-jobs' | 'all'
  const stacks = searchParams.get("stacks")?.split(",").filter(Boolean) || [];
  const region = searchParams.get("region") || "";
  const type = searchParams.get("type") || "";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "30");

  console.log(`[API /api/jobs] GET Request - category: "${category}", region: "${region}", type: "${type}", search: "${search}", stacks: [${stacks.join(', ')}], page: ${page}`);

  try {
    // If 'my-jobs' requested, get hirer's posted jobs
    if (category === 'my-jobs') {
      const user = await getSessionUser();
      if (!user) {
        return Response.json({ error: "Authentication required" }, { status: 401 });
      }
      const myJobs = await getJobsByHirerId(user.id);
      return Response.json({
        jobs: myJobs,
        total: myJobs.length,
        page: 1,
        pages: 1
      });
    }

    // 1. Fetch DB jobs safely
    let dbJobs = [];
    try {
      dbJobs = await getDbJobs({ category });
    } catch (dbErr) {
      console.warn("[API /api/jobs] DB read warning:", dbErr.message);
    }

    // 2. Fetch external scraped jobs (cached)
    const normalizedScraped = await fetchExternalScrapedJobs();

    // 3. Combine real DB jobs first with external scraped jobs
    let allJobs = [...dbJobs, ...normalizedScraped];

    // Filter by active feed category tab
    if (category === 'nigerian') {
      allJobs = allJobs.filter(job => {
        const loc = (job.location || '').toLowerCase();
        const reg = (job.region || '').toLowerCase();
        const isNigerian = reg === 'nigeria' || loc.includes('nigeria') || loc.includes('lagos') || loc.includes('abuja') || loc.includes('ibadan') || loc.includes('port harcourt');
        const isRemoteWorldwide = reg === 'remote' || loc.includes('remote') || loc.includes('worldwide') || loc.includes('anywhere');
        return isNigerian || isRemoteWorldwide;
      });

      // Sort so local Nigerian direct employer jobs appear at the top
      allJobs.sort((a, b) => {
        const aIsLocal = a.region === 'Nigeria' || a.location?.toLowerCase().includes('nigeria') || a.location?.toLowerCase().includes('lagos');
        const bIsLocal = b.region === 'Nigeria' || b.location?.toLowerCase().includes('nigeria') || b.location?.toLowerCase().includes('lagos');
        if (aIsLocal && !bIsLocal) return -1;
        if (!aIsLocal && bIsLocal) return 1;
        return 0;
      });
    } else if (category === 'global') {
      allJobs = allJobs.filter(job => job.region !== 'Nigeria');
    }

    // Deduplicate and sanitize stacks
    allJobs = deduplicateJobs(allJobs).map(job => ({
      ...job,
      stacks: sanitizeStacks(job.stacks)
    }));

    // ── Apply Query Filters ───────────────────────────────────
    if (stacks.length) {
      allJobs = allJobs.filter((job) => matchesStack(job, stacks));
    }

    if (region) {
      allJobs = allJobs.filter(
        (job) =>
          job.region?.toLowerCase() === region.toLowerCase() ||
          matchesLocationQuery(job.location || '', job.title || '', job.description || '', region)
      );
    }

    if (type) {
      allJobs = allJobs.filter((job) =>
        (job.type || job.job_type || '').toLowerCase().includes(type.toLowerCase())
      );
    }

    if (search) {
      const s = search.toLowerCase();
      allJobs = allJobs.filter(
        (job) =>
          job.title?.toLowerCase().includes(s) ||
          job.company?.toLowerCase().includes(s) ||
          (job.stacks && job.stacks.some(stk => stk.toLowerCase().includes(s))) ||
          matchesLocationQuery(job.location || '', job.title || '', job.description || '', s)
      );
    }

    // ── Pagination ────────────────────────────────────────────
    const total = allJobs.length;
    const start = (page - 1) * limit;
    const paginated = allJobs.slice(start, start + limit);

    return Response.json({
      jobs: paginated,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      category
    });
  } catch (err) {
    console.error("[API /api/jobs] Fallback handler caught error:", err);
    // Never fail with 500 on Vercel: return graceful response with whatever cached jobs exist
    const fallbackJobs = cachedScrapedJobs || [];
    return Response.json({
      jobs: fallbackJobs.slice(0, 30),
      total: fallbackJobs.length,
      page: 1,
      pages: 1,
      category,
      warning: "Serving cached roles"
    });
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return Response.json({ error: "Authentication required to post a job" }, { status: 401 });
    }

    if (user.role !== 'hirer') {
      return Response.json({ error: "Only Hirer accounts can post jobs" }, { status: 403 });
    }

    const body = await request.json();
    const {
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
      customQuestions = [],
      isAnonymous = false,
      ogImageUrl = ''
    } = body;

    if (!title || !location || !description) {
      return Response.json(
        { error: "Job title, location, and description are required" },
        { status: 400 }
      );
    }

    const resolvedCompany = isAnonymous
      ? (company?.trim() || 'Confidential Employer')
      : (company?.trim() || user.company_name || 'Hiring Company');

    const newJob = await createJob({
      hirerId: user.id,
      title,
      company: resolvedCompany,
      logoUrl: isAnonymous ? '' : logoUrl,
      location,
      region,
      workplaceType,
      jobType,
      salary,
      description,
      stacks: sanitizeStacks(stacks),
      customQuestions,
      isAnonymous: Boolean(isAnonymous),
      ogImageUrl
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareableLink = `${appUrl}/jobs/${newJob.id}`;

    return Response.json({
      job: newJob,
      shareableLink,
      message: "Job created successfully!"
    }, { status: 201 });
  } catch (err) {
    console.error("Create Job API error:", err);
    return Response.json(
      { error: err.message || "Failed to create job" },
      { status: 500 }
    );
  }
}
