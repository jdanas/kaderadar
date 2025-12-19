export interface Job {
  id: number;
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

export interface JobStats {
  total: number;
  linkedin: number;
  indeed: number;
}

export interface ApiResponse<T> {
  success: boolean;
  error?: string;
  jobs?: T[];
  job?: T;
  stats?: JobStats;
  message?: string;
  scraped?: number;
  inserted?: number;
}
