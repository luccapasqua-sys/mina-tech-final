import { useState } from 'react';
import './Faq.css';

const PERGUNTAS = [
  {
    q: 'É possível ganhar um certificado?',
    a: 'Sim! Participantes com mais de 75% de presença recebem o certificado da Jornada Minatech e ainda concorrem a um sorteio de brindes.',
  },
  {
    q: 'Onde será a Jornada Minatech?',
    a: 'Nossa base é na Neoway, em Itacorubi, Florianópolis. Outras atividades incluem visitas a laboratórios e a empresas de tecnologia da cidade.',
  },
  {
    q: 'Precisa da autorização de responsáveis?',
    a: 'Sim. Menores de idade precisam entregar um termo de responsabilidade assinado pelo responsável legal.',
  },
  {
    q: 'Como os horários e a organização do dia vão ser informados?',
    a: 'Todas as participantes serão incluídas em um grupo de WhatsApp com todas as informações e o esclarecimento de dúvidas.',
  },
];

export default function Faq() {
  const [aberto, setAberto] = useState(null);

  return (
    <section className="section faq">
      <div className="container">
        <h1 className="page-title faq__title">Perguntas mais frequentes</h1>

        <div className="faq__list">
          {PERGUNTAS.map((item, i) => {
            const isOpen = aberto === i;
            return (
              <div className={`faq__item ${isOpen ? 'is-open' : ''}`} key={i}>
                <button
                  className="faq__btn"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-btn-${i}`}
                  onClick={() => setAberto(isOpen ? null : i)}
                >
                  <span>{item.q}</span>
                  <span className="faq__chevron" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>
                <div
                  className="faq__panel"
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-btn-${i}`}
                  style={{ maxHeight: isOpen ? '240px' : '0' }}
                >
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}