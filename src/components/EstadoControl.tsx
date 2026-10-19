import type { EstadoVisualizacion } from '../types.ts'
import { ESTADOS, ETIQUETA_ESTADO, esEstado } from '../lib/labels.ts'

interface EstadoControlProps {
  id: string
  titulo: string
  value: EstadoVisualizacion
  onChange: (estado: EstadoVisualizacion) => void
  disabled?: boolean
  compact?: boolean
}

export function EstadoControl({
  id,
  titulo,
  value,
  onChange,
  disabled = false,
  compact = false,
}: EstadoControlProps) {
  const select = (
    <select
      id={id}
      className={`select-estado is-${value}`}
      value={value}
      disabled={disabled}
      aria-label={compact ? `Estado de ${titulo}` : undefined}
      onChange={(event) => {
        const siguiente = event.target.value
        if (esEstado(siguiente)) onChange(siguiente)
      }}
    >
      {ESTADOS.map((estado) => (
        <option key={estado} value={estado}>
          {ETIQUETA_ESTADO[estado]}
        </option>
      ))}
    </select>
  )

  if (compact) return select

  return (
    <div className="field">
      <label htmlFor={id}>Estado</label>
      {select}
    </div>
  )
}
