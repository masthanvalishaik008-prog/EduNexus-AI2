"""
EduNexus Advisor — Round 2 FastAPI Application Entrypoint
Institutional Decision-Intelligence Platform with Multi-Target Predictive Analytics,
Driver-Linked Recommendations, Role-Appropriate Scoping, and Gemini Flash Copilot.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, SessionLocal, Base
from models import (
    User,
    Student,
    AcademicRecord,
    AttendanceRecord,
    LMSRecord,
    PlacementRecord,
    QuizActivity,
)
from routers import predict, recommendations, dashboard, copilot, activities, auth_router, insights


def seed_database(db: Session):
    """Seeds the database with representative multi-pillar students if empty."""
    if db.query(Student).first():
        return  # Already seeded

    print("[EduNexus] Seeding institutional database with representative cohort...")

    sample_students = [
        {
            "id": "ENX-2024-0101",
            "name": "Aarav Patel",
            "email": "aarav.patel@edunexus.edu",
            "department": "ECE",
            "semester": 6,
            "mentor_id": "STF-ECE-01",
            "mentor_name": "Dr. Ramesh Sundaram",
            "gender": "Male",
            "acad": {"cgpa": 8.4, "previous_gpa": 8.2, "internal_assessment": 85.0, "backlogs_active": 0, "core_subject_avg": 86.0},
            "att": {"overall_pct": 91.0, "theory_pct": 90.0, "practical_pct": 93.0, "consecutive_absences": 0, "trend_delta": 1.5},
            "lms": {"portal_logins_weekly": 14, "module_completion_pct": 88.0, "quiz_average": 82.0, "assignment_on_time_pct": 92.0, "days_since_last_login": 1},
            "plc": {"aptitude_score": 82.0, "coding_score": 78.0, "mock_interview_score": 8.0, "domain": "Embedded Systems & IoT", "hackathons": 2, "github_repos": 4},
        },
        {
            "id": "ENX-2024-0102",
            "name": "Priya Sharma",
            "email": "priya.sharma@edunexus.edu",
            "department": "CSE",
            "semester": 6,
            "mentor_id": "STF-CSE-01",
            "mentor_name": "Prof. Ananya Iyer",
            "gender": "Female",
            "acad": {"cgpa": 9.3, "previous_gpa": 9.1, "internal_assessment": 94.0, "backlogs_active": 0, "core_subject_avg": 95.0},
            "att": {"overall_pct": 96.0, "theory_pct": 95.0, "practical_pct": 98.0, "consecutive_absences": 0, "trend_delta": 0.5},
            "lms": {"portal_logins_weekly": 18, "module_completion_pct": 98.0, "quiz_average": 94.0, "assignment_on_time_pct": 100.0, "days_since_last_login": 0},
            "plc": {"aptitude_score": 94.0, "coding_score": 92.0, "mock_interview_score": 9.2, "domain": "Software Development & AI", "hackathons": 3, "github_repos": 8},
        },
        {
            "id": "ENX-2024-0103",
            "name": "Karan Verma",
            "email": "karan.verma@edunexus.edu",
            "department": "ECE",
            "semester": 6,
            "mentor_id": "STF-ECE-01",
            "mentor_name": "Dr. Ramesh Sundaram",
            "gender": "Male",
            "acad": {"cgpa": 5.8, "previous_gpa": 6.1, "internal_assessment": 52.0, "backlogs_active": 2, "core_subject_avg": 54.0},
            "att": {"overall_pct": 64.0, "theory_pct": 62.0, "practical_pct": 68.0, "consecutive_absences": 4, "trend_delta": -6.2},
            "lms": {"portal_logins_weekly": 3, "module_completion_pct": 46.0, "quiz_average": 48.0, "assignment_on_time_pct": 50.0, "days_since_last_login": 5},
            "plc": {"aptitude_score": 48.0, "coding_score": 42.0, "mock_interview_score": 4.5, "domain": "Electronics Testing", "hackathons": 0, "github_repos": 1},
        },
        {
            "id": "ENX-2024-0104",
            "name": "Sneha Kulkarni",
            "email": "sneha.kulkarni@edunexus.edu",
            "department": "IT",
            "semester": 6,
            "mentor_id": "STF-IT-01",
            "mentor_name": "Dr. Shalini Mukherjee",
            "gender": "Female",
            "acad": {"cgpa": 8.1, "previous_gpa": 8.0, "internal_assessment": 82.0, "backlogs_active": 0, "core_subject_avg": 81.0},
            "att": {"overall_pct": 88.0, "theory_pct": 86.0, "practical_pct": 91.0, "consecutive_absences": 0, "trend_delta": 0.0},
            "lms": {"portal_logins_weekly": 12, "module_completion_pct": 82.0, "quiz_average": 78.0, "assignment_on_time_pct": 88.0, "days_since_last_login": 1},
            "plc": {"aptitude_score": 78.0, "coding_score": 74.0, "mock_interview_score": 7.5, "domain": "Data Analytics & Cloud", "hackathons": 1, "github_repos": 3},
        },
        {
            "id": "ENX-2024-0105",
            "name": "Devendra Rao",
            "email": "devendra.rao@edunexus.edu",
            "department": "EEE",
            "semester": 6,
            "mentor_id": "STF-EEE-01",
            "mentor_name": "Prof. K. Venkatesh",
            "gender": "Male",
            "acad": {"cgpa": 6.9, "previous_gpa": 7.1, "internal_assessment": 64.0, "backlogs_active": 1, "core_subject_avg": 66.0},
            "att": {"overall_pct": 74.0, "theory_pct": 72.0, "practical_pct": 78.0, "consecutive_absences": 2, "trend_delta": -2.0},
            "lms": {"portal_logins_weekly": 7, "module_completion_pct": 64.0, "quiz_average": 62.0, "assignment_on_time_pct": 70.0, "days_since_last_login": 3},
            "plc": {"aptitude_score": 62.0, "coding_score": 56.0, "mock_interview_score": 6.0, "domain": "Embedded Power Electronics", "hackathons": 0, "github_repos": 2},
        },
        {
            "id": "ENX-2024-0106",
            "name": "Meera Nair",
            "email": "meera.nair@edunexus.edu",
            "department": "ECE",
            "semester": 6,
            "mentor_id": "STF-ECE-01",
            "mentor_name": "Dr. Ramesh Sundaram",
            "gender": "Female",
            "acad": {"cgpa": 8.7, "previous_gpa": 8.5, "internal_assessment": 88.0, "backlogs_active": 0, "core_subject_avg": 89.0},
            "att": {"overall_pct": 93.0, "theory_pct": 92.0, "practical_pct": 95.0, "consecutive_absences": 0, "trend_delta": 1.0},
            "lms": {"portal_logins_weekly": 15, "module_completion_pct": 90.0, "quiz_average": 86.0, "assignment_on_time_pct": 95.0, "days_since_last_login": 1},
            "plc": {"aptitude_score": 86.0, "coding_score": 82.0, "mock_interview_score": 8.4, "domain": "Electronics Testing & VLSI", "hackathons": 2, "github_repos": 5},
        },
        {
            "id": "ENX-2024-0107",
            "name": "Rohan Deshmukh",
            "email": "rohan.deshmukh@edunexus.edu",
            "department": "MECH",
            "semester": 6,
            "mentor_id": "STF-MEC-01",
            "mentor_name": "Prof. Vikramaditya Rao",
            "gender": "Male",
            "acad": {"cgpa": 6.2, "previous_gpa": 6.4, "internal_assessment": 58.0, "backlogs_active": 1, "core_subject_avg": 60.0},
            "att": {"overall_pct": 71.0, "theory_pct": 70.0, "practical_pct": 73.0, "consecutive_absences": 3, "trend_delta": -3.5},
            "lms": {"portal_logins_weekly": 5, "module_completion_pct": 54.0, "quiz_average": 55.0, "assignment_on_time_pct": 62.0, "days_since_last_login": 4},
            "plc": {"aptitude_score": 55.0, "coding_score": 48.0, "mock_interview_score": 5.2, "domain": "Robotics & Automation", "hackathons": 0, "github_repos": 1},
        },
        {
            "id": "ENX-2024-0108",
            "name": "Ritu Sen",
            "email": "ritu.sen@edunexus.edu",
            "department": "CSE",
            "semester": 6,
            "mentor_id": "STF-CSE-01",
            "mentor_name": "Prof. Ananya Iyer",
            "gender": "Female",
            "acad": {"cgpa": 7.9, "previous_gpa": 7.8, "internal_assessment": 76.0, "backlogs_active": 0, "core_subject_avg": 78.0},
            "att": {"overall_pct": 86.0, "theory_pct": 85.0, "practical_pct": 88.0, "consecutive_absences": 0, "trend_delta": 0.2},
            "lms": {"portal_logins_weekly": 11, "module_completion_pct": 79.0, "quiz_average": 72.0, "assignment_on_time_pct": 84.0, "days_since_last_login": 1},
            "plc": {"aptitude_score": 72.0, "coding_score": 70.0, "mock_interview_score": 7.0, "domain": "Software Development", "hackathons": 1, "github_repos": 3},
        },
        {
            "id": "ENX-2024-0109",
            "name": "Aditya Verma",
            "email": "aditya.verma@edunexus.edu",
            "department": "CSE",
            "semester": 6,
            "mentor_id": "STF-CSE-01",
            "mentor_name": "Prof. Ananya Iyer",
            "gender": "Male",
            "acad": {"cgpa": 8.9, "previous_gpa": 8.8, "internal_assessment": 89.0, "backlogs_active": 0, "core_subject_avg": 90.0},
            "att": {"overall_pct": 92.0, "theory_pct": 90.0, "practical_pct": 95.0, "consecutive_absences": 0, "trend_delta": 0.8},
            "lms": {"portal_logins_weekly": 14, "module_completion_pct": 91.0, "quiz_average": 88.0, "assignment_on_time_pct": 94.0, "days_since_last_login": 1},
            # Note: High CGPA (8.9) but lagging coding score (58.0) -> Triggers Gap Rule!
            "plc": {"aptitude_score": 68.0, "coding_score": 58.0, "mock_interview_score": 6.2, "domain": "Software Development", "hackathons": 0, "github_repos": 1},
        },
    ]

    for item in sample_students:
        s = Student(
            id=item["id"],
            name=item["name"],
            email=item["email"],
            department=item["department"],
            semester=item["semester"],
            mentor_id=item["mentor_id"],
            mentor_name=item["mentor_name"],
            gender=item["gender"],
        )
        db.add(s)

        acad_rec = AcademicRecord(student_id=item["id"], **item["acad"])
        att_rec = AttendanceRecord(student_id=item["id"], **item["att"])
        lms_rec = LMSRecord(student_id=item["id"], **item["lms"])
        plc_rec = PlacementRecord(student_id=item["id"], **item["plc"])

        db.add_all([acad_rec, att_rec, lms_rec, plc_rec])

        # Add initial sample quiz activity
        act = QuizActivity(
            id=f"ACT-INIT-{item['id']}",
            student_id=item["id"],
            title=f"Core Assessment Benchmark: {item['department']}",
            category="Interactive Quiz",
            score=10.0,
            status="Completed",
            verified_by_staff=True,
            verified_by_staff_name="Automated Evaluation Engine",
            learning_outcomes="Baseline competency verification.",
        )
        db.add(act)

    db.commit()
    print(f"[EduNexus] Successfully seeded {len(sample_students)} students into SQLite.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and seed data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown


app = FastAPI(
    title="EduNexus Advisor — Round 2 Institutional Decision Intelligence",
    description=(
        "Production-ready FastAPI backend powering Predictive Analytics (4 outcomes), "
        "Rule & AI-Driven Interventions, Role-Appropriate Scoping, and Gemini Flash Copilot."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

# CORS Middleware with exposed headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_no_store_headers(request: Request, call_next):
    """
    Global Security & Freshness Middleware:
    Applies strict 'Cache-Control: no-store' headers across all API routes
    to guarantee real-time updates and eliminate cross-user cache contamination.
    """
    response: Response = await call_next(request)
    if request.url.path.startswith("/api"):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        response.headers["Surrogate-Control"] = "no-store"
    return response


# Include Modular Routers
app.include_router(predict.router)
app.include_router(recommendations.router)
app.include_router(dashboard.router)
app.include_router(copilot.router)
app.include_router(insights.router)
app.include_router(auth_router.router)


@app.get("/api/health", tags=["System"])
def healthcheck():
    """Healthcheck endpoint for platform liveness monitoring."""
    return {
        "status": "healthy",
        "service": "EduNexus Advisor Round 2 Backend",
        "database": "connected",
        "engine": "FastAPI + SQLAlchemy + Google Gemini Flash",
        "version": "2.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
