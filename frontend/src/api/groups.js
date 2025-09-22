// API de grupos
export async function getGroupsByCategory(category, token) {
  const API_URL = process.env.REACT_APP_API_URL;
  const response = await fetch(`${API_URL}/api/grupos?categoria=${encodeURIComponent(category)}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Erro ao buscar grupos.');
  return response.json();
}

export async function getGroupDetails(groupId, token) {
  const API_URL = process.env.REACT_APP_API_URL;
  const response = await fetch(`${API_URL}/api/grupos/${groupId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Erro ao buscar detalhes do grupo.');
  return response.json();
}
