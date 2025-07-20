import { useState } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import styles from './Header.module.css';
import Logo from '../../images/Logo.png';
import FeatherIcon from '../../images/feather.png';
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import DropdownYear from '../DropdownYear/DropdownYear';
import LoginModal from '../../modals/Login/Login_modal';
import RegisterModal from '../../modals/SignIn/SignIn';
import ForgetModal from '../../modals/Forget/Forget';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../../images/avatar.png';
import { useFilters } from '../../hooks/filterContext';
import { normalize } from '../../utils/helpers';
import BookFormModal from '../../modals/BookFormModal/BookFormModal';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';

function Header() {
  const [showAddBook, setShowAddBook] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgetPassword, setShowForgetPassword] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showTestFormModal, setShowTestFormModal] = useState(false);
  const [book, setBook] = useState(null);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  
  const navigate = useNavigate();
  const location = useLocation();

  const isPath = (prefixes) => prefixes.some((prefix) => location.pathname.startsWith(prefix));
  const hideSearchBar = isPath(['/Forum', '/topic', '/Admin']);

  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  const {
    setSearchQuery,
    setSelectedCategories,
    setSelectedYear,
    selectedCategories,
    selectedYear
  } = useFilters();

  const hasActiveFilter = selectedCategories.length > 0 || selectedYear !== '';

  const closeAllModals = () => {
    setShowLogin(false);
    setShowRegister(false);
    setShowForgetPassword(false);
    setShowAddBook(false);
  };

  const handleSearch = () => {
    const normalized = normalize(inputValue.trim());
    setSearchQuery(normalized);

    setTimeout(() => {
      const el = document.getElementById('filters');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    if (location.pathname !== '/') {
      navigate('/#filters');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={styles.Header}>
      <div className={styles.container}>
        <img className={styles.logo} src={Logo} alt="logo WonderBook" />
        <nav className={styles.navBar}>
          <ul>
            <li>
              <NavLink
                to="/#topPage"
                className={({ isActive }) => (isActive ? styles.activeLink : undefined)}
                onClick={(e) => {
                  e.preventDefault();
                  setSearchQuery('');
                  setInputValue('');
                  setSelectedCategories([]);
                  setSelectedYear('');
                  navigate('/#topPage');
                  setTimeout(() => {
                    const el = document.getElementById('topPage');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
               {t('Header.Home')}
              </NavLink>
            </li>
            {!isPath(['/Forum', '/topic']) && (
              <>
                <li>
                  <DropdownMenu isActive={hasActiveFilter} />
                </li>
                <li>
                  <DropdownYear
                    isActive={
                      (typeof selectedYear === 'string' && selectedYear !== '') ||
                      (typeof selectedYear === 'object' && (selectedYear.start !== '' || selectedYear.end !== ''))
                    }
                  />
                </li>
              </>
            )}
            <li>
              <NavLink
                to="/Forum"
                className={() => (isPath(['/Forum', '/topic']) ? styles.activeLink : undefined)}
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
            {isAdmin && (
              <li>
                <NavLink
                  to="/Admin"
                  className={() => (isPath(['/Admin']) ? styles.activeLink : undefined)}
                >
                  Admin
                </NavLink>
              </li>
            )}
            {isAuthenticated && (
              <li>
                <button
                  type="button"
                  className={styles.Button}
                  aria-label="Ajouter un livre"
                  onClick={() => setShowTestFormModal(true)}
                >
                  {t('Header.AddBook')}
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
              <LanguageSwitcher />

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
            <div className={styles.login_menu}>
              <LanguageSwitcher />
              <button type="button" className={styles.Button} onClick={() => setShowLogin(true)}>
                {t('Header.Login')}
                <img src={FeatherIcon} alt="Feather Icon" className={styles.icon} />
              </button>
              <button type="button" className={styles.Button} onClick={() => setShowRegister(true)}>
                {t('Header.Register')}
                <img src={FeatherIcon} alt="Feather Icon" className={styles.icon} />
              </button>
            </div>
          )}
          {!hideSearchBar && (
            <div className={styles.searchBar}>
              <div className={styles.inputSearch}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder= {t('Header.SearchPlaceholder')}
                />
                <button type="button" onClick={handleSearch}>
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
            {showTestFormModal && (
              <BookFormModal
                mode="add"
                book={book}
                onSave={(updatedData) => {
                  setBook({ ...book, ...updatedData });
                  ToastSuccess(t('Header.book.updatedSuccess'));
                  setShowTestFormModal(false);
                }}
                onClose={() => setShowTestFormModal(false)}
              />
            )}
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
      {showRegister && <RegisterModal onClose={closeAllModals} openLogin={() => setShowLogin(true)} />}
      {showForgetPassword && <ForgetModal onClose={closeAllModals} />}
    </header>
  );
}

export default Header;