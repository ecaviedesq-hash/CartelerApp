import type { EstadoVisualizacion, TipoContenido } from '../types.ts'

export const ESTADOS: readonly EstadoVisualizacion[] = ['por_ver', 'viendo', 'vista']

export const ETIQUETA_ESTADO: Record<EstadoVisualizacion, string> = {
  por_ver: 'Por ver',
  viendo: 'Viendo',
  vista: 'Vista',
}

export const ETIQUETA_TIPO: Record<TipoContenido, string> = {
  pelicula: 'Película',
  serie: 'Serie',
}

export function esEstado(valor: string): valor is EstadoVisualizacion {
  return valor === 'por_ver' || valor === 'viendo' || valor === 'vista'
}
