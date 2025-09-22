
const activitiesService = require('../services/activitiesService');

exports.getAll = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await activitiesService.getAllActivitiesByUser(userId);
    if (error) return res.status(400).json({ message: error.message });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar atividades', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const body = req.body;
    const activity = {
      user_id: req.user.id,
      tipo_id: body.group,
      descricao: body.description,
      horas: body.hours,
      externa: body.external,
      certificado_url: body.certificado_url
    };
    const { error } = await activitiesService.createActivity(activity);
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar atividade', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { error } = await activitiesService.updateActivity(id, updates);
    if (error) return res.status(400).json({ message: error.message });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar atividade', error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await activitiesService.removeActivity(id);
    if (error) return res.status(400).json({ message: error.message });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover atividade', error: error.message });
  }
};
