import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../components/Alert.tsx'
import { AuthScreen } from '../components/AuthScreen.tsx'
import { useAuth } from '../context/useAuth.ts'
import { mensajeDeError } from '../lib/errores.ts'

export function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    document.title = 'Entrar · Mi Cartelera'
  }, [])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await signIn(email, password)
    } catch (caught) {
      setError(mensajeDeError(caught))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthScreen
      titulo="Entra a tu cartelera"
      subtitulo="Tu lista solo se abre con tu cuenta."
      pie={
        <>
          ¿Primera vez? <Link to="/registro">Crea una cuenta</Link>
        </>
      }
    >
      <form className="stack-form" onSubmit={(event) => void onSubmit(event)}>
        <div className="field">
          <label htmlFor="email">Correo</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {error ? <Alert>{error}</Alert> : null}
        <button className="btn btn-primary" type="submit" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </AuthScreen>
  )
}
