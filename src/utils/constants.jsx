//constants.js
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

  CATEGORIES: {
    GET_ALL: `${API_URL}/api/categories`, 
  },

  PUBLISHERS: {
    GET_ALL: `${API_URL}/api/publishers`,
  },
  
  BOOKS: {
    BASE: `${API_URL}/api/books`,
    ADD_BOOK: `${API_URL}/api/books`,
    BEST_RATED: `${API_URL}/api/books/bestrating`,
    LAST_ADDED: `${API_URL}/api/books/lastadded`,
  },

  FORUM: {
    BASE: `${API_URL}/api/topics`,
    GET_ALL_TOPICS: `${API_URL}/api/topics`,
    ADD_TOPIC: `${API_URL}/api/topics`,
  },

  POSTS: {
    BASE: `${API_URL}/api/posts`,
    GET_BY_TOPIC: (id) => `${API_URL}/api/posts/${id}`,
  },  
  
  COLLECTION: {
    BASE: `${API_URL}/api/collection`,
    ADD: `${API_URL}/api/collection/add`,
    REMOVE: (bookId) => `${API_URL}/api/collection/${bookId}`,
    UPDATE_READ: (bookId) => `${API_URL}/api/collection/${bookId}`,
    GET_USER_COLLECTION: `${API_URL}/api/collection`,
  },
  
  COMMENTS: {
    BASE: `${API_URL}/api/comments`,
  },
  
};

export const APP_ROUTES = {
  HOME: '/',
  SIGN_IN: '/Register',
  LOGIN: '/Login',
  FORGET: '/ForgetPassword',
  ACCOUNT: '/Account',
  CHANGE_PASS: '/change-password',
  COLLECTION: '/Collection',
  FORUM: '/Forum',
  ADD_BOOK: '/AddBook',
  BOOK: '/livre/:title',
  UPDATE_BOOK: '/Book/edit/:id',
  RESET_PASSWORD: '/reset-password/:token',
};