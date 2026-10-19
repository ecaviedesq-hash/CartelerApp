import type { FichaTmdb, SearchResult, TipoContenido } from '../types.ts'
import { tmdbApiKey } from './config.ts'

const API_BASE = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p'

interface TmdbCastMember {
  id: number
  name: string
  character?: string
  profile_path?: string | null
  order?: number
}

interface TmdbTitle {
  id: number
  media_type?: string
  title?: string
  name?: string
  overview?: string
  poster_path?: string | null
  backdrop_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
  vote_count?: number
  credits?: { cast?: TmdbCastMember[] }
}

interface TmdbSearchResponse {
  results?: TmdbTitle[]
}

function imagenTmdb(
  path: string | null | undefined,
  size: 'w185' | 'w500' | 'w1280',
): string | null {
  if (!path) return null
  return `${IMAGE_BASE}/${size}${path}`
}

function notaOficial(voteAverage: number | undefined, voteCount: number | undefined): number | null {
  if (!voteCount || voteAverage == null || voteAverage <= 0) return null
  return Math.round(voteAverage * 10) / 10
}

function anioDe(fecha: string | undefined): string | null {
  if (!fecha || fecha.length < 4) return null
  return fecha.slice(0, 4)
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<T> {
  if (!tmdbApiKey) {
    throw new Error('La API key de TMDB no está configurada.')
  }

  const url = new URL(`${API_BASE}${path}`)
  url.searchParams.set('api_key', tmdbApiKey)
  url.searchParams.set('language', 'es-ES')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  let response: Response
  try {
    response = await fetch(url, { signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new Error('No hay conexión con TMDB. Revisa tu red.')
  }

  if (response.status === 401) {
    throw new Error('La API key de TMDB no es válida.')
  }
  if (!response.ok) {
    throw new Error('TMDB no respondió. Inténtalo de nuevo en unos segundos.')
  }

  return response.json() as Promise<T>
}

function mapResultado(item: TmdbTitle): SearchResult | null {
  if (item.media_type !== 'movie' && item.media_type !== 'tv') return null
  const tipo: TipoContenido = item.media_type === 'movie' ? 'pelicula' : 'serie'
  const titulo = (tipo === 'pelicula' ? item.title : item.name)?.trim()
  if (!titulo) return null

  return {
    tmdbId: item.id,
    titulo,
    posterUrl: imagenTmdb(item.poster_path, 'w500'),
    tipo,
    anio: anioDe(tipo === 'pelicula' ? item.release_date : item.first_air_date),
    sinopsis: item.overview?.trim() ?? '',
    calificacionOficial: notaOficial(item.vote_average, item.vote_count),
  }
}

export async function buscarTitulos(consulta: string, signal?: AbortSignal): Promise<SearchResult[]> {
  const limpia = consulta.trim()
  if (limpia.length < 2) {
    throw new Error('Escribe al menos 2 caracteres.')
  }

  const data = await tmdbFetch<TmdbSearchResponse>(
    '/search/multi',
    { query: limpia, include_adult: 'false' },
    signal,
  )

  return (data.results ?? []).flatMap((item) => {
    const resultado = mapResultado(item)
    return resultado ? [resultado] : []
  })
}

function mapFicha(item: TmdbTitle, tipo: TipoContenido): FichaTmdb {
  const elenco = [...(item.credits?.cast ?? [])]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 10)
    .map((persona) => ({
      id: persona.id,
      nombre: persona.name,
      personaje: persona.character?.trim() || 'Reparto',
      fotoUrl: imagenTmdb(persona.profile_path, 'w185'),
    }))

  return {
    sinopsis: item.overview?.trim() || 'Sinopsis no disponible.',
    anio: anioDe(tipo === 'pelicula' ? item.release_date : item.first_air_date),
    calificacionOficial: notaOficial(item.vote_average, item.vote_count),
    backdropUrl: imagenTmdb(item.backdrop_path, 'w1280'),
    elenco,
  }
}

export async function obtenerFicha(tipo: TipoContenido, tmdbId: number): Promise<FichaTmdb> {
  const path = tipo === 'pelicula' ? `/movie/${tmdbId}` : `/tv/${tmdbId}`
  const enEspanol = await tmdbFetch<TmdbTitle>(path, { append_to_response: 'credits' })

  if (enEspanol.overview?.trim()) return mapFicha(enEspanol, tipo)

  const enIngles = await tmdbFetch<TmdbTitle>(path, { language: 'en-US' })
  return mapFicha({ ...enEspanol, overview: enIngles.overview }, tipo)
}
