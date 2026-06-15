import { Link } from 'react-router-dom';
import fundoHome from '../assets/fundo-home.png';
import quemSomosImg from '../assets/quem-somos-image.png';
import iconNeuro from '../assets/neurodivergentes.png';
import iconEstudante from '../assets/estudante.png';
import iconMulheres from '../assets/mulheres.png';
import iconLgbt from '../assets/lgbt.png';
import './Home.css';

const ACOLHE = [
  { icon: iconNeuro, label: 'Neurodivergentes' },
  { icon: iconEstudante, label: 'Estudantes' },
  { icon: iconMulheres, label: 'Mulheres' },
  { icon: iconLgbt, label: 'LGBTQIA+' },
];

const PALAVRAS = [
  'Inovação', 'STEAM', 'Engenharia', 'Tecnologia', 'Robótica',
  'Programação', 'Ciência', 'Matemática', 'Criatividade', 'Futuro',
];

export default function Home() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="hero" style={{ backgroundImage: `url(${fundoHome})` }}>
        <div className="hero__overlay" />
        <span className="hero__watermark" aria-hidden="true">Minatech</span>
        <div className="hero__inner container">
          <div className="hero__text fade-in-up">
            <span className="hero__kicker">— Jornada Minatech · Florianópolis</span>
            <h1 className="hero__title">
              Tecnologia<br />feita por <em>meninas,<br />para meninas</em>
            </h1>
            <div className="hero__card">
              <p>
                Um programa gratuito que inspira jovens meninas de escolas públicas a
                explorar engenharia e tecnologia, porque o futuro também é delas!
              </p>
              <div className="hero__actions">
                <Link to="/inscricao" className="btn btn-maroon">Participar</Link>
                <Link to="/doacao" className="btn btn-maroon hero__btn-alt">Apoie o projeto</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="stats">
        <div className="container stats__inner">
          <p className="stats__impacto">
            mais de <strong>150</strong> meninas impactadas na Grande Florianópolis!
          </p>
          <div className="stats__badge" aria-label="100% gratuito">
            <strong>100%</strong>
            <span>GRATUITO</span>
          </div>
        </div>
      </section>

      {/* ===== MARQUEE DE PALAVRAS-CHAVE ===== */}
      <div className="kw" aria-hidden="true">
        <div className="kw__track">
          {[...PALAVRAS, ...PALAVRAS].map((p, i) => (
            <span className="kw__item" key={i}>{p}<span className="kw__sep">✦</span></span>
          ))}
        </div>
      </div>

      {/* ===== O MINATECH ACOLHE ===== */}
      <section className="section acolhe">
        <div className="container">
          <div className="acolhe__panel">
            <h2 className="acolhe__title">O Minatech acolhe</h2>
            <div className="acolhe__cols">
              {ACOLHE.map((item) => (
                <div className="acolhe__col" key={item.label}>
                  <img src={item.icon} alt={item.label} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== QUEM SOMOS ===== */}
      <section className="section section--alt quem" id="quem-somos">
        <div className="container quem__grid">
          <div className="quem__text">
            <h2 className="page-title">Quem somos</h2>
            <p className="quem__sub">Corali e Engenheiros sem Fronteiras — núcleo Florianópolis</p>
            <p>
              A <strong>Corali</strong> e os <strong>Engenheiros sem Fronteiras
              (Florianópolis)</strong> se uniram para organizar a Jornada Minatech. Temos o
              sonho de inspirar meninas a conhecerem e seguirem carreiras tecnológicas,
              mostrando que elas têm capacidade e que essas profissões não são só para meninos.
            </p>
            <p>
              Para isso, promovemos oficinas de lógica, matemática e física, junto com talks
              sobre profissões, soft skills, empreendedorismo, diversidade e empoderamento
              feminino.
            </p>
          </div>

          <div className="quem__img">
            <img src={quemSomosImg} alt="Participantes do Minatech em um encontro" />
          </div>
        </div>
      </section>
    </>
  );
}
