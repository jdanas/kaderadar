import { Router, Request, Response } from "express";
import { jobService } from "../services/jobService.js";
import { firecrawlService } from "../services/firecrawlService.js";

const router = Router();

// Get all jobs
router.get("/", (_req: Request, res: Response) => {
  try {
    const jobs = jobService.getAllJobs();
    res.json({ success: true, jobs });
  } catch (_error) {
    res.status(500).json({ success: false, error: "Failed to fetch jobs" });
  }
});

// Search jobs
router.get("/search", (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || "";
    const jobs = jobService.searchJobs(query);
    res.json({ success: true, jobs });
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
    const platform = req.params.platform as "linkedin" | "indeed";

    let result;
    if (platform === "linkedin") {
      result = await firecrawlService.scrapeLinkedIn();
    } else if (platform === "indeed") {
      result = await firecrawlService.scrapeIndeed();
    } else {
      res.status(400).json({ success: false, error: "Invalid platform" });
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
