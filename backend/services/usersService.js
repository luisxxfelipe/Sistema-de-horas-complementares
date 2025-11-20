const supabase = require('./supabase');

async function getUserPreferences(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('email_notifications, dark_mode, activity_reminders')
    .eq('id', userId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

async function updateUserPreferences(userId, preferences) {
  const { error } = await supabase
    .from('users')
    .update(preferences)
    .eq('id', userId);
  if (error) throw new Error(error.message);
  return true;
}

async function updateUserProfile(userId, updates) {
  // Campos permitidos para atualização
  const allowedFields = ['nome', 'phone'];
  
  // Filtrar apenas campos permitidos
  const filteredUpdates = {};
  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  if (Object.keys(filteredUpdates).length === 0) {
    return { error: { message: 'Nenhum campo válido para atualizar' } };
  }

  const { data, error } = await supabase
    .from('users')
    .update(filteredUpdates)
    .eq('id', userId)
    .select();

  if (error) return { error };
  return { data };
}

async function getUserLoginLogs(userId) {
  const { data, error } = await supabase
    .from('login_logs')
    .select('device_info, ip_address, location, login_time')
    .eq('user_id', userId)
    .order('login_time', { ascending: false })
    .limit(10);
  if (error) throw new Error(error.message);
  return data;
}

async function updateUserAvatar(userId, url_profile) {
  const { data, error } = await supabase
    .from('users')
    .update({ url_profile })
    .eq('id', userId)
    .select();

  if (error) return { error };
  return { data };
}

module.exports = {
  getUserPreferences,
  updateUserPreferences,
  updateUserProfile,
  getUserLoginLogs,
  updateUserAvatar,
};
