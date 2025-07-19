// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import history from 'connect-history-api-fallback';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    base: '/',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.(js|jsx)$/,
      exclude: [],
    },
    server: mode === 'development' ? {
      host: true,
      port: 3000,
      watch: {
        usePolling: true,
      },
      proxy: {
        '/api': env.VITE_BACKEND_URL,
      },
      middlewareMode: false,
      setupMiddlewares(middlewares) {
        middlewares.unshift(history());
        return middlewares;
      },
    } : undefined,
  };
});
