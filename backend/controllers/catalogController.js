const supabase = require('../services/supabase');

exports.getCursos = async (req, res) => {
  const { data, error } = await supabase.from('courses').select('*');
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
};

exports.getUnidades = async (req, res) => {
  const { data, error } = await supabase.from('units').select('*');
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
};

exports.getUnidadesPorCurso = async (req, res) => {
  const { cursoId } = req.query;
  const { data, error } = await supabase.from('course_units').select('*').eq('course_id', cursoId);
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
};

exports.getCategorias = async (req, res) => {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
};

const catalogService = require('../services/catalogService');

exports.getGrupos = async (req, res) => {
  const { categoria } = req.query;
  if (categoria) {
    const { data, error } = await catalogService.getGroupsByCategoryName(categoria);
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  } else {
    // Se não passar categoria, retorna todos os grupos
    const { data, error } = await supabase.from('activity_types').select('*');
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  }
};

exports.getGrupoById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('activity_types').select('*').eq('id', id).single();
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
};
