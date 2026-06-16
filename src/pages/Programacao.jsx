import { useState } from 'react';
import imgSabado from '../assets/programacao_mulher_sabado.png';
import img1505 from '../assets/img_programacao_1505.jpg';
import img2805 from '../assets/img_programacao_2805.png';
import passada01 from '../assets/progamacoes_passadas01.png';
import passada02 from '../assets/progamacoes_passadas02.png';
import vitoria from '../assets/vitoria-da-rosa.png';
import mariaEduarda from '../assets/maria-eduarda.png';
import './Programacao.css';

const EVENTOS = [
  {
    data: '01/05',
    dataCompleta: '01/05/2026',
    dia: 'Sábado',
    titulo: 'Rodas de conversa',
    alimentacao: 'Coffe Break',
    local: 'Sebrae HUB — SC 401',
    horario: '13h45 às 17h45',
    descricao: 'Rodas de conversa com engenheiras e profissionais da tecnologia para inspirar e conectar as participantes.',
    img: imgSabado,
  },
  {
    data: '15/05',
    dataCompleta: '15/05/2026',
    dia: 'Sábado',
    titulo: 'Visita técnica',
    alimentacao: 'Coffe Break',
    local: 'Laboratórios da UFSC — Trindade',
    horario: '13h45 às 17h45',
    descricao: 'Ciência que você pode tocar: visita guiada aos laboratórios da universidade.',
    img: img1505,
  },
  {
    data: '28/05',
    dataCompleta: '28/05/2026',
    dia: 'Sábado',
    titulo: 'Mão na massa',
    alimentacao: 'Coffe Break',
    local: 'Neoway — Itacorubi',
    horario: '13h45 às 17h45',
    descricao: 'Oficina prática de tecnologia e inovação com mentoras voluntárias.',
    img: img2805,
  },
];

const DEPOIMENTOS = [
  {
    nome: 'Vitória da Rosa',
    foto: vitoria,
    texto: 'Minha jornada no Minatech, em 2022 e 2023, foi uma grande fonte de inspiração e crescimento. O programa me ajudou a descobrir caminhos na Engenharia e Tecnologia, contribuindo para minha formação em Engenharia de Software e para meu desenvolvimento profissional. Sou muito grata ao Minatech pelas oportunidades e por incentivar mulheres a irem cada vez mais longe.',
  },
  {
    nome: 'Maria Eduarda',
    foto: mariaEduarda,
    texto: 'Participar do projeto entre 2020 e 2022 transformou minha visão de futuro e fortaleceu minha confiança na programação. Hoje, cursando Ciência da Computação, reconheço o quanto essa experiência contribuiu para minha base acadêmica e profissional. Sou grata por iniciativas como essa, que incentivam mais mulheres a conquistarem e crescerem na tecnologia.',
  },
];

/* Ícones das linhas de detalhe */
const RowIcon = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const ICON_TEMA = <RowIcon><path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.5 8.5 0 0 1-3.6-.8L3 21l1.9-4.4A8.5 8.5 0 1 1 21 11.5z" /></RowIcon>;
const ICON_ALIM = <RowIcon><path d="M6 8h12v5a6 6 0 0 1-12 0z" /><path d="M18 9h2a2 2 0 0 1 0 4h-2" /><path d="M6 21h12" /></RowIcon>;
const ICON_LOCAL = <RowIcon><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></RowIcon>;
const ICON_HORA = <RowIcon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></RowIcon>;

export default function Programacao() {
  const [ativo, setAtivo] = useState(0);
  const evento = EVENTOS[ativo];

  const linhas = [
    { icon: ICON_TEMA, label: 'Tema', valor: evento.titulo },
    { icon: ICON_ALIM, label: 'Alimentação', valor: evento.alimentacao },
    { icon: ICON_LOCAL, label: 'Local', valor: evento.local },
    { icon: ICON_HORA, label: 'Horário', valor: evento.horario },
  ];

  return (
    <div className="prog">
      {/* ===== Eventos ===== */}
      <section className="section">
        <div className="container">
          <h1 className="page-title prog__title">Programação</h1>
          <p className="page-subtitle">Data de todos os eventos.</p>

          <div className="prog__layout">
            <ul className="prog__list">
              {EVENTOS.map((e, i) => (
                <li key={e.data}>
                  <button
                    className={`prog__item ${i === ativo ? 'is-active' : ''}`}
                    onClick={() => setAtivo(i)}
                  >
                    <span className="prog__item-date">{e.data}</span>
                    <span className="prog__item-info">
                      <strong>{e.titulo}</strong>
                      <small>{e.local}</small>
                    </span>
                    <img src={e.img} alt="" className="prog__item-thumb" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>

            <article className="prog__feature">
              <div className="prog__feature-img">
                <img src={evento.img} alt={`${evento.titulo} — ${evento.dataCompleta}`} />
              </div>
              <div className="prog__feature-info">
                <span className="prog__feature-dia">{evento.dia}</span>
                <span className="prog__feature-data">{evento.dataCompleta}</span>
                <ul className="prog__detalhes">
                  {linhas.map((l) => (
                    <li key={l.label}>
                      <span className="prog__detalhe-icon">{l.icon}</span>
                      <span className="prog__detalhe-text">
                        <small>{l.label}</small>
                        <strong>{l.valor}</strong>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ===== Programações passadas ===== */}
      <section className="section section--alt">
        <div className="container">
          <h2 className="page-title prog__title">Programações Passadas</h2>

          <div className="prog__passada">
            <img src={passada01} alt="Imersão no Laboratório de Química do IFSC" />
            <div className="prog__passada-text">
              <p>
                Nossa imersão no Laboratório de Química do IFSC, conduzida pelas professoras
                Berenice e Gisele, foi uma vitrine sobre a versatilidade da Engenharia Química.
                Além de explorarmos as áreas de atuação e as crescentes oportunidades do mercado,
                vivenciamos a prática da transformação e o descarte correto de efluentes.
              </p>
              <a href="https://www.instagram.com/minatech.brasil/" target="_blank" rel="noopener noreferrer" className="btn btn-maroon">
                Veja mais
              </a>
            </div>
          </div>

          <div className="prog__passada prog__passada--rev">
            <div className="prog__passada-text">
              <p>
                Com a participação especial do Time Curie, do Senai, e da professora Daniela
                Suzuki, acompanhada por suas alunas graduandas e doutorandas da UFSC, vivenciamos
                uma troca de experiências. As atividades mostraram compartilhamento de trajetórias
                reais e conhecimentos técnicos avançados nas áreas de engenharia e tecnologia.
              </p>
              <a href="https://www.instagram.com/minatech.brasil/" target="_blank" rel="noopener noreferrer" className="btn btn-maroon">
                Veja mais
              </a>
            </div>
            <img src={passada02} alt="Troca de experiências com o Time Curie e a UFSC" />
          </div>
        </div>
      </section>

      {/* ===== Depoimentos ===== */}
      <section className="section">
        <div className="container">
          <h2 className="page-title prog__title">Depoimentos de ex-alunas</h2>
          <div className="prog__depos">
            {DEPOIMENTOS.map((d, i) => (
              <figure className={`prog__depo ${i % 2 === 1 ? 'prog__depo--rev' : ''}`} key={d.nome}>
                <img src={d.foto} alt={d.nome} className="prog__depo-foto" />
                <div className="prog__depo-text">
                  <strong className="prog__depo-nome">{d.nome}</strong>
                  <blockquote>{d.texto}</blockquote>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}