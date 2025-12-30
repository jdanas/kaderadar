import FirecrawlApp from "@mendable/firecrawl-js";
import { Job, ScrapeResult } from "../types/job.js";

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY || "",
});

const JOB_SCHEMA = {
  type: "object",
  properties: {
    jobs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "Job title" },
          company: { type: "string", description: "Company name" },
          location: { type: "string", description: "Job location" },
          salary: { type: "string", description: "Salary range if available" },
          description: { type: "string", description: "Brief job description" },
          job_type: {
            type: "string",
            description: "Full-time, Part-time, Contract, etc.",
          },
          job_url: {
            type: "string",
            description: "Direct URL to the job posting",
          },
          posted_date: {
            type: "string",
            description: "When the job was posted",
          },
        },
        required: ["title", "company"],
      },
    },
  },
  required: ["jobs"],
};

// Helper to standardise scraping multiple URLs
async function scrapeAndExtract(
  urls: string[],
  platform: "google" | "indeed" | "jobstreet" | "careersgov",
  prompt: string,
  actions?: any[]
): Promise<Job[]> {
  const allJobs: Job[] = [];

  for (const url of urls) {
    try {
      const result = await firecrawl.scrapeUrl(url, {
        formats: ["extract"],
        actions: actions,
        extract: {
          schema: JOB_SCHEMA as any,
          prompt,
        },
      });

      if (result.success && result.extract) {
        const extractedJobs =
          (
            result.extract as {
              jobs?: Array<{
                title: string;
                company: string;
                location?: string;
                salary?: string;
                description?: string;
                job_type?: string;
                job_url?: string;
                posted_date?: string;
              }>;
            }
          ).jobs || [];

        const mappedJobs: Job[] = extractedJobs.map((job) => ({
          title: job.title,
          company: job.company,
          location: job.location || "Singapore",
          salary: job.salary,
          description: job.description,
          job_type: job.job_type,
          source_url: job.job_url || url,
          source_platform: platform,
          posted_date: job.posted_date,
        }));
        allJobs.push(...mappedJobs);
      }
    } catch (error) {
      console.error(`Error scraping ${platform} url ${url}:`, error);
      // Continue to next URL even if one fails
    }
  }

  return allJobs;
}

