import { useEffect, useState, type CSSProperties, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../components/Alert.tsx'
import { EstadoControl } from '../components/EstadoControl.tsx'
import { Poster } from '../components/Poster.tsx'
import { StarRating } from '../components/StarRating.tsx'
import { mensajeDeError } from '../lib/errores.ts'
import { formatearFecha, formatearNota } from '../lib/formato.ts'
import { ETIQUETA_TIPO } from '../lib/labels.ts'
import { actualizarItem, eliminarItem, obtenerItem } from '../lib/lista.ts'
import { obtenerFicha } from '../lib/tmdb.ts'
import type { EstadoVisualizacion, FichaTmdb, MiListaItem } from '../types.ts'

interface Borrador {
  estado: EstadoVisualizacion
  calificacion: number | null
  comentario: string
}

function borradorDesde(item: MiListaItem): Borrador {
  return {
    estado: item.estado,
    calificacion: item.calificacion_personal,
    comentario: item.comentario ?? '',
  }
}

function sinCambios(item: MiListaItem, borrador: Borrador): boolean {
  return (
    item.estado === borrador.estado &&
    item.calificacion_personal === borrador.calificacion &&
    (item.comentario ?? '') === borrador.comentario
  )
}

export function DetailPage() {
  const params = useParams()
  const navigate = useNavigate()
  const rawId = params.id ?? ''
  const id = Number(rawId)
  const idValido = Number.isInteger(id) && id > 0

  const [pedidoId, setPedidoId] = useState(rawId)
  const [item, setItem] = useState<MiListaItem | null>(null)
  const [borrador, setBorrador] = useState<Borrador | null>(null)
  const [fase, setFase] = useState<'cargando' | 'lista' | 'vacio' | 'error'>(idValido ? 'cargando' : 'vacio')
  const [error, setError] = useState<string | null>(null)
  const [ficha, setFicha] = useState<FichaTmdb | null>(null)
  const [fichaEstado, setFichaEstado] = useState<'cargando' | 'lista' | 'error'>('cargando')
  const [fichaError, setFichaError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [confirmar, setConfirmar] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  if (pedidoId !== rawId) {
    setPedidoId(rawId)
    setItem(null)
    setBorrador(null)
    setFicha(null)
    setFase(idValido ? 'cargando' : 'vacio')
    setError(null)
    setAviso(null)
    setConfirmar(false)
    setFichaEstado('cargando')
    setFichaError(null)
  }

  useEffect(() => {
    if (!idValido) return

    let activo = true
    obtenerItem(id)
      .then((fila) => {
        if (!activo) return
        if (!fila) {
          setFase('vacio')
          return
        }
        setItem(fila)
        setBorrador(borradorDesde(fila))
        setFase('lista')
        document.title = `${fila.titulo} · Mi Cartelera`
      })
      .catch((caught: unknown) => {
        if (!activo) return
        setError(mensajeDeError(caught))
        setFase('error')
      })

    return () => {
      activo = false
    }
  }, [id, idValido])

  const tipoFicha = item?.tipo_contenido
  const tmdbId = item?.tmdb_id

  useEffect(() => {
    if (!tipoFicha || tmdbId == null) return

    let activo = true
    obtenerFicha(tipoFicha, tmdbId)
      .then((detalle) => {
        if (!activo) return
        setFicha(detalle)
        setFichaEstado('lista')
      })
      .catch((caught: unknown) => {
        if (!activo) return
        setFichaError(mensajeDeError(caught))
        setFichaEstado('error')
      })

    return () => {
      activo = false
    }
  }, [tipoFicha, tmdbId])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!item || !borrador || sinCambios(item, borrador)) return
    setGuardando(true)
    setError(null)
    setAviso(null)
    try {
      const comentario = borrador.comentario.trim()
      await actualizarItem(item.id, {
        estado: borrador.estado,
        calificacion_personal: borrador.calificacion,
        comentario: comentario.length > 0 ? comentario : null,
      })
      const actualizado: MiListaItem = {
        ...item,
        estado: borrador.estado,
        calificacion_personal: borrador.calificacion,
        comentario: comentario.length > 0 ? comentario : null,
      }
      setItem(actualizado)
      setBorrador(borradorDesde(actualizado))
      setAviso('Cambios guardados.')
    } catch (caught) {
      setError(mensajeDeError(caught))
    } finally {
      setGuardando(false)
    }
  }

  async function quitar() {
    if (!item) return
    setGuardando(true)
    setError(null)
    try {
      await eliminarItem(item.id)
      navigate('/lista', { replace: true })
    } catch (caught) {
      setError(mensajeDeError(caught))
      setGuardando(false)
    }
  }

  if (fase === 'cargando') {
    return <p className="status-line">Abriendo la ficha…</p>
  }

  if (fase === 'error') {
    return (
      <section className="stack">
        <Link className="back-link" to="/lista">
          Volver a mi lista
        </Link>
        <Alert>{error}</Alert>
      </section>
    )
  }

  if (fase === 'vacio' || !item || !borrador) {
    return (
      <section className="empty">
        <h1>Este título no está en tu lista</h1>
        <p>Puede que lo hayas quitado, o que pertenezca a otra cuenta.</p>
        <Link className="btn btn-primary" to="/lista">
          Volver a mi lista
        </Link>
      </section>
    )
  }

  const anio = ficha?.anio
  const estilo = ficha?.backdropUrl
    ? ({ '--backdrop': `url("${ficha.backdropUrl}")` } as CSSProperties)
    : undefined

  return (
    <article className="stack">
      <Link className="back-link" to="/lista">
        Volver a mi lista
      </Link>

      <div className="detail-hero" style={estilo}>
        <div className="detail-layout">
          <Poster src={item.poster_url} alt={`Póster de ${item.titulo}`} titulo={item.titulo} />
          <div className="detail-copy">
            <p className="eyebrow">
              {ETIQUETA_TIPO[item.tipo_contenido]}
              {anio ? ` · ${anio}` : ''}
            </p>
            <h1>{item.titulo}</h1>
            <p className="added-on">Agregada el {formatearFecha(item.fecha_agregado)}</p>

            {fichaEstado === 'cargando' ? <p className="status-line">Cargando sinopsis y elenco…</p> : null}
            {fichaEstado === 'error' ? (
              <Alert>
                {fichaError ?? 'No pudimos cargar la ficha de TMDB.'} Tu nota y tu comentario siguen aquí.
              </Alert>
            ) : null}

            {ficha ? (
              <>
                <p className="official-score">
                  {ficha.calificacionOficial != null
                    ? `Calificación TMDB ${formatearNota(ficha.calificacionOficial)}`
                    : 'Sin calificación oficial todavía'}
                </p>
                <p className="synopsis">{ficha.sinopsis}</p>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {ficha && ficha.elenco.length > 0 ? (
        <section>
          <h2>Elenco</h2>
          <ul className="cast-list">
            {ficha.elenco.map((persona) => (
              <li key={persona.id} className="cast-item">
                {persona.fotoUrl ? (
                  <img src={persona.fotoUrl} alt="" />
                ) : (
                  <span className="cast-fallback" aria-hidden="true">
                    {persona.nombre.slice(0, 1)}
                  </span>
                )}
                <strong>{persona.nombre}</strong>
                <span>{persona.personaje}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {ficha && ficha.elenco.length === 0 && fichaEstado === 'lista' ? (
        <p className="status-line">No hay elenco registrado en TMDB.</p>
      ) : null}

      <section className="personal-card">
        <h2>Tu versión</h2>
        <p className="field-hint">La nota y el comentario son tuyos. No cambian la calificación de TMDB.</p>
        <form className="stack-form" onSubmit={(event) => void onSubmit(event)}>
          <EstadoControl
            id="estado-detalle"
            titulo={item.titulo}
            value={borrador.estado}
            disabled={guardando}
            onChange={(estado) => setBorrador((prev) => (prev ? { ...prev, estado } : prev))}
          />
          <div className="field">
            <span id="nota-label">Calificación personal</span>
            <StarRating
              value={borrador.calificacion}
              etiqueta="Calificación personal"
              onChange={
                guardando
                  ? undefined
                  : (calificacion) => setBorrador((prev) => (prev ? { ...prev, calificacion } : prev))
              }
            />
            <p className="field-hint">Del 1 al 5. Pulsa la misma estrella otra vez para quitar la nota.</p>
          </div>
          <div className="field">
            <label htmlFor="comentario">Comentario</label>
            <textarea
              id="comentario"
              rows={5}
              maxLength={2000}
              disabled={guardando}
              value={borrador.comentario}
              onChange={(event) =>
                setBorrador((prev) => (prev ? { ...prev, comentario: event.target.value } : prev))
              }
              placeholder="Una escena, un spoiler para ti, o la razón para volver a verla."
            />
          </div>
          {error ? <Alert>{error}</Alert> : null}
          {aviso ? <Alert tone="ok">{aviso}</Alert> : null}
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={guardando || sinCambios(item, borrador)}>
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>
            {confirmar ? (
              <div className="confirm-row">
                <button type="button" className="btn btn-danger" disabled={guardando} onClick={() => void quitar()}>
                  Sí, quitar
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setConfirmar(false)}>
                  Cancelar
                </button>
              </div>
            ) : (
              <button type="button" className="btn btn-danger" onClick={() => setConfirmar(true)}>
                Quitar de mi lista
              </button>
            )}
          </div>
        </form>
      </section>
    </article>
  )
}
