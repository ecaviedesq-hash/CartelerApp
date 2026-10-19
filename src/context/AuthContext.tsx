import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext, type AuthContextValue } from './auth-context.ts'
import { requireSupabase } from '../lib/supabase.ts'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const client = requireSupabase()
    let activo = true

    client.auth
      .getSession()
      .then(({ data }) => {
        if (!activo) return
        setSession(data.session)
        setLoading(false)
      })
      .catch(() => {
        if (!activo) return
        setSession(null)
        setLoading(false)
      })

    const { data } = client.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setLoading(false)
    })

    return () => {
      activo = false
      data.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await requireSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) throw error
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await requireSupabase().auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) throw error
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new Error('User already registered')
    }
    return data.session ? 'session' : 'confirm'
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await requireSupabase().auth.signOut()
    if (error) throw error
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ session, loading, signIn, signUp, signOut }),
    [session, loading, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
