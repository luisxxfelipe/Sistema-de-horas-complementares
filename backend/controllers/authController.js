const jwt = require('jsonwebtoken');
const authService = require('../services/authService');
const supabase = require('../services/supabase');

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const result = await authService.login(email, senha);
    if (result.success) {
      // Gerar JWT
      const secret = process.env.JWT_SECRET;
      const token = jwt.sign({ id: result.user.id, role: result.role }, secret, { expiresIn: '8h' });
      res.json({ ...result, token });
    } else {
      res.status(401).json({ message: result.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro interno no login', error: error.message });
  }
};

exports.signup = async (req, res) => {
  try {
    const userData = req.body;
    const result = await authService.signup(userData.email, userData.senha, userData.nome, userData.matricula, userData.turno, userData.semestre_entrada, userData.role);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro interno no cadastro', error: error.message });
  }
};

exports.me = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('users')
      .select('id, nome, email, role, matricula, turno, semestre_entrada, created_at, last_login, url_profile')
      .eq('id', userId)
      .single();
    if (error) return res.status(400).json({ message: error.message });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar dados do usuário', error: error.message });
  }
};
