import PageHeader from '../../components/PageHeader';

export const metadata = { title: 'Termos de uso | Ratione' };

export default function TermosPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Transparência" title="Termos de uso" description="Condições gerais de uso das ferramentas." />
      <div className="space-y-5 text-base text-ink-soft leading-relaxed">
        <p>
          O Ratione é um instrumento de apoio ao trabalho jurídico. Os resultados não constituem aconselhamento
          jurídico e não substituem a análise do profissional responsável.
        </p>
        <p>
          A tempestividade de qualquer ato deve ser conferida pelo usuário no calendário do tribunal e nos atos
          normativos aplicáveis. As limitações conhecidas estão descritas em{' '}
          <a href="/metodologia" className="text-brand-text underline underline-offset-2">
            Metodologia e limitações
          </a>
          .
        </p>
        <p>
          Os textos normativos e os precedentes exibidos devem ser conferidos na fonte oficial antes de serem citados em
          peças ou decisões.
        </p>
      </div>
    </div>
  );
}
