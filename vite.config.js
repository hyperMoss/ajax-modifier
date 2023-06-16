import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import { resolve } from "path";
import manifest from "./manifest.config";

// https://vitejs.dev/config/
export default defineConfig({
  build:{
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        iframe: resolve(__dirname, 'iframe.html'),
        devtools: resolve(__dirname, 'devtools.html'),
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    react(),
    crx({ manifest }),
  ]
})
