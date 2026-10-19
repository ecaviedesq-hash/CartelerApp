import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../components/Alert.tsx'
import { EstadoControl } from '../components/EstadoControl.tsx'
import { Poster } from '../components/Poster.tsx'
import { StarRating } from '../components/StarRating.tsx'
import { conteoPorEstado, prepararLista, resumenLista } from '../lib/coleccion.ts'
import { mensajeDeError } from '../lib/errores.ts'
import { formatearFecha } from '../lib/formato.ts'
import { ESTADOS, ETIQUETA_ESTADO, ETIQUETA_TIPO } from '../lib/labels.ts'
import { actualizarItem, eliminarItem, obtenerMiLista } from '../lib/lista.ts'
import type { EstadoVisualizacion, FiltroEstado, MiListaItem, OrdenLista } from '../types.ts'

interface TarjetaListaProps {
  item: MiListaItem
  confirmar: boolean
  onEstado: (item: MiListaItem, estado: EstadoVisualizacion) => void
  onNota: (item: MiListaItem, nota: number | null) => void
  onPedirBorrado: (id: number) => void
  onCancelarBorrado: () => void
  onConfirmarBorrado: (item: MiListaItem) => void
}

function TarjetaLista({
  item,
  confirmar,
  onEstado,
  onNota,
  onPedirBorrado,
  onCancelarBorrado,
  onConfirmarBorrado,
}: TarjetaListaProps) {
  return (
    <article className="media-card">
      <Link to={`/lista/${item.id}`} className="poster-link">
        <Poster src={item.poster_url} alt={`Póster de ${item.titulo}`} titulo={item.titulo} />
      </Link>
      <div className="media-body">
        <div className="media-kicker">
          <span className={`chip chip-${item.tipo_contenido}`}>{ETIQUETA_TIPO[item.tipo_contenido]}</span>
          <span>{formatearFecha(item.fecha_agregado)}</span>
        </div>
        <h2 className="media-title">
          <Link to={`/lista/${item.id}`}>{item.titulo}</Link>
        </h2>
        {item.comentario ? <p className="excerpt">{item.comentario}</p> : null}
        <StarRating
          value={item.calificacion_personal}
          onChange={(nota) => onNota(item, nota)}
          etiqueta={`Calificación de ${item.titulo}`}
          size="sm"
        />
        <div className="media-actions card-tools">
          <EstadoControl
            id={`estado-${item.id}`}
            titulo={item.titulo}
            value={item.estado}
            compact
            onChange={(estado) => onEstado(item, estado)}
          />
          {confirmar ? (
            <div className="confirm-row">
              <button type="button" className="btn btn-danger btn-small" onClick={() => onConfirmarBorrado(item)}>
                Quitar
              </button>
              <button type="button" className="btn btn-ghost btn-small" onClick={onCancelarBorrado}>
                Cancelar
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-ghost btn-small" onClick={() => onPedirBorrado(item.id)}>
              Eliminar
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export function ListPage() {
  const [items, setItems] = useState<MiListaItem[]>([])
  const [filtro, setFiltro] = useState<FiltroEstado>('todos')
  const [orden, setOrden] = useState<OrdenLista>('recientes')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmarId, setConfirmarId] = useState<number | null>(null)

  useEffect(() => {
    document.title = 'Mi lista · Mi Cartelera'
  }, [])

  useEffect(() => {
    let activo = true
    obtenerMiLista()
      .then((lista) => {
        if (!activo) return
        setItems(lista)
        setCargando(false)
      })
      .catch((caught: unknown) => {
        if (!activo) return
        setError(mensajeDeError(caught))
        setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [])

  async function cambiarEstado(item: MiListaItem, estado: EstadoVisualizacion) {
    if (item.estado === estado) return
    const anterior = item.estado
    setItems((prev) => prev.map((fila) => (fila.id === item.id ? { ...fila, estado } : fila)))
    try {
      await actualizarItem(item.id, { estado })
    } catch (caught) {
      setItems((prev) => prev.map((fila) => (fila.id === item.id ? { ...fila, estado: anterior } : fila)))
      setError(mensajeDeError(caught))
    }
  }

  async function cambiarNota(item: MiListaItem, nota: number | null) {
    if (item.calificacion_personal === nota) return
    const anterior = item.calificacion_personal
    setItems((prev) => prev.map((fila) => (fila.id === item.id ? { ...fila, calificacion_personal: nota } : fila)))
    try {
      await actualizarItem(item.id, { calificacion_personal: nota })
    } catch (caught) {
      setItems((prev) =>
        prev.map((fila) => (fila.id === item.id ? { ...fila, calificacion_personal: anterior } : fila)),
      )
      setError(mensajeDeError(caught))
    }
  }

  async function quitar(item: MiListaItem) {
    try {
      await eliminarItem(item.id)
      setItems((prev) => prev.filter((fila) => fila.id !== item.id))
      setConfirmarId(null)
    } catch (caught) {
      setError(mensajeDeError(caught))
    }
  }

  const visibles = prepararLista(items, filtro, orden)
  const conteo = conteoPorEstado(items)

  return (
    <section className="stack">
      <header className="page-intro">
        <p className="eyebrow">Tu colección</p>
        <h1>Mi lista</h1>
        {!cargando && !error ? <p className="summary">{resumenLista(items)}</p> : null}
      </header>

      <div className="toolbar">
        <div className="filters" role="group" aria-label="Filtrar por estado">
          <button
            type="button"
            className={filtro === 'todos' ? 'filter-btn is-active' : 'filter-btn'}
            aria-pressed={filtro === 'todos'}
            onClick={() => setFiltro('todos')}
          >
            Todos <span>{items.length}</span>
          </button>
          {ESTADOS.map((estado) => (
            <button
              key={estado}
              type="button"
              className={filtro === estado ? `filter-btn is-active is-${estado}` : `filter-btn is-${estado}`}
              aria-pressed={filtro === estado}
              onClick={() => setFiltro(estado)}
            >
              {ETIQUETA_ESTADO[estado]} <span>{conteo[estado]}</span>
            </button>
          ))}
        </div>
        <div className="field field-inline">
          <label htmlFor="orden">Ordenar</label>
          <select
            id="orden"
            value={orden}
            onChange={(event) => setOrden(event.target.value as OrdenLista)}
          >
            <option value="recientes">Fecha agregada, más recientes</option>
            <option value="antiguos">Fecha agregada, más antiguos</option>
            <option value="mejor">Calificación personal, más alta</option>
            <option value="peor">Calificación personal, más baja</option>
          </select>
        </div>
      </div>

      {error ? <Alert>{error}</Alert> : null}
      {cargando ? <p className="status-line">Cargando tu lista…</p> : null}

      {!cargando && items.length === 0 ? (
        <div className="empty">
          <h2>Tu cartelera está vacía</h2>
          <p>Busca un título y agrégalo. Empieza en por ver y cámbialo cuando lo estés viendo.</p>
          <Link className="btn btn-primary" to="/">
            Buscar títulos
          </Link>
        </div>
      ) : null}

      {!cargando && items.length > 0 && visibles.length === 0 ? (
        <div className="empty">
          <h2>Nada en este estado</h2>
          <p>Prueba otro filtro o cambia el estado de un título desde su ficha.</p>
        </div>
      ) : null}

      {!cargando && visibles.length > 0 ? (
        <div className="card-grid">
          {visibles.map((item) => (
            <TarjetaLista
              key={item.id}
              item={item}
              confirmar={confirmarId === item.id}
              onEstado={(fila, estado) => void cambiarEstado(fila, estado)}
              onNota={(fila, nota) => void cambiarNota(fila, nota)}
              onPedirBorrado={setConfirmarId}
              onCancelarBorrado={() => setConfirmarId(null)}
              onConfirmarBorrado={(fila) => void quitar(fila)}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
