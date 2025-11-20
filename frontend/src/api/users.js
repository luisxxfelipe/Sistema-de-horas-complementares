import { supabase } from '../supabase';

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
  // 1. Upload do arquivo para o Supabase Storage
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 8)}.${fileExt}`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("profiles")
    .upload(fileName, file);
    
  if (uploadError) {
    throw new Error("Erro ao fazer upload da imagem: " + uploadError.message);
  }
  
  // 2. Obter URL pública
  const { data: publicUrlData } = supabase.storage
    .from("profiles")
    .getPublicUrl(fileName);
    
  const url_profile = publicUrlData.publicUrl;
  
  // 3. Atualizar campo na base de dados via API
  const API_URL = process.env.REACT_APP_API_URL;
  const response = await fetch(`${API_URL}/api/users/me/avatar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ url_profile })
  });
  
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Erro ao atualizar avatar');
  }
  
  return result;
}

export async function getUserPreferences(token) {
  const API_URL = process.env.REACT_APP_API_URL;
  const response = await fetch(`${API_URL}/api/users/me/preferences`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
}

export async function getUserLoginLogs(token) {
  const API_URL = process.env.REACT_APP_API_URL;
  const response = await fetch(`${API_URL}/api/users/me/login-logs`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}
