// @ts-ignore - bun:sqlite is a valid runtime module
import { Database } from "bun:sqlite";
import path from "path";

const dbPath = path.join(process.cwd(), "kaderadar.db");
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.run("PRAGMA journal_mode = WAL");

// Create tables
db.run(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT DEFAULT 'Singapore',
    salary TEXT,
    description TEXT,
    job_type TEXT,
    source_url TEXT UNIQUE,
    source_platform TEXT NOT NULL,
    posted_date TEXT,
    scraped_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
  );

  CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
  CREATE INDEX IF NOT EXISTS idx_jobs_source_platform ON jobs(source_platform);
  CREATE INDEX IF NOT EXISTS idx_jobs_scraped_at ON jobs(scraped_at DESC);
`);

export default db;
