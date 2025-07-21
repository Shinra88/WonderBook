//app.jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Home from './pages/Home/Home';
import Book from './pages/Book/Book';
import { APP_ROUTES } from './utils/constants';
import Forum from './pages/Forum/Forum';
import Account from './pages/Account/Account';
import ChangePass from './modals/ChangePass/ChangePass.jsx';
import Collection from './pages/Collection/Collection';
import HomeWithForgetPassword from './pages/HomeWithForgetPassword/HomeWithForgetPassword';
import TopicDetail from './pages/Topics/TopicDetail';
import Admin from './pages/Admin/Admin';
import EpubReader from './components/EpubReader/EpubReader';
import NotFound from './pages/NotFound/NotFound';

import { FilterProvider } from './hooks/filterContext';

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
            }
          >
            <Route
              index
              element={
                <Home selectedCategories={selectedCategories} selectedYear={selectedYear || ''} />
              }
            />
            <Route path={APP_ROUTES.FORUM} element={<Forum />} />
            <Route path="/topic/:topicId" element={<TopicDetail />} />
            <Route path={APP_ROUTES.BOOK} element={<Book />} />
            <Route path={APP_ROUTES.ACCOUNT} element={<Account />} />
            <Route path={APP_ROUTES.COLLECTION} element={<Collection />} />
            <Route path={APP_ROUTES.BOOK} element={<Book />} />
            <Route path={APP_ROUTES.ADMIN} element={<Admin />} />
            <Route path="/read/:bookId" element={<EpubReader />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* ✅ Route pour réinitialisation de mot de passe */}
          <Route path="/forget-password/:token" element={<HomeWithForgetPassword />} />
        </Routes>

        {/* Modals globales */}
        {openChangePass && <ChangePass onClose={() => setOpenChangePass(false)} />}
      </BrowserRouter>
    </FilterProvider>
  );
}

export default App;
