/** Símbolo abstrato de estrutura e raciocínio (plano §5.2): três pontos conectados em ramificação. */
export function Simbolo({ tamanho = 30 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="rgb(var(--brand))" />
      <g stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M11 9.5v13" />
        <path d="M11 16h9" />
      </g>
      <g fill="#fff">
        <circle cx="11" cy="9" r="2.6" />
        <circle cx="11" cy="23" r="2.6" />
        <circle cx="21.5" cy="16" r="2.6" />
      </g>
    </svg>
  );
}

/** `grande` é o do cabeçalho; o padrão serve ao rodapé e a outros cantos. */
export default function Logo({ grande = false }: { grande?: boolean }) {
  return (
    <span className={`inline-flex items-center ${grande ? 'gap-3' : 'gap-2.5'}`}>
      <Simbolo tamanho={grande ? 40 : 30} />
      <span className={`${grande ? 'text-xl tracking-[0.16em]' : 'text-[15px] tracking-[0.18em]'} font-semibold text-ink`}>RATIONE</span>
    </span>
  );
}
