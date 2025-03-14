import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://gxmjrflinujlpjnqblyr.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWpyZmxpbnVqbHBqbnFibHlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTk3ODc2OSwiZXhwIjoyMDU3NTU0NzY5fQ.-wQrbwahMtFAE6yGLEZyMcrogMX7toUrCDDWNsILG1M")

# Create Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY) 