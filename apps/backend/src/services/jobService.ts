import db from "../db/database.js";
import { Job } from "../types/job.js";

export const jobService = {
  getAllJobs(
    limit: number,
    offset: number,
    sortBy: "posted_date" | "scraped_at" = "posted_date",
    platform?: string
  ): Job[] {
    const orderColumn = sortBy === "posted_date" ? "posted_date" : "scraped_at";
    let query = `SELECT * FROM jobs WHERE is_active = 1`;
    const params: any[] = [];

    if (platform) {
      query += ` AND source_platform = ?`;
      params.push(platform);
    }

    query += ` ORDER BY ${orderColumn} DESC NULLS LAST LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const stmt = db.prepare(query);
    return stmt.all(...params) as Job[];
  },

  getJobCount(platform?: string): number {
    let query = `SELECT COUNT(*) as count FROM jobs WHERE is_active = 1`;
    const params: any[] = [];

    if (platform) {
      query += ` AND source_platform = ?`;
      params.push(platform);
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...params) as { count: number };
    return result.count;
  },

  getJobById(id: number): Job | undefined {
    const stmt = db.prepare("SELECT * FROM jobs WHERE id = ?");
    return stmt.get(id) as Job | undefined;
  },

  searchJobs(
    query: string,
    limit: number,
    offset: number,
    sortBy: "posted_date" | "scraped_at" = "posted_date"
  ): Job[] {
    const orderColumn = sortBy === "posted_date" ? "posted_date" : "scraped_at";
    const stmt = db.prepare(`
      SELECT * FROM jobs 
      WHERE is_active = 1 
        AND (title LIKE ? OR company LIKE ? OR description LIKE ?)
      ORDER BY ${orderColumn} DESC NULLS LAST
      LIMIT ? OFFSET ?
    `);
    const searchTerm = `%${query}%`;
    return stmt.all(searchTerm, searchTerm, searchTerm, limit, offset) as Job[];
  },

  getSearchJobCount(query: string): number {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM jobs 
      WHERE is_active = 1 
        AND (title LIKE ? OR company LIKE ? OR description LIKE ?)
    `);
    const searchTerm = `%${query}%`;
    const result = stmt.get(searchTerm, searchTerm, searchTerm) as { count: number };
    return result.count;
  },

  insertJob(job: Job): number | null {
    try {
      const stmt = db.prepare(`
        INSERT INTO jobs (title, company, location, salary, description, job_type, source_url, source_platform, posted_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        job.title,
        job.company,
        job.location || "Singapore",
        job.salary || null,
        job.description || null,
        job.job_type || null,
        job.source_url,
        job.source_platform,
        job.posted_date || null
      );
      return result.lastInsertRowid as number;
    } catch (_error) {
      // Likely a duplicate URL, skip silently
      return null;
    }
  },

  insertManyJobs(jobs: Job[]): number {
    let inserted = 0;
    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO jobs (title, company, location, salary, description, job_type, source_url, source_platform, posted_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((jobs: Job[]) => {
      for (const job of jobs) {
        const result = insertStmt.run(
          job.title,
          job.company,
          job.location || "Singapore",
          job.salary || null,
          job.description || null,
          job.job_type || null,
          job.source_url,
          job.source_platform,
          job.posted_date || null
        );
        if (result.changes > 0) inserted++;
      }
    });

    insertMany(jobs);
    return inserted;
  },

  deleteJob(id: number): boolean {
    const stmt = db.prepare("UPDATE jobs SET is_active = 0 WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  },

  getStats() {
    const totalStmt = db.prepare(
      "SELECT COUNT(*) as count FROM jobs WHERE is_active = 1"
    );
    const googleStmt = db.prepare(
      "SELECT COUNT(*) as count FROM jobs WHERE is_active = 1 AND source_platform = 'google'"
    );
    const indeedStmt = db.prepare(
      "SELECT COUNT(*) as count FROM jobs WHERE is_active = 1 AND source_platform = 'indeed'"
    );
    const jobstreetStmt = db.prepare(
      "SELECT COUNT(*) as count FROM jobs WHERE is_active = 1 AND source_platform = 'jobstreet'"
    );
    const careersgovStmt = db.prepare(
      "SELECT COUNT(*) as count FROM jobs WHERE is_active = 1 AND source_platform = 'careersgov'"
    );

    return {
      total: (totalStmt.get() as { count: number }).count,
      google: (googleStmt.get() as { count: number }).count,
      indeed: (indeedStmt.get() as { count: number }).count,
      jobstreet: (jobstreetStmt.get() as { count: number }).count,
      careersgov: (careersgovStmt.get() as { count: number }).count,
    };
  },
};
