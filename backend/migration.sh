#!/bin/bash
set -e

# Script to run Supabase migrations during container startup
# This script will be executed in the Docker container

echo "Checking if Supabase migrations need to be applied..."

# Check if required environment variables are set
if [ -z "$SUPABASE_ACCESS_TOKEN" ] || [ -z "$SUPABASE_PROJECT_ID" ]; then
  echo "WARNING: SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_ID not set. Skipping migrations."
  exit 0
fi

# Install Supabase CLI
npm install -g supabase

# Attempt to run migrations
echo "Running Supabase migrations..."
supabase link --project-ref "$SUPABASE_PROJECT_ID"
supabase db push

echo "Migrations completed successfully."
exit 0 