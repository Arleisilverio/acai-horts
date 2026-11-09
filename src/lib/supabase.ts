import { createClient } from '@supabase/supabase-js';

const defaultUrl = 'https://govygmvlodvynkfdxhji.supabase.co';

export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  localStorage.getItem('acai_supabase_url') ||
  defaultUrl;

export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  localStorage.getItem('acai_supabase_anon_key') ||
  '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;