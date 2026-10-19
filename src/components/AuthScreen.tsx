import type { ReactNode } from 'react'

interface AuthScreenProps {
  titulo: string
  subtitulo: string
  children: ReactNode
  pie: ReactNode
}

export function AuthScreen({ titulo, subtitulo, children, pie }: AuthScreenProps) {
  return (
    <main className="auth-screen">
      <section className="auth-hero">
        <p className="eyebrow">Mi cartelera personal</p>
        <h1>Lo que quieres ver, lo que estás viendo y lo que ya viste.</h1>
        <ul className="auth-points">
          <li>Busca películas y series reales en TMDB.</li>
          <li>Guárdalas como por ver, viendo o vista.</li>
          <li>Ponles tu nota del 1 al 5 y un comentario propio.</li>
        </ul>
      </section>
      <section className="auth-panel">
        <div className="brand brand-panel">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-text">
            <strong>Mi Cartelera</strong>
            <small>Personal</small>
          </span>
        </div>
        <h2>{titulo}</h2>
        <p className="auth-copy">{subtitulo}</p>
        {children}
        <div className="auth-switch">{pie}</div>
      </section>
    </main>
  )
}
