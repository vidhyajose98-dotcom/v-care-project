"""
Profiles Router - User profile management endpoints
Handles CRUD operations for user profiles in Supabase
"""

from fastapi import APIRouter, HTTPException, status, Query
from fastapi.responses import JSONResponse
import logging
from typing import Optional
from datetime import datetime

from database import get_supabase_client
from models import ProfileResponse, ProfileCreate, ProfileUpdate, ErrorResponse

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/",
    response_model=ProfileResponse,
    status_code=status.HTTP_201_CREATED,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def create_profile(profile: ProfileCreate):
    """
    Create a new user profile
    
    Args:
        profile: Profile data to create
        
    Returns:
        ProfileResponse: Created profile with ID and timestamp
        
    Raises:
        HTTPException: If profile creation fails
    """
    try:
        supabase = get_supabase_client()
        
        # Insert profile into Supabase
        response = supabase.table("profiles").insert({
            "full_name": profile.full_name
        }).execute()
        
        if response.data:
            logger.info(f"Profile created successfully: {response.data[0]['id']}")
            return response.data[0]
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create profile"
            )
            
    except Exception as e:
        logger.error(f"Error creating profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create profile: {str(e)}"
        )


@router.get(
    "/{profile_id}",
    response_model=ProfileResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def get_profile(profile_id: str):
    """
    Retrieve a user profile by ID
    
    Args:
        profile_id: The profile ID
        
    Returns:
        ProfileResponse: Profile data
        
    Raises:
        HTTPException: If profile not found
    """
    try:
        supabase = get_supabase_client()
        
        response = supabase.table("profiles").select("*").eq("id", profile_id).execute()
        
        if response.data:
            logger.info(f"Profile retrieved: {profile_id}")
            return response.data[0]
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Profile with ID {profile_id} not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve profile: {str(e)}"
        )


@router.get(
    "/",
    response_model=list[ProfileResponse],
    responses={500: {"model": ErrorResponse}}
)
async def list_profiles(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    List all user profiles with pagination
    
    Args:
        limit: Number of profiles to return (max 100)
        offset: Number of profiles to skip
        
    Returns:
        list[ProfileResponse]: List of profiles
    """
    try:
        supabase = get_supabase_client()
        
        response = supabase.table("profiles").select("*")\
            .range(offset, offset + limit - 1).execute()
        
        logger.info(f"Retrieved {len(response.data)} profiles")
        return response.data
        
    except Exception as e:
        logger.error(f"Error listing profiles: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list profiles: {str(e)}"
        )


@router.put(
    "/{profile_id}",
    response_model=ProfileResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def update_profile(profile_id: str, profile: ProfileUpdate):
    """
    Update an existing user profile
    
    Args:
        profile_id: The profile ID to update
        profile: Updated profile data
        
    Returns:
        ProfileResponse: Updated profile
        
    Raises:
        HTTPException: If profile not found or update fails
    """
    try:
        supabase = get_supabase_client()
        
        # Prepare update data (exclude None values)
        update_data = profile.model_dump(exclude_unset=True)
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Verify profile exists
        check = supabase.table("profiles").select("id").eq("id", profile_id).execute()
        if not check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Profile with ID {profile_id} not found"
            )
        
        # Update profile
        response = supabase.table("profiles").update(update_data).eq("id", profile_id).execute()
        
        if response.data:
            logger.info(f"Profile updated: {profile_id}")
            return response.data[0]
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update profile"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )


@router.delete(
    "/{profile_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def delete_profile(profile_id: str):
    """
    Delete a user profile by ID
    
    Args:
        profile_id: The profile ID to delete
        
    Raises:
        HTTPException: If profile not found or deletion fails
    """
    try:
        supabase = get_supabase_client()
        
        # Verify profile exists
        check = supabase.table("profiles").select("id").eq("id", profile_id).execute()
        if not check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Profile with ID {profile_id} not found"
            )
        
        # Delete profile
        supabase.table("profiles").delete().eq("id", profile_id).execute()
        
        logger.info(f"Profile deleted: {profile_id}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete profile: {str(e)}"
        )
