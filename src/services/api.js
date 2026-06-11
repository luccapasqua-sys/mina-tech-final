/**
 * Cliente HTTP da API Minatech (backend Express).
 */
// Mesma origem por padrão: em dev o Vite faz proxy de /api -> :3001 e, na
// Vercel, a API vive no mesmo domínio. VITE_API_URL pode sobrescrever se preciso.
const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!res.ok) {
    const message =
      (data && (data.error || (data.detalhes && data.detalhes.join(' ')))) ||
      'Ocorreu um erro inesperado.';
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/* ---------- Inscrições (público) ---------- */
export function criarInscricao(payload) {
  return request('/inscricao', { method: 'POST', body: payload });
}

/* ---------- Admin (autenticado) ---------- */
export function listarInscricoes(token, status) {
  const query = status && status !== 'todos' ? `?status=${encodeURIComponent(status)}` : '';
  return request(`/admin/inscricoes${query}`, { token });
}

export function atualizarStatus(token, id, status) {
  return request(`/admin/inscricoes/${id}`, { method: 'PATCH', body: { status }, token });
}

export function excluirInscricao(token, id) {
  return request(`/admin/inscricoes/${id}`, { method: 'DELETE', token });
}

/* ---------- Administradores do painel ---------- */
export function listarAdmins(token) {
  return request('/admin/admins', { token });
}

export function adicionarAdmin(token, email) {
  return request('/admin/admins', { method: 'POST', body: { email }, token });
}

export function removerAdmin(token, email) {
  return request(`/admin/admins/${encodeURIComponent(email)}`, { method: 'DELETE', token });
}

export { BASE_URL };
