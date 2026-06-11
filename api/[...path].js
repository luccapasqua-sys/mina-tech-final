/**
 * Função serverless da Vercel para a API Minatech.
 *
 * O nome do arquivo `[...path].js` é uma rota "catch-all": a Vercel envia
 * para cá QUALQUER requisição em /api/* (ex.: /api/inscricao, /api/admin/...).
 * Apenas reexportamos o app Express — a Vercel o invoca como (req, res).
 *
 * As variáveis de ambiente (SUPABASE_URL, SUPABASE_SERVICE_KEY, etc.) vêm
 * das Environment Variables configuradas no projeto da Vercel.
 */
module.exports = require('../server/app');
