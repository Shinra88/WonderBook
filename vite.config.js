// vite.config.js
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import history from 'connect-history-api-fallback';

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
      ...(isProduction && {
        drop: ['console', 'debugger'],
        minifyIdentifiers: true,
        minifySyntax: true,
        minifyWhitespace: true,
      }),
    },

    // 🚀 Configuration BUILD optimisée
    build: {
      minify: 'esbuild',
      target: 'esnext',

      rollupOptions: {
        output: {
          // Chunks optimisés
          manualChunks: id => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              return 'vendor';
            }
          },

          assetFileNames: assetInfo => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];

            if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/css/i.test(ext)) {
              return `assets/[name]-[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },

          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },

      // 🚀 Optimisations pour les performances
      assetsInlineLimit: 8192, // 8KB inline
      cssCodeSplit: true, // Garder pour CSS modules
      cssMinify: true,

      sourcemap: false,
      chunkSizeWarningLimit: 1500,
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
              '/api': {
                target: env.VITE_BACKEND_URL || 'http://backend:5000',
                changeOrigin: true,
                secure: false,
                configure: (proxy) => {
                  proxy.on('error', (err) => {
                    console.log('❌ Proxy error:', err.message);
                  });
                  proxy.on('proxyReq', (proxyReq, req) => {
                    console.log('🔄 Proxying:', req.method, req.url, '→', proxyReq.path);
                  });
                  proxy.on('proxyRes', (proxyRes, req) => {
                    console.log('✅ Proxy response:', proxyRes.statusCode, req.url);
                  });
                },
              },
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

    // 🔧 CSS configuration simple et propre
    css: {
      devSourcemap: mode === 'development',
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
