/**
 * App Express da Minatech (inscrições + painel admin).
 *
 * Este módulo apenas CONSTRÓI e exporta o app — não chama `listen`.
 * Assim ele serve aos dois ambientes:
 *   - Local:  `server/index.js` importa este app e sobe um servidor HTTP.
 *   - Vercel: `api/[...path].js` importa este app como função serverless.
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { isConfigured } = require('./supabase');
const inscricaoRoutes = require('./routes/inscricao');
const adminRoutes = require('./routes/admin');

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

/* Atrás do proxy da Vercel: confia no 1º proxy para ler o IP real do
   visitante (necessário para o rate-limit por IP funcionar). */
app.set('trust proxy', 1);

/* ---------- Segurança ---------- */
app.use(helmet());
app.use(
  cors({
    origin: FRONTEND_URL === '*' ? true : FRONTEND_URL.split(',').map((s) => s.trim()),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

/* ---------- Parsing de JSON (compatível com serverless) ----------
   Em algumas plataformas (Vercel) o corpo da requisição já chega parseado
   em `req.body`. Nesse caso pulamos o parser do Express, que tentaria ler um
   stream já consumido — o que resultaria em body vazio. Em ambiente local o
   `req.body` ainda não existe, então o `express.json()` roda normalmente. */
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') return next();
  express.json()(req, res, next);
});

app.use(morgan('dev'));

/* ---------- Healthcheck ---------- */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: isConfigured ? 'supabase' : 'demo (memória)',
  });
});

/* ---------- Rotas ---------- */
app.use('/api/inscricao', inscricaoRoutes);
app.use('/api/admin', adminRoutes);

/* ---------- 404 ---------- */
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

/* ---------- Tratamento de erros ---------- */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[erro]', err.message || err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

module.exports = app;