export const firecrawlService = {
  async scrapeGoogleJobs(): Promise<ScrapeResult> {
    try {
      const url =
        "https://www.google.com/search?q=AI+Engineer+OR+Machine+Learning+Engineer+OR+Full+Stack+Engineer+OR+Software+Engineer+OR+Full+Stack+Developer+jobs+in+Singapore&ibp=htl;jobs";

      // Google jobs often infinite scrolls, so we add scroll actions
      const actions = [
        { type: "scroll", direction: "down" },
        { type: "wait", milliseconds: 1000 },
        { type: "scroll", direction: "down" },
        { type: "wait", milliseconds: 1000 },
        { type: "scroll", direction: "down" },
        { type: "wait", milliseconds: 1000 },
      ];

      const jobs = await scrapeAndExtract(
        [url],
        "google",
        "Extract all job listings from this Google Jobs page. For each job, get the title, company name, location, salary (if shown), brief description, job type, the direct URL to apply, and when it was posted. Focus on AI Engineer, Machine Learning Engineer, Full Stack Engineer, Software Engineer, Full Stack Developer, and Lead Engineer positions. Only include jobs located in Singapore.",
        actions
      );

      return { success: true, jobs };
    } catch (error) {
      console.error("Google Jobs scrape error:", error);
      return {
        success: false,
        jobs: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  async scrapeIndeed(): Promise<ScrapeResult> {
    try {
      const baseUrl =
        "https://sg.indeed.com/jobs?q=AI+Engineer+OR+Full+Stack+Engineer+OR+Software+Engineer+OR+Full+Stack+Developer&l=Singapore";
      
      // Scrape first 2 pages
      const urls = [
        baseUrl,
        `${baseUrl}&start=10`
      ];

      // Indeed might lazy load some content or detect bots. Scrolling helps.
      const actions = [
        { type: "scroll", direction: "down" },
        { type: "wait", milliseconds: 1500 },
        { type: "scroll", direction: "down" },
        { type: "wait", milliseconds: 1500 }
      ];

      const jobs = await scrapeAndExtract(
        urls,
        "indeed",
        "Extract all job listings from this Indeed jobs page. For each job, get the title, company name, location, salary (if shown), brief description, job type, the direct URL to apply, and when it was posted. Look for job cards or list items. Focus on AI Engineer, Full Stack Engineer, Software Engineer, Full Stack Developer, and Machine Learning Engineer roles. Only include jobs located in Singapore.",
        actions
      );

      return { success: true, jobs };
    } catch (error) {
      console.error("Indeed scrape error:", error);
      return {
        success: false,
        jobs: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  async scrapeJobStreet(): Promise<ScrapeResult> {
    try {
      const baseUrl =
        "https://www.jobstreet.com.sg/jobs?keywords=AI%20Engineer%20OR%20Full%20Stack%20Engineer%20OR%20Software%20Engineer%20OR%20Full%20Stack%20Developer";
      
      // Scrape first 2 pages (page 1 is default, page 2 added)
      const urls = [
        baseUrl,
        `${baseUrl}&pg=2`
      ];

      // JobStreet is relatively static but scrolling doesn't hurt to ensure everything is in viewport
      const actions = [
        { type: "scroll", direction: "down" },
        { type: "wait", milliseconds: 1000 }
      ];

      const jobs = await scrapeAndExtract(
        urls,
        "jobstreet",
        "Extract all job listings from this JobStreet page. For each job, get the title, company name, location, salary (if shown), brief description, job type, the direct URL to apply, and when it was posted. Focus on AI Engineer, Full Stack Engineer, Software Engineer, Full Stack Developer, and related technical roles. Only include jobs located in Singapore.",
        actions
      );

      return { success: true, jobs };
    } catch (error) {
      console.error("JobStreet scrape error:", error);
      return {
        success: false,
        jobs: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  async scrapeCareersGov(): Promise<ScrapeResult> {
    try {
      const url = "https://jobs.careers.gov.sg/";
      
      // Careers.gov.sg is a SPA and might require interaction to see more jobs if we don't have deep link pagination
      // We will scroll aggressively to trigger any lazy loading
      const actions = [
        { type: "scroll", direction: "down" },
        { type: "wait", milliseconds: 2000 },
        { type: "scroll", direction: "down" },
        { type: "wait", milliseconds: 2000 },
        { type: "scroll", direction: "down" },
        { type: "wait", milliseconds: 2000 }
      ];

      const jobs = await scrapeAndExtract(
        [url],
        "careersgov",
        "Extract all job listings from this Singapore government careers page. For each job, get the title, company/agency name, location, salary (if shown), brief description, job type, the direct URL to apply, and when it was posted. Focus on AI Engineer, Full Stack Engineer, Software Engineer, Full Stack Developer, Machine Learning, Data Science, and technology positions related to AI/ML.",
        actions
      );

      return { success: true, jobs };
    } catch (error) {
      console.error("Careers.gov.sg scrape error:", error);
      return {
        success: false,
        jobs: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  async scrapeAll(): Promise<ScrapeResult> {
    const [googleResult, indeedResult, careersgovResult] = await Promise.all([
      this.scrapeGoogleJobs(),
      this.scrapeIndeed(),
      this.scrapeCareersGov(),
    ]);

    const allJobs = [
      ...googleResult.jobs,
      ...indeedResult.jobs,
      ...careersgovResult.jobs,
    ];
    const errors: string[] = [];

    if (!googleResult.success && googleResult.error) {
      errors.push(`Google Jobs: ${googleResult.error}`);
    }
    if (!indeedResult.success && indeedResult.error) {
      errors.push(`Indeed: ${indeedResult.error}`);
    }
    if (!careersgovResult.success && careersgovResult.error) {
      errors.push(`Careers.gov.sg: ${careersgovResult.error}`);
    }

    return {
      success:
        googleResult.success ||
        indeedResult.success ||
        careersgovResult.success,
      jobs: allJobs,
      error: errors.length > 0 ? errors.join("; ") : undefined,
    };
  },
};
