const supabase = require('./supabase');

async function getAllActivitiesByUser(userId) {
  const { data, error } = await supabase
    .from('activities')
    .select(`*, activity_types:tipo_id (nome, categories:categoria_id (nome))`)
    .eq('user_id', userId);
  if (error) return { data: null, error };
  // Mapear para retornar categoria e grupo como string (nome)
  const mapped = data.map((item) => ({
    ...item,
    categoria: item.activity_types?.categories?.nome || "Não especificado",
    grupo: item.activity_types?.nome || "Não especificado",
  }));
  return { data: mapped, error: null };
}

async function createActivity(activity) {
  return await supabase.from('activities').insert([activity]);
}

async function updateActivity(id, updates) {
  return await supabase.from('activities').update(updates).eq('id', id);
}

async function removeActivity(id) {
  return await supabase.from('activities').delete().eq('id', id);
}

module.exports = {
  getAllActivitiesByUser,
  createActivity,
  updateActivity,
  removeActivity,
};
