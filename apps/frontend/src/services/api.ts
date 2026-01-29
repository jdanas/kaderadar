import { Job, JobStats, ApiResponse, PaginationMetadata } from "@/types/job";

const API_BASE = "/api";

export const api = {
  async getJobs(
    platform?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ jobs: Job[]; pagination?: PaginationMetadata }> {
    let url = `${API_BASE}/jobs?page=${page}&limit=${limit}`;
    if (platform) {
      url += `&platform=${platform}`;
    }
    const res = await fetch(url);
    const data: ApiResponse<Job> = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch jobs");
    return { jobs: data.jobs || [], pagination: data.pagination };
  },

  async searchJobs(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ jobs: Job[]; pagination?: PaginationMetadata }> {
    const res = await fetch(
      `${API_BASE}/jobs/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    const data: ApiResponse<Job> = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to search jobs");
    return { jobs: data.jobs || [], pagination: data.pagination };
  },

  async getStats(): Promise<JobStats> {
    const res = await fetch(`${API_BASE}/jobs/stats`);
    const data: ApiResponse<Job> = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch stats");
    return data.stats || { total: 0, google: 0, indeed: 0, jobstreet: 0, careersgov: 0 };
  },

  async scrapeJobs(): Promise<{
    scraped: number;
    inserted: number;
    message: string;
  }> {
    const res = await fetch(`${API_BASE}/jobs/scrape`, { method: "POST" });
    const data: ApiResponse<Job> = await res.json();
    return {
      scraped: data.scraped || 0,
      inserted: data.inserted || 0,
      message:
        data.message ||
        (data.success ? "Scraping completed" : "Scraping failed"),
    };
  },

  async scrapePlatform(
    platform:
      | "google"
      | "indeed"
      | "jobstreet"
      | "careersgov"
      | "careersgov-tech"
      | "jobspy"
  ): Promise<{ scraped: number; inserted: number; message: string }> {
    const res = await fetch(`${API_BASE}/jobs/scrape/${platform}`, {
      method: "POST",
    });
    const data: ApiResponse<Job> = await res.json();
    return {
      scraped: data.scraped || 0,
      inserted: data.inserted || 0,
      message:
        data.message ||
        (data.success ? "Scraping completed" : "Scraping failed"),
    };
  },

  async deleteJob(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/jobs/${id}`, { method: "DELETE" });
    const data: ApiResponse<Job> = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to delete job");
  },
};
