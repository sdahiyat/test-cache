import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// Browser singleton client
let browserClient: ReturnType<typeof createSupabaseClient> | null = null;

export function createBrowserClient() {
  if (browserClient) return browserClient;
  browserClient = createSupabaseClient(supabaseUrl!, supabaseAnonKey!);
  return browserClient;
}

// Server client factory — must be called within request context
export function createServerClient() {
  const cookieStore = cookies();
  return createSupabaseServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from Server Component — mutations ignored
        }
      },
    },
  });
}
