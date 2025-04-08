import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ForgetSend from './modals/ForgetSend/ForgetSend';
import RegisterSend from './modals/RegisterSend/RegisterSend';
import Home from './pages/Home/Home';
import Book from './pages/Book/Book';
import { APP_ROUTES } from './utils/constants';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import AddBook from './modals/AddBook/AddBook';
import UpdateBook from './pages/updateBook/UpdateBook';
import Forum from './pages/Forum/Forum';
import Account from './pages/Account/Account';
import ChangePass from './modals/ChangePass/ChangePass';
import Collection from './pages/Collection/Collection';

function App() {
  const [user, setUser] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);

  const [openAddBook, setOpenAddBook] = useState(false);
  const [openChangePass, setOpenChangePass] = useState(false);

  const updateCategories = (categories) => {
    setSelectedCategories(categories);
  };

  const updateYear = (year) => {
    setSelectedYear(year);
  };

  useEffect(() => {
  }, [selectedCategories, selectedYear]);

  return (
    <BrowserRouter>
      <Header
        user={user}
        setUser={setUser}
        selectedCategories={selectedCategories}
        selectedYear={selectedYear}
        updateCategories={updateCategories}
        updateYear={updateYear}
      />

      <Routes>
        <Route
          index
          element={(
            <Home
              selectedCategories={selectedCategories}
              selectedYear={selectedYear || ''}
            />
          )}
        />
        <Route path={APP_ROUTES.FORGET_SEND} element={<ForgetSend setUser={setUser} />} />
        <Route path={APP_ROUTES.REGISTER_SEND} element={<RegisterSend setUser={setUser} />} />
        <Route path={APP_ROUTES.FORUM} element={<Forum />} />
        <Route path={APP_ROUTES.BOOK} element={<Book />} />
        <Route path={APP_ROUTES.UPDATE_BOOK} element={<UpdateBook />} />
        <Route path={APP_ROUTES.ACCOUNT} element={<Account />} />
        <Route path={APP_ROUTES.COLLECTION} element={<Collection />} />
      </Routes>

      {openAddBook && <AddBook onClose={() => setOpenAddBook(false)} />}
      {openChangePass && <ChangePass onClose={() => setOpenChangePass(false)} />}
      <Footer />
    </BrowserRouter>
  );
}

export default App;
