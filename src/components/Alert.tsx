import type { ReactNode } from 'react'

interface AlertProps {
  children: ReactNode
  tone?: 'error' | 'ok'
}

export function Alert({ children, tone = 'error' }: AlertProps) {
  return (
    <p className={tone === 'error' ? 'alert alert-error' : 'alert alert-ok'} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  )
}
