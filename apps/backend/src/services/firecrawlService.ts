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

export const firecrawlService = {
  async scrapeLinkedIn(): Promise<ScrapeResult> {
    try {
      const url =
        "https://www.linkedin.com/jobs/search/?keywords=AI%20Engineer&location=Singapore&geoId=102454443&f_TPR=r604800";

      const result = await firecrawl.scrapeUrl(url, {
        formats: ["extract"],
        extract: {
          schema: JOB_SCHEMA,
          prompt:
            "Extract all job listings from this LinkedIn jobs page. For each job, get the title, company name, location, salary (if shown), brief description, job type, the direct URL to apply, and when it was posted. Only include jobs located in Singapore.",
        },
      });

      if (!result.success || !result.extract) {
        return { success: false, jobs: [], error: "Failed to scrape LinkedIn" };
      }

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

      const jobs: Job[] = extractedJobs.map((job) => ({
        title: job.title,
        company: job.company,
        location: job.location || "Singapore",
        salary: job.salary,
        description: job.description,
        job_type: job.job_type,
        source_url: job.job_url || url,
        source_platform: "linkedin" as const,
        posted_date: job.posted_date,
      }));

      return { success: true, jobs };
    } catch (error) {
      console.error("LinkedIn scrape error:", error);
      return {
        success: false,
        jobs: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  async scrapeIndeed(): Promise<ScrapeResult> {
    try {
      const url = "https://sg.indeed.com/jobs?q=AI+Engineer&l=Singapore";

      const result = await firecrawl.scrapeUrl(url, {
        formats: ["extract"],
        extract: {
          schema: JOB_SCHEMA,
          prompt:
            "Extract all job listings from this Indeed jobs page. For each job, get the title, company name, location, salary (if shown), brief description, job type, the direct URL to apply, and when it was posted. Only include jobs located in Singapore.",
        },
      });

      if (!result.success || !result.extract) {
        return { success: false, jobs: [], error: "Failed to scrape Indeed" };
      }

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

      const jobs: Job[] = extractedJobs.map((job) => ({
        title: job.title,
        company: job.company,
        location: job.location || "Singapore",
        salary: job.salary,
        description: job.description,
        job_type: job.job_type,
        source_url: job.job_url || url,
        source_platform: "indeed" as const,
        posted_date: job.posted_date,
      }));

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

  async scrapeAll(): Promise<ScrapeResult> {
    const [linkedinResult, indeedResult] = await Promise.all([
      this.scrapeLinkedIn(),
      this.scrapeIndeed(),
    ]);

    const allJobs = [...linkedinResult.jobs, ...indeedResult.jobs];
    const errors: string[] = [];

    if (!linkedinResult.success && linkedinResult.error) {
      errors.push(`LinkedIn: ${linkedinResult.error}`);
    }
    if (!indeedResult.success && indeedResult.error) {
      errors.push(`Indeed: ${indeedResult.error}`);
    }

    return {
      success: linkedinResult.success || indeedResult.success,
      jobs: allJobs,
      error: errors.length > 0 ? errors.join("; ") : undefined,
    };
  },
};
