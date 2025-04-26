// 📁 src/layouts/AppLayout.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

function AppLayout({ user = null, setUser }) {
  return (
    <>
      <Header user={user} setUser={setUser} />
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
};

export default AppLayout;
