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
  const env = loadEnv(mode, __dirname);
  const isProduction = mode === 'production';

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
      // Optimisations pour la production
      ...(isProduction && {
        drop: ['console', 'debugger'],
        minifyIdentifiers: true,
        minifySyntax: true,
        minifyWhitespace: true,
      }),
    },

    // 🚀 Configuration BUILD ultra-optimisée
    build: {
      minify: 'esbuild',
      target: 'esnext',

      rollupOptions: {
        output: {
          // 🔧 Un seul chunk pour éviter les requêtes en cascade
          manualChunks: undefined,

          // Nommage des assets
          assetFileNames: assetInfo => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];

            if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            // CSS sera inline donc pas de fichier généré
            return `assets/[name]-[hash][extname]`;
          },

          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },

      // 🚀 CRITICAL: Inline TOUT pour éliminer les requêtes bloquantes
      assetsInlineLimit: 100000, // 100KB - inline presque tout
      cssCodeSplit: false, // CSS inline dans JS
      cssMinify: true,

      sourcemap: false,
      chunkSizeWarningLimit: 2000, // Augmenté car tout est inline
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

    optimizeDeps: {
      include: ['react', 'react-dom', '@fontsource/itim'],
    },

    css: {
      devSourcemap: mode === 'development',
      // 🔧 Configuration CSS modules pour compatibilité avec cssCodeSplit: false
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: isProduction ? '[hash:base64:5]' : '[name]__[local]___[hash:base64:5]',
      },
    },

    define: {
      __DEV__: mode === 'development',
      __PROD__: mode === 'production',
    },

    preview: {
      port: 4173,
      host: true,
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    },
  };
});
