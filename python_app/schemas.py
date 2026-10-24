"""
EduNexus Advisor — Pydantic Schemas (Pydantic v2)
Data validation and response serialization contracts for Round 2 Analytics and Copilot.
"""

from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, ConfigDict


# ---------------------------------------------------------------------------
# Driver & Prediction Schemas
# ---------------------------------------------------------------------------

class DriverExplanation(BaseModel):
    feature_name: str
    feature_value: float
    impact_direction: Literal["positive", "negative", "neutral"]
    contribution_score: float = Field(..., description="Normalized SHAP-style weight or impact contribution (-1.0 to +1.0)")
    rationale: str

    model_config = ConfigDict(from_attributes=True)


class SemesterPerformancePrediction(BaseModel):
    expected_cgpa_band: str
    expected_gpa_numerical: float
    pass_likelihood_pct: float
    performance_tier: str
    top_drivers: List[DriverExplanation]


class BacklogRiskPrediction(BaseModel):
    probability: float = Field(..., ge=0.0, le=1.0)
    risk_level: Literal["Low", "Moderate", "High", "Critical"]
    expected_new_backlogs: int
    top_drivers: List[DriverExplanation]


class PlacementReadinessPrediction(BaseModel):
    benchmark_pass_probability: float = Field(..., ge=0.0, le=1.0)
    readiness_level: Literal["High Readiness", "Progressing", "At Risk"]
    target_domain: str
    aptitude_gap: float
    coding_gap: float
    interview_gap: float
    top_drivers: List[DriverExplanation]


class EngagementDropPrediction(BaseModel):
    probability: float = Field(..., ge=0.0, le=1.0)
    risk_level: Literal["Stable", "Early Watch", "Severe Drop Warning"]
    projected_attendance_drop_pct: float
    lms_velocity_status: str
    top_drivers: List[DriverExplanation]


class StudentPredictionSummary(BaseModel):
    student_id: str
    student_name: str
    department: str
    semester: int
    mentor_name: str
    composite_health_score: float
    semester_performance: SemesterPerformancePrediction
    backlog_risk: BacklogRiskPrediction
    placement_readiness: PlacementReadinessPrediction
    engagement_drop: EngagementDropPrediction
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Recommendation Schemas
# ---------------------------------------------------------------------------

class RecommendationItem(BaseModel):
    id: str
    student_id: str
    student_name: str
    department: str
    segment: str
    recommended_action: str
    reason: str
    suggested_owner: Literal["Faculty Mentor", "T&P Cell", "Counselor"]
    priority_level: Literal["High", "Medium", "Low"]
    status: Literal["Pending", "In Progress", "Completed"]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RecommendationUpdateStatus(BaseModel):
    status: Literal["Pending", "In Progress", "Completed"]
    notes: Optional[str] = None


# ---------------------------------------------------------------------------
# Role-Appropriate Dashboard Schemas
# ---------------------------------------------------------------------------

class FacultyStudentSummary(BaseModel):
    student_id: str
    student_name: str
    cgpa: float
    attendance_pct: float
    backlog_risk_level: str
    placement_readiness_level: str
    engagement_drop_level: str
    primary_risk_driver: str
    recommended_intervention: str
    priority: str


class FacultyDashboardResponse(BaseModel):
    mentor_name: str
    department: str
    assigned_students_count: int
    at_risk_students_count: int
    avg_cohort_cgpa: float
    avg_cohort_attendance: float
    students: List[FacultyStudentSummary]
    immediate_actions: List[RecommendationItem]


class DepartmentAggregateMetrics(BaseModel):
    department: str
    total_students: int
    avg_cgpa: float
    avg_attendance: float
    high_backlog_risk_count: int
    low_placement_readiness_count: int
    engagement_warning_count: int
    priority_interventions_count: int


class DeanDashboardResponse(BaseModel):
    total_monitored_students: int
    total_departments: int
    campus_avg_cgpa: float
    campus_avg_attendance: float
    total_critical_risks: int
    department_metrics: List[DepartmentAggregateMetrics]
    strategic_interventions: List[RecommendationItem]
    segment_distribution: Dict[str, int]


# ---------------------------------------------------------------------------
# AI Analytics Copilot Schemas
# ---------------------------------------------------------------------------

class CopilotQueryRequest(BaseModel):
    query: str = Field(..., min_length=3, description="Natural language query by Dean or Faculty")
    department_scope: Optional[str] = Field("All", description="Scope query by branch, e.g. CSE or All")


class GroundedEvidenceRecord(BaseModel):
    student_id: str
    name: str
    department: str
    cgpa: float
    attendance: float
    backlogs: int
    coding_score: float
    aptitude_score: float
    risk_level: str
    notable_metric: str


class CopilotQueryResponse(BaseModel):
    query: str
    answer: str
    supporting_evidence: List[GroundedEvidenceRecord]
    intent_detected: str
    scoped_students_count: int
    model_version: str
    timestamp: datetime


# ---------------------------------------------------------------------------
# Quiz & Activity Isolation Schemas
# ---------------------------------------------------------------------------

class ActivitySubmitRequest(BaseModel):
    student_id: str
    student_name: Optional[str] = "Student"
    department: Optional[str] = "General"
    title: str
    category: Optional[str] = "Interactive Quiz"
    question_text: Optional[str] = None
    is_correct: bool = True
    score: float = 10.0
    explanation: Optional[str] = None


class ActivityResponse(BaseModel):
    id: str
    student_id: str
    student_name: str
    department: str
    title: str
    category: str
    score: float
    status: str
    verified_by_staff: bool
    verified_by_staff_name: Optional[str] = None
    learning_outcomes: Optional[str] = None
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)
