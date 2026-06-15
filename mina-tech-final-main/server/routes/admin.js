const express = require('express');
const { requireAuth } = require('../middleware/auth');
const controller = require('../controllers/adminController');

const router = express.Router();

// Todas as rotas de admin exigem autenticação.
router.use(requireAuth);

router.get('/inscricoes', controller.list);
router.patch('/inscricoes/:id', controller.updateStatus);
router.delete('/inscricoes/:id', controller.remove);

// Gestão de administradores do painel
router.get('/admins', controller.listAdmins);
router.post('/admins', controller.addAdmin);
router.delete('/admins/:email', controller.removeAdmin);

module.exports = router;
