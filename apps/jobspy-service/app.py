from flask import Flask, request, jsonify
from flask_cors import CORS
from jobspy import scrape_jobs
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "jobspy"})


@app.route("/scrape", methods=["POST"])
def scrape():
    try:
        data = request.get_json()

        print(f"🔍 Received scrape request with data: {data}")

        # Extract parameters from request
        search_term = data.get("search_term", "")
        location = data.get("location", "Singapore")
        site_name = data.get("site_name", ["indeed", "linkedin"])
        results_wanted = data.get("results_wanted", 20)
        hours_old = data.get("hours_old", 24)
        job_type = data.get("job_type", None)
        is_remote = data.get("is_remote", None)
        country_indeed = data.get("country_indeed", "Singapore")

        # Validate search_term
        if not search_term:
            print("❌ Error: search_term is required")
            return jsonify({"success": False, "error": "search_term is required"}), 400

        # Build scrape_jobs parameters
        scrape_params = {
            "site_name": site_name,
            "search_term": search_term,
            "location": location,
            "results_wanted": results_wanted,
            "hours_old": hours_old,
            "country_indeed": country_indeed,
        }

        # Add optional parameters if provided
        if job_type:
            scrape_params["job_type"] = job_type
        if is_remote is not None:
            scrape_params["is_remote"] = is_remote

        print(f"🚀 Starting JobSpy scrape with params: {scrape_params}")

        # Scrape jobs using JobSpy
        jobs_df = scrape_jobs(**scrape_params)

        print(f"📊 JobSpy returned {len(jobs_df)} jobs")

        # Convert DataFrame to list of dictionaries
        jobs_list = jobs_df.to_dict(orient="records")

        # Transform to match our Job schema
        transformed_jobs = []
        for job in jobs_list:
            transformed_job = {
                "title": job.get("title", ""),
                "company": job.get("company", ""),
                "location": job.get("location", location),
                "salary": format_salary(job),
                "description": job.get("description", ""),
                "job_type": job.get("job_type", ""),
                "source_url": job.get("job_url", ""),
                "source_platform": map_site_name(job.get("site", "")),
                "posted_date": job.get("date_posted", ""),
            }
            transformed_jobs.append(transformed_job)

        print(f"✅ Successfully transformed {len(transformed_jobs)} jobs")

        return jsonify(
            {"success": True, "jobs": transformed_jobs, "total": len(transformed_jobs)}
        )

    except Exception as e:
        print(f"❌ Error in scrape endpoint: {str(e)}")
        import traceback

        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


def format_salary(job):
    """Format salary information from JobSpy format"""
    min_amount = job.get("min_amount")
    max_amount = job.get("max_amount")
    interval = job.get("interval", "")
    currency = job.get("currency", "")

    if not min_amount and not max_amount:
        return None

    parts = []
    if currency:
        parts.append(currency)

    if min_amount and max_amount:
        parts.append(f"{int(min_amount):,} - {int(max_amount):,}")
    elif min_amount:
        parts.append(f"{int(min_amount):,}+")
    elif max_amount:
        parts.append(f"Up to {int(max_amount):,}")

    if interval:
        parts.append(f"per {interval}")

    return " ".join(parts) if parts else None


def map_site_name(site):
    """Map JobSpy site names to our platform names"""
    mapping = {
        "indeed": "indeed",
        "linkedin": "linkedin",
        "zip_recruiter": "ziprecruiter",
        "glassdoor": "glassdoor",
        "google": "google",
    }
    return mapping.get(site.lower(), site)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 3002))
    app.run(host="0.0.0.0", port=port, debug=True)
