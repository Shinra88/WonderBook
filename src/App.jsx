import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ForgetSend from './modals/ForgetSend/ForgetSend';
import RegisterSend from './modals/RegisterSend/RegisterSend';
import Home from './pages/Home/Home';
import Book from './pages/Book/Book';
import { APP_ROUTES } from './utils/constants';
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

  return (
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
              <Home
                selectedCategories={selectedCategories}
                selectedYear={selectedYear || ''}
              />
            }
          />
          <Route path={APP_ROUTES.FORUM} element={<Forum />} />
          <Route path={APP_ROUTES.BOOK} element={<Book />} />
          <Route path={APP_ROUTES.UPDATE_BOOK} element={<UpdateBook />} />
          <Route path={APP_ROUTES.ACCOUNT} element={<Account />} />
          <Route path={APP_ROUTES.COLLECTION} element={<Collection />} />
        </Route>

        <Route path={APP_ROUTES.FORGET_SEND} element={<ForgetSend setUser={setUser} />} />
        <Route path={APP_ROUTES.REGISTER_SEND} element={<RegisterSend setUser={setUser} />} />
      </Routes>

      {openAddBook && <AddBook onClose={() => setOpenAddBook(false)} />}
      {openChangePass && <ChangePass onClose={() => setOpenChangePass(false)} />}
    </BrowserRouter>
  );
}

export default App;
