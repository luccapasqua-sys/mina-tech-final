/**
 * Validação server-side do corpo de POST /api/inscricao.
 * Normaliza os dados em `req.validatedInscricao` quando válido,
 * ou responde 400 com a lista de erros.
 */
const ESCOLARIDADES = ['Fundamental', 'Médio'];
const NEURO = ['Sim', 'Não', 'Não sei ao certo', 'Prefiro não dizer'];
const FAIXAS = ['até 1 SM', '1–2 SM', '2–3 SM', 'acima de 3 SM'];
const DISPOSITIVOS = ['Computador/Notebook', 'Celular/Tablet', 'Nenhum dos acima'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateInscricao(req, res, next) {
  const b = req.body || {};
  const errors = [];

  // --- Dados pessoais ---
  const nome = typeof b.nome === 'string' ? b.nome.trim() : '';
  if (nome.length < 2) errors.push('Informe o nome completo.');

  const idade = Number(b.idade);
  if (!Number.isInteger(idade) || idade < 1 || idade > 120) {
    errors.push('Informe uma idade válida.');
  }

  const escolaridade = typeof b.escolaridade === 'string' ? b.escolaridade.trim() : '';
  if (!ESCOLARIDADES.includes(escolaridade)) {
    errors.push('Selecione a escolaridade.');
  }

  // --- Contato ---
  const telefone = typeof b.telefone === 'string' ? b.telefone.trim() : '';
  if (telefone.length < 8) errors.push('Informe um telefone válido.');

  const email = typeof b.email === 'string' ? b.email.trim() : '';
  if (!EMAIL_RE.test(email)) errors.push('Informe um e-mail válido.');

  // --- Diversidade e inclusão (opcionais, mas validados se presentes) ---
  const neurodivergente =
    typeof b.neurodivergente === 'string' ? b.neurodivergente.trim() : '';
  if (neurodivergente && !NEURO.includes(neurodivergente)) {
    errors.push('Valor inválido para neurodivergência.');
  }

  const alergias = typeof b.alergias === 'string' ? b.alergias.trim() : '';

  // --- Situação familiar ---
  const faixa_salarial =
    typeof b.faixa_salarial === 'string' ? b.faixa_salarial.trim() : '';
  if (faixa_salarial && !FAIXAS.includes(faixa_salarial)) {
    errors.push('Faixa salarial inválida.');
  }

  let pessoas_em_casa = null;
  if (b.pessoas_em_casa !== undefined && b.pessoas_em_casa !== null && b.pessoas_em_casa !== '') {
    pessoas_em_casa = Number(b.pessoas_em_casa);
    if (!Number.isInteger(pessoas_em_casa) || pessoas_em_casa < 1) {
      errors.push('Quantidade de pessoas na casa inválida.');
    }
  }

  // --- Acesso digital ---
  let dispositivos = [];
  if (Array.isArray(b.dispositivos)) {
    dispositivos = b.dispositivos
      .map((d) => (typeof d === 'string' ? d.trim() : ''))
      .filter(Boolean);
    const invalid = dispositivos.filter((d) => !DISPOSITIVOS.includes(d));
    if (invalid.length) errors.push('Dispositivo inválido informado.');
  }

  if (errors.length) {
    return res.status(400).json({ error: 'Dados inválidos.', detalhes: errors });
  }

  req.validatedInscricao = {
    nome,
    idade,
    escolaridade,
    telefone,
    email,
    neurodivergente: neurodivergente || null,
    alergias: alergias || null,
    faixa_salarial: faixa_salarial || null,
    pessoas_em_casa,
    dispositivos,
  };

  next();
}

module.exports = validateInscricao;
