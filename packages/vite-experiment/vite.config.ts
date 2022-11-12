import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { optimizeLodashImports } from "@optimize-lodash/rollup-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ...(process.env.OPTIMIZE_LODASH ? [optimizeLodashImports()] : [])
  ],
})
