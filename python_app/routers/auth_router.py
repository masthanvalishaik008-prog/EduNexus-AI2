"""
EduNexus Advisor — Authentication Router (Forgot Password & Gmail OTP Reset)
Implements secure 6-digit OTP generation, Gmail SMTP dispatch, and bcrypt password hashing.
"""

import os
import random
import smtplib
from email.message import EmailMessage
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from database import SessionLocal
from models import User

router = APIRouter(prefix="/api/auth", tags=["Authentication & Password Reset"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=6, description="New password with minimum 6 characters")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def send_gmail_otp(recipient_email: str, otp_code: str) -> bool:
    """
    Sends the 6-digit OTP code to the user's email via Gmail SMTP using App Passwords.
    If credentials are missing or SMTP fails, logs the code for local demonstration/testing.
    """
    sender_email = os.getenv("GMAIL_SENDER_EMAIL")
    sender_password = os.getenv("GMAIL_APP_PASSWORD")

    if not sender_email or not sender_password:
        print(f"[EduNexus Security] Gmail SMTP credentials not set in environment. [DEMO OTP for {recipient_email}]: {otp_code}")
        return True  # Allow demo flow fallback

    try:
        msg = EmailMessage()
        msg["Subject"] = "EduNexus Advisor — Password Reset OTP Verification"
        msg["From"] = sender_email
        msg["To"] = recipient_email
        msg.set_content(
            f"Hello,\n\n"
            f"You have requested to reset your password for EduNexus Advisor.\n"
            f"Your secure 6-digit One-Time Password (OTP) is: {otp_code}\n\n"
            f"This code is valid for 10 minutes. If you did not request this reset, please ignore this email.\n\n"
            f"Regards,\nEduNexus Advisor Security Team"
        )

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.send_message(msg)
        print(f"[EduNexus Security] Successfully sent Gmail OTP to {recipient_email}")
        return True
    except Exception as e:
        print(f"[EduNexus Security] Failed to send Gmail SMTP email: {e}")
        print(f"[EduNexus Security] [FALLBACK DEMO OTP for {recipient_email}]: {otp_code}")
        return False


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Step 1: Accepts user email, generates a secure 6-digit numeric OTP valid for 10 minutes,
    and sends it via Gmail SMTP. Never discloses whether the email exists (returns generic success).
    """
    user = db.query(User).filter(User.email == payload.email.lower()).first()

    # Best practice: always return generic success message to prevent user enumeration
    if not user:
        return {
            "success": True,
            "message": "If an account with this email exists in our institutional directory, a 6-digit OTP has been sent."
        }

    # Generate secure 6-digit numeric OTP
    otp_code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    user.reset_otp = otp_code
    user.otp_expires_at = expires_at
    db.commit()

    # Send via Gmail SMTP
    send_gmail_otp(user.email, otp_code)

    return {
        "success": True,
        "message": "If an account with this email exists in our institutional directory, a 6-digit OTP has been sent."
    }


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Step 2: Accepts email, 6-digit OTP, and new password.
    Verifies OTP validity and expiration, hashes new password with bcrypt, and clears OTP fields.
    """
    user = db.query(User).filter(User.email == payload.email.lower()).first()

    if not user or not user.reset_otp or not user.otp_expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP verification request."
        )

    # Check expiration
    if datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP code has expired. Please request a new password reset."
        )

    # Verify OTP match
    if user.reset_otp != payload.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect verification OTP code."
        )

    # Hash new password securely using passlib (bcrypt)
    hashed_pwd = pwd_context.hash(payload.new_password)

    user.hashed_password = hashed_pwd
    user.reset_otp = None  # Clear upon successful reset to prevent reuse
    user.otp_expires_at = None
    db.commit()

    return {
        "success": True,
        "message": "Password has been successfully updated. You can now log in with your new credentials."
    }
