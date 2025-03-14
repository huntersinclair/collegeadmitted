import { createClient } from '@supabase/supabase-js'

// These will be replaced with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gxmjrflinujlpjnqblyr.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWpyZmxpbnVqbHBqbnFibHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5Nzg3NjksImV4cCI6MjA1NzU1NDc2OX0.ZCJATd14Nw4TS3s6GHFyXQZ6gi_EDorvMKjCtmp6plI'

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey) 