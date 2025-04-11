// utils/localStorage.js

export function storeInLocalStorage(key, value) {
  if (typeof value === 'object') {
    value = JSON.stringify(value); // pour stocker des objets
  }
  localStorage.setItem(key, value);
}

export function getFromLocalStorage(key) {
  const value = localStorage.getItem(key);
  try {
    return JSON.parse(value); // essaie de parser si c'est un objet
  } catch {
    return value;
  }
}

export function removeFromLocalStorage(key) {
  localStorage.removeItem(key);
}

export function clearLocalStorage() {
  localStorage.clear();
}
