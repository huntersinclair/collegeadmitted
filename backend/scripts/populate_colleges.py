#!/usr/bin/env python3
"""
Script to fetch and populate colleges data from CommonApp JSON.
"""

import os
import json
import logging
import requests
from typing import Dict, List
from dotenv import load_dotenv
from supabase import create_client, Client

# Add backend directory to Python path to access app modules if needed
import sys
from pathlib import Path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables from backend/.env
load_dotenv(backend_dir / '.env')

# Supabase Configuration
supabase: Client = create_client(
    os.getenv("SUPABASE_URL", ""),
    os.getenv("SUPABASE_KEY", "")
)

# CommonApp Colleges JSON URL
COLLEGES_URL = "https://content.commonapp.org/scripts/colleges.json"

def fetch_colleges_data() -> List[Dict]:
    """Fetch colleges data from CommonApp JSON."""
    try:
        response = requests.get(COLLEGES_URL)
        response.raise_for_status()
        
        # Try to decode with different encodings
        try:
            data = response.json()
        except:
            # Try UTF-8 encoding
            data = json.loads(response.content.decode('utf-8'))
        
        logger.debug(f"First college in data: {data[0] if data else 'No data'}")
        return data
    except Exception as e:
        logger.error(f"Error fetching colleges data: {e}")
        raise

def transform_college_type(type_str: str) -> str:
    """Transform college type string."""
    return type_str if type_str else None

def process_colleges_data(colleges_data: List[Dict]) -> List[Dict]:
    """Process and validate colleges data."""
    valid_colleges = []
    sample_college = colleges_data[0] if colleges_data else None
    logger.debug(f"Sample college data: {sample_college}")
    
    for college in colleges_data:
        # Check for required fields
        if not college.get('id') or not college.get('N'):
            logging.warning(f"Skipping college due to missing ID or name: {college}")
            continue

        # Format the common_app_id as a 4-digit string
        common_app_id = college.get('id', '')
        if not common_app_id:
            logging.warning(f"Skipping college due to missing common_app_id: {college}")
            continue

        # Map college type
        college_type = None
        raw_type = college.get('T', '').strip()
        if raw_type == '4-year college or university':
            college_type = '4-year college or university'
        elif raw_type == '2-year or community college':
            college_type = '2-year or community college'

        valid_college = {
            'name': college['N'],  # Use 'N' for name
            'city': college.get('Ci', ''),  # Add city from 'Ci' field
            'common_app_id': common_app_id,
            'country': college.get('C', ''),
            'state': college.get('S', ''),
            'type': college_type
        }
        valid_colleges.append(valid_college)

    logging.info(f"Processed {len(valid_colleges)} valid colleges")
    return valid_colleges

def upload_to_supabase(colleges: List[Dict]) -> None:
    """Upload colleges data to Supabase."""
    logger.info(f"Uploading {len(colleges)} colleges to Supabase...")
    
    try:
        # First, delete all existing records
        logger.info("Deleting existing college records...")
        supabase.table("colleges").delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        
        # Upload in batches to avoid request size limits
        BATCH_SIZE = 100
        for i in range(0, len(colleges), BATCH_SIZE):
            batch = colleges[i:i + BATCH_SIZE]
            result = supabase.table("colleges") \
                .upsert(
                    batch,
                    on_conflict="common_app_id"
                ) \
                .execute()
            
            logger.info(f"Uploaded batch {i//BATCH_SIZE + 1} ({len(batch)} colleges)")
            
    except Exception as e:
        logger.error(f"Error uploading to Supabase: {e}")
        raise

def main():
    """Main execution function."""
    try:
        # Fetch colleges data
        logger.info("Fetching colleges data from CommonApp...")
        colleges_data = fetch_colleges_data()
        logger.info(f"Fetched {len(colleges_data)} colleges")
        
        # Process data
        logger.info("Processing colleges data...")
        processed_colleges = process_colleges_data(colleges_data)
        logger.info(f"Processed {len(processed_colleges)} valid colleges")
        
        # Upload to Supabase
        upload_to_supabase(processed_colleges)
        logger.info("Successfully completed colleges data population")
        
    except Exception as e:
        logger.error(f"Error in main execution: {e}")
        raise

if __name__ == "__main__":
    main() 