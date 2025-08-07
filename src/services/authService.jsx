// src/services/authService.jsx
export async function loginUser(mail, password, recaptchaToken) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ mail, password, recaptchaToken }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erreur lors de la connexion');
  }
  return await response.json(); // { user: {...} }
}

export async function logoutUser() {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

export async function fetchAuthenticatedUser() {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) return null;
  return await response.json();
}
