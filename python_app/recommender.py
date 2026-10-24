"""
EduNexus Advisor — Rule & AI-Driven Recommendation Engine
Generates targeted, non-generic interventions linked directly to multi-pillar prediction drivers.
Outputs:
  - Target Student/Segment
  - Recommended Action
  - Reason (tied to prediction drivers)
  - Suggested Owner (Faculty Mentor, T&P Cell, Counselor)
  - Priority Level (High, Medium, Low)
"""

from typing import List, Dict, Any
from datetime import datetime
import uuid

from schemas import (
    RecommendationItem,
    SemesterPerformancePrediction,
    BacklogRiskPrediction,
    PlacementReadinessPrediction,
    EngagementDropPrediction,
)


class RecommendationEngine:
    """
    Evaluates multi-pillar diagnostic profiles and emits precise, actionable interventions.
    """

    @staticmethod
    def generate_recommendations_for_student(
        student_id: str,
        student_name: str,
        department: str,
        cgpa: float,
        attendance_overall: float,
        consecutive_absences: int,
        backlogs_active: int,
        internal_assessment: float,
        coding_score: float,
        aptitude_score: float,
        mock_interview_score: float,
        module_completion: float,
        portal_logins_weekly: int,
        perf_pred: SemesterPerformancePrediction,
        backlog_pred: BacklogRiskPrediction,
        placement_pred: PlacementReadinessPrediction,
        engagement_pred: EngagementDropPrediction,
    ) -> List[RecommendationItem]:
        """
        Synthesizes rule-based heuristics and driver alignments to construct actionable intervention items.
        """
        items: List[RecommendationItem] = []

        # -------------------------------------------------------------------------
        # Rule 1: High Academic Achiever but Deficient Placement Skills (The "Gap" Segment)
        # -------------------------------------------------------------------------
        if cgpa >= 7.8 and (coding_score < 65.0 or aptitude_score < 70.0 or mock_interview_score < 6.5):
            reasons = []
            if coding_score < 65.0:
                reasons.append(f"coding proficiency benchmark is currently {coding_score}/100 (gap: {round(70.0 - coding_score, 1)} pts)")
            if aptitude_score < 70.0:
                reasons.append(f"aptitude score is {aptitude_score}% (cutoff: 75%)")
            if mock_interview_score < 6.5:
                reasons.append(f"mock interview rating is {mock_interview_score}/10.0")

            reason_str = f"Student maintains high academic GPA ({cgpa:.2f}), but {', '.join(reasons)}. This will impede campus recruitment shortlisting."
            
            action = (
                f"Fast-track student into 4-week Technical Coding Sprint for {department} "
                f"and schedule 1-on-1 Alumni Mock Technical Interview before company drive."
            )

            items.append(
                RecommendationItem(
                    id=f"INT-{student_id}-TNP-01",
                    student_id=student_id,
                    student_name=student_name,
                    department=department,
                    segment="High CGPA / Deficient Placement Execution",
                    recommended_action=action,
                    reason=reason_str,
                    suggested_owner="T&P Cell",
                    priority_level="High",
                    status="Pending",
                    created_at=datetime.utcnow(),
                )
            )

        # -------------------------------------------------------------------------
        # Rule 2: Attendance Debarment Risk & Acute Behavioral Disengagement
        # -------------------------------------------------------------------------
        if attendance_overall < 75.0 or consecutive_absences >= 3 or engagement_pred.probability >= 0.50:
            urgency = "Statutory Regulatory Violation" if attendance_overall < 75.0 else "Disengagement Leading Indicator"
            items.append(
                RecommendationItem(
                    id=f"INT-{student_id}-CNS-01",
                    student_id=student_id,
                    student_name=student_name,
                    department=department,
                    segment=f"Attendance Debarment Risk ({attendance_overall:.1f}%)",
                    recommended_action=(
                        f"Initiate mandatory in-person Counseling session within 48 hours. "
                        f"Establish formal Attendance Recovery Undertaking and verify personal/health distress factors."
                    ),
                    reason=(
                        f"Current attendance is {attendance_overall:.1f}% (statutory cutoff: 75.0%) with "
                        f"{consecutive_absences} consecutive unexcused absences. Engagement drop risk is evaluated at "
                        f"{int(engagement_pred.probability * 100)}% ({urgency})."
                    ),
                    suggested_owner="Counselor",
                    priority_level="High" if attendance_overall < 75.0 else "Medium",
                    status="Pending",
                    created_at=datetime.utcnow(),
                )
            )

        # -------------------------------------------------------------------------
        # Rule 3: Active Backlog Deficit & Academic Remediation
        # -------------------------------------------------------------------------
        if backlogs_active > 0 or backlog_pred.risk_level in ["High", "Critical"]:
            items.append(
                RecommendationItem(
                    id=f"INT-{student_id}-FAC-01",
                    student_id=student_id,
                    student_name=student_name,
                    department=department,
                    segment=f"Active Backlog Deficit ({backlogs_active} Subject{'s' if backlogs_active > 1 else ''})",
                    recommended_action=(
                        f"Assign student to departmental Remedial Problem Clinic. "
                        f"Mandate 3 weekly problem-solving lab hours with Subject Expert Faculty."
                    ),
                    reason=(
                        f"Carrying {backlogs_active} unresolved backlog course(s) with an internal assessment average of "
                        f"{internal_assessment:.1f}%. Predicted backlog accumulation risk is {int(backlog_pred.probability * 100)}% ({backlog_pred.risk_level})."
                    ),
                    suggested_owner="Faculty Mentor",
                    priority_level="High",
                    status="Pending",
                    created_at=datetime.utcnow(),
                )
            )

        # -------------------------------------------------------------------------
        # Rule 4: Digital LMS Platform Slump & Passive Learning Drift
        # -------------------------------------------------------------------------
        if module_completion < 60.0 or portal_logins_weekly < 4:
            items.append(
                RecommendationItem(
                    id=f"INT-{student_id}-LMS-01",
                    student_id=student_id,
                    student_name=student_name,
                    department=department,
                    segment="LMS Inactivity & Module Lag",
                    recommended_action=(
                        "Pair student with a high-performing peer study partner for weekly LMS quiz milestones; "
                        "send automated daily micro-learning review prompts."
                    ),
                    reason=(
                        f"Digital LMS module completion has fallen to {module_completion:.1f}% with only "
                        f"{portal_logins_weekly} logins/week. Predictor flags early drop velocity."
                    ),
                    suggested_owner="Faculty Mentor",
                    priority_level="Medium",
                    status="Pending",
                    created_at=datetime.utcnow(),
                )
            )

        # -------------------------------------------------------------------------
        # Rule 5: Top-Tier Star Performer (Sponsorship & Leadership)
        # -------------------------------------------------------------------------
        if cgpa >= 8.5 and coding_score >= 80.0 and attendance_overall >= 85.0 and backlogs_active == 0:
            items.append(
                RecommendationItem(
                    id=f"INT-{student_id}-STR-01",
                    student_id=student_id,
                    student_name=student_name,
                    department=department,
                    segment="Placement Elite & Research Candidate",
                    recommended_action=(
                        "Nominate for Tier-1 Super-Dream Campus Placement Fast-Track, "
                        "provide sponsorship for National Hackathon, and offer Undergraduate Research Assistantship."
                    ),
                    reason=(
                        f"Exceptional multi-pillar standing: CGPA {cgpa:.2f}, Coding {coding_score}/100, and "
                        f"Attendance {attendance_overall:.1f}%. Zero active risk factors."
                    ),
                    suggested_owner="T&P Cell",
                    priority_level="Low",
                    status="Pending",
                    created_at=datetime.utcnow(),
                )
            )

        # Fallback default if student is in balanced state
        if not items:
            items.append(
                RecommendationItem(
                    id=f"INT-{student_id}-GEN-01",
                    student_id=student_id,
                    student_name=student_name,
                    department=department,
                    segment="Steady Progression Cohort",
                    recommended_action=(
                        "Conduct routine mid-term faculty advisory review; encourage completion of one industry certification."
                    ),
                    reason=(
                        f"Student performance is well-balanced across academics (CGPA {cgpa:.2f}), "
                        f"attendance ({attendance_overall:.1f}%), and placement drills."
                    ),
                    suggested_owner="Faculty Mentor",
                    priority_level="Low",
                    status="Pending",
                    created_at=datetime.utcnow(),
                )
            )

        return items


# Singleton instance
recommendation_engine = RecommendationEngine()
