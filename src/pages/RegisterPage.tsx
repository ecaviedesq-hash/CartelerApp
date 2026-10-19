import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../components/Alert.tsx'
import { AuthScreen } from '../components/AuthScreen.tsx'
import { useAuth } from '../context/useAuth.ts'
import { mensajeDeError } from '../lib/errores.ts'

export function RegisterPage() {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    document.title = 'Registro · Mi Cartelera'
  }, [])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setAviso(null)
    setEnviando(true)
    try {
      const resultado = await signUp(email, password)
      if (resultado === 'confirm') {
        setAviso('Te enviamos un correo para confirmar la cuenta. Ábrelo y luego entra.')
      }
    } catch (caught) {
      setError(mensajeDeError(caught))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthScreen
      titulo="Crea tu cuenta"
      subtitulo="Con ella se guarda tu lista y nadie más puede verla."
      pie={
        <>
          ¿Ya tienes cuenta? <Link to="/login">Entra</Link>
        </>
      }
    >
      {aviso ? (
        <Alert tone="ok">{aviso}</Alert>
      ) : (
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
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <p className="field-hint">Mínimo 6 caracteres.</p>
          </div>
          {error ? <Alert>{error}</Alert> : null}
          <button className="btn btn-primary" type="submit" disabled={enviando}>
            {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>
      )}
    </AuthScreen>
  )
}
