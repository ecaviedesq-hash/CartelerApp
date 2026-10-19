import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth.ts'

export function Layout() {
  const { session, signOut } = useAuth()
  const email = session?.user.email ?? ''

  return (
    <div className="shell">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden="true" />
            <span className="brand-text">
              <strong>Mi Cartelera</strong>
              <small>Personal</small>
            </span>
          </Link>
          <nav className="nav" aria-label="Principal">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}>
              Buscar
            </NavLink>
            <NavLink to="/lista" className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}>
              Mi lista
            </NavLink>
          </nav>
          <div className="session">
            <span className="session-email" title={email}>
              {email}
            </span>
            <button type="button" className="btn btn-ghost btn-small" onClick={() => void signOut()}>
              Salir
            </button>
          </div>
        </div>
      </header>
      <main id="contenido" className="page">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>
          Este producto usa la API de{' '}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
            TMDB
          </a>
          , pero no está avalado ni certificado por TMDB.
        </p>
      </footer>
    </div>
  )
}
