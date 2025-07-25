import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import { APP_ROUTES } from './utils/constants';
import { FilterProvider } from './hooks/filterContext';

// 🚀 Composants critiques chargés immédiatement (above-the-fold)
import Home from './pages/Home/Home';

// 🚀 Lazy loading des composants lourds (below-the-fold)
const Book = lazy(() => import('./pages/Book/Book'));
const Forum = lazy(() => import('./pages/Forum/Forum'));
const Account = lazy(() => import('./pages/Account/Account'));
const Collection = lazy(() => import('./pages/Collection/Collection'));
const TopicDetail = lazy(() => import('./pages/Topics/TopicDetail'));
const Admin = lazy(() => import('./pages/Admin/Admin'));
const EpubReader = lazy(() => import('./components/EpubReader/EpubReader'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
const HomeWithForgetPassword = lazy(
  () => import('./pages/HomeWithForgetPassword/HomeWithForgetPassword')
);

// 🚀 Lazy loading des modals (utilisés à la demande)
const ChangePass = lazy(() => import('./modals/ChangePass/ChangePass.jsx'));

// 🚀 Composant de loading optimisé
const LoadingFallback = ({ message = 'Chargement...' }) => (
  <div
    className="loading-container"
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      padding: '20px',
    }}>
    <div
      className="loading-skeleton"
      style={{
        width: '100%',
        maxWidth: '300px',
        height: '20px',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'loading 1.5s infinite',
        borderRadius: '4px',
      }}>
      <span
        style={{
          display: 'block',
          textAlign: 'center',
          lineHeight: '20px',
          fontSize: '14px',
          color: '#666',
        }}>
        {message}
      </span>
    </div>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [openChangePass, setOpenChangePass] = useState(false);

  return (
    <FilterProvider>
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <AppLayout
                user={user}
                setUser={setUser}
                selectedCategories={selectedCategories}
                selectedYear={selectedYear}
                updateCategories={setSelectedCategories}
                updateYear={setSelectedYear}
              />
            }>
            {/* 🚀 Page d'accueil - chargée immédiatement */}
            <Route
              index
              element={
                <Home selectedCategories={selectedCategories} selectedYear={selectedYear || ''} />
              }
            />

            {/* 🚀 Pages lazy-loadées avec Suspense individuels */}
            <Route
              path={APP_ROUTES.FORUM}
              element={
                <Suspense fallback={<LoadingFallback message="Chargement du forum..." />}>
                  <Forum />
                </Suspense>
              }
            />

            <Route
              path="/topic/:topicId"
              element={
                <Suspense fallback={<LoadingFallback message="Chargement du sujet..." />}>
                  <TopicDetail />
                </Suspense>
              }
            />

            <Route
              path={APP_ROUTES.BOOK}
              element={
                <Suspense fallback={<LoadingFallback message="Chargement du livre..." />}>
                  <Book />
                </Suspense>
              }
            />

            <Route
              path={APP_ROUTES.ACCOUNT}
              element={
                <Suspense fallback={<LoadingFallback message="Chargement du compte..." />}>
                  <Account />
                </Suspense>
              }
            />

            <Route
              path={APP_ROUTES.COLLECTION}
              element={
                <Suspense fallback={<LoadingFallback message="Chargement de la collection..." />}>
                  <Collection />
                </Suspense>
              }
            />

            <Route
              path={APP_ROUTES.ADMIN}
              element={
                <Suspense fallback={<LoadingFallback message="Chargement de l'admin..." />}>
                  <Admin />
                </Suspense>
              }
            />

            <Route
              path="/read/:bookId"
              element={
                <Suspense fallback={<LoadingFallback message="Chargement du lecteur..." />}>
                  <EpubReader />
                </Suspense>
              }
            />

            <Route
              path="*"
              element={
                <Suspense fallback={<LoadingFallback message="Page introuvable..." />}>
                  <NotFound />
                </Suspense>
              }
            />
          </Route>

          {/* ✅ Route pour réinitialisation de mot de passe */}
          <Route
            path="/forget-password/:token"
            element={
              <Suspense fallback={<LoadingFallback message="Chargement..." />}>
                <HomeWithForgetPassword />
              </Suspense>
            }
          />
        </Routes>

        {/* 🚀 Modals globales avec lazy loading */}
        {openChangePass && (
          <Suspense fallback={<LoadingFallback message="Chargement..." />}>
            <ChangePass onClose={() => setOpenChangePass(false)} />
          </Suspense>
        )}
      </BrowserRouter>
    </FilterProvider>
  );
}

export default App;
