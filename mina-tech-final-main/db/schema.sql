-- =========================================================
--  Minatech — Esquema do banco (Supabase / PostgreSQL)
--  Execute no SQL Editor do Supabase.
-- =========================================================

-- Tabela de inscrições
CREATE TABLE IF NOT EXISTS inscricoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  idade INTEGER NOT NULL,
  escolaridade TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  neurodivergente TEXT,
  alergias TEXT,
  faixa_salarial TEXT,
  pessoas_em_casa INTEGER,
  dispositivos TEXT[],
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'reprovada')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para filtros por status
CREATE INDEX IF NOT EXISTS idx_inscricoes_status ON inscricoes (status);

-- =========================================================
--  Row Level Security (RLS)
-- =========================================================
ALTER TABLE inscricoes ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa (anon) pode inserir uma inscrição.
DROP POLICY IF EXISTS "Inscrições públicas" ON inscricoes;
CREATE POLICY "Inscrições públicas"
  ON inscricoes FOR INSERT
  TO anon
  WITH CHECK (true);

-- Somente usuários autenticados (admins) podem ler.
DROP POLICY IF EXISTS "Admin lê tudo" ON inscricoes;
CREATE POLICY "Admin lê tudo"
  ON inscricoes FOR SELECT
  TO authenticated
  USING (true);

-- Somente autenticados podem atualizar.
DROP POLICY IF EXISTS "Admin atualiza" ON inscricoes;
CREATE POLICY "Admin atualiza"
  ON inscricoes FOR UPDATE
  TO authenticated
  USING (true);

-- Somente autenticados podem excluir.
DROP POLICY IF EXISTS "Admin deleta" ON inscricoes;
CREATE POLICY "Admin deleta"
  ON inscricoes FOR DELETE
  TO authenticated
  USING (true);

-- =========================================================
--  Administradores gerenciáveis pelo painel
--  (lista de e-mails que podem acessar o /admin).
--  OBS.: os "super-admins" ficam na env ADMIN_EMAILS (ocultos no
--  painel) — esta tabela é a lista VISÍVEL/editável pela interface.
-- =========================================================
CREATE TABLE IF NOT EXISTS admin_emails (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;
-- Sem políticas para anon/authenticated: só a SERVICE ROLE KEY (a API) acessa.

-- E-mail institucional da Minatech já cadastrado como admin.
INSERT INTO admin_emails (email) VALUES ('minatech.floripa@gmail.com')
  ON CONFLICT (email) DO NOTHING;

-- =========================================================
--  OBS.: A API usa a SERVICE ROLE KEY, que ignora o RLS.
--  As políticas acima protegem o acesso direto via anon key
--  (ex.: caso o front-end acesse o banco diretamente).
--  Crie usuários admin em Authentication > Users no painel.
-- =========================================================
