import tatiana from '../assets/tatiana-takimoto.png';
import logoCorali from '../assets/logo_corali.png';
import logoEsf from '../assets/engenheiros_sem_fronteiras_logo.png';
import p1 from '../assets/parceria01.png';
import p2 from '../assets/parceria02.png';
import p3 from '../assets/parceria03.png';
import p4 from '../assets/parceria04.png';
import p5 from '../assets/parceria05.png';
import p6 from '../assets/parceria06.png';
import './Oscs.css';

export default function Oscs() {
  return (
    <div className="oscs">
      {/* ===== Coordenadora + equipe ===== */}
      <section className="section">
        <div className="container oscs__intro">
          <div className="oscs__coord">
            <img src={tatiana} alt="Tatiana Takimoto" />
            <div className="oscs__coord-card">
              <strong>Tatiana Takimoto</strong>
              <span>Fundadora e coordenadora geral</span>
            </div>
          </div>

          <div className="oscs__intro-text">
            <h1 className="page-title">Conheça a equipe</h1>
            <p>
              Somos uma equipe formada por <strong>11 mulheres</strong> dedicadas a abrir
              caminhos para outras mulheres nos setores de tecnologia e engenharia. Nosso foco
              é acolher aquelas em situação de vulnerabilidade, oferecendo suporte, capacitação
              e as oportunidades necessárias para que ocupem seus espaços de direito e cresçam
              com excelência no mercado de trabalho.
            </p>
          </div>
        </div>
      </section>

      {/* ===== OSCs parceiras ===== */}
      <section className="section section--alt">
        <div className="container oscs__cards">
          <article className="oscs__osc">
            <p>
              A <strong>Corali</strong> é uma OSC dedicada a transformar a realidade de mulheres
              em situação de vulnerabilidade, promovendo sua inclusão no ecossistema de
              tecnologia e inovação.
            </p>
            <img src={logoCorali} alt="Logo Corali" className="oscs__osc-logo" />
          </article>

          <article className="oscs__osc oscs__osc--rev">
            <img src={logoEsf} alt="Logo Engenheiros sem Fronteiras Florianópolis" className="oscs__osc-logo" />
            <p>
              A <strong>Engenheiros Sem Fronteiras (Núcleo Florianópolis)</strong> é uma OSC que
              utiliza o conhecimento técnico da engenharia para promover transformações sociais
              e ambientais.
            </p>
          </article>
        </div>
      </section>

      {/* ===== Parcerias ===== */}
      <section className="section">
        <div className="container">
          <h2 className="page-title">Parcerias</h2>
          <p className="page-subtitle">Empresas e instituições que apoiam o projeto.</p>
          <div className="oscs__parceiros-top">
            <div className="oscs__parceiro"><img src={p1} alt="CREA-SC" /></div>
            <div className="oscs__parceiro"><img src={p2} alt="Neoway" /></div>
          </div>
          <div className="oscs__parceiros-bot">
            <div className="oscs__parceiro"><img src={p3} alt="HOGAR" /></div>
            <div className="oscs__parceiro"><img src={p4} alt="Be.Diverse" /></div>
            <div className="oscs__parceiro"><img src={p5} alt="Morro do Silício" /></div>
            <div className="oscs__parceiro"><img src={p6} alt="meSalva!" /></div>
          </div>
        </div>
      </section>
    </div>
  );
}
