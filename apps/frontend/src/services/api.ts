import { Job, JobStats, ApiResponse } from "@/types/job";

const API_BASE = "/api";

export const api = {
  async getJobs(platform?: string): Promise<Job[]> {
    const url = platform
      ? `${API_BASE}/jobs?platform=${platform}`
      : `${API_BASE}/jobs`;
    const res = await fetch(url);
    const data: ApiResponse<Job> = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch jobs");
    return data.jobs || [];
  },

  async searchJobs(query: string): Promise<Job[]> {
    const res = await fetch(
      `${API_BASE}/jobs/search?q=${encodeURIComponent(query)}`
    );
    const data: ApiResponse<Job> = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to search jobs");
    return data.jobs || [];
  },

  async getStats(): Promise<JobStats> {
    const res = await fetch(`${API_BASE}/jobs/stats`);
    const data: ApiResponse<Job> = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch stats");
    return data.stats || { total: 0, linkedin: 0, indeed: 0 };
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
    platform: "linkedin" | "indeed"
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
