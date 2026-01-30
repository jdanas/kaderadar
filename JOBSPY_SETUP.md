# JobSpy Integration Setup Guide

This guide will help you set up and test the JobSpy integration in KadeRadar.

## What is JobSpy?

JobSpy is a Python library that scrapes job postings from multiple platforms including LinkedIn, Indeed, ZipRecruiter, Glassdoor, and Google Jobs. We've integrated it as a separate Python microservice that communicates with the TypeScript backend.

## Setup Instructions

### Option 1: Local Development (Recommended for Testing)

#### 1. Setup Python Service

```bash
# Navigate to the JobSpy service directory
cd apps/jobspy-service

# Create a virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the service
python app.py
```

The service will start on http://localhost:3002

#### 2. Run Backend & Frontend

In a new terminal:

```bash
# From project root
bun run dev:local
```

#### 3. Test JobSpy Integration

1. Open http://localhost:5173 in your browser
2. Click the "JobSpy" button in the header
3. Wait for scraping to complete (this may take 1-2 minutes)
4. Check the results - you should see jobs from Indeed and LinkedIn

### Option 2: Docker (Production)

```bash
# From project root
docker-compose up --build
```

This will start all three services:
- Frontend: http://localhost
- Backend: http://localhost:3001
- JobSpy Service: http://localhost:3002

## How It Works

### Architecture

```
Frontend (React) 
    ↓ HTTP
Backend (TypeScript/Bun)
    ↓ HTTP
JobSpy Service (Python/Flask)
    ↓ Python Library
JobSpy → Indeed, LinkedIn, etc.
```

### Current Filters

When you click the "JobSpy" button, it scrapes with these filters:
- **Search Term**: "AI Engineer OR Machine Learning Engineer OR Full Stack Engineer OR Software Engineer OR Full Stack Developer"
- **Location**: Singapore
- **Sites**: Indeed, LinkedIn
- **Results**: Up to 50 jobs per site
- **Age**: Posted within last 24 hours
- **Country (Indeed)**: Singapore

### Customizing Filters

To customize the search, edit `apps/backend/src/services/jobSpyService.ts:130-137`:

```typescript
async scrapeWithCurrentFilters(): Promise<ScrapeResult> {
  return this.scrapeJobs({
    search_term: "YOUR_SEARCH_TERM",
    location: "YOUR_LOCATION",
    site_name: ["indeed", "linkedin", "ziprecruiter", "glassdoor"],
    results_wanted: 50,
    hours_old: 24,
    country_indeed: "Singapore",
  });
}
```

## Troubleshooting

### Issue: "JobSpy service is not available"

**Solution**: Make sure the Python service is running:
```bash
cd apps/jobspy-service
source venv/bin/activate
python app.py
```

### Issue: "Failed to scrape jobs with JobSpy"

**Possible causes**:
1. Rate limiting from job sites (Indeed/LinkedIn)
   - **Solution**: Wait a few minutes and try again
2. Network issues
   - **Solution**: Check your internet connection
3. Python dependencies not installed
   - **Solution**: Reinstall dependencies: `pip install -r requirements.txt`

### Issue: No results returned

**Possible causes**:
1. Too restrictive filters (e.g., jobs posted in last 24 hours might be few)
   - **Solution**: Increase `hours_old` to 48 or 72
2. Job sites blocking requests
   - **Solution**: Try again later or use proxies (see JobSpy docs)

## Features

✅ Scrapes from Indeed and LinkedIn (default)  
✅ Supports ZipRecruiter and Glassdoor (customize filters)  
✅ Filters by date (last 24 hours by default)  
✅ Filters by location (Singapore)  
✅ Filters by job type  
✅ Integrates seamlessly with existing KadeRadar database  
✅ Shows in the same UI with other scraped jobs

## Supported Job Sites

| Site | Status | Notes |
|------|--------|-------|
| Indeed | ✅ Working | Best results, no rate limiting |
| LinkedIn | ✅ Working | May rate limit after ~10 searches |
| ZipRecruiter | ✅ Available | US/Canada only |
| Glassdoor | ✅ Available | May require proxies |
| Google Jobs | ✅ Available | Use specific search syntax |

## Next Steps

1. Test the integration locally
2. Adjust filters to match your needs
3. Add proxies if you encounter rate limiting (see JobSpy README)
4. Deploy with Docker for production use

## Additional Resources

- JobSpy GitHub: https://github.com/speedyapply/JobSpy
- JobSpy Documentation: See README in the repository
- KadeRadar AGENTS.md: For development guidelines
