import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.(js|jsx)$/, 
    exclude: [],
  },  
});
