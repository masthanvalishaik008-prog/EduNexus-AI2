"""
EduNexus Advisor — Predictive Analytics API Router
Provides endpoints to execute and retrieve the 4 Target Outcomes with explanation drivers:
  1. Semester Performance
  2. Backlog Risk
  3. Placement Readiness
  4. Engagement Drop
"""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session

from database import get_db
from models import Student, AcademicRecord, AttendanceRecord, LMSRecord, PlacementRecord
from schemas import StudentPredictionSummary
from auth import (
    AuthenticatedUser,
    get_current_user,
    require_faculty_or_above,
    enforce_student_self_or_faculty_mentor,
)
from predictor import analytics_engine

router = APIRouter(prefix="/api/analytics", tags=["Predictive Analytics"])


def _set_no_store_headers(response: Response):
    """Enforces no-store caching headers to eliminate stale cached data."""
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"


@router.get("/predict/{student_id}", response_model=StudentPredictionSummary)
def get_student_prediction(
    student_id: str,
    response: Response,
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(enforce_student_self_or_faculty_mentor),
):
    """
    Evaluates and returns the 4 Round-2 target outcomes for a specific student.
    Strictly scoped: Students can only query themselves; Faculty can query students in their branch.
    """
    _set_no_store_headers(response)

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student record with ID {student_id} not found in database.",
        )

    # Department Isolation check for faculty
    if user.role == "faculty_mentor" and user.department != "ALL":
        if user.department.lower() not in student.department.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Faculty in {user.department} cannot view predictive metrics for {student.department} students.",
            )

    # Extract clean temporally isolated features
    acad = student.academic or AcademicRecord(student_id=student.id)
    att = student.attendance or AttendanceRecord(student_id=student.id)
    lms = student.lms or LMSRecord(student_id=student.id)
    plc = student.placement or PlacementRecord(student_id=student.id)

    # Run Prediction Engines
    perf_pred = analytics_engine.evaluate_semester_performance(
        cgpa=acad.cgpa,
        previous_gpa=acad.previous_gpa,
        internal_assessment=acad.internal_assessment,
        core_subject_avg=acad.core_subject_avg,
        attendance_overall=att.overall_pct,
        module_completion=lms.module_completion_pct,
        quiz_average=lms.quiz_average,
    )

    backlog_pred = analytics_engine.evaluate_backlog_risk(
        backlogs_active=acad.backlogs_active,
        internal_assessment=acad.internal_assessment,
        attendance_overall=att.overall_pct,
        consecutive_absences=att.consecutive_absences,
        core_subject_avg=acad.core_subject_avg,
    )

    placement_pred = analytics_engine.evaluate_placement_readiness(
        aptitude_score=plc.aptitude_score,
        coding_score=plc.coding_score,
        mock_interview_score=plc.mock_interview_score,
        cgpa=acad.cgpa,
        hackathons=plc.hackathons,
        github_repos=plc.github_repos,
        target_domain=plc.domain,
    )

    engagement_pred = analytics_engine.evaluate_engagement_drop(
        attendance_trend_delta=att.trend_delta,
        consecutive_absences=att.consecutive_absences,
        days_since_last_login=lms.days_since_last_login,
        portal_logins_weekly=lms.portal_logins_weekly,
        assignment_on_time_pct=lms.assignment_on_time_pct,
    )

    # Composite health score (0-100)
    composite = round(
        (acad.cgpa * 4.0) +
        (att.overall_pct * 0.25) +
        (plc.coding_score * 0.20) +
        (lms.module_completion_pct * 0.15),
        1
    )

    return StudentPredictionSummary(
        student_id=student.id,
        student_name=student.name,
        department=student.department,
        semester=student.semester,
        mentor_name=student.mentor_name,
        composite_health_score=composite,
        semester_performance=perf_pred,
        backlog_risk=backlog_pred,
        placement_readiness=placement_pred,
        engagement_drop=engagement_pred,
        generated_at=datetime.utcnow(),
    )


@router.get("/predict/batch", response_model=List[StudentPredictionSummary])
def batch_evaluate_predictions(
    response: Response,
    department: Optional[str] = Query(None, description="Filter by department"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(require_faculty_or_above),
):
    """
    Evaluates predictions for a cohort. Faculty can only query their own department.
    """
    _set_no_store_headers(response)

    query = db.query(Student)

    # Faculty restriction
    if user.role == "faculty_mentor":
        query = query.filter(Student.department.ilike(f"%{user.department}%"))
    elif department and department != "All":
        query = query.filter(Student.department.ilike(f"%{department}%"))

    students = query.limit(limit).all()
    results: List[StudentPredictionSummary] = []

    for s in students:
        acad = s.academic or AcademicRecord(student_id=s.id)
        att = s.attendance or AttendanceRecord(student_id=s.id)
        lms = s.lms or LMSRecord(student_id=s.id)
        plc = s.placement or PlacementRecord(student_id=s.id)

        perf = analytics_engine.evaluate_semester_performance(
            acad.cgpa, acad.previous_gpa, acad.internal_assessment,
            acad.core_subject_avg, att.overall_pct, lms.module_completion_pct, lms.quiz_average
        )
        b_risk = analytics_engine.evaluate_backlog_risk(
            acad.backlogs_active, acad.internal_assessment, att.overall_pct,
            att.consecutive_absences, acad.core_subject_avg
        )
        p_read = analytics_engine.evaluate_placement_readiness(
            plc.aptitude_score, plc.coding_score, plc.mock_interview_score,
            acad.cgpa, plc.hackathons, plc.github_repos, plc.domain
        )
        e_drop = analytics_engine.evaluate_engagement_drop(
            att.trend_delta, att.consecutive_absences, lms.days_since_last_login,
            lms.portal_logins_weekly, lms.assignment_on_time_pct
        )

        composite = round(
            (acad.cgpa * 4.0) + (att.overall_pct * 0.25) +
            (plc.coding_score * 0.20) + (lms.module_completion_pct * 0.15),
            1
        )

        results.append(
            StudentPredictionSummary(
                student_id=s.id,
                student_name=s.name,
                department=s.department,
                semester=s.semester,
                mentor_name=s.mentor_name,
                composite_health_score=composite,
                semester_performance=perf,
                backlog_risk=b_risk,
                placement_readiness=p_read,
                engagement_drop=e_drop,
                generated_at=datetime.utcnow(),
            )
        )

    return results
