import { useState, useEffect, useCallback } from "react";
import { Job, JobStats } from "@/types/job";
import { api } from "@/services/api";
import { JobCard } from "@/components/JobCard";
import { JobCardSkeleton } from "@/components/JobCardSkeleton";
import { StatsBar } from "@/components/StatsBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, Radar, ChevronLeft, ChevronRight } from "lucide-react";

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("");
  const [message, setMessage] = useState("");

  const [appliedJobs, setAppliedJobs] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem("appliedJobs");
      if (stored) {
        setAppliedJobs(new Set(JSON.parse(stored)));
      }
    } catch (e) {
      console.error("Failed to parse applied jobs from local storage", e);
    }
  }, []);

  const handleMarkApplied = (jobId: number) => {
    setAppliedJobs((prev) => {
      const newSet = new Set(prev);
      newSet.add(jobId);
      localStorage.setItem("appliedJobs", JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 20;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, platformFilter]);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const [jobsData, statsData] = await Promise.all([
        searchQuery
          ? api.searchJobs(searchQuery, page, LIMIT)
          : api.getJobs(platformFilter || undefined, page, LIMIT),
        api.getStats(),
      ]);
      setJobs(jobsData.jobs);
      if (jobsData.pagination) {
        setTotalPages(jobsData.pagination.totalPages);
      }
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      setMessage("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, platformFilter, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleScrape = async () => {
    try {
      setScraping(true);
      setMessage("Scraping AI, Full Stack, and Lead Engineer jobs...");
      const result = await api.scrapeJobs();
      setMessage(result.message);
      await fetchJobs();
    } catch (error) {
      console.error("Failed to scrape:", error);
      setMessage("Failed to scrape jobs");
    } finally {
      setScraping(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
    // fetchJobs will be triggered by page or query change
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Radar className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">KadeRadar</h1>
                <p className="text-sm text-muted-foreground">
                  AI Engineer, Full Stack AI, & Lead Engineer Jobs in Singapore
                </p>
              </div>
            </div>
            <Button onClick={handleScrape} disabled={scraping}>
              <RefreshCw
                className={`h-4 w-4 ${scraping ? "animate-spin" : ""}`}
              />
              {scraping ? "Scraping..." : "Scrape Jobs"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="">All Sources</option>
              <option value="google">Google Jobs</option>
              <option value="indeed">Indeed</option>
              <option value="jobstreet">JobStreet</option>
              <option value="careersgov">Careers.gov.sg</option>
            </select>
          </div>
          <StatsBar stats={stats} />
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-muted text-sm">{message}</div>
        )}

        {/* Jobs Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isApplied={appliedJobs.has(job.id)}
                onApply={() => handleMarkApplied(job.id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Radar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No jobs found</p>
              <p className="text-sm">
                Click "Scrape Jobs" to fetch latest AI Engineer positions
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && jobs.length > 0 && (
          <div className="flex items-center justify-center gap-4 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          KadeRadar • Powered by Firecrawl
        </div>
      </footer>
    </div>
  );
}

export default App;
