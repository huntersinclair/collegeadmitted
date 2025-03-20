#!/usr/bin/env python3
"""
Script to fetch university majors from CommonApp API and store them in Supabase.
"""

import os
import json
import time
import logging
from typing import Dict, List, Optional
import requests
from dotenv import load_dotenv
from supabase import create_client, Client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add backend directory to Python path to access app modules if needed
import sys
from pathlib import Path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

# Load environment variables from backend/.env
load_dotenv(backend_dir / '.env')

# API Configuration
API_BASE_URL = "https://api24.commonapp.org"
HEADERS = {
    "X-Api-Key": os.getenv("COMMONAPP_API_KEY"),
    "Origin": os.getenv("COMMONAPP_ORIGIN"),
    "Authorization": os.getenv("COMMONAPP_AUTH"),
}

# Supabase Configuration
supabase: Client = create_client(
    os.getenv("SUPABASE_URL", ""),
    os.getenv("SUPABASE_KEY", "")
)

# Local storage for temporary data
TEMP_DATA_FILE = Path(__file__).parent / "temp_university_majors.json"

def load_temp_data() -> Dict:
    """Load temporary data from file if it exists."""
    try:
        with open(TEMP_DATA_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"processed_universities": [], "university_majors": {}}

def save_temp_data(data: Dict) -> None:
    """Save temporary data to file."""
    with open(TEMP_DATA_FILE, 'w') as f:
        json.dump(data, f)

def get_questions_screen_id(common_app_id: int) -> Optional[int]:
    """Get the Questions screen ID for a university."""
    try:
        response = requests.get(
            f"{API_BASE_URL}/datacatalog/members/{common_app_id}/screens",
            headers=HEADERS
        )
        response.raise_for_status()
        screens = response.json()
        
        for screen in screens:
            if screen.get("name") == "Questions":
                return screen["id"]
        return None
    except Exception as e:
        logger.error(f"Error getting screens for university {common_app_id}: {e}")
        return None

def get_academics_section_id(screen_id: int) -> Optional[int]:
    """Get the Academics section ID from a screen."""
    try:
        response = requests.get(
            f"{API_BASE_URL}/datacatalog/screens/{screen_id}/sections",
            headers=HEADERS
        )
        response.raise_for_status()
        sections = response.json()
        
        # Define section name keywords to check in order of preference
        section_keywords = [
            "Academics",
            "Academic Interest",
            "Academic",
            "Interest"
        ]
        
        # Try to find section using keywords in order of preference
        matched_section = None
        matched_keyword = None
        for keyword in section_keywords:
            for section in sections:
                section_name = section.get("name", "")
                if keyword.lower() in section_name.lower():
                    matched_section = section
                    matched_keyword = keyword
                    break
            if matched_section:
                break
        
        if matched_section:
            logger.info(f"Found matching section using keyword: '{matched_keyword}'")
            return matched_section["id"]
            
        logger.warning(f"Could not find any matching section (tried: {', '.join(section_keywords)})")
        return None
        
    except Exception as e:
        logger.error(f"Error getting sections for screen {screen_id}: {e}")
        return None

def get_majors(section_id: int) -> List[Dict]:
    """Get majors from an academics section."""
    try:
        response = requests.get(
            f"{API_BASE_URL}/datacatalog/sections/{section_id}/questions",
            headers=HEADERS
        )
        response.raise_for_status()
        data = response.json()
        
        # Define keywords to check in order of preference
        keywords = [
            "major",
            "academic interest",
            "program",
            "interest"
        ]
        
        # Find the question using keywords in order of preference
        major_question = None
        matched_keyword = None
        for keyword in keywords:
            for question in data.get("questions", []):
                label = question.get("label", "").lower()
                if keyword in label:
                    major_question = question
                    matched_keyword = keyword
                    break
            if major_question:
                break
        
        if not major_question:
            logger.warning(f"Could not find any matching question (tried: {', '.join(keywords)}) in section {section_id}")
            return []
        else:
            logger.info(f"Found matching question using keyword: '{matched_keyword}'")
            
        choice_group_id = major_question.get("choiceGroupId")
        if not choice_group_id:
            logger.warning(f"No choiceGroupId found for question in section {section_id}")
            return []
            
        # Get majors from choice values
        majors = []
        for choice in data.get("choiceValues", []):
            if choice.get("choiceGroupId") == choice_group_id:
                majors.append({
                    "choice_label": choice.get("choiceLabel"),
                    "choice_value_id": choice.get("choiceValueId"),
                    "member_export_code": choice.get("memberExportCode"),
                    # TODO: Add major group analysis from dynamicChoiceGroups
                    "major_group": None
                })
        
        if not majors:
            logger.warning(f"No majors found for choiceGroupId {choice_group_id} in section {section_id}")
        else:
            logger.info(f"Found {len(majors)} majors/academic interests in section {section_id}")
            
        return majors
    except Exception as e:
        logger.error(f"Error getting questions for section {section_id}: {e}")
        return []

