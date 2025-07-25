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
        drop: ['console', 'debugger'], // Supprimer console.log en prod
        minifyIdentifiers: true,
        minifySyntax: true,
        minifyWhitespace: true,
      }),
    },
    
    // 🚀 Optimisations de build pour S3 + CloudFront
    build: {
      // Minification optimale
      minify: 'esbuild', // Plus rapide que terser pour SWC
      target: 'esnext',
      
      // Gestion des chunks pour un cache optimal
      rollupOptions: {
        output: {
          // Chunks manuels pour optimiser le cache
          manualChunks: (id) => {
            // Vendor chunk pour les dépendances principales
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor';
              }
              // Autres dépendances npm dans un chunk séparé
              return 'libs';
            }
          },
          
          // Nommage optimisé des assets pour le cache
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            
            // Images avec hash pour cache long terme
            if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            // CSS avec hash
            if (/css/i.test(ext)) {
              return `assets/css/[name]-[hash][extname]`;
            }
            // Fonts avec hash
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          
          // JS chunks avec hash
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },
      
      // 🔧 Optimisations pour éviter le blocage de rendu
      assetsInlineLimit: 8192, // 🚀 Augmenté à 8KB pour inline plus d'assets (CSS, fonts)
      
      // 🚀 CSS critique : inline dans le JS pour éviter le blocage
      cssCodeSplit: false, // 🔧 CHANGEMENT CRITIQUE : inline le CSS dans le JS
      cssMinify: true,
      
      // Optimisations pour CloudFront
      sourcemap: false, // Pas de sourcemaps en prod pour économiser la bande passante
      
      // Compression et optimisations
      chunkSizeWarningLimit: 1200, // 🔧 Augmenté car CSS inline = JS plus gros
    },
    
    // 🔧 Configuration serveur pour le développement
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
    
    // 🔬 Configuration des tests
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
    
    // ⚡ Optimisations des dépendances
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@fontsource/itim', // 🚀 Ajout pour optimiser la font auto-hébergée
      ],
      // Force la résolution des images
      force: false,
    },
    
    // 🖼️ Configuration des assets
    assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.webp', '**/*.gif', '**/*.svg'],
    
    // 🎯 Optimisations CSS pour les performances
    css: {
      devSourcemap: mode === 'development',
      // 🚀 Optimisations CSS critiques
      postcss: {
        plugins: isProduction ? [
          // Plugin pour optimiser le CSS critique (optionnel)
          // require('cssnano')({
          //   preset: 'default',
          // }),
        ] : [],
      },
      preprocessorOptions: {
        scss: {
          // Si vous utilisez SCSS
          additionalData: `@import "@/styles/variables.scss";`,
        },
      },
    },
    
    // 📦 Configuration pour le déploiement S3
    define: {
      // Variables d'environnement pour la production
      __DEV__: mode === 'development',
      __PROD__: mode === 'production',
    },
    
    // 🚀 Prévisualisation optimisée pour tester avant déploiement
    preview: {
      port: 4173,
      host: true,
      // Simule le comportement CloudFront
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    },
  };
});