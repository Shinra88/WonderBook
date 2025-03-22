const API_URL = 'http://localhost:5000';
export const API_ROUTES = {
  SIGN_UP: `${API_URL}/api/auth/signup`,
  SIGN_IN: `${API_URL}/api/auth/Singin`,
  LOGIN: `${API_URL}/api/auth/login`,
  FORGET: `${API_URL}/api/auth/forget`,
  REGISTER_SEND: `${API_URL}/api/auth/register`,
  BOOKS: `${API_URL}/api/books`,
  BEST_RATED: `${API_URL}/api/books/bestrating`,
  ADD_BOOK: `${API_URL}/api/books`,
  FORGET_SEND: `${API_URL}/api/auth/forget`,
  FORUM: `${API_URL}/api/books`,
  ACCOUNT: `${API_URL}/api/books`,
  CHANGE_PASS: `${API_URL}/api/pass`,
  COLLECTION: `${API_URL}/api/books`,
};

export const APP_ROUTES = {
  HOME: '/',
  SIGN_IN: '/Register',
  REGISTER_SEND: '/RegisterSend',
  LOGIN: '/Login',
  FORGET: '/ForgetPassword',
  FORGET_SEND: '/ForgetSend',
  FORUM: '/Forum',
  ADD_BOOK: '/AddBook',
  ACCOUNT: '/Account',
  BOOK: '/Book/:id',
  UPDATE_BOOK: 'Book/edit/:id',
  CHANGE_PASS: '/ChangePass',
  COLLECTION: '/Collection',
};
