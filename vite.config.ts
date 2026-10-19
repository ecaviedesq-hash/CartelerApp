import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// En GitHub Pages la app vive en /CartelerApp/, no en la raíz del dominio.
// En local no se define VITE_BASE_PATH y la base sigue siendo /.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
})
