// 📁 src/layouts/AppLayout.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

function AppLayout({
  user = null,
  setUser,
  updateCategories = () => {},
  updateYear = () => {},
  selectedCategories = [],
  selectedYear = null,
}) {
  return (
    <>
      <Header
        user={user}
        setUser={setUser}
        updateCategories={updateCategories}
        updateYear={updateYear}
        selectedCategories={selectedCategories}
        selectedYear={selectedYear}
      />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

AppLayout.propTypes = {
  user: PropTypes.object,
  setUser: PropTypes.func.isRequired,
  updateCategories: PropTypes.func,
  updateYear: PropTypes.func,
  selectedCategories: PropTypes.array,
  selectedYear: PropTypes.number,
};

export default AppLayout;
