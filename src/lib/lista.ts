import type { EstadoVisualizacion, MiListaItem, SearchResult, TipoContenido } from '../types.ts'
import { requireSupabase } from './supabase.ts'

interface FilaLista {
  id: number | string
  user_id: string
  tmdb_id: number | string
  titulo: string
  poster_url: string | null
  tipo_contenido: TipoContenido
  estado: EstadoVisualizacion
  calificacion_personal: number | string | null
  comentario: string | null
  fecha_agregado: string
}

export interface CambiosLista {
  estado?: EstadoVisualizacion
  calificacion_personal?: number | null
  comentario?: string | null
}

function aNumero(valor: number | string | null): number | null {
  if (valor == null || valor === '') return null
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : null
}

function normalizar(fila: FilaLista): MiListaItem {
  return {
    id: Number(fila.id),
    user_id: fila.user_id,
    tmdb_id: Number(fila.tmdb_id),
    titulo: fila.titulo,
    poster_url: fila.poster_url,
    tipo_contenido: fila.tipo_contenido,
    estado: fila.estado,
    calificacion_personal: aNumero(fila.calificacion_personal),
    comentario: fila.comentario,
    fecha_agregado: fila.fecha_agregado,
  }
}

export function claveTitulo(tipo: TipoContenido, tmdbId: number): string {
  return `${tipo}:${tmdbId}`
}

export async function obtenerMiLista(): Promise<MiListaItem[]> {
  const { data, error } = await requireSupabase()
    .from('mi_lista')
    .select('*')
    .order('fecha_agregado', { ascending: false })

  if (error) throw error
  return (data as FilaLista[]).map(normalizar)
}

export async function obtenerItem(id: number): Promise<MiListaItem | null> {
  const { data, error } = await requireSupabase()
    .from('mi_lista')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return normalizar(data as FilaLista)
}

export async function obtenerGuardados(): Promise<Record<string, number>> {
  const { data, error } = await requireSupabase()
    .from('mi_lista')
    .select('id, tmdb_id, tipo_contenido')

  if (error) throw error

  const guardados: Record<string, number> = {}
  for (const fila of data as Pick<FilaLista, 'id' | 'tmdb_id' | 'tipo_contenido'>[]) {
    guardados[claveTitulo(fila.tipo_contenido, Number(fila.tmdb_id))] = Number(fila.id)
  }
  return guardados
}

export async function agregarTitulo(userId: string, resultado: SearchResult): Promise<number> {
  const { data, error } = await requireSupabase()
    .from('mi_lista')
    .insert({
      user_id: userId,
      tmdb_id: resultado.tmdbId,
      titulo: resultado.titulo,
      poster_url: resultado.posterUrl,
      tipo_contenido: resultado.tipo,
      estado: 'por_ver',
    })
    .select('id')
    .single()

  if (error) throw error
  return Number((data as { id: number | string }).id)
}

export async function actualizarItem(id: number, cambios: CambiosLista): Promise<void> {
  const { error } = await requireSupabase().from('mi_lista').update(cambios).eq('id', id)
  if (error) throw error
}

export async function eliminarItem(id: number): Promise<void> {
  const { error } = await requireSupabase().from('mi_lista').delete().eq('id', id)
  if (error) throw error
}
