/**
 * Função serverless da Vercel para a API Minatech.
 *
 * O `vercel.json` faz um rewrite de TODO /api/* (em qualquer profundidade,
 * ex.: /api/inscricao, /api/admin/inscricoes) para esta função. Apenas
 * reexportamos o app Express — ele cuida do roteamento interno e a Vercel o
 * invoca como (req, res), preservando a URL original em req.url.
 *
 * As variáveis de ambiente (SUPABASE_URL, SUPABASE_SERVICE_KEY, etc.) vêm
 * das Environment Variables configuradas no projeto da Vercel.
 */
module.exports = require('../server/app');
