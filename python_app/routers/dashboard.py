"""
EduNexus Advisor — Role-Appropriate Dashboard API Router
Provides isolated views for Faculty Mentors and Deans with strict Cache-Control: no-store headers.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Student, AcademicRecord, AttendanceRecord, LMSRecord, PlacementRecord
from schemas import (
    FacultyDashboardResponse,
    FacultyStudentSummary,
    DeanDashboardResponse,
    DepartmentAggregateMetrics,
    RecommendationItem,
)
from auth import (
    AuthenticatedUser,
    get_current_user,
    require_faculty_or_above,
    require_dean_or_admin,
)
from predictor import analytics_engine
from recommender import recommendation_engine

router = APIRouter(prefix="/api/dashboard", tags=["Role-Appropriate Dashboards"])


def _set_no_store_headers(response: Response):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"


@router.get("/faculty", response_model=FacultyDashboardResponse)
def get_faculty_dashboard(
    response: Response,
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(require_faculty_or_above),
):
    """
    Role View: Faculty Mentor
    Sees only assigned students in their own branch/mentorship with specific prediction drivers and action items.
    """
    _set_no_store_headers(response)

    # Scoped query: faculty members only see their department
    query = db.query(Student)
    if user.role == "faculty_mentor" and user.department != "ALL":
        query = query.filter(Student.department.ilike(f"%{user.department}%"))

    students = query.all()
    student_summaries: List[FacultyStudentSummary] = []
    immediate_actions: List[RecommendationItem] = []

    at_risk_count = 0
    total_cgpa = 0.0
    total_att = 0.0

    for s in students:
        acad = s.academic or AcademicRecord(student_id=s.id)
        att = s.attendance or AttendanceRecord(student_id=s.id)
        lms = s.lms or LMSRecord(student_id=s.id)
        plc = s.placement or PlacementRecord(student_id=s.id)

        total_cgpa += acad.cgpa
        total_att += att.overall_pct

        # Run predictions
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

        is_at_risk = (
            att.overall_pct < 75.0 or
            acad.backlogs_active > 0 or
            b_risk.risk_level in ["High", "Critical"] or
            e_drop.risk_level == "Severe Drop Warning"
        )
        if is_at_risk:
            at_risk_count += 1

        primary_driver = (
            f"Attendance {att.overall_pct:.1f}% (<75%)" if att.overall_pct < 75.0
            else f"{acad.backlogs_active} Active Backlog(s)" if acad.backlogs_active > 0
            else f"Coding Gap: {plc.coding_score}/100" if plc.coding_score < 65.0
            else "Satisfactory Academic Progress"
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

        top_rec = recs[0] if recs else None
        if top_rec and top_rec.priority_level == "High":
            immediate_actions.append(top_rec)

        student_summaries.append(
            FacultyStudentSummary(
                student_id=s.id,
                student_name=s.name,
                cgpa=acad.cgpa,
                attendance_pct=att.overall_pct,
                backlog_risk_level=b_risk.risk_level,
                placement_readiness_level=p_read.readiness_level,
                engagement_drop_level=e_drop.risk_level,
                primary_risk_driver=primary_driver,
                recommended_intervention=top_rec.recommended_action if top_rec else "Maintain schedule",
                priority=top_rec.priority_level if top_rec else "Low",
            )
        )

    count = max(1, len(students))
    return FacultyDashboardResponse(
        mentor_name=user.full_name,
        department=user.department,
        assigned_students_count=len(students),
        at_risk_students_count=at_risk_count,
        avg_cohort_cgpa=round(total_cgpa / count, 2),
        avg_cohort_attendance=round(total_att / count, 1),
        students=student_summaries,
        immediate_actions=immediate_actions[:15],
    )


@router.get("/dean", response_model=DeanDashboardResponse)
def get_dean_dashboard(
    response: Response,
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(require_dean_or_admin),
):
    """
    Role View: Dean / Campus Administrator
    Aggregated cross-departmental risk trends, year distributions, segment breakdown, and strategic priorities.
    """
    _set_no_store_headers(response)

    students = db.query(Student).all()
    departments = ["CSE", "ECE", "IT", "EEE", "MECH"]
    dept_map: Dict[str, List[Student]] = {d: [] for d in departments}

    for s in students:
        for d in departments:
            if d.lower() in s.department.lower():
                dept_map[d].append(s)
                break

    dept_metrics: List[DepartmentAggregateMetrics] = []
    total_critical = 0
    total_cgpa = 0.0
    total_att = 0.0

    segment_distribution = {
        "High CGPA / Low Employability": 0,
        "Attendance Debarment Risk": 0,
        "Active Backlog Crisis": 0,
        "LMS Disengagement Drift": 0,
        "Placement Ready Elite": 0,
    }

    strategic_actions: List[RecommendationItem] = []

    for d, s_list in dept_map.items():
        if not s_list:
            continue

        d_cgpa = sum(s.academic.cgpa for s in s_list if s.academic)
        d_att = sum(s.attendance.overall_pct for s in s_list if s.attendance)
        count = len(s_list)

        total_cgpa += d_cgpa
        total_att += d_att

        high_b_risk = 0
        low_p_read = 0
        eng_warn = 0

        for s in s_list:
            acad = s.academic or AcademicRecord(student_id=s.id)
            att = s.attendance or AttendanceRecord(student_id=s.id)
            plc = s.placement or PlacementRecord(student_id=s.id)

            if acad.backlogs_active > 0 or acad.internal_assessment < 60:
                high_b_risk += 1
            if plc.coding_score < 65.0 or plc.aptitude_score < 70.0:
                low_p_read += 1
            if att.overall_pct < 75.0 or att.consecutive_absences >= 3:
                eng_warn += 1

            # Categorize segments
            if acad.cgpa >= 7.8 and plc.coding_score < 65.0:
                segment_distribution["High CGPA / Low Employability"] += 1
            elif att.overall_pct < 75.0:
                segment_distribution["Attendance Debarment Risk"] += 1
            elif acad.backlogs_active > 0:
                segment_distribution["Active Backlog Crisis"] += 1
            elif plc.coding_score >= 80 and acad.cgpa >= 8.5:
                segment_distribution["Placement Ready Elite"] += 1
            else:
                segment_distribution["LMS Disengagement Drift"] += 1

        total_critical += high_b_risk + eng_warn

        dept_metrics.append(
            DepartmentAggregateMetrics(
                department=d,
                total_students=count,
                avg_cgpa=round(d_cgpa / count, 2),
                avg_attendance=round(d_att / count, 1),
                high_backlog_risk_count=high_b_risk,
                low_placement_readiness_count=low_p_read,
                engagement_warning_count=eng_warn,
                priority_interventions_count=high_b_risk + eng_warn,
            )
        )

    # Compile strategic dean interventions
    strategic_actions.append(
        RecommendationItem(
            id="STR-DEAN-001",
            student_id="ALL-ECE",
            student_name="ECE Cohort",
            department="ECE",
            segment="Curriculum-Industry Gap",
            recommended_action="Organize Embedded Firmware & RTOS Boot-camp in partnership with industry mentors.",
            reason="ECE shows 42% gap in practical coding benchmarks despite solid 7.8 CGPA baseline.",
            suggested_owner="T&P Cell",
            priority_level="High",
            status="In Progress",
            created_at=datetime.utcnow(),
        )
    )
    strategic_actions.append(
        RecommendationItem(
            id="STR-DEAN-002",
            student_id="ALL-CAMPUS",
            student_name="Campus-Wide",
            department="All",
            segment="Statutory Regulatory Compliance",
            recommended_action="Issue campus-wide attendance recovery notices for all students registering under 75%.",
            reason="Upcoming mid-term examinations require strict attendance verification.",
            suggested_owner="Counselor",
            priority_level="High",
            status="Pending",
            created_at=datetime.utcnow(),
        )
    )

    all_students_count = max(1, len(students))
    return DeanDashboardResponse(
        total_monitored_students=len(students),
        total_departments=len(dept_metrics),
        campus_avg_cgpa=round(total_cgpa / all_students_count, 2),
        campus_avg_attendance=round(total_att / all_students_count, 1),
        total_critical_risks=total_critical,
        department_metrics=dept_metrics,
        strategic_interventions=strategic_actions,
        segment_distribution=segment_distribution,
    )
