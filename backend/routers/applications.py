"""
Applications Router - Insurance applications management endpoints
Handles CRUD operations for insurance applications
"""

from fastapi import APIRouter, HTTPException, status, Query
import logging
from typing import Optional
from datetime import datetime, date

from database import get_supabase_client
from models import (
    ApplicationResponse, ApplicationCreate, ApplicationUpdate,
    ErrorResponse, SuccessResponse
)
from .schema_mapper import APPLICATIONS_COLUMNS, map_fields_to_db

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def create_application(application: ApplicationCreate):
    """Create a new insurance application"""
    try:
        supabase = get_supabase_client()
        
        # Handle date_of_birth - convert to ISO format
        dob = application.date_of_birth
        if isinstance(dob, date):
            dob = dob.isoformat()
        
        # Prepare data with all frontend fields
        application_dict = {
            "name": application.name,
            "date_of_birth": str(dob),
            "mobile_number": application.mobile_number,
            "email_address": application.email_address,
            "address": application.address,
            "postcode": application.postcode,
            "plan_selected": application.plan_selected,
            "status": application.status,
        }
        
        # Map frontend fields to database columns
        application_data = map_fields_to_db(application_dict, APPLICATIONS_COLUMNS)
        
        logger.info(f"Creating application with mapped data: {application_data}")
        
        response = supabase.table("applications").insert(application_data).execute()
        
        if response.data:
            logger.info(f"Application created: {response.data[0]['id']}")
            return response.data[0]
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create application"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating application: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create application: {str(e)}"
        )


@router.get(
    "/{application_id}",
    response_model=ApplicationResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def get_application(application_id: str):
    """Retrieve an application by ID"""
    try:
        supabase = get_supabase_client()
        response = supabase.table("applications").select("*").eq("id", application_id).execute()
        
        if response.data:
            logger.info(f"Application retrieved: {application_id}")
            return response.data[0]
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application {application_id} not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving application: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve application: {str(e)}"
        )


@router.get(
    "/",
    response_model=list[ApplicationResponse],
    responses={500: {"model": ErrorResponse}}
)
async def list_applications(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """List all applications with pagination"""
    try:
        supabase = get_supabase_client()
        response = supabase.table("applications").select("*").range(offset, offset + limit - 1).execute()
        
        logger.info(f"Retrieved {len(response.data)} applications")
        return response.data
        
    except Exception as e:
        logger.error(f"Error listing applications: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list applications: {str(e)}"
        )


@router.put(
    "/{application_id}",
    response_model=ApplicationResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def update_application(application_id: str, application: ApplicationUpdate):
    """Update an existing application"""
    try:
        supabase = get_supabase_client()
        
        check = supabase.table("applications").select("id").eq("id", application_id).execute()
        if not check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application {application_id} not found"
            )
        
        # Build update data only with non-None values
        update_dict = {}
        if application.name is not None:
            update_dict["name"] = application.name
        if application.date_of_birth is not None:
            dob = application.date_of_birth
            if isinstance(dob, date):
                dob = dob.isoformat()
            update_dict["date_of_birth"] = str(dob)
        if application.mobile_number is not None:
            update_dict["mobile_number"] = application.mobile_number
        if application.email_address is not None:
            update_dict["email_address"] = application.email_address
        if application.address is not None:
            update_dict["address"] = application.address
        if application.postcode is not None:
            update_dict["postcode"] = application.postcode
        if application.plan_selected is not None:
            update_dict["plan_selected"] = application.plan_selected
        if application.status is not None:
            update_dict["status"] = application.status
        
        if not update_dict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Map to database columns
        update_data = map_fields_to_db(update_dict, APPLICATIONS_COLUMNS)
        
        response = supabase.table("applications").update(update_data).eq("id", application_id).execute()
        
        if response.data:
            logger.info(f"Application updated: {application_id}")
            return response.data[0]
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update application"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating application: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update application: {str(e)}"
        )


@router.delete(
    "/{application_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def delete_application(application_id: str):
    """Delete an application by ID"""
    try:
        supabase = get_supabase_client()
        
        check = supabase.table("applications").select("id").eq("id", application_id).execute()
        if not check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application {application_id} not found"
            )
        
        supabase.table("applications").delete().eq("id", application_id).execute()
        logger.info(f"Application deleted: {application_id}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting application: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete application: {str(e)}"
        )