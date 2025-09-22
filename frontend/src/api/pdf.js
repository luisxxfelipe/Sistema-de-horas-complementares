// API de geração de PDF
export async function generatePDF(userData, activities, tipoAtividade, token) {
  const API_URL = process.env.REACT_APP_API_URL;
  const response = await fetch(`${API_URL}/api/pdf/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ userData, activities, tipoAtividade })
  });
  if (!response.ok) throw new Error('Erro ao gerar PDF');
  return await response.blob();
}
