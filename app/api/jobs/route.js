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
  matchesLocationQuery
} from "../../../lib/normalize.js";
import { getDbJobs, createJob, getJobsByHirerId } from "../../../lib/db.js";
import { getSessionUser } from "../../../lib/auth.js";

export const dynamic = "force-dynamic";

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
        console.log('[API /api/jobs] Unauthorized my-jobs request');
        return Response.json({ error: "Authentication required" }, { status: 401 });
      }
      const myJobs = await getJobsByHirerId(user.id);
      console.log(`[API /api/jobs] my-jobs returned ${myJobs.length} jobs for user ${user.id}`);
      return Response.json({
        jobs: myJobs,
        total: myJobs.length,
        page: 1,
        pages: 1
      });
    }

    // 1. Fetch DB jobs first (priority user-posted & seeded direct jobs)
    const dbJobs = await getDbJobs({ category });
    console.log(`[API /api/jobs] Loaded ${dbJobs.length} DB jobs for category "${category}"`);

    // 2. Fetch from external scrapers in parallel with graceful error handling
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

      console.log(`[API /api/jobs] Scraper results: RemoteOK (${rOkCount}), Remotive (${remotiveCount}), Arbeitnow (${arbeitnowCount}), Himalayas (${himalayasCount}), WWR (${wwrCount}), NigerianJobs (${ngCount}), SmartyAcad (${smartyCount})`);

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

    // 3. Normalize external scraped jobs
    let normalizedScraped = scrapedJobs.map((job) => ({
      ...job,
      stacks: [...new Set([...(job.stacks || []), ...extractStacks(job.title)])],
      region: job.region || detectRegion(job.location)
    }));

    // 4. Combine real DB jobs first (priority user-posted direct jobs) with external scraped jobs
    let allJobs = [...dbJobs, ...normalizedScraped];

    // Filter by active feed category tab
    if (category === 'nigerian') {
      // 1. Direct Nigerian jobs (Lagos, Abuja, Ibadan, Port Harcourt, Nigeria)
      // 2. Global Remote & Worldwide jobs (open to talent in Nigeria)
      // Filters out pure on-site international roles locked to specific foreign cities (e.g. on-site in Munich, Berlin, London)
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
      // Global remote opportunities
      allJobs = allJobs.filter(job => job.region !== 'Nigeria');
    }

    // Deduplicate
    allJobs = deduplicateJobs(allJobs);
    console.log(`[API /api/jobs] Total combined & deduplicated pool for category "${category}": ${allJobs.length} jobs`);

    // ── Apply Query Filters ───────────────────────────────────

    if (stacks.length) {
      allJobs = allJobs.filter((job) => matchesStack(job, stacks));
      console.log(`[API /api/jobs] After stacks filter [${stacks.join(',')}]: ${allJobs.length} jobs`);
    }

    if (region) {
      allJobs = allJobs.filter(
        (job) =>
          job.region?.toLowerCase() === region.toLowerCase() ||
          matchesLocationQuery(job.location || '', job.title || '', job.description || '', region)
      );
      console.log(`[API /api/jobs] After region filter "${region}": ${allJobs.length} jobs`);
    }

    if (type) {
      allJobs = allJobs.filter((job) =>
        (job.type || job.job_type || '').toLowerCase().includes(type.toLowerCase())
      );
      console.log(`[API /api/jobs] After type filter "${type}": ${allJobs.length} jobs`);
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
      console.log(`[API /api/jobs] After search filter "${search}": ${allJobs.length} jobs`);
    }

    // ── Pagination ────────────────────────────────────────────
    const total = allJobs.length;
    const start = (page - 1) * limit;
    const paginated = allJobs.slice(start, start + limit);

    console.log(`[API /api/jobs] Returning ${paginated.length} jobs (total: ${total}, pages: ${Math.ceil(total / limit) || 1})`);

    return Response.json({
      jobs: paginated,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      category
    });
  } catch (err) {
    console.error("[API /api/jobs] Error:", err);
    return Response.json(
      { error: "Failed to fetch jobs", details: err.message },
      { status: 500 }
    );
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
      company = user.company_name || 'Hiring Company',
      logoUrl = '',
      location,
      region = 'Remote',
      workplaceType = 'Remote',
      jobType = 'Full Time',
      salary = '',
      description,
      stacks = [],
      customQuestions = []
    } = body;

    if (!title || !location || !description) {
      return Response.json(
        { error: "Job title, location, and description are required" },
        { status: 400 }
      );
    }

    const newJob = await createJob({
      hirerId: user.id,
      title,
      company,
      logoUrl,
      location,
      region,
      workplaceType,
      jobType,
      salary,
      description,
      stacks,
      customQuestions
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
