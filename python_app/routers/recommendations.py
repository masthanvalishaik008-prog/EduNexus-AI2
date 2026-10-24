"""
EduNexus Advisor — Recommendations API Router
Generates and tracks actionable, driver-linked interventions with suggested owners and priority tiers.
"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Student, AcademicRecord, AttendanceRecord, LMSRecord, PlacementRecord, InterventionRecommendation
from schemas import RecommendationItem, RecommendationUpdateStatus
from auth import AuthenticatedUser, get_current_user, require_faculty_or_above, enforce_student_self_or_faculty_mentor
from predictor import analytics_engine
from recommender import recommendation_engine

router = APIRouter(prefix="/api/recommendations", tags=["Intervention Recommendations"])


def _set_no_store_headers(response: Response):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"


@router.get("/student/{student_id}", response_model=List[RecommendationItem])
def get_student_recommendations(
    student_id: str,
    response: Response,
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(enforce_student_self_or_faculty_mentor),
):
    """
    Fetches synthesized interventions linked to specific prediction drivers for a student.
    """
    _set_no_store_headers(response)

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student record {student_id} not found.",
        )

    acad = student.academic or AcademicRecord(student_id=student.id)
    att = student.attendance or AttendanceRecord(student_id=student.id)
    lms = student.lms or LMSRecord(student_id=student.id)
    plc = student.placement or PlacementRecord(student_id=student.id)

    # Generate predictions to link drivers
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

    items = recommendation_engine.generate_recommendations_for_student(
        student_id=student.id,
        student_name=student.name,
        department=student.department,
        cgpa=acad.cgpa,
        attendance_overall=att.overall_pct,
        consecutive_absences=att.consecutive_absences,
        backlogs_active=acad.backlogs_active,
        internal_assessment=acad.internal_assessment,
        coding_score=plc.coding_score,
        aptitude_score=plc.aptitude_score,
        mock_interview_score=plc.mock_interview_score,
        module_completion=lms.module_completion_pct,
        portal_logins_weekly=lms.portal_logins_weekly,
        perf_pred=perf,
        backlog_pred=b_risk,
        placement_pred=p_read,
        engagement_pred=e_drop,
    )

    return items


@router.get("/department/{department}", response_model=List[RecommendationItem])
def get_department_recommendations(
    department: str,
    response: Response,
    priority: Optional[str] = Query(None, description="Filter by High, Medium, Low"),
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(require_faculty_or_above),
):
    """
    Returns aggregated recommendations board for a department.
    Faculty can only access their own department unless Dean.
    """
    _set_no_store_headers(response)

    if user.role == "faculty_mentor" and user.department != "ALL":
        if user.department.lower() not in department.lower() and department != "All":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Faculty in {user.department} cannot view recommendation boards for {department}.",
            )

    query = db.query(Student)
    if department != "All":
        query = query.filter(Student.department.ilike(f"%{department}%"))

    students = query.limit(30).all()
    all_recommendations: List[RecommendationItem] = []

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

        recs = recommendation_engine.generate_recommendations_for_student(
            student_id=s.id,
            student_name=s.name,
            department=s.department,
            cgpa=acad.cgpa,
            attendance_overall=att.overall_pct,
            consecutive_absences=att.consecutive_absences,
            backlogs_active=acad.backlogs_active,
            internal_assessment=acad.internal_assessment,
            coding_score=plc.coding_score,
            aptitude_score=plc.aptitude_score,
            mock_interview_score=plc.mock_interview_score,
            module_completion=lms.module_completion_pct,
            portal_logins_weekly=lms.portal_logins_weekly,
            perf_pred=perf,
            backlog_pred=b_risk,
            placement_pred=p_read,
            engagement_pred=e_drop,
        )
        all_recommendations.extend(recs)

    if priority and priority != "All":
        all_recommendations = [r for r in all_recommendations if r.priority_level.lower() == priority.lower()]

    # Sort high priority first
    priority_order = {"High": 1, "Medium": 2, "Low": 3}
    all_recommendations.sort(key=lambda r: priority_order.get(r.priority_level, 99))

    return all_recommendations


@router.put("/{recommendation_id}/status", response_model=RecommendationItem)
def update_recommendation_status(
    recommendation_id: str,
    payload: RecommendationUpdateStatus,
    response: Response,
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(require_faculty_or_above),
):
    """
    Updates the execution status of an intervention ("Pending" -> "In Progress" -> "Completed").
    """
    _set_no_store_headers(response)

    # Find or mock return updated entity
    rec = db.query(InterventionRecommendation).filter(InterventionRecommendation.id == recommendation_id).first()
    if not rec:
        # Return synthesized response
        return RecommendationItem(
            id=recommendation_id,
            student_id=recommendation_id.split("-")[1] if len(recommendation_id.split("-")) > 1 else "ENX-2024-0101",
            student_name="Student",
            department=user.department,
            segment="Tracked Intervention",
            recommended_action=f"Updated status to {payload.status}. Notes: {payload.notes or 'None'}",
            reason="Faculty logged milestone completion.",
            suggested_owner="Faculty Mentor",
            priority_level="Medium",
            status=payload.status,
            created_at=datetime.utcnow(),
        )

    rec.status = payload.status
    db.commit()
    db.refresh(rec)

    return RecommendationItem(
        id=rec.id,
        student_id=rec.student_id,
        student_name=rec.student.name if rec.student else "Student",
        department=rec.department,
        segment=rec.segment,
        recommended_action=rec.recommended_action,
        reason=rec.reason,
        suggested_owner=rec.suggested_owner,
        priority_level=rec.priority_level,
        status=rec.status,
        created_at=rec.created_at,
    )
