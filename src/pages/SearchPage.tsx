import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../components/Alert.tsx'
import { Poster } from '../components/Poster.tsx'
import { useAuth } from '../context/useAuth.ts'
import { mensajeDeError } from '../lib/errores.ts'
import { formatearNota } from '../lib/formato.ts'
import { ETIQUETA_TIPO } from '../lib/labels.ts'
import { agregarTitulo, claveTitulo, obtenerGuardados } from '../lib/lista.ts'
import { buscarTitulos } from '../lib/tmdb.ts'
import type { SearchResult } from '../types.ts'

interface TarjetaResultadoProps {
  resultado: SearchResult
  idGuardado: number | undefined
  guardando: boolean
  onAgregar: (resultado: SearchResult) => void
}

function TarjetaResultado({ resultado, idGuardado, guardando, onAgregar }: TarjetaResultadoProps) {
  return (
    <article className="media-card">
      <Poster src={resultado.posterUrl} alt={`Póster de ${resultado.titulo}`} titulo={resultado.titulo} />
      <div className="media-body">
        <div className="media-kicker">
          <span className={`chip chip-${resultado.tipo}`}>{ETIQUETA_TIPO[resultado.tipo]}</span>
          {resultado.anio ? <span>{resultado.anio}</span> : null}
          {resultado.calificacionOficial != null ? (
            <span>TMDB {formatearNota(resultado.calificacionOficial)}</span>
          ) : null}
        </div>
        <h2 className="media-title">{resultado.titulo}</h2>
        {resultado.sinopsis ? <p className="excerpt">{resultado.sinopsis}</p> : null}
        <div className="media-actions">
          {idGuardado ? (
            <Link className="btn btn-ghost btn-small" to={`/lista/${idGuardado}`}>
              En tu lista
            </Link>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-small"
              disabled={guardando}
              onClick={() => onAgregar(resultado)}
            >
              {guardando ? 'Agregando…' : 'Agregar a mi lista'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export function SearchPage() {
  const { session } = useAuth()
  const [consulta, setConsulta] = useState('')
  const [buscado, setBuscado] = useState('')
  const [resultados, setResultados] = useState<SearchResult[]>([])
  const [guardados, setGuardados] = useState<Record<string, number>>({})
  const [guardandoClave, setGuardandoClave] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avisoLista, setAvisoLista] = useState<string | null>(null)
  const espera = useRef<number | null>(null)
  const busquedaActual = useRef(0)

  useEffect(() => {
    document.title = 'Buscar · Mi Cartelera'
  }, [])

  useEffect(() => {
    let activo = true
    obtenerGuardados()
      .then((mapa) => {
        if (activo) setGuardados(mapa)
      })
      .catch(() => {
        if (activo) setAvisoLista('No pudimos revisar qué títulos ya guardaste. Igual puedes buscar.')
      })
    return () => {
      activo = false
    }
  }, [])

  useEffect(() => {
    return () => {
      if (espera.current != null) window.clearTimeout(espera.current)
    }
  }, [])

  async function ejecutarBusqueda(valor: string) {
    const limpio = valor.trim()
    const ticket = ++busquedaActual.current
    setBuscado(limpio)

    if (limpio.length < 2) {
      setResultados([])
      setCargando(false)
      setError(null)
      return
    }

    setCargando(true)
    setError(null)
    try {
      const items = await buscarTitulos(limpio)
      if (busquedaActual.current !== ticket) return
      setResultados(items)
    } catch (caught) {
      if (busquedaActual.current !== ticket) return
      setError(mensajeDeError(caught))
      setResultados([])
    } finally {
      if (busquedaActual.current === ticket) setCargando(false)
    }
  }

  function programarBusqueda(valor: string) {
    setConsulta(valor)
    if (espera.current != null) window.clearTimeout(espera.current)
    espera.current = window.setTimeout(() => {
      void ejecutarBusqueda(valor)
    }, 400)
  }

  function buscarAhora(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (espera.current != null) window.clearTimeout(espera.current)
    void ejecutarBusqueda(consulta)
  }

  async function onAgregar(resultado: SearchResult) {
    const userId = session?.user.id
    if (!userId) return
    const clave = claveTitulo(resultado.tipo, resultado.tmdbId)
    setGuardandoClave(clave)
    setError(null)
    try {
      const id = await agregarTitulo(userId, resultado)
      setGuardados((prev) => ({ ...prev, [clave]: id }))
    } catch (caught) {
      setError(mensajeDeError(caught))
    } finally {
      setGuardandoClave(null)
    }
  }

  const texto = consulta.trim()
  const hayConsulta = texto.length >= 2
  let estadoBusqueda = 'Escribe un título para buscar en TMDB.'
  if (error && texto === buscado) estadoBusqueda = error
  else if (texto.length === 1) estadoBusqueda = 'Escribe al menos 2 caracteres.'
  else if (hayConsulta && (cargando || texto !== buscado)) estadoBusqueda = 'Buscando en TMDB…'
  else if (hayConsulta && resultados.length === 0) estadoBusqueda = `No hay resultados para «${buscado}».`
  else if (hayConsulta && resultados.length > 0) {
    estadoBusqueda = `${resultados.length} ${resultados.length === 1 ? 'resultado' : 'resultados'}.`
  }

  return (
    <section className="stack">
      <header className="page-intro">
        <p className="eyebrow">The Movie Database</p>
        <h1>Busca una película o una serie</h1>
        <p>Los resultados traen póster, año y la nota oficial. Lo que agregues se guarda solo en tu lista.</p>
      </header>

      <form className="search-form" onSubmit={buscarAhora}>
        <label className="sr-only" htmlFor="busqueda">
          Buscar película o serie
        </label>
        <input
          id="busqueda"
          value={consulta}
          onChange={(event) => programarBusqueda(event.target.value)}
          placeholder="El secreto de sus ojos, The Office, Dune…"
          autoComplete="off"
        />
        <button className="btn btn-primary" type="submit">
          Buscar
        </button>
      </form>

      <p className="status-line" role={error && texto === buscado ? 'alert' : 'status'} aria-live="polite">
        {estadoBusqueda}
      </p>
      {avisoLista ? <Alert>{avisoLista}</Alert> : null}

      {hayConsulta && (cargando || texto !== buscado) ? (
        <div className="card-grid" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="skeleton-card" />
          ))}
        </div>
      ) : null}

      {hayConsulta && texto === buscado && !cargando && resultados.length > 0 ? (
        <div className="card-grid">
          {resultados.map((resultado) => {
            const clave = claveTitulo(resultado.tipo, resultado.tmdbId)
            return (
              <TarjetaResultado
                key={clave}
                resultado={resultado}
                idGuardado={guardados[clave]}
                guardando={guardandoClave === clave}
                onAgregar={(item) => void onAgregar(item)}
              />
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
