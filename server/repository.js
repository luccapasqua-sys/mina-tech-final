/**
 * Camada de acesso a dados das inscrições.
 *
 * Quando o Supabase está configurado, usa a tabela `inscricoes`.
 * Caso contrário (MODO DEMO), usa um armazenamento em memória com
 * alguns registros de exemplo, para permitir rodar/avaliar o sistema
 * sem credenciais externas.
 */
const { randomUUID } = require('crypto');
const { supabase, isConfigured } = require('./supabase');

const TABLE = 'inscricoes';
const TABLE_ADMINS = 'admin_emails';

/* ---------- Armazenamento em memória (modo demo) ---------- */
function nowISO() {
  return new Date().toISOString();
}

/* Admins gerenciáveis em modo demo (memória). O super-admin oculto vive na
   env ADMIN_EMAILS e NÃO entra nesta lista. */
let adminEmailsMemory = ['minatech.floripa@gmail.com'];

const memory = [
  {
    id: randomUUID(),
    nome: 'Ana Beatriz Silva',
    idade: 15,
    escolaridade: 'Médio',
    telefone: '+55 (48) 99999-1111',
    email: 'ana.silva@example.com',
    neurodivergente: 'Não',
    alergias: 'Nenhuma',
    faixa_salarial: '1–2 SM',
    pessoas_em_casa: 4,
    dispositivos: ['Celular/Tablet'],
    status: 'pendente',
    created_at: nowISO(),
    updated_at: nowISO(),
  },
  {
    id: randomUUID(),
    nome: 'Júlia Fernandes',
    idade: 14,
    escolaridade: 'Fundamental',
    telefone: '+55 (48) 98888-2222',
    email: 'julia.fernandes@example.com',
    neurodivergente: 'Sim',
    alergias: 'Amendoim',
    faixa_salarial: 'até 1 SM',
    pessoas_em_casa: 5,
    dispositivos: ['Computador/Notebook', 'Celular/Tablet'],
    status: 'aprovada',
    created_at: nowISO(),
    updated_at: nowISO(),
  },
  {
    id: randomUUID(),
    nome: 'Mariana Costa',
    idade: 17,
    escolaridade: 'Médio',
    telefone: '+55 (48) 97777-3333',
    email: 'mariana.costa@example.com',
    neurodivergente: 'Prefiro não dizer',
    alergias: 'Glúten',
    faixa_salarial: '2–3 SM',
    pessoas_em_casa: 3,
    dispositivos: ['Nenhum dos acima'],
    status: 'reprovada',
    created_at: nowISO(),
    updated_at: nowISO(),
  },
];

/* ---------- Operações ---------- */

async function createInscricao(data) {
  const payload = { ...data, status: 'pendente' };

  if (isConfigured) {
    const { data: row, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return row;
  }

  const row = {
    id: randomUUID(),
    ...payload,
    created_at: nowISO(),
    updated_at: nowISO(),
  };
  memory.unshift(row);
  return row;
}

async function listInscricoes(status) {
  if (isConfigured) {
    let query = supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  const rows = [...memory].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
  return status ? rows.filter((r) => r.status === status) : rows;
}

async function updateStatus(id, status) {
  if (isConfigured) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ status, updated_at: nowISO() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data; // null se não encontrado
  }

  const row = memory.find((r) => r.id === id);
  if (!row) return null;
  row.status = status;
  row.updated_at = nowISO();
  return row;
}

async function deleteInscricao(id) {
  if (isConfigured) {
    // Confere existência antes de remover para retornar 404 corretamente.
    const { data: existing } = await supabase
      .from(TABLE)
      .select('id')
      .eq('id', id)
      .maybeSingle();
    if (!existing) return false;
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  const idx = memory.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  memory.splice(idx, 1);
  return true;
}

/* ---------- Admins gerenciáveis ---------- */

/** Lista os e-mails de admin gerenciáveis (não inclui os super-admins da env). */
async function listAdminEmails() {
  if (isConfigured) {
    const { data, error } = await supabase
      .from(TABLE_ADMINS)
      .select('email')
      .order('email', { ascending: true });
    // Se a tabela ainda não existe, não quebra o painel: retorna vazio.
    if (error) {
      if (error.code === '42P01') return [];
      throw error;
    }
    return (data || []).map((r) => r.email);
  }
  return [...adminEmailsMemory].sort((a, b) => a.localeCompare(b));
}

/** Adiciona um e-mail de admin (idempotente). Retorna o e-mail normalizado. */
async function addAdminEmail(email) {
  const e = String(email).trim().toLowerCase();
  if (isConfigured) {
    const { error } = await supabase
      .from(TABLE_ADMINS)
      .upsert({ email: e }, { onConflict: 'email' });
    if (error) throw error;
    return e;
  }
  if (!adminEmailsMemory.includes(e)) adminEmailsMemory.push(e);
  return e;
}

/** Remove um e-mail de admin. Retorna true se existia. */
async function removeAdminEmail(email) {
  const e = String(email).trim().toLowerCase();
  if (isConfigured) {
    const { data: existing } = await supabase
      .from(TABLE_ADMINS)
      .select('email')
      .eq('email', e)
      .maybeSingle();
    if (!existing) return false;
    const { error } = await supabase.from(TABLE_ADMINS).delete().eq('email', e);
    if (error) throw error;
    return true;
  }
  const before = adminEmailsMemory.length;
  adminEmailsMemory = adminEmailsMemory.filter((x) => x !== e);
  return adminEmailsMemory.length < before;
}

/**
 * Convida o usuário por e-mail (Supabase Auth Admin API): cria a conta, se ainda
 * não existir, e envia um e-mail para a pessoa definir a senha. Best-effort —
 * nunca lança; retorna o resultado para a controller decidir a mensagem.
 *   { invited: true }                  -> e-mail de convite enviado
 *   { invited: false, reason:'exists' }-> já tinha conta (pode logar)
 *   { invited: false, reason:'demo' }  -> modo demo (sem Supabase)
 *   { invited: false, reason:'error', detail } -> falhou (ex.: e-mail não config.)
 */
async function inviteAuthUser(email, redirectTo) {
  if (!isConfigured) return { invited: false, reason: 'demo' };
  try {
    const options = redirectTo ? { redirectTo } : undefined;
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, options);
    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (error.status === 422 || msg.includes('already') || msg.includes('registered')) {
        return { invited: false, reason: 'exists' };
      }
      return { invited: false, reason: 'error', detail: error.message };
    }
    return { invited: true };
  } catch (e) {
    return { invited: false, reason: 'error', detail: e.message };
  }
}

module.exports = {
  createInscricao,
  listInscricoes,
  updateStatus,
  deleteInscricao,
  listAdminEmails,
  addAdminEmail,
  removeAdminEmail,
  inviteAuthUser,
};
