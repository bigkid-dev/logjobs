/**
 * Google Jobs Scraper (Puppeteer)
 * Extend this to scrape Google Jobs, Twitter, LinkedIn etc.
 * Requires: npm install puppeteer
 * 
 * Usage: import { scrapeGoogleJobs } from './google.js'
 * const jobs = await scrapeGoogleJobs('React developer Nigeria')
 */

import { detectRegion, extractStacks } from '../normalize.js'

export async function scrapeGoogleJobs(query = 'React developer remote') {
  let browser
  try {
    const puppeteer = await import('puppeteer')
    browser = await puppeteer.default.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
      ],
    })

    const page = await browser.newPage()

    // Spoof a real browser
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    )

    const url = `https://www.google.com/search?q=${encodeURIComponent(query + ' jobs')}&ibp=htl;jobs`
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

    // Wait for job cards to load
    await page.waitForSelector('[data-ved]', { timeout: 10000 }).catch(() => {})

    // Random delay to avoid detection
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000))

    const jobs = await page.evaluate(() => {
      const cards = document.querySelectorAll('.iFjolb') // Google Jobs card selector
      return Array.from(cards).map(card => ({
        title: card.querySelector('.BjJfJf')?.innerText || '',
        company: card.querySelector('.vNEEBe')?.innerText || '',
        location: card.querySelector('.Qk80Jf')?.innerText || 'Remote',
        url: card.querySelector('a')?.href || '',
      }))
    })

    return jobs
      .filter(j => j.title)
      .map((job, i) => ({
        id: `google-${Date.now()}-${i}`,
        title: job.title,
        company: job.company,
        location: job.location,
        region: detectRegion(job.location),
        type: 'Full Time',
        stacks: extractStacks(job.title),
        salary: '',
        url: job.url,
        postedAt: new Date().toISOString(),
        source: 'Google Jobs',
        logo: '',
      }))
  } catch (err) {
    console.error('Google Jobs scraper failed:', err.message)
    return []
  } finally {
    if (browser) await browser.close()
  }
}

/**
 * Twitter/X Job Scraper (Puppeteer)
 * Searches Twitter for job postings using hashtags
 */
export async function scrapeTwitterJobs(query = 'react developer hiring remote') {
  let browser
  try {
    const puppeteer = await import('puppeteer')
    browser = await puppeteer.default.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')

    const searchQuery = encodeURIComponent(`${query} #hiring -is:retweet lang:en`)
    await page.goto(`https://twitter.com/search?q=${searchQuery}&f=live`, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    })

    // Twitter requires login for most searches now
    // Consider using the Twitter API v2 with bearer token instead
    // https://developer.twitter.com/en/docs/twitter-api

    console.warn('Twitter scraping requires authentication. Use Twitter API v2 instead.')
    return []
  } catch (err) {
    console.error('Twitter scraper failed:', err.message)
    return []
  } finally {
    if (browser) await browser.close()
  }
}

// ========== NEW NIGERIAN JOB FUNCTIONS (Doesn't affect existing code) ==========

/**
 * Enhanced Google Jobs scraper specifically for Nigerian market
 * Optimized with Nigerian keywords and location filtering
 */
