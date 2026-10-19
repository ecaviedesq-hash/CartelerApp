interface StarRatingProps {
  value: number | null
  onChange?: (value: number | null) => void
  etiqueta: string
  size?: 'sm' | 'md'
}

function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="star-icon">
      <path d="M10 1.8 12.4 7l5.6.5-4.3 3.7 1.3 5.5L10 13.8 4.9 16.7 6.2 11.2 1.9 7.5 7.6 7 10 1.8Z" />
    </svg>
  )
}

export function StarRating({ value, onChange, etiqueta, size = 'md' }: StarRatingProps) {
  const clase = size === 'sm' ? 'stars stars-sm' : 'stars'
  const resumen = value == null ? 'sin calificar' : `${value} de 5`

  return (
    <div className={clase} role="radiogroup" aria-label={`${etiqueta}: ${resumen}`}>
      {[1, 2, 3, 4, 5].map((nivel) => {
        const activa = value !== null && nivel <= value
        if (!onChange) {
          return (
            <span key={nivel} className={activa ? 'star is-on' : 'star'} aria-hidden="true">
              <StarIcon />
            </span>
          )
        }

        return (
          <button
            key={nivel}
            type="button"
            className={activa ? 'star is-on' : 'star'}
            aria-label={`${nivel} de 5`}
            aria-pressed={value === nivel}
            onClick={() => onChange(value === nivel ? null : nivel)}
          >
            <StarIcon />
          </button>
        )
      })}
    </div>
  )
}