def process_university(common_app_id: int) -> Optional[List[Dict]]:
    """Process a single university to get its majors."""
    logger.info(f"Processing university {common_app_id}")
    
    # Get Questions screen ID
    screen_id = get_questions_screen_id(common_app_id)
    if not screen_id:
        logger.error(f"Could not find Questions screen for university {common_app_id}")
        return None
        
    # Get Academics section ID
    section_id = get_academics_section_id(screen_id)
    if not section_id:
        logger.error(f"Could not find Academics section for university {common_app_id}")
        return None
        
    # Get majors
    majors = get_majors(section_id)
    if not majors:
        logger.error(f"Could not find majors for university {common_app_id}")
        return None
        
    return majors

def upload_to_supabase(university_majors: Dict) -> None:
    """Upload the collected data to Supabase."""
    logger.info("Starting Supabase upload...")
    
    for common_app_id, majors in university_majors.items():
        try:
            # Get university ID from Supabase
            result = supabase.table("universities") \
                .select("id") \
                .eq("common_app_id", common_app_id) \
                .execute()
            
            if not result.data:
                logger.error(f"University {common_app_id} not found in database")
                continue
                
            university_id = result.data[0]["id"]
            
            # Prepare majors data
            majors_data = [{
                "university_id": university_id,
                **major
            } for major in majors]
            
            # Insert majors in batches
            BATCH_SIZE = 100
            for i in range(0, len(majors_data), BATCH_SIZE):
                batch = majors_data[i:i + BATCH_SIZE]
                supabase.table("university_majors") \
                    .upsert(batch) \
                    .execute()
                
            logger.info(f"Uploaded {len(majors_data)} majors for university {common_app_id}")
            
        except Exception as e:
            logger.error(f"Error uploading data for university {common_app_id}: {e}")

def main():
    """Main execution function."""
    # Check for required environment variables
    required_env_vars = [
        "COMMONAPP_API_KEY",
        "COMMONAPP_ORIGIN",
        "COMMONAPP_AUTH",
        "SUPABASE_URL",
        "SUPABASE_KEY"
    ]
    
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    if missing_vars:
        logger.error(f"Missing required environment variables: {', '.join(missing_vars)}")
        return
    
    # Load temporary data
    temp_data = load_temp_data()
    
    try:
        # Get list of universities from Supabase
        result = supabase.table("universities") \
            .select("common_app_id") \
            .execute()
        
        universities = [u["common_app_id"] for u in result.data]
        
        # Get list of universities that already have majors in Supabase
        majors_result = supabase.table("university_majors") \
            .select("university_id") \
            .execute()
        
        # Get the corresponding university common_app_ids for universities that already have majors
        if majors_result.data:
            university_ids_with_majors = set(m["university_id"] for m in majors_result.data)
            universities_result = supabase.table("universities") \
                .select("common_app_id") \
                .in_("id", list(university_ids_with_majors)) \
                .execute()
            
            processed_common_app_ids = set(u["common_app_id"] for u in universities_result.data)
        else:
            processed_common_app_ids = set()
        
        # Process each university
        for common_app_id in universities:
            # Skip if university was already processed successfully (has majors in database)
            if common_app_id in processed_common_app_ids:
                logger.info(f"Skipping university {common_app_id} - already has majors in database")
                continue
                
            # Skip if university was processed in current run but failed
            if str(common_app_id) in temp_data["processed_universities"]:
                logger.info(f"Skipping university {common_app_id} - already attempted in current run")
                continue
                
            majors = process_university(common_app_id)
            if majors:
                temp_data["university_majors"][str(common_app_id)] = majors
                temp_data["processed_universities"].append(str(common_app_id))
                save_temp_data(temp_data)
                logger.info(f"Successfully processed university {common_app_id}")
            else:
                logger.warning(f"No majors found for university {common_app_id}")
                temp_data["processed_universities"].append(str(common_app_id))
                save_temp_data(temp_data)
            
            # Add delay to avoid rate limiting
            time.sleep(1)
        
        # Upload all collected data to Supabase
        if temp_data["university_majors"]:
            upload_to_supabase(temp_data["university_majors"])
            logger.info("Successfully uploaded new majors data to Supabase")
        else:
            logger.info("No new majors data to upload")
        
        # Clean up temporary file
        os.remove(TEMP_DATA_FILE)
        logger.info("Process completed successfully")
        
    except Exception as e:
        logger.error(f"Error in main execution: {e}")
        save_temp_data(temp_data)  # Save progress before exiting
        raise  # Re-raise the exception for proper error handling

if __name__ == "__main__":
    main() 