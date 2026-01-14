import { Router, Request, Response } from "express";
import { jobService } from "../services/jobService.js";
import { firecrawlService } from "../services/firecrawlService.js";
import { calculatePagination } from "../utils/pagination.js";

const router: ReturnType<typeof Router> = Router();

// Get all jobs with pagination
router.get("/", (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const sortBy = (req.query.sortBy as string) || "posted_date";
    const platform = req.query.platform as string | undefined;

    const { offset, totalPages: calcTotalPages } = calculatePagination({
      page,
      limit,
    });
    const validSort = sortBy === "scraped_at" ? "scraped_at" : "posted_date";

    const jobs = jobService.getAllJobs(
      limit,
      offset,
      validSort as "posted_date" | "scraped_at",
      platform
    );

    const total = jobService.getJobCount(platform);
    const totalPages = calcTotalPages(total);

    res.json({
      success: true,
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (_error) {
    res.status(500).json({ success: false, error: "Failed to fetch jobs" });
  }
});

// Search jobs with pagination
router.get("/search", (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const sortBy = (req.query.sortBy as string) || "posted_date";

    const { offset, totalPages: calcTotalPages } = calculatePagination({
      page,
      limit,
    });
    const validSort = sortBy === "scraped_at" ? "scraped_at" : "posted_date";

    const jobs = jobService.searchJobs(
      query,
      limit,
      offset,
      validSort as "posted_date" | "scraped_at"
    );

    const total = jobService.getSearchJobCount(query);
    const totalPages = calcTotalPages(total);

    res.json({
      success: true,
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (_error) {
    res.status(500).json({ success: false, error: "Failed to search jobs" });
  }
});

// Get job stats
router.get("/stats", (_req: Request, res: Response) => {
  try {
    const stats = jobService.getStats();
    res.json({ success: true, stats });
  } catch (_error) {
    res.status(500).json({ success: false, error: "Failed to get stats" });
  }
});

// Get job by ID
router.get("/:id", (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const job = jobService.getJobById(id);
    if (job) {
      res.json({ success: true, job });
    } else {
      res.status(404).json({ success: false, error: "Job not found" });
    }
  } catch (_error) {
    res.status(500).json({ success: false, error: "Failed to fetch job" });
  }
});

// Trigger scraping
router.post("/scrape", async (_req: Request, res: Response) => {
  try {
    const result = await firecrawlService.scrapeAll();

    if (result.jobs.length > 0) {
      const inserted = jobService.insertManyJobs(result.jobs);
      res.json({
        success: true,
        message: `Scraped ${result.jobs.length} jobs, inserted ${inserted} new jobs`,
        scraped: result.jobs.length,
        inserted,
        warning: result.error,
      });
    } else {
      res.json({
        success: false,
        message: "No jobs scraped",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Scrape error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to scrape jobs",
    });
  }
});

// Scrape specific platform
router.post("/scrape/:platform", async (req: Request, res: Response) => {
  try {
    const platform = req.params.platform as
      | "google"
      | "indeed"
      | "jobstreet"
      | "careersgov"
      | "careersgov-tech";

    let result;
    if (platform === "google") {
      result = await firecrawlService.scrapeGoogleJobs();
    } else if (platform === "indeed") {
      result = await firecrawlService.scrapeIndeed();
    } else if (platform === "jobstreet") {
      result = await firecrawlService.scrapeJobStreet();
    } else if (platform === "careersgov") {
      // Can accept custom options from request body
      const options = req.body || {};
      result = await firecrawlService.scrapeCareersGov(options);
    } else if (platform === "careersgov-tech") {
      // Optimized for InfoComm & Technology jobs
      result = await firecrawlService.scrapeCareersGovTech();
    } else {
      res.status(400).json({
        success: false,
        error:
          "Invalid platform. Use 'google', 'indeed', 'jobstreet', 'careersgov', or 'careersgov-tech'",
      });
      return;
    }

    if (result.jobs.length > 0) {
      const inserted = jobService.insertManyJobs(result.jobs);
      res.json({
        success: true,
        message: `Scraped ${result.jobs.length} jobs from ${platform}, inserted ${inserted} new jobs`,
        scraped: result.jobs.length,
        inserted,
      });
    } else {
      res.json({
        success: false,
        message: `No jobs scraped from ${platform}`,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Scrape error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to scrape jobs",
    });
  }
});

// Delete job
router.delete("/:id", (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = jobService.deleteJob(id);
    if (deleted) {
      res.json({ success: true, message: "Job deleted" });
    } else {
      res.status(404).json({ success: false, error: "Job not found" });
    }
  } catch (_error) {
    res.status(500).json({ success: false, error: "Failed to delete job" });
  }
});

export default router;
