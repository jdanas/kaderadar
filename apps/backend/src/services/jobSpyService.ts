import { Job, ScrapeResult } from "../types/job.js";

const JOBSPY_SERVICE_URL =
  process.env.JOBSPY_SERVICE_URL || "http://localhost:3002";

interface JobSpyRequest {
  search_term: string;
  location?: string;
  site_name?: string[];
  results_wanted?: number;
  hours_old?: number;
  job_type?: string;
  is_remote?: boolean;
  country_indeed?: string;
}

interface JobSpyResponse {
  success: boolean;
  jobs?: Array<{
    title: string;
    company: string;
    location?: string;
    salary?: string;
    description?: string;
    job_type?: string;
    source_url?: string;
    source_platform?: string;
    posted_date?: string;
  }>;
  total?: number;
  error?: string;
}

export const jobSpyService = {
  async scrapeJobs(params: JobSpyRequest): Promise<ScrapeResult> {
    try {
      console.log(
        `🔍 Attempting to connect to JobSpy service at: ${JOBSPY_SERVICE_URL}`
      );

      // Check if JobSpy service is available
      const healthCheck = await fetch(`${JOBSPY_SERVICE_URL}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000), // 5 second timeout for health check
      }).catch((err) => {
        console.error("❌ JobSpy health check failed:", err.message);
        return null;
      });

      if (!healthCheck || !healthCheck.ok) {
        console.error("❌ JobSpy service is not healthy");
        return {
          success: false,
          jobs: [],
          error: `JobSpy service is not available at ${JOBSPY_SERVICE_URL}. Make sure it's running.`,
        };
      }

      console.log("✅ JobSpy service is healthy. Starting scrape...");
      console.log("📋 Scrape parameters:", JSON.stringify(params, null, 2));

      // Call JobSpy service
      const response = await fetch(`${JOBSPY_SERVICE_URL}/scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(120000), // 2 minute timeout for scraping
      });

      console.log(`📡 JobSpy response status: ${response.status}`);

      if (!response.ok) {
        const errorData = (await response
          .json()
          .catch(() => ({}))) as { error?: string };
        console.error("❌ JobSpy scraping failed:", errorData);
        return {
          success: false,
          jobs: [],
          error: errorData.error || `JobSpy service error: ${response.status}`,
        };
      }

      const data = (await response.json()) as JobSpyResponse;
      console.log(
        `📊 JobSpy returned ${data.jobs?.length || 0} jobs. Success: ${data.success}`
      );

      if (!data.success) {
        console.error("❌ JobSpy reported failure:", data.error);
        return {
          success: false,
          jobs: [],
          error: data.error || "JobSpy scraping failed",
        };
      }

      // Map JobSpy jobs to our Job type
      const jobs: Job[] =
        data.jobs?.map((job) => ({
          title: job.title,
          company: job.company,
          location: job.location || params.location || "Singapore",
          salary: job.salary,
          description: job.description,
          job_type: job.job_type,
          source_url: job.source_url || "",
          source_platform: (job.source_platform ||
            "indeed") as Job["source_platform"],
          posted_date: job.posted_date,
        })) || [];

      console.log(`✅ Successfully mapped ${jobs.length} jobs`);

      return {
        success: true,
        jobs,
      };
    } catch (error) {
      console.error("❌ JobSpy service error:", error);
      return {
        success: false,
        jobs: [],
        error:
          error instanceof Error
            ? error.message
            : "Failed to connect to JobSpy service",
      };
    }
  },

  // Convenience method matching your current filters
  async scrapeWithCurrentFilters(): Promise<ScrapeResult> {
    return this.scrapeJobs({
      search_term:
        "AI Engineer OR Machine Learning Engineer OR Full Stack Engineer OR Software Engineer OR Full Stack Developer",
      location: "Singapore",
      site_name: ["indeed", "linkedin"],
      results_wanted: 50,
      hours_old: 24,
      country_indeed: "Singapore",
    });
  },
};
