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
    DELETE_TOPIC: id => `/api/topics/${id}`, // ✅ NOUVEAU : Suppression de topic
    UPDATE_NOTICE: id => `/api/topics/${id}/pin`,
    LOCK_TOPIC: id => `/api/topics/${id}/lock`,
  },
  POSTS: {
    BASE: `/api/posts`,
    ADD_POST: `/api/posts/add`, // ✅ AJOUTÉ : Route explicite pour l'ajout
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
  // ✅ Routes pour les logs
  LOGS: {
    GET_ALL: `/api/logs`,
    GET_USER_LOGS: userId => `/api/logs/user/${userId}`,
    GET_STATS: `/api/logs/stats`,
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
  // ✅ Route pour la page des logs
  LOGS: '/admin/logs',
};

// ✅ NOUVEAU : Constantes pour les filtres de logs (optionnel, mais utile)
export const LOG_FILTERS = {
  TARGET_TYPES: {
    ALL: '',
    BOOK: 'book',
    USER: 'user',
    COMMENT: 'comment',
    FORUM_TOPIC: 'forum_topic',
    FORUM_POST: 'forum_post',
  },
  ACTIONS: {
    // Livres
    BOOK_ADDED: 'Livre ajouté',
    BOOK_VALIDATED: 'Livre validé',
    BOOK_DENIED: 'Livre refusé',
    BOOK_UPDATED: 'Livre modifié',
    BOOK_DELETED: 'Livre supprimé',

    // Utilisateurs
    USER_SUSPENDED: 'Utilisateur suspendu',
    USER_ACTIVATED: 'Utilisateur activé',
    USER_BANNED: 'Utilisateur banni',
    USER_ROLE_CHANGED: 'Rôle utilisateur modifié',
    USER_PROFILE_UPDATED: 'Profil utilisateur modifié',

    // Commentaires
    COMMENT_ADDED: 'Commentaire ajouté',
    COMMENT_UPDATED: 'Commentaire modifié',
    COMMENT_DELETED: 'Commentaire supprimé',

    // Forum - Posts
    POST_ADDED: 'Post ajouté',
    POST_UPDATED: 'Post modifié',
    POST_DELETED: 'Post supprimé',
  },
};
