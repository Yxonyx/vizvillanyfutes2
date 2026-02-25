import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key (for API routes)
// WARNING: Never expose the service role key to the client!

// Use any type for server clients to avoid type issues with custom tables/functions
// The database schema types will be properly inferred once tables are created
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, 'public', any>;

// Helper to get required env var
function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Create admin client for server-side operations
// This bypasses RLS - use with caution!
export function createAdminClient(): AnySupabaseClient {
  const supabaseUrl = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseServiceRoleKey = getRequiredEnvVar('SUPABASE_SERVICE_ROLE_KEY');
  
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Create client for API routes with user's session
export function createServerClient(authHeader?: string): AnySupabaseClient {
  const supabaseUrl = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  };

  // If auth header provided, set it as the authorization header
  if (authHeader) {
    options.global = {
      headers: {
        Authorization: authHeader,
      },
    };
  }

  return createClient(supabaseUrl, supabaseAnonKey, options);
}
