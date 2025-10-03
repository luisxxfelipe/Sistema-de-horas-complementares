const usersService = require('../services/usersService');

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    const result = await usersService.updateUserProfile(userId, updates);
    if (result.error) {
      return res.status(400).json({ message: result.error.message });
    }
    res.json({ success: true, message: 'Perfil atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno ao atualizar perfil', error: error.message });
  }
};

exports.getLoginLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await require('../services/usersService').getUserLoginLogs(userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await usersService.getUserPreferences(userId);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    await usersService.updateUserPreferences(userId, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
