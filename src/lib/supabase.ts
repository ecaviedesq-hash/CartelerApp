import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { supabaseAnonKey, supabaseConfigurado, supabaseUrl } from './config.ts'

export const supabase: SupabaseClient | null = supabaseConfigurado
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }
  return supabase
}
