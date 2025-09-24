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

module.exports = {
  getUserPreferences,
  updateUserPreferences,
  getUserLoginLogs,
};
