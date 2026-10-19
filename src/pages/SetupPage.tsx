import { useEffect } from 'react'
import { variablesFaltantes } from '../lib/config.ts'

export function SetupPage() {
  const faltan = variablesFaltantes()

  useEffect(() => {
    document.title = 'Configuración · Mi Cartelera'
  }, [])

  return (
    <main className="setup-screen">
      <section className="setup-card">
        <p className="eyebrow">Antes de abrir la cartelera</p>
        <h1>Faltan las claves del proyecto</h1>
        <p>
          Copia <code>.env.example</code> como <code>.env</code> y completa las variables. Después
          reinicia <code>npm run dev</code>. La guía está en el README.
        </p>
        <ul className="missing-list">
          {faltan.map((nombre) => (
            <li key={nombre}>
              <code>{nombre}</code>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
