import PageHeader from '../../components/PageHeader';
import Notice from '../../components/Notice';

export const metadata = { title: 'Metodologia | Ratione' };

export default function MetodologiaPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Transparência"
        title="Metodologia e limitações"
        description="Como os resultados são produzidos, de onde vêm as informações e o que ainda não está coberto."
      />

      <div className="space-y-12 text-base text-ink-soft leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-semibold text-ink">Cálculo verificável</h2>
          <p>
            O prazo final é calculado por regras fixas, aplicadas dia a dia: a mesma entrada produz sempre o mesmo
            resultado. Cada dia contado ou excluído aparece na memória de cálculo, com o fundamento legal
            correspondente. Nenhuma estimativa é feita por inteligência artificial.
          </p>
        </section>

        <section className="space-y-3" id="fontes">
          <h2 className="font-serif text-2xl font-semibold text-ink">Fontes jurídicas</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-ink">Prazos:</strong> CPC, arts. 219, 220 e 224; CLT, art. 775; CPP, art. 798;
              Lei 11.419/2006 e Resolução CNJ 455/2022 para a comunicação eletrônica.
            </li>
            <li>
              <strong className="text-ink">Feriados:</strong> leis federais e estaduais catalogadas, com a lei
              instituidora indicada em cada dia excluído; Lei 5.010/1966 para a Justiça Federal e os tribunais
              superiores.
            </li>
            <li>
              <strong className="text-ink">Normas:</strong> texto do CPC conforme o{' '}
              <a
                className="text-brand-text underline underline-offset-2"
                href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Planalto
              </a>
              .
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-ink">O que ainda não está coberto</h2>
          <Notice tom="warn" titulo="Confira sempre o calendário do tribunal">
            O resultado é um instrumento de apoio e não dispensa a conferência dos atos do tribunal.
          </Notice>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-ink">Feriados municipais</strong> não são considerados. Feriado local deve ser
              comprovado no ato de interposição do recurso (CPC, art. 1.003, § 6º).
            </li>
            <li>
              <strong className="text-ink">Atos específicos de cada tribunal</strong> (portarias, suspensões,
              indisponibilidade do sistema) ainda não são cadastrados.
            </li>
            <li>
              <strong className="text-ink">Carnaval, Quarta-feira de Cinzas e Corpus Christi</strong> são tratados
              como dias não úteis em todos os tribunais. A prática varia: verifique o calendário do seu tribunal.
            </li>
            <li>
              <strong className="text-ink">Tribunais:</strong> o catálogo contém os tribunais superiores, os TRFs e um
              conjunto de Tribunais de Justiça. Outros tribunais serão acrescentados.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-semibold text-ink">Estado de cada ferramenta</h2>
          <ul className="space-y-2">
            <li>
              <strong className="text-ink">PrazoZero:</strong> disponível.
            </li>
            <li>
              <strong className="text-ink">NormaViva:</strong> prévia, com um conjunto inicial de dispositivos do CPC.
              Confira o texto na fonte oficial antes de citar.
            </li>
            <li>
              <strong className="text-ink">TeseMap:</strong> prévia, com dois temas catalogados.
            </li>
            <li>
              <strong className="text-ink">Argumenta:</strong> demonstração com uma decisão ilustrativa. O envio de
              documentos ainda não está disponível.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
