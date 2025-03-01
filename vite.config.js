import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // No proxy needed when using Netlify CLI's integrated dev server
  // The Netlify CLI will handle routing to functions automatically
})