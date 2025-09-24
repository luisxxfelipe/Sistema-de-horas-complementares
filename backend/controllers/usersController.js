exports.getLoginLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await require('../services/usersService').getUserLoginLogs(userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const usersService = require('../services/usersService');

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
