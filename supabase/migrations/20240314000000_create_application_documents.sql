-- Create enum type for document types
create type document_type as enum (
  'resume',
  'essay',
  'transcript',
  'recommendation_letter',
  'other'
);

-- Create application_documents table
create table application_documents (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references applications(id) on delete cascade not null,
  document_type document_type not null,
  content text not null,
  word_count int,
  original_filename text,
  mime_type text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Add indexes for common queries
create index idx_application_documents_application_id on application_documents(application_id);
create index idx_application_documents_document_type on application_documents(document_type);

-- Add RLS policies
alter table application_documents enable row level security;

create policy "Users can view their own application documents"
  on application_documents for select
  using (
    auth.uid() in (
      select user_id
      from applications
      where id = application_id
    )
  );

create policy "Users can insert their own application documents"
  on application_documents for insert
  with check (
    auth.uid() in (
      select user_id
      from applications
      where id = application_id
    )
  );

-- Add realtime
alter publication supabase_realtime add table application_documents; 