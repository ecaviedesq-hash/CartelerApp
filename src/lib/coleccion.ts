import type { EstadoVisualizacion, FiltroEstado, MiListaItem, OrdenLista } from '../types.ts'

export function conteoPorEstado(items: MiListaItem[]): Record<EstadoVisualizacion, number> {
  return {
    por_ver: items.filter((item) => item.estado === 'por_ver').length,
    viendo: items.filter((item) => item.estado === 'viendo').length,
    vista: items.filter((item) => item.estado === 'vista').length,
  }
}

function frase(cantidad: number, singular: string, plural: string): string {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`
}

export function resumenLista(items: MiListaItem[]): string {
  const conteo = conteoPorEstado(items)
  return `Tienes ${frase(conteo.por_ver, 'pendiente', 'pendientes')}, ${frase(conteo.viendo, 'en progreso', 'en progreso')}, ${frase(conteo.vista, 'vista', 'vistas')}.`
}

function porFecha(a: MiListaItem, b: MiListaItem, direccion: 'asc' | 'desc'): number {
  const diferencia = Date.parse(a.fecha_agregado) - Date.parse(b.fecha_agregado)
  return direccion === 'asc' ? diferencia : -diferencia
}

export function prepararLista(
  items: MiListaItem[],
  filtro: FiltroEstado,
  orden: OrdenLista,
): MiListaItem[] {
  const filtrados = filtro === 'todos' ? [...items] : items.filter((item) => item.estado === filtro)

  filtrados.sort((a, b) => {
    if (orden === 'recientes') return porFecha(a, b, 'desc')
    if (orden === 'antiguos') return porFecha(a, b, 'asc')

    const notaA = a.calificacion_personal
    const notaB = b.calificacion_personal
    if (notaA == null && notaB == null) return porFecha(a, b, 'desc')
    if (notaA == null) return 1
    if (notaB == null) return -1
    if (notaA === notaB) return porFecha(a, b, 'desc')
    return orden === 'mejor' ? notaB - notaA : notaA - notaB
  })

  return filtrados
}
