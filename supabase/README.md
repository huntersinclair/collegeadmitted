# Supabase Configuration

This directory contains the database schema migrations for the Supabase project.

## Setup

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link to your Supabase project:
   ```bash
   supabase link --project-ref <your-project-id>
   ```

## Migrations

### Creating a new migration

1. Create a new migration file in the `migrations` directory with a timestamp prefix:
   ```bash
   touch migrations/$(date +%Y%m%d%H%M%S)_migration_name.sql
   ```

2. Add your SQL code to the migration file.

### Applying migrations

Migrations are automatically applied to production when you push code to the main branch.

To apply migrations manually:
```bash
supabase db push
```

### Local Development

For local development with Supabase:

1. Start a local Supabase instance:
   ```bash
   supabase start
   ```

2. Apply migrations to your local instance:
   ```bash
   supabase db push
   ```

3. Stop the local instance when done:
   ```bash
   supabase stop
   ```

## Environment Variables

Make sure to add these environment variables to your Render.com service:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase service role key (for backend) or anon key (for frontend)
- `SUPABASE_ACCESS_TOKEN`: Used for CI/CD deployment of migrations
- `SUPABASE_PROJECT_ID`: Your Supabase project ID

## Row Level Security (RLS)

All tables have Row Level Security enabled. Each user can only access their own data by default. 