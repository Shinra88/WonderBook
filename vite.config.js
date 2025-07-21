import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import history from 'connect-history-api-fallback';

// 🔧 définir __dirname manuellement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname); // 👈 utilise le vrai __dirname

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
    server:
      mode === 'development'
        ? {
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
          }
        : undefined,
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.js',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.test.{js,jsx}',
          '**/*.spec.{js,jsx}',
          'src/main.jsx',
          'vite.config.js',
        ],
      },
    },
  };
});
