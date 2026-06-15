/**
 * Middleware de autenticação para rotas de admin.
 *
 * Espera o header `Authorization: Bearer <token>`.
 * - Com Supabase configurado: valida o JWT via supabase.auth.getUser().
 * - Em MODO DEMO: aceita o token fixo "demo-token".
 *
 * Quem é admin?
 *  - SUPER-ADMINS: e-mails na env ADMIN_EMAILS. São permanentes e OCULTOS
 *    (não aparecem nem podem ser removidos pelo painel). Ex.: o e-mail do dono.
 *  - ADMINS GERENCIÁVEIS: e-mails na tabela `admin_emails`, adicionados/
 *    removidos pela própria interface do painel.
 *  - Failsafe: se NÃO houver nenhum admin definido (env vazia + tabela vazia/
 *    inexistente), qualquer usuário autenticado é aceito — evita travar o acesso
 *    enquanto o sistema ainda não foi configurado.
 */
const { supabase, isConfigured } = require('../supabase');
const repo = require('../repository');

const DEMO_TOKEN = 'demo-token';

/** Super-admins permanentes e ocultos (env). */
const SUPER_ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/** É super-admin (env)? */
function isSuperAdmin(email) {
  return SUPER_ADMIN_EMAILS.includes(String(email || '').toLowerCase());
}

/** Tem permissão de admin? (super-admin OU consta na tabela gerenciável) */
async function isAllowed(email) {
  const e = String(email || '').toLowerCase();
  if (isSuperAdmin(e)) return true;

  let managed = [];
  try {
    managed = await repo.listAdminEmails();
  } catch (_) {
    managed = [];
  }
  const managedLower = managed.map((m) => String(m).toLowerCase());

  // Failsafe: nenhum admin configurado em lugar nenhum -> libera autenticados.
  if (SUPER_ADMIN_EMAILS.length === 0 && managedLower.length === 0) return true;

  return managedLower.includes(e);
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação ausente.' });
  }

  if (!isConfigured) {
    if (token === DEMO_TOKEN) {
      req.user = { email: 'admin@minatech.org', demo: true };
      return next();
    }
    return res
      .status(401)
      .json({ error: 'Token inválido (modo demo). Faça login novamente.' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    }
    if (!(await isAllowed(data.user.email))) {
      return res
        .status(403)
        .json({ error: 'Este usuário não tem permissão de administrador.' });
    }
    req.user = data.user;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Falha ao validar a sessão.' });
  }
}

module.exports = { requireAuth, DEMO_TOKEN, isSuperAdmin };
