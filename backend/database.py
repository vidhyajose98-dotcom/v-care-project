"""
Database module for Supabase integration
"""

from dotenv import load_dotenv
import os
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# Debug: Print environment variables
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print("\n" + "="*60)
print("DEBUG: Environment Variables")
print("="*60)
print(f"SUPABASE_URL exists: {bool(supabase_url)}")
print(f"SUPABASE_URL value: {supabase_url[:50] if supabase_url else 'NOT FOUND'}...")
print(f"SUPABASE_SERVICE_ROLE_KEY exists: {bool(supabase_key)}")
print(f"SUPABASE_SERVICE_ROLE_KEY length: {len(supabase_key) if supabase_key else 0}")
print("="*60 + "\n")

if not supabase_url or not supabase_key:
    logger.error("❌ CREDENTIALS NOT LOADED FROM .env FILE!")
    logger.error(f"SUPABASE_URL: {supabase_url}")
    logger.error(f"SUPABASE_SERVICE_ROLE_KEY: {supabase_key}")
else:
    logger.info("✅ CREDENTIALS LOADED SUCCESSFULLY")

_supabase_client = None

def get_supabase_client():
    global _supabase_client
    
    if _supabase_client is not None:
        return _supabase_client
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        raise ValueError(
            "Missing required environment variables: "
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
        )
    
    try:
        from supabase import create_client
        _supabase_client = create_client(supabase_url, supabase_key)
        logger.info("✅ Supabase client initialized successfully")
        return _supabase_client
    except Exception as e:
        logger.error(f"❌ Failed to initialize Supabase client: {e}")
        raise

def init_db():
    try:
        client = get_supabase_client()
        logger.info("✅ Database connection initialized successfully")
        return client
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise

def close_db():
    global _supabase_client
    if _supabase_client is not None:
        _supabase_client = None
        logger.info("Database connection closed")