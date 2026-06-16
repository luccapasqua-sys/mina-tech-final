/** "dark" para fundo claro; "center" para centralizar. */
export default function Spinner({ dark = false, center = false }) {
  const cls = ['spinner', dark ? 'spinner-dark' : '', center ? 'spinner-center' : '']
    .filter(Boolean)
    .join(' ');
  return <span className={cls} role="status" aria-label="Carregando" />;
}
