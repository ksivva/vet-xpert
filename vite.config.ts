
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Use a dynamic base path depending on the environment
  base: mode === 'production' ? "/vet-xpert/" : "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Ensure proper MIME types are used
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: ({name}) => {
          if (/\.(js|mjs)$/.test(name ?? '')) {
            return 'assets/[name].[hash].js';
          }
          
          if (/\.css$/.test(name ?? '')) {
            return 'assets/[name].[hash].css';
          }
          
          return 'assets/[name].[hash].[ext]';
        }
      }
    }
  }
}));
