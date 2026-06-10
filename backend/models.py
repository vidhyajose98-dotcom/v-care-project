"""
Pydantic models for V-Care application
Handles request validation, response schemas, and type safety
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


# Enum for Plan Types
class PlanType(str, Enum):
    BASIC = "V-Care Basic"
    SELECT = "V-Care Select"


# Enum for Status
class Status(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


# ==================== Profiles Models ====================

class ProfileBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)

    class Config:
        from_attributes = True


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=255)

    class Config:
        from_attributes = True


class ProfileResponse(ProfileBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== Applications Models ====================

class ApplicationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    date_of_birth: str
    mobile_number: str = Field(..., min_length=10)
    email_address: str
    address: str = Field(..., min_length=1, max_length=500)
    postcode: str
    plan_selected: str
    status: Optional[str] = "pending"

    @field_validator('date_of_birth', mode='before')
    @classmethod
    def parse_date(cls, v):
        """Accept date in DD-MM-YYYY or YYYY-MM-DD format"""
        if isinstance(v, date):
            return v.isoformat()
        if isinstance(v, str):
            # Try DD-MM-YYYY format first
            try:
                parts = v.split('-')
                if len(parts) == 3:
                    if len(parts[0]) == 2:  # DD-MM-YYYY
                        from datetime import datetime as dt
                        parsed = dt.strptime(v, '%d-%m-%Y')
                        return parsed.strftime('%Y-%m-%d')
                    elif len(parts[0]) == 4:  # YYYY-MM-DD
                        return v
            except:
                pass
        return v

    class Config:
        from_attributes = True


class ApplicationUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    date_of_birth: Optional[str | date] = None
    mobile_number: Optional[str] = None
    email_address: Optional[str] = None
    address: Optional[str] = None
    postcode: Optional[str] = None
    plan_selected: Optional[str] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True


class ApplicationResponse(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    date_of_birth: Optional[str] = None
    mobile_number: Optional[str] = None
    email_address: Optional[str] = None
    address: Optional[str] = None
    postcode: Optional[str] = None
    plan_selected: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[str] = None
    
    class Config:
        from_attributes = True


# ==================== Claims Models ====================

class ClaimCreate(BaseModel):
    hospital_name: str = Field(..., min_length=1, max_length=255)
    date_of_admission: str | date
    date_of_discharge: str | date

    class Config:
        from_attributes = True


class ClaimUpdate(BaseModel):
    hospital_name: Optional[str] = None
    date_of_admission: Optional[str | date] = None
    date_of_discharge: Optional[str | date] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True


class ClaimResponse(BaseModel):
    id: Optional[str] = None
    hospital_name: Optional[str] = None
    date_of_admission: Optional[str] = None
    date_of_discharge: Optional[str] = None
    length_of_stay: Optional[int] = None
    status: Optional[str] = None
    created_at: Optional[str] = None
    user_id: Optional[str] = None
    discharge_summary_url: Optional[str] = None
    
    class Config:
        from_attributes = True


class ClaimInfo(BaseModel):
    hospitalName: str
    admissionDate: str
    dischargeDate: str
    documentUploaded: bool
    documentName: str
    claimAmount: float
    aiVerified: bool


# ==================== Telehealth Booking Models ====================

class TelehealthBookingCreate(BaseModel):
    pharmacy_name: str = Field(..., min_length=1, max_length=255)
    location_city: str = Field(..., min_length=2, max_length=100)
    location_state: str = Field(..., min_length=2, max_length=50)
    postcode: Optional[str] = None

    class Config:
        from_attributes = True


class TelehealthBookingUpdate(BaseModel):
    pharmacy_name: Optional[str] = None
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    postcode: Optional[str] = None

    class Config:
        from_attributes = True


class TelehealthBookingResponse(BaseModel):
    id: Optional[str] = None
    pharmacy_name: Optional[str] = None
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    postcode: Optional[str] = None
    status: Optional[str] = None
    user_id: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


# ==================== Insurance Application Models ====================

class InsuranceApplicationBase(BaseModel):
    plan_type: str
    eligibility: Optional[str] = None
    status: Optional[str] = "pending"

    class Config:
        from_attributes = True


class InsuranceApplicationCreate(InsuranceApplicationBase):
    pass


class InsuranceApplicationUpdate(BaseModel):
    plan_type: Optional[str] = None
    eligibility: Optional[str] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True


class InsuranceApplicationResponse(BaseModel):
    id: Optional[str] = None
    plan_type: Optional[str] = None
    eligibility: Optional[str] = None
    status: Optional[str] = None
    user_id: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


# ==================== Frontend Input Models ====================

class FrontendInputBase(BaseModel):
    data: dict

    class Config:
        from_attributes = True


class FrontendInputCreate(FrontendInputBase):
    pass


class FrontendInputResponse(FrontendInputBase):
    id: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== File Upload Models ====================

class FileUploadResponse(BaseModel):
    filename: str
    url: str
    size: int
    content_type: str
    uploaded_at: datetime

    class Config:
        from_attributes = True


# ==================== Error Response Models ====================

class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)

    class Config:
        from_attributes = True


# ==================== Success Response Models ====================

class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[dict] = None

    class Config:
        from_attributes = True


# ==================== Batch Operation Models ====================

class BatchCreateApplications(BaseModel):
    applications: List[ApplicationCreate]


class BatchResponse(BaseModel):
    created: int
    failed: int
    errors: List[dict]

    class Config:
        from_attributes = True


# ==================== Plan Info (for Context) ====================

class PlanInfo(BaseModel):
    selectedPlan: Optional[str] = None
    dailyRate: int = 0
    maxDays: int = 0
    annualCost: int = 0


# ==================== Personal Info (for Context) ====================

class PersonalInfo(BaseModel):
    name: str = ""
    dob: str = ""
    mobile: str = ""
    email: str = ""
    address: str = ""
    pincode: str = ""