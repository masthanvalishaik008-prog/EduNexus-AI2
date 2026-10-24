"""
EduNexus Advisor — AI Analytics Copilot API Router
Powers natural language querying over grounded institutional data using Google Gemini Flash.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from database import get_db
from schemas import CopilotQueryRequest, CopilotQueryResponse
from auth import AuthenticatedUser, get_current_user, require_faculty_or_above
from copilot import copilot_engine

router = APIRouter(prefix="/api/copilot", tags=["AI Analytics Copilot"])


def _set_no_store_headers(response: Response):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"


@router.post("/query", response_model=CopilotQueryResponse)
def query_ai_analytics_copilot(
    payload: CopilotQueryRequest,
    response: Response,
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(require_faculty_or_above),
):
    """
    BONUS FEATURE: Natural Language Querying powered by Gemini Flash.
    Allows Deans and Faculty Mentors to query live platform database analytics,
    grounding responses in real student records and evidence.
    """
    _set_no_store_headers(response)

    # Scoping: If user is a Faculty Mentor, force department scope to their own branch
    department_scope = payload.department_scope or "All"
    if user.role == "faculty_mentor" and user.department != "ALL":
        department_scope = user.department

    try:
        copilot_response = copilot_engine.query_copilot(
            db=db,
            user_query=payload.query,
            department_scope=department_scope,
            user_role=user.role,
        )
        return copilot_response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Copilot inference error: {str(e)}",
        )
