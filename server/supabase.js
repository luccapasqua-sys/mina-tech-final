/**
 * Cliente Supabase (service role) usado pela API.
 *
 * Se as variáveis SUPABASE_URL e SUPABASE_SERVICE_KEY não estiverem
 * definidas, `supabase` será null e `isConfigured` será false — nesse
 * caso a aplicação opera em MODO DEMO (armazenamento em memória).
 */

// Polyfill de WebSocket: versões recentes do supabase-js inicializam um
// cliente Realtime que exige `WebSocket` global. No Node < 22 ele não existe,
// e o `createClient` quebra. Não usamos Realtime aqui, mas precisamos que o
// construtor exista — então fornecemos o do pacote `ws` quando faltar.
if (typeof globalThis.WebSocket === 'undefined') {
  try {
    globalThis.WebSocket = require('ws');
  } catch (_) {
    /* sem 'ws' instalado: segue o jogo (Node 22+ tem WebSocket nativo) */
  }
}

const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

const isConfigured = Boolean(url && serviceKey);

const supabase = isConfigured
  ? createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

module.exports = { supabase, isConfigured };
