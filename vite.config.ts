import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: true },
  // iPhones keep older Safari versions for years
  build: { target: ['es2020', 'safari14'] },
})
