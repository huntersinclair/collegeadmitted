import os
import requests
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL and key must be set in environment variables")

class SupabaseClient:
    def __init__(self, url: str, key: str):
        self.url = url
        self.key = key
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }
    
    def auth_signup(self, email: str, password: str, user_metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Register a new user with email and password"""
        endpoint = f"{self.url}/auth/v1/signup"
        payload = {
            "email": email,
            "password": password,
            "data": user_metadata or {}
        }
        response = requests.post(endpoint, json=payload, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def auth_signin(self, email: str, password: str) -> Dict[str, Any]:
        """Sign in a user with email and password"""
        endpoint = f"{self.url}/auth/v1/token?grant_type=password"
        payload = {
            "email": email,
            "password": password
        }
        response = requests.post(endpoint, json=payload, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def get_user(self, user_id: str) -> Dict[str, Any]:
        """Get user data by ID"""
        endpoint = f"{self.url}/rest/v1/users?id=eq.{user_id}"
        response = requests.get(endpoint, headers=self.headers)
        response.raise_for_status()
        return response.json()[0] if response.json() else None
    
    def get_user_by_email(self, email: str) -> Dict[str, Any]:
        """Get user data by email"""
        endpoint = f"{self.url}/rest/v1/users?email=eq.{email}"
        response = requests.get(endpoint, headers=self.headers)
        response.raise_for_status()
        return response.json()[0] if response.json() else None
    
    def update_user(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user data"""
        endpoint = f"{self.url}/rest/v1/users?id=eq.{user_id}"
        response = requests.patch(endpoint, json=data, headers=self.headers)
        response.raise_for_status()
        return self.get_user(user_id)
    
    def delete_user(self, user_id: str) -> None:
        """Delete a user"""
        endpoint = f"{self.url}/rest/v1/users?id=eq.{user_id}"
        response = requests.delete(endpoint, headers=self.headers)
        response.raise_for_status()

# Create a Supabase client instance
supabase_client = SupabaseClient(SUPABASE_URL, SUPABASE_KEY) 