import { useState } from 'react'

interface PosterProps {
  src: string | null
  alt: string
  titulo: string
}

export function Poster({ src, alt, titulo }: PosterProps) {
  const [fallo, setFallo] = useState(false)
  const inicial = titulo.trim().slice(0, 1).toUpperCase() || '·'

  if (!src || fallo) {
    return (
      <div className="poster poster-empty" role="img" aria-label={alt}>
        <span>{inicial}</span>
      </div>
    )
  }

  return (
    <img
      className="poster"
      src={src}
      alt={alt}
      decoding="async"
      onError={() => setFallo(true)}
    />
  )
}
