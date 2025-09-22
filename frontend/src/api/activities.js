// API de atividades
export async function getActivities(token) {
  const API_URL = process.env.REACT_APP_API_URL;
  const response = await fetch(`${API_URL}/api/atividades`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}

export async function createActivity(activity, token) {
  const API_URL = process.env.REACT_APP_API_URL;
  const response = await fetch(`${API_URL}/api/atividades`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(activity)
  });
  return response.json();
}

export async function updateActivity(id, updates, token) {
  const API_URL = process.env.REACT_APP_API_URL;
  const response = await fetch(`${API_URL}/api/atividades/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  return response.json();
}

export async function deleteActivity(id, token) {
  const API_URL = process.env.REACT_APP_API_URL;
  const response = await fetch(`${API_URL}/api/atividades/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}


