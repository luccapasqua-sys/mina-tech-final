const repo = require('../repository');
const { isSuperAdmin } = require('../middleware/auth');

const STATUS_VALIDOS = ['pendente', 'aprovada', 'reprovada'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


/** Gerenciamento das inscrições */


/** GET /api/admin/inscricoes 
 * lista todas as inscrições cadastradas, se um status inválido for enviado, barra a requisição antes de consultar o banco
*/
async function list(req, res, next) {
  try {
    const { status } = req.query;
    if (status && !STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({ error: 'Status inválido.' });
    }
    const rows = await repo.listInscricoes(status);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/admin/inscricoes/:id  { status }
 * altera o status de uma inscrição especifica, valida se o status é um dos permitidos no array
 */
async function updateStatus(req, res, next) {
  try {
    const { status } = req.body || {};
    if (!STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({ error: 'Status inválido.' });
    }
    const row = await repo.updateStatus(req.params.id, status);
    if (!row) return res.status(404).json({ error: 'Inscrição não encontrada.' });
    res.json(row);
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/admin/inscricoes/:id 
 * exclui permanentemente uma inscrição do sistema
*/
async function remove(req, res, next) {
  try {
    const ok = await repo.deleteInscricao(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Inscrição não encontrada.' });
    res.json({ message: 'Inscrição removida com sucesso.' });
  } catch (err) {
    next(err);
  }
}


/* Gerenciamento dos administradores */


/** GET /api/admin/admins
 * lista os e-mails de admins gerenciáveis, ocultando os super-admins */
async function listAdmins(req, res, next) {
  try {
    const emails = await repo.listAdminEmails();
    res.json(emails);
  } catch (err) {
    next(err);
  }
}

/** POST /api/admin/admins  { email }
 * adiciona um admin gerenciavel. */
async function addAdmin(req, res, next) {
  try {
    const email = String((req.body && req.body.email) || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Informe um e-mail válido.' });
    }
    if (isSuperAdmin(email)) {
      return res
        .status(400)
        .json({ error: 'Este e-mail já é um administrador permanente.' });
    }
    await repo.addAdminEmail(email);

    // convida a pessoa por e-mail (cria conta + link pra definir senha).
    const origin =
      req.headers.origin ||
      (process.env.FRONTEND_URL && process.env.FRONTEND_URL !== '*'
        ? process.env.FRONTEND_URL.split(',')[0].trim()
        : null);
    const redirectTo = origin ? `${origin.replace(/\/$/, '')}/admin` : undefined;
    const invite = await repo.inviteAuthUser(email, redirectTo);


    /** trata o retorno do serviço de autenticação */
    let message;
    if (invite.invited) message = `Convite enviado para ${email}.`;
    else if (invite.reason === 'exists') message = `${email} adicionado (já possui conta).`;
    else if (invite.reason === 'demo') message = `${email} adicionado.`;
    else
      message =
        `${email} adicionado, mas não foi possível enviar o convite por e-mail. ` +
        `Crie o usuário em Authentication → Users no Supabase.`;

    res.status(201).json({ email, message, invite });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/admin/admins/:email
 * remove um admin gerenciavel. Também bloqueia admins de tentar deletar a si mesmos e a remoção de super-admins */
async function removeAdmin(req, res, next) {
  try {
    const email = String(req.params.email || '').trim().toLowerCase();
    if (isSuperAdmin(email)) {
      return res
        .status(400)
        .json({ error: 'Administrador permanente não pode ser removido.' });
    }
    if (email === String(req.user?.email || '').toLowerCase()) {
      return res
        .status(400)
        .json({ error: 'Você não pode remover o seu próprio acesso.' });
    }
    const ok = await repo.removeAdminEmail(email);
    if (!ok) return res.status(404).json({ error: 'Administrador não encontrado.' });
    res.json({ message: 'Administrador removido.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, updateStatus, remove, listAdmins, addAdmin, removeAdmin };
