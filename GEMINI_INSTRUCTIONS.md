# KadeRadar - Gemini Context & Instructions

This file serves as a context guide for Large Language Models (LLMs) like Gemini to understand the KadeRadar codebase, its architecture, conventions, and operational procedures.

## 1. Project Overview
**KadeRadar** is a job aggregator application specifically focused on AI Engineer, Full Stack AI, and Lead Engineer roles in Singapore. It scrapes job listings from multiple platforms and presents them in a unified dashboard.

### Core Architecture
- **Monorepo Structure:**
  - `apps/frontend`: React (Vite) Single Page Application.
  - `apps/backend`: Node.js/Bun Express API service.
- **Package Manager:** `bun` (used for both package management and runtime in some cases).
- **Database:** SQLite (`bun:sqlite`) running in WAL mode.
- **Infrastructure:** Docker & Docker Compose for containerization.

## 2. Tech Stack

### Frontend (`apps/frontend`)
- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** React `useState` / `useEffect` (Local state), `localStorage` (Persistence for user actions like "Applied")
- **Icons:** `lucide-react`
- **HTTP Client:** Custom `fetch` wrapper in `api.ts`

### Backend (`apps/backend`)
- **Runtime:** Bun (compatible with Node.js APIs)
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** SQLite (via `bun:sqlite` native driver)
- **Scraping:** Firecrawl SDK (`@mendable/firecrawl-js`) for AI-powered web scraping.

## 3. Key Directories & Files

### Root
- `package.json`: Workspace configuration. **Always use `bun`** for scripts.
- `docker-compose.yml`: Production orchestration.
- `docker-compose.dev.yml`: Development orchestration with hot-reloading.
- `SETUP.md`: Comprehensive setup and troubleshooting guide.

### Backend
- `src/server.ts`: Entry point, API route definitions.
- `src/db/database.ts`: SQLite connection and schema initialization.
- `src/services/firecrawlService.ts`: Logic for scraping Google, Indeed, JobStreet, etc.
- `src/services/jobService.ts`: CRUD operations for the SQLite database.

### Frontend
- `src/App.tsx`: Main application controller (Search, Pagination, State).
- `src/components/JobCard.tsx`: Job display component. Handles "Applied" state logic.
- `src/services/api.ts`: API interface matching the backend routes.

## 4. Coding Conventions & Patterns

- **Package Management:** Always use `bun install` and `bun run`.
- **Imports:** Use `@/` path aliases in Frontend for `src/*`.
- **Styling:** Use Tailwind utility classes. For complex components, use `shadcn/ui` patterns (found in `components/ui`).
- **Async/Await:** Prefer `async/await` over raw Promises.
- **Error Handling:** Backend services should return standardized response objects (or throw handled errors). Frontend should display user-friendly error messages (e.g., in the `message` state).
- **Scraping:** The `firecrawlService` uses specific prompts for different platforms. When modifying, ensure the prompt explicitly requests the required JSON schema fields.

## 5. Key Features to Remember

### Job "Applied" Tracking
- **Mechanism:** Client-side only (`localStorage`).
- **Key Files:** `App.tsx` (state & storage logic), `JobCard.tsx` (UI).
- **Behavior:**
  - Clicking "Apply" opens the job link.
  - The button changes to "Applied" and becomes disabled.
  - A visual indicator (green border/bg) is applied to the card.
  - This state persists across reloads via the `appliedJobs` key in `localStorage`.

### Job Scraping
- **Trigger:** Manual button press on Frontend -> `/api/jobs/scrape` -> `firecrawlService`.
- **Logic:** Scrapes multiple sources in parallel, normalizes data, and inserts into SQLite (ignoring duplicates via `source_url` unique constraint).

## 6. Common Tasks (How-To)

### Running the Project
```bash
# Development (Host)
bun run dev

# Development (Docker)
docker-compose -f docker-compose.dev.yml up --build
```

### Database Changes
1. Modify `apps/backend/src/db/database.ts` to update the schema (SQLite).
2. Note: Since it's SQLite without an ORM migration tool, schema changes might require manually dropping the table or adding columns if the database file persists.

### Adding a New Scrape Source
1. Update `apps/backend/src/services/firecrawlService.ts`.
2. Add a new method `scrapeNewSource()`.
3. Add it to `scrapeAll()`.
4. Update `JobStats` interface in both Frontend and Backend if necessary.

## 7. Troubleshooting
- **Build Errors:** If `bun run build` fails, check `apps/frontend/tsconfig.json` or unused imports.
- **Docker Hangs:** Ensure `bun` is used for all scripts to avoid `npm` vs `bun` conflicts.
