# DevJobs.ng 🇳🇬

> Remote tech jobs aggregator for African developers. Scrapes RemoteOK, Remotive, Arbeitnow and more — filtered for React, Next.js, Django, Node.js and more.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Sources (Free, No API Key Needed)

| Source | Type | Notes |
|--------|------|-------|
| RemoteOK | Free API | Great for remote dev jobs |
| Remotive | Free API | Software dev category |
| Arbeitnow | Free API | European + remote jobs |
| Google Jobs | Puppeteer | See `lib/scrapers/puppeteer.js` |
| Twitter/X | Puppeteer | Requires Twitter API v2 key |

---

## 🧠 Adding More Sources

1. Create a new file in `lib/scrapers/yoursite.js`
2. Export an async function that returns normalized jobs:

```js
export async function scrapeYourSite() {
  // fetch or puppeteer scrape
  return jobs.map(job => ({
    id: `yoursite-${job.id}`,
    title: job.title,
    company: job.company,
    location: job.location,
    region: detectRegion(job.location), // 'Nigeria' | 'Africa' | 'Remote' | 'Europe' | 'America'
    type: 'Remote',                     // 'Full Time' | 'Contract' | 'Remote'
    stacks: [],                         // ['React', 'Django', ...]
    salary: '',
    url: job.url,
    postedAt: job.date,
    source: 'YourSite',
    logo: '',
  }))
}
```

3. Import and add it to `app/api/jobs/route.js`:

```js
import { scrapeYourSite } from '@/lib/scrapers/yoursite'

const [remoteok, remotive, arbeitnow, yoursite] = await Promise.allSettled([
  scrapeRemoteOK(),
  scrapeRemotive(),
  scrapeArbeitnow(),
  scrapeYourSite(),       // ← add here
])
```

---

## 🔧 Using Puppeteer (for dynamic sites)

For Google Jobs, LinkedIn, etc:

```bash
npm install puppeteer
```

See `lib/scrapers/puppeteer.js` for the Google Jobs and Twitter implementations.

For anti-ban on LinkedIn/Google:
```bash
npm install puppeteer-extra puppeteer-extra-plugin-stealth
```

---

## 🗺 Stack

- **Next.js 14** (App Router)
- **Puppeteer** (for dynamic scraping)
- **React** (frontend)
- Sources: RemoteOK API, Remotive API, Arbeitnow API

---

## 💰 Monetization Ideas

- Email job alerts (free tier → paid)
- Featured listings (charge companies)
- Talent profiles (companies pay to search)
- Premium filters (salary range, experience level)
