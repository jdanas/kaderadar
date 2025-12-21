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
  async scrapeGoogleJobs(): Promise<ScrapeResult> {
    try {
      const url =
        "https://www.google.com/search?q=AI+Engineer+OR+Machine+Learning+Engineer+OR+Full+Stack+AI+Engineer+OR+Lead+AI+Engineer+jobs+in+Singapore&ibp=htl;jobs";

      const result = await firecrawl.scrapeUrl(url, {
        formats: ["extract"],
        extract: {
          schema: JOB_SCHEMA as any,
          prompt:
            "Extract all job listings from this Google Jobs page. For each job, get the title, company name, location, salary (if shown), brief description, job type, the direct URL to apply, and when it was posted. Focus on AI Engineer, Machine Learning Engineer, Full Stack AI Developer, Full Stack Engineer with AI/ML experience, and Lead Engineer positions related to AI/ML. Only include jobs located in Singapore.",
        },
      });

      if (!result.success || !result.extract) {
        return {
          success: false,
          jobs: [],
          error: "Failed to scrape Google Jobs",
        };
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
        source_platform: "google" as const,
        posted_date: job.posted_date,
      }));

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
      const url =
        "https://sg.indeed.com/jobs?q=AI+Engineer+OR+Full+Stack+AI+OR+Lead+Engineer+AI+OR+Machine+Learning+Engineer&l=Singapore";

      const result = await firecrawl.scrapeUrl(url, {
        formats: ["extract"],
        extract: {
          schema: JOB_SCHEMA as any,
          prompt:
            "Extract all job listings from this Indeed jobs page. For each job, get the title, company name, location, salary (if shown), brief description, job type, the direct URL to apply, and when it was posted. Focus on AI Engineer, Full Stack Developer/Engineer with AI/ML, Lead Engineer (AI/ML), and Machine Learning Engineer roles. Only include jobs located in Singapore.",
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

  async scrapeJobStreet(): Promise<ScrapeResult> {
    try {
      const url =
        "https://www.jobstreet.com.sg/ai-engineer-jobs?keywords=AI%20Engineer%20OR%20Full%20Stack%20AI%20OR%20Lead%20Engineer";

      const result = await firecrawl.scrapeUrl(url, {
        formats: ["extract"],
        extract: {
          schema: JOB_SCHEMA as any,
          prompt:
            "Extract all job listings from this JobStreet page. For each job, get the title, company name, location, salary (if shown), brief description, job type, the direct URL to apply, and when it was posted. Focus on AI Engineer, Full Stack Developer with AI/ML, Lead Engineer (AI), and related technical roles. Only include jobs located in Singapore.",
        },
      });

      if (!result.success || !result.extract) {
        return {
          success: false,
          jobs: [],
          error: "Failed to scrape JobStreet",
        };
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
        source_platform: "jobstreet" as const,
        posted_date: job.posted_date,
      }));

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

      const result = await firecrawl.scrapeUrl(url, {
        formats: ["extract"],
        extract: {
          schema: JOB_SCHEMA as any,
          prompt:
            "Extract all job listings from this Singapore government careers page. For each job, get the title, company/agency name, location, salary (if shown), brief description, job type, the direct URL to apply, and when it was posted. Focus on AI Engineer, Full Stack Developer with AI/ML experience, Lead Engineer, Machine Learning, Data Science, and technology positions related to AI/ML.",
        },
      });

      if (!result.success || !result.extract) {
        return {
          success: false,
          jobs: [],
          error: "Failed to scrape Careers.gov.sg",
        };
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
        source_platform: "careersgov" as const,
        posted_date: job.posted_date,
      }));

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
