import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  listarInscricoes,
  atualizarStatus,
  excluirInscricao,
  listarAdmins,
  adicionarAdmin,
  removerAdmin,
} from '../../services/api.js';
import Spinner from '../../components/Spinner.jsx';
import logo from '../../assets/logo.png';
import './admin.css';

const STATUS_TABS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'aprovada', label: 'Aprovada' },
  { value: 'reprovada', label: 'Reprovada' },
];

function formatData(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
}

function gerarCSV(linhas) {
  const cabecalho = [
    'Nome', 'Idade', 'Escolaridade', 'Telefone', 'E-mail',
    'Neurodivergente', 'Alergias', 'Faixa salarial', 'Pessoas em casa',
    'Dispositivos', 'Status', 'Data',
  ];
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const corpo = linhas.map((r) =>
    [
      r.nome, r.idade, r.escolaridade, r.telefone, r.email,
      r.neurodivergente, r.alergias, r.faixa_salarial, r.pessoas_em_casa,
      Array.isArray(r.dispositivos) ? r.dispositivos.join('; ') : '',
      r.status, formatData(r.created_at),
    ].map(escape).join(',')
  );
  return [cabecalho.map(escape).join(','), ...corpo].join('\n');
}

export default function Dashboard() {
  const { token, user, signOut, isDemo } = useAuth();
  const navigate = useNavigate();

  const [inscricoes, setInscricoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [busca, setBusca] = useState('');
  const [detalhe, setDetalhe] = useState(null);
  const [excluindo, setExcluindo] = useState(null); // registro a confirmar exclusão
  const [acaoId, setAcaoId] = useState(null); // id em processamento

  // Administradores do painel
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [adminErro, setAdminErro] = useState('');
  const [adminMsg, setAdminMsg] = useState('');
  const [novoAdmin, setNovoAdmin] = useState('');
  const [adminBusy, setAdminBusy] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const dados = await listarInscricoes(token);
      setInscricoes(Array.isArray(dados) ? dados : []);
    } catch (err) {
      setErro(err.message || 'Erro ao carregar inscrições.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const carregarAdmins = useCallback(async () => {
    setAdminsLoading(true);
    setAdminErro('');
    try {
      const lista = await listarAdmins(token);
      setAdmins(Array.isArray(lista) ? lista : []);
    } catch (err) {
      setAdminErro(err.message || 'Erro ao carregar administradores.');
    } finally {
      setAdminsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    carregarAdmins();
  }, [carregarAdmins]);

  async function adicionarAdminEmail(e) {
    e.preventDefault();
    const email = novoAdmin.trim().toLowerCase();
    if (!email) return;
    setAdminBusy(true);
    setAdminErro('');
    setAdminMsg('');
    try {
      const res = await adicionarAdmin(token, email);
      setNovoAdmin('');
      if (res?.message) setAdminMsg(res.message);
      await carregarAdmins();
    } catch (err) {
      setAdminErro(err.message || 'Erro ao adicionar administrador.');
    } finally {
      setAdminBusy(false);
    }
  }

  async function removerAdminEmail(email) {
    setAdminBusy(true);
    setAdminErro('');
    setAdminMsg('');
    try {
      await removerAdmin(token, email);
      setAdmins((arr) => arr.filter((a) => a !== email));
    } catch (err) {
      setAdminErro(err.message || 'Erro ao remover administrador.');
    } finally {
      setAdminBusy(false);
    }
  }

  const resumo = useMemo(
    () => ({
      total: inscricoes.length,
      pendente: inscricoes.filter((i) => i.status === 'pendente').length,
      aprovada: inscricoes.filter((i) => i.status === 'aprovada').length,
      reprovada: inscricoes.filter((i) => i.status === 'reprovada').length,
    }),
    [inscricoes]
  );

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return inscricoes.filter((i) => {
      const okStatus = statusFiltro === 'todos' || i.status === statusFiltro;
      const okBusca =
        !q ||
        i.nome?.toLowerCase().includes(q) ||
        i.email?.toLowerCase().includes(q);
      return okStatus && okBusca;
    });
  }, [inscricoes, statusFiltro, busca]);

  async function mudarStatus(id, status) {
    setAcaoId(id);
    setErro('');
    try {
      const atualizada = await atualizarStatus(token, id, status);
      setInscricoes((arr) => arr.map((i) => (i.id === id ? { ...i, ...atualizada } : i)));
    } catch (err) {
      setErro(err.message || 'Erro ao atualizar status.');
    } finally {
      setAcaoId(null);
    }
  }

  async function confirmarExclusao() {
    if (!excluindo) return;
    const id = excluindo.id;
    setAcaoId(id);
    setErro('');
    try {
      await excluirInscricao(token, id);
      setInscricoes((arr) => arr.filter((i) => i.id !== id));
      setExcluindo(null);
    } catch (err) {
      setErro(err.message || 'Erro ao excluir.');
    } finally {
      setAcaoId(null);
    }
  }

  function exportarCSV() {
    const csv = gerarCSV(visiveis);
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inscricoes-minatech-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function sair() {
    await signOut();
    navigate('/admin');
  }

  return (
    <div className="adm">
      {/* Topbar */}
      <header className="adm__top">
        <div className="adm__top-inner">
          <img src={logo} alt="Minatech" className="adm__logo" />
          <div className="adm__top-right">
            {isDemo && <span className="adm__demo-tag">modo demo</span>}
            <span className="adm__user">{user?.email}</span>
            <button className="btn btn-outline adm__sair" onClick={sair}>Sair</button>
          </div>
        </div>
      </header>

      <main className="adm__main">
        <h1 className="adm__title">Inscrições</h1>

        {/* Cards de resumo */}
        <div className="adm__cards">
          <div className="adm__card"><span className="adm__card-num">{resumo.total}</span><span className="adm__card-label">Total</span></div>
          <div className="adm__card adm__card--pendente"><span className="adm__card-num">{resumo.pendente}</span><span className="adm__card-label">Pendentes</span></div>
          <div className="adm__card adm__card--aprovada"><span className="adm__card-num">{resumo.aprovada}</span><span className="adm__card-label">Aprovadas</span></div>
          <div className="adm__card adm__card--reprovada"><span className="adm__card-num">{resumo.reprovada}</span><span className="adm__card-label">Reprovadas</span></div>
        </div>

        {/* Filtros */}
        <div className="adm__filtros">
          <div className="adm__tabs">
            {STATUS_TABS.map((t) => (
              <button
                key={t.value}
                className={`adm__tab ${statusFiltro === t.value ? 'is-active' : ''}`}
                onClick={() => setStatusFiltro(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="adm__filtros-right">
            <input
              className="input adm__busca"
              type="search"
              placeholder="Buscar por nome ou e-mail..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <button className="btn btn-maroon" onClick={exportarCSV} disabled={!visiveis.length}>
              Exportar CSV
            </button>
          </div>
        </div>

        {erro && <div className="alert alert-error adm__erro">{erro}</div>}

        {/* Tabela */}
        {loading ? (
          <Spinner dark center />
        ) : (
          <div className="adm__tabela-wrap">
            <table className="adm__tabela">
              <thead>
                <tr>
                  <th>Nome</th><th>Idade</th><th>Escolaridade</th><th>Telefone</th>
                  <th>E-mail</th><th>Dispositivos</th><th>Status</th><th>Data</th><th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {visiveis.length === 0 ? (
                  <tr><td colSpan="9" className="adm__vazio">Nenhuma inscrição encontrada.</td></tr>
                ) : (
                  visiveis.map((i) => (
                    <tr key={i.id}>
                      <td>
                        <button className="adm__nome" onClick={() => setDetalhe(i)}>{i.nome}</button>
                      </td>
                      <td>{i.idade}</td>
                      <td>{i.escolaridade}</td>
                      <td>{i.telefone}</td>
                      <td className="adm__email">{i.email}</td>
                      <td>{Array.isArray(i.dispositivos) ? i.dispositivos.join(', ') : '—'}</td>
                      <td><span className={`pill pill-${i.status}`}>{i.status}</span></td>
                      <td>{formatData(i.created_at)}</td>
                      <td>
                        <div className="adm__acoes">
                          <button
                            className="adm__btn adm__btn--ok"
                            title="Aprovar"
                            disabled={acaoId === i.id || i.status === 'aprovada'}
                            onClick={() => mudarStatus(i.id, 'aprovada')}
                          >
                            Aprovar
                          </button>
                          <button
                            className="adm__btn adm__btn--no"
                            title="Reprovar"
                            disabled={acaoId === i.id || i.status === 'reprovada'}
                            onClick={() => mudarStatus(i.id, 'reprovada')}
                          >
                            Reprovar
                          </button>
                          <button
                            className="adm__btn adm__btn--del"
                            title="Excluir"
                            disabled={acaoId === i.id}
                            onClick={() => setExcluindo(i)}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== Administradores do painel ===== */}
        <section className="adm__admins">
          <div className="adm__admins-head">
            <h2 className="adm__admins-title">Administradores</h2>
            <p className="adm__admins-sub">
              E-mails autorizados a acessar o painel. Eles precisam ter um usuário
              criado no Supabase (Authentication&nbsp;→&nbsp;Users) com o mesmo e-mail.
            </p>
          </div>

          <form className="adm__admins-form" onSubmit={adicionarAdminEmail}>
            <input
              className="input"
              type="email"
              placeholder="novo.admin@exemplo.com"
              value={novoAdmin}
              onChange={(e) => setNovoAdmin(e.target.value)}
              disabled={adminBusy}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={adminBusy || !novoAdmin.trim()}>
              {adminBusy ? <Spinner /> : 'Adicionar'}
            </button>
          </form>

          {adminErro && <div className="alert alert-error adm__erro">{adminErro}</div>}
          {adminMsg && <div className="alert alert-success adm__erro">{adminMsg}</div>}

          {adminsLoading ? (
            <Spinner dark center />
          ) : admins.length === 0 ? (
            <p className="adm__admins-vazio">Nenhum administrador gerenciável cadastrado.</p>
          ) : (
            <ul className="adm__admins-lista">
              {admins.map((email) => {
                const ehVoce = email === (user?.email || '').toLowerCase();
                return (
                  <li className="adm__admins-item" key={email}>
                    <span className="adm__admins-email">
                      {email}
                      {ehVoce && <span className="adm__admins-voce">você</span>}
                    </span>
                    <button
                      className="adm__btn adm__btn--del"
                      onClick={() => removerAdminEmail(email)}
                      disabled={adminBusy || ehVoce}
                      title={ehVoce ? 'Você não pode remover o seu próprio acesso' : 'Remover'}
                    >
                      Remover
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      {/* Modal de detalhes */}
      {detalhe && (
        <div className="adm__modal-overlay" onClick={() => setDetalhe(null)}>
          <div className="adm__modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm__modal-head">
              <h2>{detalhe.nome}</h2>
              <button className="adm__modal-x" onClick={() => setDetalhe(null)} aria-label="Fechar">×</button>
            </div>
            <dl className="adm__detalhes">
              <div><dt>Idade</dt><dd>{detalhe.idade}</dd></div>
              <div><dt>Escolaridade</dt><dd>{detalhe.escolaridade}</dd></div>
              <div><dt>Telefone</dt><dd>{detalhe.telefone}</dd></div>
              <div><dt>E-mail</dt><dd>{detalhe.email}</dd></div>
              <div><dt>Neurodivergente</dt><dd>{detalhe.neurodivergente || '—'}</dd></div>
              <div><dt>Alergias</dt><dd>{detalhe.alergias || '—'}</dd></div>
              <div><dt>Faixa salarial</dt><dd>{detalhe.faixa_salarial || '—'}</dd></div>
              <div><dt>Pessoas em casa</dt><dd>{detalhe.pessoas_em_casa ?? '—'}</dd></div>
              <div className="adm__detalhes-full"><dt>Dispositivos</dt><dd>{Array.isArray(detalhe.dispositivos) && detalhe.dispositivos.length ? detalhe.dispositivos.join(', ') : '—'}</dd></div>
              <div><dt>Status</dt><dd><span className={`pill pill-${detalhe.status}`}>{detalhe.status}</span></dd></div>
              <div><dt>Data</dt><dd>{formatData(detalhe.created_at)}</dd></div>
            </dl>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {excluindo && (
        <div className="adm__modal-overlay" onClick={() => setExcluindo(null)}>
          <div className="adm__modal adm__modal--sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="adm__modal-title">Excluir inscrição</h2>
            <p>Tem certeza que deseja excluir a inscrição de <strong>{excluindo.nome}</strong>? Essa ação não pode ser desfeita.</p>
            <div className="adm__modal-acoes">
              <button className="btn btn-outline" onClick={() => setExcluindo(null)} disabled={acaoId === excluindo.id}>Cancelar</button>
              <button className="adm__btn adm__btn--del adm__btn--lg" onClick={confirmarExclusao} disabled={acaoId === excluindo.id}>
                {acaoId === excluindo.id ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
