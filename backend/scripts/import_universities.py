import os
import json
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Supabase URL and key must be set in environment variables")

supabase = create_client(supabase_url, supabase_key)

def fetch_universities():
    """Load universities from local JSON file."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, 'colleges.json')
    
    with open(json_path, 'r') as f:
        return json.load(f)

def import_universities():
    """Import universities into Supabase."""
    print("Loading universities from local JSON file...")
    universities = fetch_universities()
    
    print(f"Found {len(universities)} universities")
    
    for university in universities:
        # Transform the data to match our schema
        uni_data = {
            "name": university.get("memberName", ""),
            "common_app_id": str(university.get("memberId", ""))
        }
        
        try:
            # Upsert the university data
            result = supabase.table("universities").insert(
                uni_data
            ).execute()
            print(f"Imported {uni_data['name']}")
        except Exception as e:
            print(f"Error importing {uni_data['name']}: {str(e)}")

if __name__ == "__main__":
    import_universities() 