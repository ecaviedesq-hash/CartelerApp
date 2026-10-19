import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export interface AuthContextValue {
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<'session' | 'confirm'>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
