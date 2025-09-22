const express = require('express');
const router = express.Router();
const activitiesController = require('../controllers/activitiesController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, activitiesController.getAll);
router.post('/', authMiddleware, activitiesController.create);
router.put('/:id', authMiddleware, activitiesController.update); // Atualizar atividade
router.delete('/:id', authMiddleware, activitiesController.remove); // Remover atividade

module.exports = router;
