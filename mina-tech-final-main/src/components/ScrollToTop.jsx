import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Rola para o topo a cada troca de rota. Se houver hash (ex.: /#quem-somos),
 * rola até o elemento correspondente.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        // pequeno atraso para garantir que a página já renderizou
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
}
