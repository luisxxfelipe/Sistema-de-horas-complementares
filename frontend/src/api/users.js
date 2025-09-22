// API para dados do usuário (perfil, preferências, avatar)

export async function getUserProfile(token) {
  const API_URL = process.env.REACT_APP_API_URL;
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}

export async function updateUserProfile(updates, token) {
  const API_URL = process.env.REACT_APP_API_URL;
  const response = await fetch(`${API_URL}/api/users/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  return response.json();
}

export async function updateUserPreferences(preferences, token) {
  const API_URL = process.env.REACT_APP_API_URL;
  const response = await fetch(`${API_URL}/api/users/me/preferences`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(preferences)
  });
  return response.json();
}

export async function updateUserPassword(passwords, token) {
  const API_URL = process.env.REACT_APP_API_URL;
  const response = await fetch(`${API_URL}/api/users/me/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(passwords)
  });
  return response.json();
}

export async function uploadAvatar(file, token) {
  const formData = new FormData();
  formData.append('avatar', file);
  const API_URL = process.env.REACT_APP_API_URL;
  const response = await fetch(`${API_URL}/api/users/me/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  return response.json();
}
