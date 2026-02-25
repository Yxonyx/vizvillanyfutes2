import { createClient } from '@supabase/supabase-js';

// Supabase configuration - MUST be set in environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
}

// Create Supabase client for browser/client-side use
// Using untyped client since database tables are created dynamically via SQL migrations
// Once tables exist, you can generate types with: npx supabase gen types typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export configuration for reference (safe to export as these are public keys)
export const supabaseConfig = {
  url: supabaseUrl,
};
