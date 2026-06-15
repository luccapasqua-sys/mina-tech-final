import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { criarInscricao } from '../services/api.js';
import Spinner from '../components/Spinner.jsx';
import './Inscricao.css';

/* ---------- Opções ---------- */
const ESCOLARIDADES = ['Fundamental', 'Médio'];
const NEURO_OPCOES = ['Sim', 'Não', 'Não sei ao certo', 'Prefiro não dizer'];
const FAIXAS = ['até 1 SM', '1–2 SM', '2–3 SM', 'acima de 3 SM'];
const PESSOAS = ['1', '2', '3', '4', '5+'];
const DISPOSITIVOS = ['Computador/Notebook', 'Celular/Tablet', 'Nenhum dos acima'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ESTADO_INICIAL = {
  nome: '',
  idade: '',
  escolaridade: '',
  telefone: '',
  email: '',
  neurodivergente: '',
  alergias: '',
  faixa_salarial: '',
  pessoas_em_casa: '',
  dispositivos: [],
};

/* ---------- Máscara de telefone: +55 (00) 00000-0000 ---------- */
function maskTelefone(value) {
  const d = value.replace(/\D/g, '').slice(0, 13); // 55 + 11 dígitos
  let rest = d;
  if (rest.startsWith('55')) rest = rest.slice(2);
  const ddd = rest.slice(0, 2);
  const parte1 = rest.slice(2, 7);
  const parte2 = rest.slice(7, 11);
  let out = '+55';
  if (ddd) out += ` (${ddd}`;
  if (ddd.length === 2) out += ')';
  if (parte1) out += ` ${parte1}`;
  if (parte2) out += `-${parte2}`;
  return out;
}

/* ---------- Ícones do stepper ---------- */
const Icon = ({ path }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {path}
  </svg>
);
const ICONS = {
  user: <Icon path={<><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" /></>} />,
  phone: <Icon path={<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L20 13l-1 4a16 16 0 0 1-14-13z" />} />,
  heart: <Icon path={<path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" />} />,
  home: <Icon path={<><path d="M3 11l9-7 9 7" /><path d="M5 10v9h14v-9" /></>} />,
  laptop: <Icon path={<><rect x="4" y="5" width="16" height="11" rx="1" /><path d="M2 20h20" /></>} />,
};

const STEPS = [
  { id: 'step-dados', label: 'Dados pessoais', icon: ICONS.user },
  { id: 'step-contato', label: 'Contato', icon: ICONS.phone },
  { id: 'step-diversidade', label: 'Diversidade e inclusão', icon: ICONS.heart },
  { id: 'step-familiar', label: 'Situação familiar', icon: ICONS.home },
  { id: 'step-acesso', label: 'Acesso digital', icon: ICONS.laptop },
];

export default function Inscricao() {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');
  const [activeStep, setActiveStep] = useState('step-dados');
  const sectionsRef = useRef({});

  /* Destaca o passo conforme a seção em foco */
  useEffect(() => {
    if (sucesso) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveStep(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    Object.values(sectionsRef.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [sucesso]);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  }

  function toggleDispositivo(value) {
    setForm((f) => {
      const has = f.dispositivos.includes(value);
      return { ...f, dispositivos: has ? f.dispositivos.filter((d) => d !== value) : [...f.dispositivos, value] };
    });
  }

  function validateField(name, value) {
    switch (name) {
      case 'nome':
        return value.trim().length < 2 ? 'Informe seu nome completo.' : '';
      case 'idade': {
        const n = Number(value);
        if (!value) return 'Informe sua idade.';
        if (!Number.isInteger(n) || n < 1 || n > 120) return 'Idade inválida.';
        return '';
      }
      case 'escolaridade':
        return !value ? 'Selecione a escolaridade.' : '';
      case 'telefone':
        return value.replace(/\D/g, '').length < 12 ? 'Informe um telefone válido com DDD.' : '';
      case 'email':
        return !EMAIL_RE.test(value.trim()) ? 'Informe um e-mail válido.' : '';
      default:
        return '';
    }
  }

  const OBRIGATORIOS = ['nome', 'idade', 'escolaridade', 'telefone', 'email'];

  function handleBlur(name) {
    setTouched((t) => ({ ...t, [name]: true }));
    const msg = validateField(name, form[name]);
    setErrors((e) => ({ ...e, [name]: msg || undefined }));
  }

  function validarTudo() {
    const novos = {};
    OBRIGATORIOS.forEach((name) => {
      const msg = validateField(name, form[name]);
      if (msg) novos[name] = msg;
    });
    setErrors(novos);
    setTouched(OBRIGATORIOS.reduce((acc, n) => ({ ...acc, [n]: true }), {}));
    return Object.keys(novos).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErroEnvio('');
    if (!validarTudo()) {
      // foca o primeiro campo com erro
      const primeiro = OBRIGATORIOS.find((n) => validateField(n, form[n]));
      if (primeiro) document.getElementById(`f-${primeiro}`)?.focus();
      return;
    }

    setEnviando(true);
    try {
      const payload = {
        nome: form.nome.trim(),
        idade: Number(form.idade),
        escolaridade: form.escolaridade,
        telefone: form.telefone.trim(),
        email: form.email.trim(),
        neurodivergente: form.neurodivergente || null,
        alergias: form.alergias.trim() || null,
        faixa_salarial: form.faixa_salarial || null,
        pessoas_em_casa: form.pessoas_em_casa ? Number(form.pessoas_em_casa.replace('+', '')) : null,
        dispositivos: form.dispositivos,
      };
      await criarInscricao(payload);
      setSucesso(true);
    } catch (err) {
      setErroEnvio(err.message || 'Não foi possível enviar sua inscrição. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  function fieldClass(name) {
    return `input ${touched[name] && errors[name] ? 'invalid' : ''}`;
  }

  /* ---------- Tela de sucesso ---------- */
  if (sucesso) {
    return (
      <section className="section insc">
        <div className="container insc__sucesso">
          <div className="insc__sucesso-icon" aria-hidden="true">✓</div>
          <h1 className="page-title">Inscrição recebida!</h1>
          <p>Entraremos em contato em breve. Fique de olho no seu e-mail e WhatsApp. 💜</p>
          <Link to="/" className="btn btn-primary">Voltar para o início</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section insc">
      <div className="container">
        <h1 className="insc__headline">
          Preencha o formulário abaixo para garantir <em>sua vaga.</em>
        </h1>

        <div className="insc__layout">
          {/* Stepper */}
          <aside className="insc__stepper" aria-hidden="true">
            {STEPS.map((s) => (
              <div key={s.id} className={`insc__step ${activeStep === s.id ? 'is-active' : ''}`}>
                <span className="insc__step-dot">{s.icon}</span>
                <span className="insc__step-label">{s.label}</span>
              </div>
            ))}
          </aside>

          {/* Formulário */}
          <form className="insc__form" onSubmit={handleSubmit} noValidate>
            {/* Seção 1 */}
            <div className="insc__card" id="step-dados" ref={(el) => (sectionsRef.current['step-dados'] = el)}>
              <div className="head-rule"><h2>Dados pessoais</h2></div>

              <div className="field">
                <label htmlFor="f-nome">Nome completo <span className="req">*</span></label>
                <input
                  id="f-nome"
                  className={fieldClass('nome')}
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={form.nome}
                  onChange={(e) => setField('nome', e.target.value)}
                  onBlur={() => handleBlur('nome')}
                  autoComplete="name"
                />
                {touched.nome && errors.nome && <p className="field-error">{errors.nome}</p>}
              </div>

              <div className="grid-2">
                <div className="field">
                  <label htmlFor="f-idade">Idade <span className="req">*</span></label>
                  <input
                    id="f-idade"
                    className={fieldClass('idade')}
                    type="number"
                    min="1"
                    placeholder="Quantos anos você tem?"
                    value={form.idade}
                    onChange={(e) => setField('idade', e.target.value)}
                    onBlur={() => handleBlur('idade')}
                  />
                  {touched.idade && errors.idade && <p className="field-error">{errors.idade}</p>}
                </div>

                <div className="field">
                  <label htmlFor="f-escolaridade">Escolaridade <span className="req">*</span></label>
                  <select
                    id="f-escolaridade"
                    className={`select ${touched.escolaridade && errors.escolaridade ? 'invalid' : ''}`}
                    value={form.escolaridade}
                    onChange={(e) => setField('escolaridade', e.target.value)}
                    onBlur={() => handleBlur('escolaridade')}
                  >
                    <option value="">Selecione</option>
                    {ESCOLARIDADES.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  {touched.escolaridade && errors.escolaridade && <p className="field-error">{errors.escolaridade}</p>}
                </div>
              </div>
            </div>

            {/* Seção 2 */}
            <div className="insc__card" id="step-contato" ref={(el) => (sectionsRef.current['step-contato'] = el)}>
              <div className="head-rule"><h2>Contato</h2></div>

              <div className="field">
                <label htmlFor="f-telefone">Telefone <span className="req">*</span></label>
                <input
                  id="f-telefone"
                  className={fieldClass('telefone')}
                  type="tel"
                  placeholder="+55 (00) 00000-0000"
                  value={form.telefone}
                  onChange={(e) => setField('telefone', maskTelefone(e.target.value))}
                  onBlur={() => handleBlur('telefone')}
                  autoComplete="tel"
                />
                {touched.telefone && errors.telefone && <p className="field-error">{errors.telefone}</p>}
              </div>

              <div className="field">
                <label htmlFor="f-email">E-mail <span className="req">*</span></label>
                <input
                  id="f-email"
                  className={fieldClass('email')}
                  type="email"
                  placeholder="seu@gmail.com"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  autoComplete="email"
                />
                {touched.email && errors.email && <p className="field-error">{errors.email}</p>}
              </div>
            </div>

            {/* Seção 3 */}
            <div className="insc__card" id="step-diversidade" ref={(el) => (sectionsRef.current['step-diversidade'] = el)}>
              <div className="head-rule"><h2>Diversidade e inclusão</h2></div>

              <div className="field">
                <label>Você é neurodivergente?</label>
                <div className="insc__options" role="radiogroup" aria-label="Você é neurodivergente?">
                  {NEURO_OPCOES.map((op) => (
                    <button
                      type="button"
                      key={op}
                      role="radio"
                      aria-checked={form.neurodivergente === op}
                      className={`insc__option ${form.neurodivergente === op ? 'is-selected' : ''}`}
                      onClick={() => setField('neurodivergente', op)}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label htmlFor="f-alergias">Possui alguma alergia?</label>
                <input
                  id="f-alergias"
                  className="input"
                  type="text"
                  placeholder="Ex: amendoim, glúten, nenhuma...."
                  value={form.alergias}
                  onChange={(e) => setField('alergias', e.target.value)}
                />
              </div>
            </div>

            {/* Seção 4 */}
            <div className="insc__card" id="step-familiar" ref={(el) => (sectionsRef.current['step-familiar'] = el)}>
              <div className="head-rule"><h2>Situação familiar</h2></div>

              <div className="field">
                <label htmlFor="f-faixa">Faixa salarial familiar</label>
                <select
                  id="f-faixa"
                  className="select"
                  value={form.faixa_salarial}
                  onChange={(e) => setField('faixa_salarial', e.target.value)}
                >
                  <option value="">Selecione a faixa</option>
                  {FAIXAS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="f-pessoas">Quantas pessoas moram na sua casa?</label>
                <select
                  id="f-pessoas"
                  className="select"
                  value={form.pessoas_em_casa}
                  onChange={(e) => setField('pessoas_em_casa', e.target.value)}
                >
                  <option value="">Selecione</option>
                  {PESSOAS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Seção 5 */}
            <div className="insc__card" id="step-acesso" ref={(el) => (sectionsRef.current['step-acesso'] = el)}>
              <div className="head-rule"><h2>Acesso digital</h2></div>

              <div className="field">
                <label>Quais dispositivos você tem em casa?</label>
                <div className="insc__checks">
                  {DISPOSITIVOS.map((d) => (
                    <label key={d} className={`insc__check ${form.dispositivos.includes(d) ? 'is-selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={form.dispositivos.includes(d)}
                        onChange={() => toggleDispositivo(d)}
                      />
                      <span className="insc__check-box" aria-hidden="true" />
                      {d}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {erroEnvio && <div className="alert alert-error insc__erro">{erroEnvio}</div>}

            <button type="submit" className="btn btn-primary btn-block insc__submit" disabled={enviando}>
              {enviando ? <Spinner /> : 'Inscreva-se já'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
