export type TipoContenido = 'pelicula' | 'serie'

export type EstadoVisualizacion = 'por_ver' | 'viendo' | 'vista'

export type FiltroEstado = 'todos' | EstadoVisualizacion

export type OrdenLista = 'recientes' | 'antiguos' | 'mejor' | 'peor'

export interface MiListaItem {
  id: number
  user_id: string
  tmdb_id: number
  titulo: string
  poster_url: string | null
  tipo_contenido: TipoContenido
  estado: EstadoVisualizacion
  calificacion_personal: number | null
  comentario: string | null
  fecha_agregado: string
}

export interface SearchResult {
  tmdbId: number
  titulo: string
  posterUrl: string | null
  tipo: TipoContenido
  anio: string | null
  sinopsis: string
  calificacionOficial: number | null
}

export interface PersonaElenco {
  id: number
  nombre: string
  personaje: string
  fotoUrl: string | null
}

export interface FichaTmdb {
  sinopsis: string
  anio: string | null
  calificacionOficial: number | null
  backdropUrl: string | null
  elenco: PersonaElenco[]
}
