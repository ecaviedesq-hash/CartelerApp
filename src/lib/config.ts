function leerVariable(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : ''
}

export const supabaseUrl = leerVariable(import.meta.env.VITE_SUPABASE_URL)
export const supabaseAnonKey = leerVariable(import.meta.env.VITE_SUPABASE_ANON_KEY)
export const tmdbApiKey = leerVariable(import.meta.env.VITE_TMDB_API_KEY)

export const supabaseConfigurado = supabaseUrl.length > 0 && supabaseAnonKey.length > 0
export const tmdbConfigurado = tmdbApiKey.length > 0
export const appConfigurada = supabaseConfigurado && tmdbConfigurado

export function variablesFaltantes(): string[] {
  const faltan: string[] = []
  if (!supabaseUrl) faltan.push('VITE_SUPABASE_URL')
  if (!supabaseAnonKey) faltan.push('VITE_SUPABASE_ANON_KEY')
  if (!tmdbApiKey) faltan.push('VITE_TMDB_API_KEY')
  return faltan
}
