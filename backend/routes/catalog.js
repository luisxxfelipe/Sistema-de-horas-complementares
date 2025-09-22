const express = require('express');
const router = express.Router();
const { getCursos, getUnidades, getUnidadesPorCurso, getCategorias, getGrupos, getGrupoById } = require('../controllers/catalogController');

router.get('/cursos', getCursos);
router.get('/unidades', getUnidades);
router.get('/unidades-por-curso', getUnidadesPorCurso);
router.get('/categorias', getCategorias);
router.get('/grupos', getGrupos);
router.get('/grupos/:id', getGrupoById);

module.exports = router;
