const API_URL = 'http://localhost:5000';

export const API_ROUTES = {
  AUTH: {
    SIGN_UP: `${API_URL}/api/auth/signup`,
    SIGN_IN: `${API_URL}/api/auth/singin`,
    LOGIN: `${API_URL}/api/auth/login`,
    REGISTER: `${API_URL}/api/auth/register`,
    FORGET: `${API_URL}/api/auth/forget`,
    CHANGE_PASS: `${API_URL}/api/auth/change-password`,
    UPDATE_PROFILE: `${API_URL}/api/auth/profile`,
    UPDATE_AVATAR: `${API_URL}/api/upload/update-avatar`,
    UPLOAD_IMAGE: `${API_URL}/api/upload/cover`,
  },

  BOOKS: {
    BASE: `${API_URL}/api/books`,
    ADD_BOOK: `${API_URL}/api/books`,
    BEST_RATED: `${API_URL}/api/books/bestrating`,
    LAST_ADDED: `${API_URL}/api/books/lastadded`,
  },

  FORUM: {
    BASE: `${API_URL}/api/forum`,
  },

  COLLECTION: {
    BASE: `${API_URL}/api/collection`,
  },
};

export const APP_ROUTES = {
  HOME: '/',
  SIGN_IN: '/Register',
  REGISTER_SEND: '/RegisterSend',
  LOGIN: '/Login',
  FORGET: '/ForgetPassword',
  FORGET_SEND: '/ForgetSend',
  ACCOUNT: '/Account',
  CHANGE_PASS: '/change-password',
  COLLECTION: '/Collection',
  FORUM: '/Forum',
  ADD_BOOK: '/AddBook',
  BOOK: '/Book/:id',
  UPDATE_BOOK: '/Book/edit/:id',
};