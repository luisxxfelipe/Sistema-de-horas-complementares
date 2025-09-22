const generatePDF = require('../services/generatePDF');

exports.generate = async (req, res) => {
  try {
    const { userData, activities, tipoAtividade } = req.body;
    // Garante que cada atividade tenha tipo_id preenchido
    const activitiesForPDF = activities.map(act => ({
      ...act,
      tipo_id: act.tipo_id || act.group // usa group se tipo_id não existir
    }));
    const pdfBuffer = await generatePDF(userData, activitiesForPDF, tipoAtividade);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao gerar PDF', error: error.message });
  }
};
