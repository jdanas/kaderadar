export interface Job {
  id?: number;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description?: string;
  job_type?: string;
  source_url: string;
  source_platform: "linkedin" | "indeed";
  posted_date?: string;
  scraped_at?: string;
  is_active?: boolean;
}

export interface ScrapeResult {
  success: boolean;
  jobs: Job[];
  error?: string;
}
