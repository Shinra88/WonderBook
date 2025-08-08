//constants.js

export const API_ROUTES = {
  AUTH: {
    SIGN_UP: `/api/auth/signup`,
    SIGN_IN: `/api/auth/singin`,
    LOGIN: `/api/auth/login`,
    REGISTER: `/api/auth/register`,
    FORGET: `/api/auth/forget`,
    CHANGE_PASS: `/api/auth/change-password`,
    UPDATE_PROFILE: `/api/auth/profile`,
    UPDATE_AVATAR: `/api/upload/update-avatar`,
    UPLOAD_IMAGE: `/api/upload/cover`,
    UPLOAD_EBOOK: `/api/upload/ebook`,
  },

  CATEGORIES: {
    GET_ALL: `/api/categories`,
  },

  PUBLISHERS: {
    GET_ALL: `/api/publishers`,
  },

  BOOKS: {
    BASE: `/api/books`,
    ADD_BOOK: `/api/books`,
    BEST_RATED: `/api/books/bestrating`,
    LAST_ADDED: `/api/books/lastadded`,
    UPDATE_COVER: `/api/books/:id/cover`,
  },

  FORUM: {
    BASE: `/api/topics`,
    GET_ALL_TOPICS: `/api/topics`,
    ADD_TOPIC: `/api/topics`,
    UPDATE_NOTICE: id => `/api/topics/${id}/pin`,
    LOCK_TOPIC: id => `/api/topics/${id}/lock`,
  },

  POSTS: {
    BASE: `/api/posts`,
    GET_BY_TOPIC: id => `/api/posts/${id}`,
    DELETE_POST: id => `/api/posts/${id}`,
  },

  COLLECTION: {
    BASE: `/api/collection`,
    ADD: `/api/collection/add`,
    REMOVE: bookId => `/api/collection/${bookId}`,
    UPDATE_READ: bookId => `/api/collection/${bookId}`,
    GET_USER_COLLECTION: `/api/collection`,
    GET_PROGRESS: bookId => `/api/collection/progress/${bookId}`,
    SAVE_PROGRESS: bookId => `/api/collection/progress/${bookId}`,
  },

  COMMENTS: {
    BASE: `/api/comments`,
  },

  ADMIN: {
    GET_USERS: `/api/admin/users`,
    UPDATE_USER: id => `/api/admin/users/${id}`,
    DELETE_USER: id => `/api/admin/users/${id}`,
    UPDATE_USER_STATUS: id => `/api/admin/users/${id}/status`,
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
  ADMIN: '/Admin',
};
