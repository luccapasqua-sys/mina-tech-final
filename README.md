# Minatech — Plataforma Digital

Plataforma completa da **Minatech**, ONG de Florianópolis-SC que leva educação em
tecnologia e engenharia para jovens mulheres de escolas públicas. O sistema integra
**site institucional**, **formulário de inscrição**, **API** e **painel administrativo**
em uma única solução.

> 💡 **Roda sem configuração externa.** Por padrão, o backend sobe em **modo demo**
> (dados em memória) e o painel admin tem um **login de demonstração** — basta instalar
> as dependências e rodar. Para persistência real, configure o Supabase (passo a passo abaixo).

---

## 🧱 Stack

| Camada | Tecnologia |
|---|---|
| Front-end | React 18 + Vite + React Router |
| Back-end / API | Node.js + Express |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação admin | Supabase Auth (com fallback demo) |
| Estilização | CSS com design tokens (variáveis) |
| Segurança | Helmet, CORS, rate limiting |

---

## 📂 Estrutura

**Projeto único** (front + API no mesmo repositório, um só `.env`, um só deploy na Vercel).

```
entrega-final-minatech/
├── index.html                # entrada do front (Vite)
├── vite.config.mjs           # config do Vite (+ proxy /api -> :3001 em dev)
├── vercel.json               # framework Vite + fallback de SPA
├── package.json              # dependências e scripts ÚNICOS (front + back)
├── .env                      # variáveis ÚNICAS (servidor + VITE_)  ⟵ não versionar
│
├── src/                      # Aplicação React (Vite)
│   ├── assets/               # imagens e logos da marca
│   ├── components/           # Navbar, Footer, Layout, Spinner...
│   ├── context/              # AuthContext (sessão admin)
│   ├── pages/                # Home, Oscs, Inscricao, Programacao, Faq, Doacao
│   │   └── admin/            # Login, Dashboard, ProtectedRoute
│   ├── services/             # api.js (HTTP) e supabase.js
│   └── styles/theme.css      # tokens da identidade visual
│
├── server/                   # API Node.js + Express
│   ├── app.js                # constrói e exporta o app (sem listen)
│   ├── index.js              # entrada de DEV local (sobe o servidor :3001)
│   ├── routes/               # inscricao.js, admin.js
│   ├── controllers/          # inscricaoController.js, adminController.js
│   ├── middleware/           # auth.js (+ allowlist), validateInscricao.js
│   ├── repository.js         # acesso a dados (Supabase OU memória)
│   └── supabase.js           # cliente Supabase (service role)
│
├── api/
│   └── index.js              # função serverless da Vercel (reexporta server/app; /api/* via rewrite)
│
├── db/schema.sql             # tabela + RLS para o Supabase
├── medias/ • QRCODE/ • pages-print-screen/   # assets originais e protótipos
└── README.md
```

---

## ✅ Pré-requisitos

