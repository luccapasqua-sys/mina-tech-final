const express = require('express');
const rateLimit = require('express-rate-limit');
const validateInscricao = require('../middleware/validateInscricao');
const controller = require('../controllers/inscricaoController');

const router = express.Router();

// Proteção contra spam: máx. 10 inscrições por IP a cada 15 min.
const inscricaoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas tentativas. Tente novamente em alguns minutos.',
  },
});

router.post('/', inscricaoLimiter, validateInscricao, controller.create);

module.exports = router;
