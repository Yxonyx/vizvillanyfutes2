import { createClient } from '@supabase/supabase-js';

// Supabase configuration - MUST be set in environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate required environment variables - Log warning instead of throwing error during build
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. ' +
    'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

// Create Supabase client for browser/client-side use
// Using untyped client since database tables are created dynamically via SQL migrations
// Once tables exist, you can generate types with: npx supabase gen types typescript
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Export configuration for reference (safe to export as these are public keys)
export const supabaseConfig = {
  url: supabaseUrl,
};
