/**
 * Entrada de DESENVOLVIMENTO LOCAL.
 *
 * Carrega o .env, importa o app Express e sobe um servidor HTTP.
 * Em produção (Vercel) este arquivo NÃO é usado — lá quem importa o app é
 * `api/[...path].js`, e as variáveis de ambiente vêm do painel da Vercel.
 */
require('dotenv').config();

const app = require('./app');
const { isConfigured } = require('./supabase');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n🚀 Minatech API rodando em http://localhost:${PORT}`);
  console.log(
    isConfigured
      ? '   Modo: Supabase (persistência real)'
      : '   Modo: DEMO (memória) — defina SUPABASE_URL e SUPABASE_SERVICE_KEY para persistir.'
  );
});
