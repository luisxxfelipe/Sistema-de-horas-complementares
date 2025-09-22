const supabase = require('./supabase');

async function getGroupsByCategoryName(categoriaNome) {
  // Busca o id da categoria pelo nome
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .select('id')
    .eq('nome', categoriaNome)
    .single();
  if (catError) return { data: null, error: catError };
  if (!catData) return { data: null, error: { message: 'Categoria não encontrada' } };
  const categoriaId = catData.id;
  // Busca os grupos (activity_types) dessa categoria
  const { data, error } = await supabase
    .from('activity_types')
    .select('*')
    .eq('categoria_id', categoriaId);
  return { data, error };
}

module.exports = {
  getGroupsByCategoryName,
};
