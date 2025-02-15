import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import styles from './Header.module.css';
import Logo from '../../images/Logo.png';
import FeatherIcon from '../../images/feather.png';
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import DropdownYear from '../DropdownYear/DropdownYear';
import AddBookModal from '../../Modals/AddBook/AddBook';
import LoginModal from '../../Modals/Login/Login';
import RegisterModal from '../../Modals/SignIn/SignIn';
import ForgetModal from '../../Modals/Forget/Forget';

function Header({ updateCategories, updateYear }) {
  const [showAddBook, setShowAddBook] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgetPassword, setShowForgetPassword] = useState(false);

  const categories = [
    'Amour',
    'Aventure',
    'Fantastique',
    'Fantasy',
    'Historique',
    'Policier',
    'Science-Fiction',
  ];

  // Fonction pour fermer toutes les modals
  const closeAllModals = () => {
    setShowLogin(false);
    setShowRegister(false);
    setShowForgetPassword(false);
    setShowAddBook(false);
  };

  // Fonction pour ouvrir Login depuis SignIn
  const openLogin = () => {
    closeAllModals();
    setShowLogin(true);
  };

  return (
    <header className={styles.Header}>
      <div className={styles.container}>
        <img className={styles.logo} src={Logo} alt="logo WonderBook" />
        <nav className={styles.navBar}>
          <ul>
            <li>
              <NavLink to="/" end className={({ isActive }) => (isActive ? styles.activeLink : undefined)}>
                Accueil
              </NavLink>
            </li>
            <li>
              <DropdownMenu categories={categories} onFilterChange={updateCategories} />
            </li>
            <li>
              <DropdownYear onFilterChange={updateYear} />
            </li>
            <li>
              <NavLink to="/Forum" className={({ isActive }) => (isActive ? styles.activeLink : undefined)}>
                Forum
              </NavLink>
            </li>
            <li>
              <NavLink to="/Collection" className={({ isActive }) => (isActive ? styles.activeLink : undefined)}>
                Ma collection
              </NavLink>
            </li>
            <li>
              <button
                type="button"
                className={styles.Button}
                aria-label="Ajouter un livre"
                onClick={() => setShowAddBook(true)}
              >
                Ajouter un livre
                <img src={FeatherIcon} alt="Feather Icon" className={styles.icon} />
              </button>
            </li>
          </ul>
        </nav>
        <div className={styles.content}>
          <div>
            <button
              type="button"
              className={styles.Button}
              aria-label="Se connecter"
              onClick={() => setShowLogin(true)}
            >
              Se connecter
              <img src={FeatherIcon} alt="Feather Icon" className={styles.icon} />
            </button>
            <button
              type="button"
              className={styles.Button}
              aria-label="Inscription"
              onClick={() => setShowRegister(true)}
            >
              Inscription
              <img src={FeatherIcon} alt="Feather Icon" className={styles.icon} />
            </button>
          </div>
          <div className={styles.searchBar}>
            <div className={styles.inputSearch}>
              <input type="text" />
              <button type="button">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Affichage des modals en fonction des états */}
      {showAddBook && <AddBookModal onClose={() => setShowAddBook(false)} />}
      {showLogin && (
        <LoginModal
          onClose={closeAllModals}
          openRegister={() => {
            closeAllModals();
            setShowRegister(true);
          }}
          openForgetPassword={() => {
            closeAllModals();
            setShowForgetPassword(true);
          }}
        />
      )}
      {showRegister && <RegisterModal onClose={closeAllModals} openLogin={openLogin} />}
      {showForgetPassword && <ForgetModal onClose={closeAllModals} />}
    </header>
  );
}

Header.propTypes = {
  updateCategories: PropTypes.func.isRequired,
  updateYear: PropTypes.func.isRequired,
};

export default Header;
