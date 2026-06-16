import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../../components/Spinner.jsx';
import logo from '../../assets/logo.png';
import './admin.css';

export default function Login() {
  const { signIn, isAuthenticated, loading, isDemo, demoCredentials } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (!loading && isAuthenticated) return <Navigate to="/admin/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await signIn(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setErro(err.message || 'Não foi possível entrar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login">
      <form className="login__card" onSubmit={handleSubmit}>
        <Link to="/" className="login__logo">
          <img src={logo} alt="Minatech" />
        </Link>
        <h1 className="login__title">Painel administrativo</h1>
        <p className="login__sub">Entre para gerenciar as inscrições.</p>

        <div className="field">
          <label htmlFor="l-email">E-mail</label>
          <input
            id="l-email"
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@minatech.org"
            autoComplete="username"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="l-password">Senha</label>
          <input
            id="l-password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        {erro && <div className="alert alert-error">{erro}</div>}

        <button type="submit" className="btn btn-primary btn-block" disabled={enviando}>
          {enviando ? <Spinner /> : 'Entrar'}
        </button>

        {isDemo && (
          <div className="login__demo">
            <strong>Modo demonstração</strong>
            <span>e-mail: {demoCredentials.email}</span>
            <span>senha: {demoCredentials.password}</span>
          </div>
        )}
      </form>
    </div>
  );
}
