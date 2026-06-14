//importando img das pasta
import iconLocal from '../assets/local-florianopolis.png';
import iconEmail from '../assets/email-minatech.png';
import iconPhone from '../assets/telefone.png';
import iconInsta from '../assets/instagram-icon.png';
import './Footer.css';

//link do insta
const INSTAGRAM_URL = 'https://www.instagram.com/minatech.brasil/';


//footer com informações de contato
export default function Footer() {
  return (
    <footer className="footer" id="contato">
      <div className="footer__inner container">
        <h2 className="footer__title">Contato</h2>

        <div className="footer__grid">
          <div className="footer__item">
            <img src={iconLocal} alt="Florianópolis-SC" className="footer__icon" />
          </div>

          <a className="footer__item" href="mailto:minatech.floripa@gmail.com">
            <img src={iconEmail} alt="minatech.floripa@gmail.com" className="footer__icon" />
          </a>

          <a className="footer__item" href="https://wa.me/5548991375245" target="_blank" rel="noopener noreferrer">
            <img src={iconPhone} alt="(48) 99137-5245" className="footer__icon" />
          </a>

          <a
            className="footer__insta"
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram do Minatech"
          >
            <img src={iconInsta} alt="" className="footer__insta-icon" aria-hidden="true" />
            <span>Aproveite para nos acompanhar no nosso instagram!!!</span>
          </a>
        </div>

        <p className="footer__copy">© {new Date().getFullYear()} Minatech · Florianópolis-SC</p>
      </div>
    </footer>
  );
}
