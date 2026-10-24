# EduNexus Advisor — Round 2 Production Backend (FastAPI + SQLAlchemy + Gemini Flash)

EduNexus Advisor Round 2 implements an institutional decision-intelligence platform built on a 4-pillar predictive engine, rule & AI-driven interventions, role-appropriate scoping with zero data bleeding, and an AI Analytics Copilot powered by Google Gemini Flash.

---

## 🏛️ Architecture Pillars

### Pillar 1: Predictive Analytics Engine (`predictor.py`)
Evaluates 4 target outcomes with mathematically decomposed explanation drivers (SHAP-style normalized weights) and zero data leakage:
1. **Semester Performance**: Expected SGPA/CGPA band and pass/fail likelihood.
2. **Backlog Risk**: Probability of accumulating a new backlog or failing to clear existing deficits.
3. **Placement Readiness**: Likelihood of clearing aptitude (≥75%), coding (≥70%), and mock interview (≥7.0/10) benchmarks.
4. **Engagement Drop**: Leading indicator probability of sharp decline in attendance velocity or LMS logins.

### Pillar 2: Rule & AI-Driven Recommendation Engine (`recommender.py`)
Generates non-generic interventions mapped directly to prediction drivers:
- **Target Student / Segment**: Identifies distinct cohorts (e.g. *High CGPA / Deficient Placement Execution*).
- **Recommended Action**: Concrete milestones (e.g. 4-week LeetCode DP Sprint + 1-on-1 Alumni Mock Interview).
- **Reason**: Explicitly tied to mathematical driver metrics.
- **Suggested Owner**: `Faculty Mentor`, `T&P Cell`, or `Counselor`.
- **Priority Level**: `High`, `Medium`, or `Low`.

### Pillar 3: Role-Appropriate Scoped Dashboards (`routers/dashboard.py`)
- **Faculty Mentor View (`/api/dashboard/faculty`)**: Restricted exclusively to assigned students in their own branch.
- **Dean / Administrator View (`/api/dashboard/dean`)**: Campus-wide cross-departmental aggregations and strategic actions.
- **Strict Data Isolation**: Enforced via FastAPI Dependency Injection (`auth.py`). All responses apply `Cache-Control: no-store, no-cache, must-revalidate` to prevent stale caches or cross-user leakage.

### Pillar 4: Real-Time Live Activities & Quiz Submission (`routers/activities.py`)
- **Observer Status**: Staff and Higher Officials hold read-only observer rights and are blocked with HTTP 403 if attempting quiz submissions.
- **Immediate Persistence**: Student quiz submissions (`POST /api/activities/submit`) persist instantly to SQLite/PostgreSQL with XP accreditation.

### Bonus Feature: AI Analytics Copilot (`routers/copilot.py` & `copilot.py`)
- Powered by Google Gemini Flash (`gemini-2.5-flash` / `gemini-3.8-flash` via `google-genai`).
- Direct database tool execution and context grounding: answers natural language queries by fetching real student evidence and citing exact metrics.
- Handles queries like:
  - *"Which students are most at risk this semester?"*
  - *"What factors are driving poor placement readiness in the CSE department?"*
  - *"Show me students who have good CGPA but low employability scores."*
  - *"What intervention should we prioritize for the ECE department?"*

---

## 🚀 Quick Start Guide

### 1. Installation
```bash
cd python_app
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Configure Environment
Create `.env` file in `python_app/`:
```env
DATABASE_URL=sqlite:///./edunexus_round2.db
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### 3. Run FastAPI Server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API documentation:
👉 `http://localhost:8000/docs`

---

## 📡 API Contract Overview

| Method | Endpoint | Description | Role Clearance |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/predict/{student_id}` | 4-Outcome predictions with explanation drivers | Student Self / Faculty / Dean |
| `GET` | `/api/analytics/predict/batch` | Cohort-wide prediction batch | Faculty (Branch) / Dean (Campus) |
| `GET` | `/api/recommendations/student/{student_id}` | Targeted driver-linked interventions | Student Self / Faculty / Dean |
| `GET` | `/api/recommendations/department/{dept}` | Department action board by owner & priority | Faculty (Branch) / Dean |
| `PUT` | `/api/recommendations/{id}/status` | Update intervention status (Pending/In Progress) | Faculty / Dean |
| `GET` | `/api/dashboard/faculty` | Faculty Mentor View with branch isolation | Faculty Mentor |
| `GET` | `/api/dashboard/dean` | Dean Executive Cross-Department View | Dean / Administrator |
| `POST` | `/api/copilot/query` | Natural Language Query with Gemini Flash Grounding | Faculty / Dean |
| `POST` | `/api/activities/submit` | Student-only quiz submission (Staff blocked) | Student Only |
| `GET` | `/api/student/activities` | Authenticated student activity history | Student Only |
| `GET` | `/api/staff/student-reports` | Staff/Official student progress observer view | Faculty / Dean |
