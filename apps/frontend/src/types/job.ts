export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description?: string;
  job_type?: string;
  source_url: string;
  source_platform:
    | "indeed"
    | "google"
    | "jobstreet"
    | "mycareersfuture"
    | "careersgov"
    | "linkedin"
    | "jobspy";
  posted_date?: string;
  scraped_at?: string;
  is_active?: boolean;
}

export interface JobStats {
  total: number;
  google: number;
  indeed: number;
  jobstreet: number;
  careersgov: number;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
  pagination?: PaginationMetadata;
}
