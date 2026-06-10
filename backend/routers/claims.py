"""
Claims Router - Insurance claims management endpoints
Handles CRUD operations for claims and PDF discharge summary uploads to Supabase Storage
"""

from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File
import logging
from typing import Optional
from datetime import datetime, date
from uuid import uuid4

from database import get_supabase_client
from models import (
    ClaimResponse, ClaimCreate, ClaimUpdate, 
    Status, ErrorResponse, SuccessResponse, FileUploadResponse
)

router = APIRouter()
logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png'}
MAX_FILE_SIZE = 10 * 1024 * 1024


def validate_file(filename: str, file_size: int) -> tuple[bool, str]:
    """Validate file for upload"""
    extension = '.' + filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    if extension not in ALLOWED_EXTENSIONS:
        return False, f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
    
    if file_size > MAX_FILE_SIZE:
        return False, f"File too large. Max: {MAX_FILE_SIZE / 1024 / 1024}MB"
    
    return True, "Valid"


@router.post(
    "/",
    response_model=ClaimResponse,
    status_code=status.HTTP_201_CREATED,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def create_claim(claim: ClaimCreate):
    """Create a new insurance claim"""
    try:
        supabase = get_supabase_client()
        
        # Convert date to ISO format string if needed
        admission_date = claim.date_of_admission
        discharge_date = claim.date_of_discharge
        
        if isinstance(admission_date, date):
            admission_date = admission_date.isoformat()
        if isinstance(discharge_date, date):
            discharge_date = discharge_date.isoformat()
        
        claim_data = {
            "hospital_name": claim.hospital_name,
            "date_of_admission": str(admission_date),
            "date_of_discharge": str(discharge_date),
        }
        
        response = supabase.table("claims").insert(claim_data).execute()
        
        if response.data:
            logger.info(f"Claim created: {response.data[0]['id']}")
            return response.data[0]
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create claim"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating claim: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create claim: {str(e)}"
        )


@router.post(
    "/{claim_id}/upload-discharge-summary",
    response_model=FileUploadResponse,
    status_code=status.HTTP_201_CREATED,
    responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def upload_discharge_summary(
    claim_id: str,
    file: UploadFile = File(...)
):
    """Upload hospital discharge summary for a claim"""
    try:
        supabase = get_supabase_client()
        
        claim_check = supabase.table("claims").select("id").eq("id", claim_id).execute()
        if not claim_check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Claim {claim_id} not found"
            )
        
        file_content = await file.read()
        
        is_valid, message = validate_file(file.filename or "file", len(file_content))
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        
        if file.filename:
            file_extension = '.' + file.filename.rsplit('.', 1)[-1].lower()
        else:
            file_extension = '.pdf'
            
        unique_filename = f"claims/{claim_id}/{uuid4()}{file_extension}"
        
        response = supabase.storage.from_("discharge-summaries").upload(
            unique_filename,
            file_content,
            {
                "content-type": file.content_type or "application/octet-stream",
                "cache-control": "3600"
            }
        )
        
        file_url = supabase.storage.from_("discharge-summaries").get_public_url(unique_filename)
        
        logger.info(f"File uploaded for claim {claim_id}")
        
        return FileUploadResponse(
            filename=file.filename or "discharge_summary",
            url=file_url,
            size=len(file_content),
            content_type=file.content_type or "application/octet-stream",
            uploaded_at=datetime.now()
        )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )


@router.get(
    "/{claim_id}",
    response_model=ClaimResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def get_claim(claim_id: str):
    """Retrieve a claim by ID"""
    try:
        supabase = get_supabase_client()
        response = supabase.table("claims").select("*").eq("id", claim_id).execute()
        
        if response.data:
            logger.info(f"Claim retrieved: {claim_id}")
            return response.data[0]
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Claim {claim_id} not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving claim: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve claim: {str(e)}"
        )


@router.get(
    "/",
    response_model=list[ClaimResponse],
    responses={500: {"model": ErrorResponse}}
)
async def list_claims(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """List all claims with pagination"""
    try:
        supabase = get_supabase_client()
        response = supabase.table("claims").select("*").range(offset, offset + limit - 1).execute()
        
        logger.info(f"Retrieved {len(response.data)} claims")
        return response.data
        
    except Exception as e:
        logger.error(f"Error listing claims: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list claims: {str(e)}"
        )


@router.put(
    "/{claim_id}",
    response_model=ClaimResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def update_claim(claim_id: str, claim: ClaimUpdate):
    """Update an existing claim"""
    try:
        supabase = get_supabase_client()
        
        check = supabase.table("claims").select("id").eq("id", claim_id).execute()
        if not check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Claim {claim_id} not found"
            )
        
        update_data = {}
        if claim.hospital_name is not None:
            update_data["hospital_name"] = claim.hospital_name
        if claim.date_of_admission is not None:
            admission_date = claim.date_of_admission
            if isinstance(admission_date, date):
                admission_date = admission_date.isoformat()
            update_data["date_of_admission"] = str(admission_date)
        if claim.date_of_discharge is not None:
            discharge_date = claim.date_of_discharge
            if isinstance(discharge_date, date):
                discharge_date = discharge_date.isoformat()
            update_data["date_of_discharge"] = str(discharge_date)
        if claim.status is not None:
            update_data["status"] = claim.status
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        response = supabase.table("claims").update(update_data).eq("id", claim_id).execute()
        
        if response.data:
            logger.info(f"Claim updated: {claim_id}")
            return response.data[0]
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update claim"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating claim: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update claim: {str(e)}"
        )


@router.delete(
    "/{claim_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def delete_claim(claim_id: str):
    """Delete a claim by ID"""
    try:
        supabase = get_supabase_client()
        
        check = supabase.table("claims").select("id").eq("id", claim_id).execute()
        if not check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Claim {claim_id} not found"
            )
        
        supabase.table("claims").delete().eq("id", claim_id).execute()
        logger.info(f"Claim deleted: {claim_id}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting claim: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete claim: {str(e)}"
        )