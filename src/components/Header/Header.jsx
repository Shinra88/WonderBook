import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import styles from './Header.module.css';
import Logo from '../../images/Logo.png';
import FeatherIcon from '../../images/feather.png';
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import DropdownYear from '../DropdownYear/DropdownYear';
import AddBookModal from '../../modals/AddBook/AddBook';
import LoginModal from '../../modals/Login/Login_modal';
import RegisterModal from '../../modals/SignIn/SignIn';
import ForgetModal from '../../modals/Forget/Forget';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../../images/avatar.png';
import { useFilters } from '../../hooks/filterContext';
import { useLocation } from 'react-router-dom';


function Header() {
  const [showAddBook, setShowAddBook] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgetPassword, setShowForgetPassword] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { setSearchQuery, selectedCategories, selectedYear } = useFilters();
  const hasActiveFilter = selectedCategories.length > 0 || selectedYear !== '';  const navigate = useNavigate();
  const location = useLocation();
  const isForumPage = location.pathname.startsWith('/Forum') || location.pathname.startsWith('/topic');


  const { user, isAuthenticated, logout } = useAuth();

  const closeAllModals = () => {
    setShowLogin(false);
    setShowRegister(false);
    setShowForgetPassword(false);
    setShowAddBook(false);
  };

  const handleSearch = () => {
    setSearchQuery(inputValue.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const openLogin = () => {
    closeAllModals();
    setShowLogin(true);
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
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
            {!isForumPage && (
              <>
                <li>
                  <DropdownMenu isActive={hasActiveFilter} />
                </li>
                <li>
                  <DropdownYear isActive={
                    (typeof selectedYear === 'string' && selectedYear !== '') ||
                    (typeof selectedYear === 'object' && (selectedYear.start !== '' || selectedYear.end !== ''))
                  } />
                </li>
              </>
            )}
            <li>
              <NavLink
                to="/Forum"
                className={() => (isForumPage ? styles.activeLink : undefined)}
              >
                Forum
              </NavLink>
            </li>
            {isAuthenticated && (
              <li>
                <NavLink to="/Collection" className={({ isActive }) => (isActive ? styles.activeLink : undefined)}>
                  Ma collection
                </NavLink>
              </li>
            )}
            {isAuthenticated && (
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
            )}
          </ul>
        </nav>

        <div className={styles.content}>
          {isAuthenticated ? (
            <div
              className={styles.userMenuWrapper}
              onMouseEnter={toggleUserDropdown}
              onMouseLeave={toggleUserDropdown}
            >
              <div className={styles.userIcon}>
                <div className={styles.userCircle}>
                  <img
                    src={user?.avatar?.startsWith('http') ? user.avatar : Avatar}
                    alt="Avatar utilisateur"
                    className={styles.icon}
                  />
                </div>
                <p className={styles.userName}>{user?.name || 'User'}</p>
              </div>
              {showUserDropdown && (
                <div className={styles.userDropdown}>
                  <button type="button" onClick={() => navigate('/Account')}>Profil</button>
                  <button type="button" onClick={handleLogout}>Déconnexion</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button type="button" className={styles.Button} onClick={() => setShowLogin(true)}>
                Se connecter
                <img src={FeatherIcon} alt="Feather Icon" className={styles.icon} />
              </button>
              <button type="button" className={styles.Button} onClick={() => setShowRegister(true)}>
                Inscription
                <img src={FeatherIcon} alt="Feather Icon" className={styles.icon} />
              </button>
            </>
          )}
          {!isForumPage && (
            <div className={styles.searchBar}>
              <div className={styles.inputSearch}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Rechercher un livre ou un auteur"
                />
                <button type="button" onClick={handleSearch}>
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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

export default Header;
