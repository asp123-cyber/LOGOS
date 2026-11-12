import { createClient } from '@supabase/supabase-js';
import { createMockClient } from './mockBackend';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('YOUR_PROJECT') &&
  !supabaseAnonKey.includes('YOUR_PUBLIC');

if (!isConfigured) {
  console.info(
    '%c[LOGOS] Zero-Setup Mode Active%c Running with local embedded database, preloaded essays, and browser storage. No external cloud account required.',
    'background: #1e3a5f; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
    'color: inherit;'
  );
}

export const supabase: any = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : createMockClient();
