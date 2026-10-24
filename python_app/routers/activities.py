"""
EduNexus Advisor — Student Activities & Quiz Submission Router
Role-isolated real-time persistence with strict observer status for staff.
"""

from typing import List, Optional
from datetime import datetime
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Student, QuizActivity
from schemas import ActivitySubmitRequest, ActivityResponse
from auth import (
    AuthenticatedUser,
    get_current_user,
    require_student,
    require_faculty_or_above,
)

router = APIRouter(tags=["Student Engagement Activities"])


def _set_no_store_headers(response: Response):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"


# ---------------------------------------------------------------------------
# 1. POST /api/activities/submit (Student-Only Quiz & Activity Submission)
# ---------------------------------------------------------------------------
@router.post("/api/activities/submit", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def submit_student_activity(
    payload: ActivitySubmitRequest,
    response: Response,
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Submits a quiz or learning activity.
    STRICT ROLE ISOLATION:
    - Staff and Higher Officials are OBSERVERS ONLY and are forbidden from submitting answers.
    - Students can ONLY submit on behalf of their authenticated student_id.
    """
    _set_no_store_headers(response)

    # 1. Role Guard: Staff & Officials are observers only
    if user.role in ["faculty_mentor", "dean", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Access Denied: Staff and university officials hold read-only observer clearance. "
                "Staff members cannot submit quiz activities or alter student assessment records."
            ),
        )

    # 2. Ownership Guard: Student cannot impersonate another student ID
    if user.user_id.lower() != payload.student_id.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Security Violation: Authenticated student {user.user_id} cannot submit activities for {payload.student_id}.",
        )

    # Check student existence
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    student_name = student.name if student else payload.student_name or "Student"
    department = student.department if student else payload.department or "General"

    activity_id = f"ACT-QZ-{uuid.uuid4().hex[:8].upper()}"

    new_activity = QuizActivity(
        id=activity_id,
        student_id=payload.student_id,
        title=payload.title,
        category=payload.category or "Interactive Quiz",
        score=payload.score if payload.is_correct else 0.0,
        max_score=payload.score if payload.score > 0 else 10.0,
        is_correct=payload.is_correct,
        status="Completed",
        verified_by_staff=True,
        verified_by_staff_name="Automated Evaluation Engine",
        verified_at=datetime.utcnow(),
        learning_outcomes=payload.explanation or "Active knowledge evaluation and benchmark check.",
        submitted_at=datetime.utcnow(),
    )

    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)

    return ActivityResponse(
        id=new_activity.id,
        student_id=new_activity.student_id,
        student_name=student_name,
        department=department,
        title=new_activity.title,
        category=new_activity.category,
        score=new_activity.score,
        status=new_activity.status,
        verified_by_staff=new_activity.verified_by_staff,
        verified_by_staff_name=new_activity.verified_by_staff_name,
        learning_outcomes=new_activity.learning_outcomes,
        submitted_at=new_activity.submitted_at,
    )


# ---------------------------------------------------------------------------
# 2. GET /api/student/activities (Student Activity History)
# ---------------------------------------------------------------------------
@router.get("/api/student/activities", response_model=List[ActivityResponse])
def get_student_activities(
    response: Response,
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(require_student),
):
    """
    Returns the quiz and learning activity history strictly belonging to the authenticated student.
    Zero cross-contamination or leakage to other students.
    """
    _set_no_store_headers(response)

    activities = (
        db.query(QuizActivity)
        .filter(QuizActivity.student_id == user.user_id)
        .order_by(QuizActivity.submitted_at.desc())
        .all()
    )

    student = db.query(Student).filter(Student.id == user.user_id).first()
    student_name = student.name if student else "Student"
    department = student.department if student else user.department

    return [
        ActivityResponse(
            id=act.id,
            student_id=act.student_id,
            student_name=student_name,
            department=department,
            title=act.title,
            category=act.category,
            score=act.score,
            status=act.status,
            verified_by_staff=act.verified_by_staff,
            verified_by_staff_name=act.verified_by_staff_name,
            learning_outcomes=act.learning_outcomes,
            submitted_at=act.submitted_at,
        )
        for act in activities
    ]


# ---------------------------------------------------------------------------
# 3. GET /api/staff/student-reports (Staff/Official Student Progress Reports)
# ---------------------------------------------------------------------------
@router.get("/api/staff/student-reports")
def get_staff_student_reports(
    response: Response,
    department: Optional[str] = Query(None, description="Filter department"),
    student_id: Optional[str] = Query(None, description="Filter single student"),
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(require_faculty_or_above),
):
    """
    Observer-only progress reporting endpoint for Faculty Mentors and Officials.
    Strictly scoped to the staff member's department unless Dean.
    """
    _set_no_store_headers(response)

    query = db.query(QuizActivity).join(Student, QuizActivity.student_id == Student.id)

    # Department Isolation for Faculty
    if user.role == "faculty_mentor" and user.department != "ALL":
        query = query.filter(Student.department.ilike(f"%{user.department}%"))
    elif department and department != "All":
        query = query.filter(Student.department.ilike(f"%{department}%"))

    if student_id and student_id != "All":
        query = query.filter(QuizActivity.student_id == student_id)

    activities = query.order_by(QuizActivity.submitted_at.desc()).limit(100).all()

    total_submissions = len(activities)
    total_score = sum(a.score for a in activities)
    verified_count = sum(1 for a in activities if a.verified_by_staff)

    return {
        "success": True,
        "viewer_role": user.role,
        "viewer_department": user.department,
        "mode": "Observer Only (Read-Only Enforcement)",
        "total_records": total_submissions,
        "aggregate_stats": {
            "total_activities_submitted": total_submissions,
            "average_score": round(total_score / max(1, total_submissions), 1),
            "verified_rate_pct": round((verified_count / max(1, total_submissions)) * 100, 1),
        },
        "activities": [
            {
                "id": act.id,
                "student_id": act.student_id,
                "student_name": act.student.name if act.student else "Student",
                "department": act.student.department if act.student else "General",
                "title": act.title,
                "category": act.category,
                "score": act.score,
                "status": act.status,
                "verified_by_staff": act.verified_by_staff,
                "verified_by_staff_name": act.verified_by_staff_name,
                "learning_outcomes": act.learning_outcomes,
                "submitted_at": act.submitted_at.isoformat() if act.submitted_at else None,
            }
            for act in activities
        ],
        "timestamp": datetime.utcnow().isoformat(),
    }
