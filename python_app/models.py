"""
EduNexus Advisor — SQLAlchemy Database Models
Relational schema linking Users, Students, Multi-Pillar Metrics, Predictions, and Interventions.
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    """Platform user for role-based authentication and scoping."""
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    full_name = Column(String(120), nullable=False)
    role = Column(String(30), nullable=False, default="student")  # "student", "faculty_mentor", "dean", "admin"
    department = Column(String(50), nullable=False, default="CSE")
    token_secret = Column(String(100), nullable=True)
    hashed_password = Column(String(255), nullable=True)
    reset_otp = Column(String(10), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Student(Base):
    """Core student entity with profile and institutional mapping."""
    __tablename__ = "students"

    id = Column(String(50), primary_key=True, index=True)  # e.g., "ENX-2024-0101"
    name = Column(String(120), nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False)
    department = Column(String(50), nullable=False, index=True)  # "CSE", "ECE", "IT", "EEE", "MECH"
    semester = Column(Integer, nullable=False, default=6)
    batch = Column(String(20), nullable=False, default="2022-2026")
    mentor_id = Column(String(50), nullable=True, index=True)
    mentor_name = Column(String(120), nullable=False, default="Dr. Ramesh Sundaram")
    gender = Column(String(20), nullable=False, default="Not Specified")

    # Relationships to multi-pillar telemetry
    academic = relationship("AcademicRecord", uselist=False, back_populates="student", cascade="all, delete-orphan")
    attendance = relationship("AttendanceRecord", uselist=False, back_populates="student", cascade="all, delete-orphan")
    lms = relationship("LMSRecord", uselist=False, back_populates="student", cascade="all, delete-orphan")
    placement = relationship("PlacementRecord", uselist=False, back_populates="student", cascade="all, delete-orphan")
    predictions = relationship("PredictionRecord", back_populates="student", cascade="all, delete-orphan")
    recommendations = relationship("InterventionRecommendation", back_populates="student", cascade="all, delete-orphan")
    activities = relationship("QuizActivity", back_populates="student", cascade="all, delete-orphan")


class AcademicRecord(Base):
    """Pillar 1: Longitudinal academic trajectory and backlog metrics."""
    __tablename__ = "academic_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id"), unique=True, nullable=False, index=True)
    cgpa = Column(Float, nullable=False, default=7.5)
    previous_gpa = Column(Float, nullable=False, default=7.4)
    internal_assessment = Column(Float, nullable=False, default=75.0)  # Percentage (0-100)
    backlogs_active = Column(Integer, nullable=False, default=0)
    backlogs_cleared = Column(Integer, nullable=False, default=0)
    core_subject_avg = Column(Float, nullable=False, default=76.0)
    total_credits = Column(Integer, nullable=False, default=120)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student", back_populates="academic")


class AttendanceRecord(Base):
    """Pillar 2: Real-time attendance telemetry."""
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id"), unique=True, nullable=False, index=True)
    overall_pct = Column(Float, nullable=False, default=85.0)
    theory_pct = Column(Float, nullable=False, default=84.0)
    practical_pct = Column(Float, nullable=False, default=88.0)
    consecutive_absences = Column(Integer, nullable=False, default=0)
    trend_delta = Column(Float, nullable=False, default=0.0)  # Percentage point change over last 3 weeks
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student", back_populates="attendance")


class LMSRecord(Base):
    """Pillar 3: Digital LMS platform telemetry and engagement velocity."""
    __tablename__ = "lms_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id"), unique=True, nullable=False, index=True)
    portal_logins_weekly = Column(Integer, nullable=False, default=12)
    module_completion_pct = Column(Float, nullable=False, default=80.0)
    quiz_average = Column(Float, nullable=False, default=78.0)
    assignment_on_time_pct = Column(Float, nullable=False, default=85.0)
    days_since_last_login = Column(Integer, nullable=False, default=1)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student", back_populates="lms")


class PlacementRecord(Base):
    """Pillar 4: Placement readiness, aptitude, and technical domain evaluations."""
    __tablename__ = "placement_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id"), unique=True, nullable=False, index=True)
    aptitude_score = Column(Float, nullable=False, default=72.0)  # (0-100)
    coding_score = Column(Float, nullable=False, default=65.0)    # (0-100)
    mock_interview_score = Column(Float, nullable=False, default=7.0)  # (0-10)
    domain = Column(String(80), nullable=False, default="Software Engineering")
    readiness_level = Column(String(50), nullable=False, default="Progressing")  # "Ready", "Progressing", "Needs Intensive Prep"
    hackathons = Column(Integer, nullable=False, default=1)
    github_repos = Column(Integer, nullable=False, default=3)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student", back_populates="placement")


class PredictionRecord(Base):
    """Round 2 Predictive Analytics Outputs & Driver Explanations."""
    __tablename__ = "prediction_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id"), nullable=False, index=True)
    semester_cgpa_band = Column(String(50), nullable=False)     # e.g., "8.0 - 8.5 (Distinction)"
    semester_pass_probability = Column(Float, nullable=False)  # 0.0 - 1.0
    backlog_risk_score = Column(Float, nullable=False)         # 0.0 - 1.0
    backlog_risk_level = Column(String(30), nullable=False)    # "Low", "Moderate", "High", "Critical"
    placement_readiness_prob = Column(Float, nullable=False)   # 0.0 - 1.0
    placement_readiness_level = Column(String(30), nullable=False)  # "High Readiness", "Progressing", "At Risk"
    engagement_drop_prob = Column(Float, nullable=False)       # 0.0 - 1.0
    engagement_drop_level = Column(String(30), nullable=False) # "Stable", "Early Watch", "Severe Drop Warning"
    drivers_json = Column(Text, nullable=False)                # Serialized JSON list of top explainable drivers
    generated_at = Column(DateTime, default=datetime.utcnow, index=True)

    student = relationship("Student", back_populates="predictions")


class InterventionRecommendation(Base):
    """Round 2 Prescriptive Recommendations linked directly to prediction drivers."""
    __tablename__ = "interventions"

    id = Column(String(60), primary_key=True)  # e.g., "INT-2024-0101-01"
    student_id = Column(String(50), ForeignKey("students.id"), nullable=False, index=True)
    department = Column(String(50), nullable=False, index=True)
    segment = Column(String(80), nullable=False)       # e.g., "High CGPA / Low Coding Skills"
    recommended_action = Column(String(255), nullable=False)
    reason = Column(Text, nullable=False)               # Tied to specific mathematical prediction drivers
    suggested_owner = Column(String(80), nullable=False) # "Faculty Mentor", "T&P Cell", "Counselor"
    priority_level = Column(String(20), nullable=False)  # "High", "Medium", "Low"
    status = Column(String(30), nullable=False, default="Pending")  # "Pending", "In Progress", "Completed"
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="recommendations")


class QuizActivity(Base):
    """Student engagement activity & quiz submission log."""
    __tablename__ = "quiz_activities"

    id = Column(String(60), primary_key=True)
    student_id = Column(String(50), ForeignKey("students.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False, default="Interactive Quiz")
    score = Column(Float, nullable=False, default=10.0)
    max_score = Column(Float, nullable=False, default=10.0)
    is_correct = Column(Boolean, default=True)
    status = Column(String(30), nullable=False, default="Completed")
    verified_by_staff = Column(Boolean, default=True)
    staff_feedback = Column(Text, nullable=True)
    verified_by_staff_name = Column(String(120), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    learning_outcomes = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow, index=True)

    student = relationship("Student", back_populates="activities")
