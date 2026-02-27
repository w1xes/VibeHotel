import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import type { Database } from '../types/database';

// Public client — uses anon key, respects Row Level Security
export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);

// Admin client — uses service role key, bypasses Row Level Security
// Use only in trusted server-side code, never expose to the client
export const supabaseAdmin = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);
