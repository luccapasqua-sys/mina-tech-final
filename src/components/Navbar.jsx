import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Navbar.css';

const LINKS = [
  { to: '/#quem-somos', label: 'Quem somos', hash: true },
  { to: '/oscs', label: 'OSCS' },
  { to: '/inscricao', label: 'Inscrição' },
  { to: '/programacao', label: 'Programação' },
  { to: '/faq', label: 'FAQ' },
  { to: '/doacao', label: 'Contato' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fecha o menu mobile ao trocar de rota
  useEffect(() => setOpen(false), [location]);

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__inner">
        <Link to="/" className="nav__logo" aria-label="Minatech — página inicial">
          <img src={logo} alt="Minatech" />
        </Link>

        <nav className="nav__links" aria-label="Menu principal">
          {LINKS.map((l) =>
            l.hash ? (
              <Link key={l.to} to={l.to} className="nav__link">
                {l.label}
              </Link>
            ) : (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
              >
                {l.label}
              </NavLink>
            )
          )}
        </nav>

        <button
          className={`nav__burger ${open ? 'is-open' : ''}`}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav className={`nav__mobile ${open ? 'is-open' : ''}`} aria-label="Menu mobile">
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="nav__mobile-link" onClick={() => setOpen(false)}>
            {l.label}
          </Link>
        ))}
        <Link to="/inscricao" className="btn btn-primary nav__mobile-cta" onClick={() => setOpen(false)}>
          Inscreva-se já
        </Link>
      </nav>
    </header>
  );
}
