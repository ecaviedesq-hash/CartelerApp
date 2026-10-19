function texto(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error && 'message' in error) {
    const message = error.message
    return typeof message === 'string' ? message : ''
  }
  return ''
}

function codigo(error: unknown): string {
  if (typeof error === 'object' && error && 'code' in error) {
    const code = error.code
    return typeof code === 'string' ? code : ''
  }
  return ''
}

export function mensajeDeError(error: unknown): string {
  const message = texto(error)
  const code = codigo(error)

  if (code === '23505') return 'Ese título ya está en tu lista.'
  if (code === '23514') return 'La calificación debe estar entre 1 y 5.'
  if (message.includes('row-level security')) {
    return 'No puedes ver ni modificar títulos de otra cuenta.'
  }
  if (message.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (message.includes('User already registered') || message.includes('already been registered')) {
    return 'Ya existe una cuenta con ese correo.'
  }
  if (message.includes('Email not confirmed')) {
    return 'Confirma tu correo antes de entrar. Revisa la bandeja de entrada.'
  }
  if (message.includes('Password should be')) return 'La contraseña debe tener al menos 6 caracteres.'
  if (message.includes('Unable to validate email') || message.includes('invalid')) {
    if (message.toLowerCase().includes('email')) return 'Ese correo no parece válido.'
  }
  if (
    message.includes('Failed to fetch') ||
    message.includes('NetworkError') ||
    message.includes('Load failed') ||
    message.includes('Network request failed')
  ) {
    return 'No hay conexión. Revisa tu red y que las claves del archivo .env sean correctas.'
  }
  if (
    message.startsWith('No hay conexión') ||
    message.startsWith('La API key') ||
    message.startsWith('TMDB') ||
    message.startsWith('Supabase') ||
    message.startsWith('Escribe')
  ) {
    return message
  }

  return 'No se pudo completar la acción. Inténtalo otra vez.'
}
