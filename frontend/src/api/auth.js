// API de autenticação
export async function login(email, senha) {
  const API_URL = process.env.REACT_APP_API_URL;
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });
  return response.json();
}

export async function signup(userData) {
  const API_URL = process.env.REACT_APP_API_URL;
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
}

export async function getMe(token) {
  const API_URL = process.env.REACT_APP_API_URL;
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}

export async function forgotPassword(email) {
  const API_URL = process.env.REACT_APP_API_URL;
  const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
}
