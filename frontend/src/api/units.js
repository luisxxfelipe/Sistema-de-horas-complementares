// API de unidades
export async function getUnits() {
  const API_URL = process.env.REACT_APP_API_URL;
  const response = await fetch(`${API_URL}/api/unidades`);
  if (!response.ok) throw new Error('Erro ao buscar unidades.');
  return response.json();
}

export async function getUnitsByCourse(courseId) {
  const API_URL = process.env.REACT_APP_API_URL;
  const response = await fetch(`${API_URL}/api/unidades-por-curso?cursoId=${courseId}`);
  if (!response.ok) throw new Error('Erro ao buscar unidades do curso.');
  return response.json();
}
