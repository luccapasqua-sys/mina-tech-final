import { useState } from 'react';
import qrCode from '../assets/pix-qrcode.png';
import './Doacao.css';

const CHAVE_PIX = 'minatech.floripa@gmail.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Doacao() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [concluido, setConcluido] = useState(false);

  async function copiarChave() {
    try {
      await navigator.clipboard.writeText(CHAVE_PIX);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setErro('Não foi possível copiar. Chave PIX: ' + CHAVE_PIX);
    }
  }

  function concluir(e) {
    e.preventDefault();
    setErro('');
    if (nome.trim().length < 2) return setErro('Informe seu nome completo.');
    if (!EMAIL_RE.test(email.trim())) return setErro('Informe um e-mail de contato válido.');
    setConcluido(true);
  }

  return (
    <section className="section doacao">
      <div className="container">
        <h1 className="doacao__headline">
          Preencha as informações para se tornar um <em>patrocinador.</em>
        </h1>

        <form className="doacao__card card" onSubmit={concluir}>
          <div className="head-rule"><h2>Dados pessoais</h2></div>

          <div className="field">
            <label htmlFor="d-nome">Nome completo</label>
            <input
              id="d-nome"
              className="input"
              type="text"
              placeholder="Digite seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={concluido}
            />
          </div>

          <div className="field">
            <label htmlFor="d-email">E-mail de contato</label>
            <input
              id="d-email"
              className="input"
              type="email"
              placeholder="seuemail@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={concluido}
            />
          </div>

          <div className="head-rule doacao__pix-head"><h2>PIX</h2></div>

          <div className="doacao__pix">
            <img src={qrCode} alt="QR Code PIX para doação ao Minatech" className="doacao__qr" />
            <button type="button" className="doacao__copy" onClick={copiarChave}>
              {copiado ? '✓ Chave copiada!' : 'Copiar link'}
            </button>
          </div>

          {erro && <div className="alert alert-error">{erro}</div>}
          {concluido && (
            <div className="alert alert-success">
              Obrigada por apoiar o Minatech! 💜 Sua contribuição transforma o futuro de muitas meninas.
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block doacao__submit" disabled={concluido}>
            {concluido ? 'Doação registrada' : 'Concluir doação'}
          </button>
        </form>
      </div>
    </section>
  );
}