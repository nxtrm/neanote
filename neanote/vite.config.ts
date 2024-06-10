import path from "path"
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from "vite"
 
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "node_modules": path.resolve(__dirname, "./node_modules"),
    },
  },
})