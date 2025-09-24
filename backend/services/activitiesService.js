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
  // Buscar aproveitamento e limite do grupo
  const { data: groupData, error: groupError } = await supabase
    .from('activity_types')
    .select('aproveitamento, hours')
    .eq('id', activity.tipo_id)
    .single();
  if (groupError || !groupData) {
    return { error: groupError || { message: 'Grupo não encontrado' } };
  }
  const aproveitamento = groupData.aproveitamento || 1;
  const limiteGrupo = groupData.hours || 0;

  // Soma horas já registradas pelo usuário nesse grupo
  const { data: atividadesDoGrupo, error: errorAtividades } = await supabase
    .from('activities')
    .select('horas')
    .eq('user_id', activity.user_id)
    .eq('tipo_id', activity.tipo_id);
  if (errorAtividades) {
    return { error: errorAtividades };
  }
  const horasJaRegistradas = (atividadesDoGrupo || []).reduce((sum, a) => sum + (parseFloat(a.horas) || 0), 0);

  // Calcula horas aproveitadas da nova atividade
  let horasAproveitadas = (activity.horas || 0) * aproveitamento;
  // Se exceder o limite, ajusta para não ultrapassar
  if (horasJaRegistradas + horasAproveitadas > limiteGrupo) {
    horasAproveitadas = Math.max(0, limiteGrupo - horasJaRegistradas);
  }
  const activityToSave = { ...activity, horas: horasAproveitadas };
  return await supabase.from('activities').insert([activityToSave]);
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
