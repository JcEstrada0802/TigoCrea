import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),tailwindcss(),
  ],
  server:{
    port:3005,
    watch: {
      usePolling: true, // Muy importante en Docker para Mac/Windows
    },
  },
  optimizeDeps: {
    force: true, // Esto obliga a Vite a ignorar el caché viejo al arrancar
  }
})