export async function scrapeNigerianGoogleJobs(query = 'developer', location = 'Nigeria') {
  let browser
  try {
    const puppeteer = await import('puppeteer')
    browser = await puppeteer.default.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
      ],
    })

    const page = await browser.newPage()
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    )

    // Nigerian-specific search keywords
    const nigerianKeywords = ['Nigeria', 'Lagos', 'Abuja', 'remote Nigeria', 'Work from home Nigeria']
    const searchQuery = `${query} ${location} ${nigerianKeywords.join(' ')} jobs`
    
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&ibp=htl;jobs`
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

    await page.waitForSelector('[data-ved]', { timeout: 10000 }).catch(() => {})
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000))

    const jobs = await page.evaluate(() => {
      const cards = document.querySelectorAll('.iFjolb')
      return Array.from(cards).map(card => ({
        title: card.querySelector('.BjJfJf')?.innerText || '',
        company: card.querySelector('.vNEEBe')?.innerText || '',
        location: card.querySelector('.Qk80Jf')?.innerText || '',
        url: card.querySelector('a')?.href || '',
        salary: card.querySelector('.QLXjGb')?.innerText || '',
        description: card.querySelector('.HBvzbc')?.innerText || ''
      }))
    })

    // Filter for Nigerian jobs only
    const nigerianCities = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Benin', 'Enugu', 'Kaduna']
    const filteredJobs = jobs.filter(job => {
      const locationMatch = nigerianCities.some(city => 
        job.location?.toLowerCase().includes(city.toLowerCase())
      ) || job.location?.toLowerCase().includes('nigeria') ||
        job.title?.toLowerCase().includes('remote') // Include remote jobs
      return job.title && locationMatch
    })

    return filteredJobs.map((job, i) => ({
      id: `ng-google-${Date.now()}-${i}`,
      title: job.title,
      company: job.company,
      location: job.location || 'Nigeria (Remote possible)',
      region: detectRegion(job.location),
      type: job.title?.toLowerCase().includes('contract') ? 'Contract' : 
             job.title?.toLowerCase().includes('part') ? 'Part Time' : 'Full Time',
      stacks: extractStacks(job.title),
      salary: job.salary,
      url: job.url,
      postedAt: new Date().toISOString(),
      source: 'Google Jobs Nigeria',
      logo: '',
      description: job.description
    }))
  } catch (err) {
    console.error('Nigerian Google Jobs scraper failed:', err.message)
    return []
  } finally {
    if (browser) await browser.close()
  }
}

/**
 * Scrape from Nigerian-specific job platforms
 */
export async function scrapeNigerianJobBoards(query = 'software developer') {
  const allJobs = []
  
  // Jobberman (Nigeria's largest job platform)
  try {
    const puppeteer = await import('puppeteer')
    const browser = await puppeteer.default.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
    
    const jobbermanUrl = `https://www.jobberman.com/jobs?q=${encodeURIComponent(query)}&location=Nigeria`
    await page.goto(jobbermanUrl, { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    
    const jobbermanJobs = await page.evaluate(() => {
      const jobs = []
      document.querySelectorAll('.search-result-item, .job-list-item').forEach((item, idx) => {
        jobs.push({
          title: item.querySelector('.job-title, h3 a')?.innerText || '',
          company: item.querySelector('.company-name, .job-company')?.innerText || '',
          location: item.querySelector('.job-location, .location')?.innerText || 'Nigeria',
          url: item.querySelector('a')?.href || ''
        })
      })
      return jobs.slice(0, 10) // Limit to 10 per source
    })
    
    jobbermanJobs.forEach((job, i) => {
      if (job.title) {
        allJobs.push({
          id: `jobberman-${Date.now()}-${i}`,
          title: job.title,
          company: job.company,
          location: job.location,
          region: detectRegion(job.location),
          type: 'Full Time',
          stacks: extractStacks(job.title),
          salary: '',
          url: job.url,
          postedAt: new Date().toISOString(),
          source: 'Jobberman Nigeria',
          logo: ''
        })
      }
    })
    
    await browser.close()
  } catch (err) {
    console.error('Jobberman scraper failed:', err.message)
  }
  
  return allJobs
}

/**
 * Main Nigerian job aggregator - combines multiple sources
 */
export async function scrapeNigerianJobs(query = 'developer', location = 'Nigeria') {
  console.log(`🔍 Searching for Nigerian jobs: ${query} in ${location}`)
  
  // Run both scrapers in parallel
  const [googleJobs, jobbermanJobs] = await Promise.all([
    scrapeNigerianGoogleJobs(query, location),
    scrapeNigerianJobBoards(query)
  ])
  
  const allJobs = [...googleJobs, ...jobbermanJobs]
  
  // Remove duplicates based on title and company
  const uniqueJobs = allJobs.filter((job, index, self) => 
    index === self.findIndex(j => 
      j.title.toLowerCase() === job.title.toLowerCase() && 
      j.company.toLowerCase() === job.company.toLowerCase()
    )
  )
  
  console.log(`✅ Found ${uniqueJobs.length} Nigerian jobs (${googleJobs.length} from Google, ${jobbermanJobs.length} from Jobberman)`)
  
  return uniqueJobs
}

/**
 * Quick search for remote Nigerian jobs
 */
export async function scrapeRemoteNigerianJobs(query = 'developer') {
  return await scrapeNigerianJobs(`${query} remote work from home`, 'Remote')
}