import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 3000,
      watch: {
        usePolling: true,
      },
      proxy: {
        '/api': env.VITE_BACKEND_URL,
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.(js|jsx)$/,
      exclude: [],
    },
  };
});