- Node.js 18+ e npm
- (Opcional) Uma conta no [Supabase](https://supabase.com) para persistência real

---

## 🚀 Como rodar

Um único `npm install` e um único comando sobem **o front e a API juntos**:

```bash
npm install
npm run dev
```

- `npm run dev` roda o Vite (porta **5173**) e o Express (porta **3001**) em paralelo;
  em dev o front fala com a API por `/api` (mesma origem), via proxy do Vite.
- Scripts auxiliares: `npm run dev:web` (só front), `npm run dev:api` (só API),
  `npm run build` (build de produção), `npm start` (roda só a API).

> Sem as variáveis do Supabase no `.env`, o sistema sobe em **modo demo**
> (dados em memória + login admin de demonstração).

Acesse:
- Site: <http://localhost:5173>
- Painel admin: <http://localhost:5173/admin>

### 🔑 Login do painel (modo demo)
- **E-mail:** `admin@minatech.org`
- **Senha:** `admin123`

No modo demo, as inscrições ficam em memória (com 3 registros de exemplo) e são
reiniciadas quando o backend reinicia.

---

## 🗄️ Configurando o Supabase (persistência real)

1. Crie um projeto em <https://supabase.com>.
2. No **SQL Editor**, rode o conteúdo de [`db/schema.sql`](db/schema.sql)
   (cria a tabela `inscricoes`, índices e as políticas de RLS).
3. Em **Project Settings → API**, copie a `URL`, a `anon key` e a `service_role key`.
4. Em **Authentication → Users**, crie manualmente o(s) usuário(s) admin (e-mail + senha)
   e, em **Authentication → Providers → Email**, **desligue o cadastro público**
   ("Allow new users to sign up") para que só esses e-mails consigam entrar.
5. Copie [`.env.example`](.env.example) para `.env` e preencha (**um arquivo só**):

```env
# Servidor (secreto)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=sua-service-role-key
ADMIN_EMAILS=voce@gmail.com        # e-mails admin (vírgula). Vazio = qualquer autenticado
PORT=3001
FRONTEND_URL=*

# Front (público — prefixo VITE_)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

Reinicie (`npm run dev`). Agora o login usa o **Supabase Auth** e os dados são
persistidos no PostgreSQL. A API usa a *service role key* (ignora o RLS; as políticas
protegem o acesso direto via *anon key*).

### 👤 Quem pode acessar o painel

Há **dois níveis** de administrador:

- **Super-admins (env `ADMIN_EMAILS`):** permanentes e **ocultos** — não aparecem na
  lista do painel e não podem ser removidos pela interface. Ideal para o e-mail do dono.
- **Admins gerenciáveis (tabela `admin_emails`):** **adicionados e removidos pelo próprio
  painel** (seção *Administradores* no dashboard). O e-mail institucional
  `minatech.floripa@gmail.com` já vem cadastrado pelo `schema.sql`.

Um e-mail só consegue entrar se (a) for super-admin **ou** (b) constar na tabela — **e**
tiver um usuário criado no Supabase (Authentication → Users) com esse mesmo e-mail.

---

## 🔌 Endpoints da API

Base: `http://localhost:3001/api`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/health` | — | Status e modo (demo/supabase) |
| `POST` | `/inscricao` | pública (rate-limited) | Cria inscrição (status `pendente`) |
| `GET` | `/admin/inscricoes?status=` | Bearer token | Lista inscrições (filtro opcional por status) |
| `PATCH` | `/admin/inscricoes/:id` | Bearer token | Atualiza status (`pendente`/`aprovada`/`reprovada`) |
| `DELETE` | `/admin/inscricoes/:id` | Bearer token | Remove inscrição |
| `GET` | `/admin/admins` | Bearer token | Lista admins gerenciáveis (sem os super-admins) |
| `POST` | `/admin/admins` | Bearer token | Adiciona admin (`{ email }`) |
| `DELETE` | `/admin/admins/:email` | Bearer token | Remove admin gerenciável |

**Exemplo — criar inscrição**
```bash
curl -X POST http://localhost:3001/api/inscricao \
  -H 'Content-Type: application/json' \
  -d '{"nome":"Ana Silva","idade":16,"escolaridade":"Médio","telefone":"+55 (48) 99999-0000","email":"ana@example.com","dispositivos":["Celular/Tablet"]}'
```

As rotas de admin exigem o header `Authorization: Bearer <token>`. No modo demo o token
é `demo-token` (gerenciado automaticamente pelo front-end); com Supabase, é o
`access_token` da sessão autenticada.

---

## 🖥️ Páginas

| Rota | Página |
|---|---|
| `/` | Home (hero, "O Minatech acolhe", "Quem somos") |
| `/oscs` | Coordenadora, OSCs parceiras e parcerias |
| `/inscricao` | Formulário de inscrição (5 seções, validação em tempo real) |
| `/programacao` | Eventos, programações passadas e depoimentos |
| `/faq` | Perguntas frequentes (accordion) |
| `/doacao` | Doação/contato (QR Code PIX + copiar chave) |
| `/admin` | Login do painel |
| `/admin/dashboard` | Painel: resumo, tabela, filtros, busca, export CSV, ações |

---

## 🎨 Identidade visual

Todos os tokens de cor e tipografia ficam centralizados em
[`src/styles/theme.css`](src/styles/theme.css).

> **Nota:** o design foi mantido **fiel aos protótipos aprovados** (em `pages-print-screen/`):
> paleta **carmim/rosa**, rodapé vinho e títulos em fonte serifada. Isso diverge do bloco
> de tokens roxos sugerido no briefing (PARTE 5). Para voltar ao roxo (`#6B21A8`), basta
> ajustar as variáveis `--color-primary`, `--color-grad-*` e `--color-maroon` no topo de
> `theme.css` — nenhuma outra alteração é necessária.

---

## ☁️ Deploy (Vercel — projeto único)

Front e API vão **juntos** num só projeto da Vercel:

1. Importe o repositório na Vercel. O framework **Vite** é detectado automaticamente
   (build `vite build`, output `dist`); a pasta `api/` vira função serverless e atende
   `/api/*` (mesmo domínio do site — sem CORS).
2. Em **Settings → Environment Variables**, cadastre as mesmas variáveis do `.env`:
   `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ADMIN_EMAILS`, `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY` (não precisa de `PORT` nem `FRONTEND_URL`).
3. Deploy. Pronto — um domínio só serve o site e a API.

> A API roda como função serverless (sem servidor 24h). Como o estado vive no Supabase,
> isso é transparente. O *modo demo* (memória) não persiste entre invocações — use o
> Supabase em produção.

---

*Minatech — Jornada de Tecnologia para Meninas · Florianópolis-SC*
*minatech.floripa@gmail.com · (48) 99137-5245*

---

## 👥 Contribuidores

| Nome | GitHub |
|---|---|
| Lucca Carneiro Della Pasqua | [@LuccaPasqua](https://github.com/LuccaPasqua) |
| Renan | [@rojerio](https://github.com/rojerio) |
| Pedro |  [@PMeyerCP](https://github.com/PMeyerCP)|
| Rihards | [@RihardsSenai](https://github.com/RihardsSenai)  |