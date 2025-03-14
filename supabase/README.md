# Supabase Database Migrations

This directory contains the migrations and seed data for the Supabase database.

## Structure

- `migrations/`: Contains SQL migration files that define the database schema
- `seed/`: Contains seed data for development and testing environments
- `config.toml`: Configuration for the Supabase CLI

## Working with Migrations

### Creating a New Migration

1. Create a new SQL file in the `migrations/` directory with a descriptive name and timestamp:
   ```
   supabase/migrations/YYYYMMDD_description.sql
   ```

2. Write your SQL statements in the file. For example:
   ```sql
   -- Create a new table
   CREATE TABLE my_new_table (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

### Applying Migrations Locally

To apply migrations to your local Supabase development instance:

```bash
supabase db push
```

### Applying Migrations to Production

Migrations are automatically applied to the production Supabase instance when
changes are pushed to the main branch. This is handled by the GitHub Actions
workflow defined in `.github/workflows/supabase-deploy.yml`.

## Environment Setup

To use Supabase in your local development environment:

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Start a local Supabase instance:
   ```bash
   supabase start
   ```

3. Apply migrations:
   ```bash
   supabase db push
   ```

4. Seed the database:
   ```bash
   supabase db reset
   ```

## GitHub Actions Secrets

For the deployment workflow to function, you need to set up the following secrets in your GitHub repository:

- `SUPABASE_ACCESS_TOKEN`: Your Supabase access token
- `SUPABASE_PROJECT_ID`: Your Supabase project ID

You can generate an access token from the Supabase dashboard under Settings > API. 