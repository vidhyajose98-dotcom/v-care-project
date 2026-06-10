"""
Database schema mapper - maps frontend fields to actual database columns
"""

# Applications table column mapping
APPLICATIONS_COLUMNS = {
    "id": "id",
    "name": "name",
    "date_of_birth": "date_of_birth",
    "mobile_number": "mobile_number",
    "email_address": "email_address",
    "address": "Address",
    "postcode": "postcode",
    "plan_selected": "plan_selected",
    "status": "status",
}

# Claims table column mapping
CLAIMS_COLUMNS = {
    "id": "id",
    "hospital_name": "hospital_name",
    "date_of_admission": "date_of_admission",
    "date_of_discharge": "date_of_discharge",
    "status": "status",
    "length_of_stay": "length_of_stay",
    "created_at": "created_at",
    "user_id": "user_id",
}

# Telehealth bookings table column mapping
TELEHEALTH_COLUMNS = {
    "id": "id",
    "pharmacy_name": "pharmacy_selected",
    "location_city": "city",
    "location_state": "state",
    "postcode": "postcode",
    "status": "status",
    "created_at": "created_at",
    "user_id": "user_id",
}


def map_fields_to_db(data: dict, column_map: dict) -> dict:
    """
    Map frontend field names to database column names
    Removes fields that don't exist in database
    """
    db_data = {}
    for frontend_key, value in data.items():
        if frontend_key in column_map:
            db_column = column_map[frontend_key]
            if db_column is not None and value is not None:
                db_data[db_column] = value
    return db_data


def map_response_from_db(data: dict, column_map: dict) -> dict:
    """
    Map database column names back to frontend field names
    """
    response_data = {}
    reverse_map = {v: k for k, v in column_map.items() if v is not None}
    
    for db_column, value in data.items():
        frontend_key = reverse_map.get(db_column, db_column)
        response_data[frontend_key] = value
    
    return response_data