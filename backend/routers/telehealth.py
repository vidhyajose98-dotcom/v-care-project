"""
Telehealth Router - Telehealth booking management endpoints
Handles CRUD operations for telehealth bookings
"""

from fastapi import APIRouter, HTTPException, status, Query
import logging
from typing import Optional
from datetime import datetime

from database import get_supabase_client
from models import (
    TelehealthBookingResponse, TelehealthBookingCreate, TelehealthBookingUpdate,
    ErrorResponse, SuccessResponse
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/",
    response_model=TelehealthBookingResponse,
    status_code=status.HTTP_201_CREATED,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def create_telehealth_booking(booking: TelehealthBookingCreate):
    """Create a new telehealth booking"""
    try:
        supabase = get_supabase_client()
        
        # Map to actual Supabase columns
        booking_data = {
            "pharmacy_selected": booking.pharmacy_name,
            "city": booking.location_city,
            "state": booking.location_state,
            "postcode": booking.postcode or "",
        }
        
        logger.info(f"Creating booking: {booking_data}")
        
        response = supabase.table("telehealth_bookings").insert(booking_data).execute()
        
        if response.data:
            logger.info(f"Telehealth booking created: {response.data[0]['id']}")
            return response.data[0]
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create booking"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating booking: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create booking: {str(e)}"
        )


@router.get(
    "/{booking_id}",
    response_model=TelehealthBookingResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def get_telehealth_booking(booking_id: str):
    """Retrieve a telehealth booking by ID"""
    try:
        supabase = get_supabase_client()
        response = supabase.table("telehealth_bookings").select("*").eq("id", booking_id).execute()
        
        if response.data:
            logger.info(f"Booking retrieved: {booking_id}")
            return response.data[0]
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Booking {booking_id} not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving booking: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve booking: {str(e)}"
        )


@router.get(
    "/",
    response_model=list[TelehealthBookingResponse],
    responses={500: {"model": ErrorResponse}}
)
async def list_telehealth_bookings(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """List all telehealth bookings with pagination"""
    try:
        supabase = get_supabase_client()
        response = supabase.table("telehealth_bookings").select("*").range(offset, offset + limit - 1).execute()
        
        logger.info(f"Retrieved {len(response.data)} bookings")
        return response.data
        
    except Exception as e:
        logger.error(f"Error listing bookings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list bookings: {str(e)}"
        )


@router.put(
    "/{booking_id}",
    response_model=TelehealthBookingResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def update_telehealth_booking(booking_id: str, booking: TelehealthBookingUpdate):
    """Update an existing telehealth booking"""
    try:
        supabase = get_supabase_client()
        
        check = supabase.table("telehealth_bookings").select("id").eq("id", booking_id).execute()
        if not check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Booking {booking_id} not found"
            )
        
        update_data = {}
        if booking.pharmacy_name is not None:
            update_data["pharmacy_selected"] = booking.pharmacy_name
        if booking.location_city is not None:
            update_data["city"] = booking.location_city
        if booking.location_state is not None:
            update_data["state"] = booking.location_state
        if booking.postcode is not None:
            update_data["postcode"] = booking.postcode
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        response = supabase.table("telehealth_bookings").update(update_data).eq("id", booking_id).execute()
        
        if response.data:
            logger.info(f"Booking updated: {booking_id}")
            return response.data[0]
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update booking"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating booking: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update booking: {str(e)}"
        )


@router.delete(
    "/{booking_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def delete_telehealth_booking(booking_id: str):
    """Delete a telehealth booking by ID"""
    try:
        supabase = get_supabase_client()
        
        check = supabase.table("telehealth_bookings").select("id").eq("id", booking_id).execute()
        if not check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Booking {booking_id} not found"
            )
        
        supabase.table("telehealth_bookings").delete().eq("id", booking_id).execute()
        logger.info(f"Booking deleted: {booking_id}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting booking: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete booking: {str(e)}"
        )