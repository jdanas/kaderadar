# JobSpy Microservice

Python microservice that integrates JobSpy library for job scraping.

## Setup

1. Create a Python virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file (copy from `.env.example`):
```bash
PORT=3002
```

4. Run the service:
```bash
python app.py
```

The service will run on http://localhost:3002

## API Endpoints

### POST /scrape

Scrape jobs using JobSpy.

**Request body:**
```json
{
  "search_term": "software engineer",
  "location": "Singapore",
  "site_name": ["indeed", "linkedin"],
  "results_wanted": 20,
  "hours_old": 24,
  "job_type": "fulltime",
  "is_remote": false,
  "country_indeed": "Singapore"
}
```

**Response:**
```json
{
  "success": true,
  "jobs": [...],
  "total": 20
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "jobspy"
}
```

## Supported Sites

- LinkedIn
- Indeed
- ZipRecruiter
- Glassdoor
- Google Jobs

## Notes

- The service transforms JobSpy output to match KadeRadar's Job schema
- Salary formatting is automatically handled
- Site names are mapped to consistent platform identifiers
