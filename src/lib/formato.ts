export function formatearNota(nota: number): string {
  return (Math.round(nota * 10) / 10).toFixed(1)
}

export function formatearFecha(iso: string): string {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ''
  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(fecha)
}
