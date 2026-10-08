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
          <p>
            O cálculo usa o <strong className="text-ink">modo conservador</strong>: mostra a data mais cedo, contando
            só os dias não úteis com base verificada. Se um dia ainda não conferido pudesse mudar o resultado, o
            sistema mostra também a data alternativa e qual dia a causaria. Assim o resultado principal nunca depende
            de um dia ainda não conferido.
          </p>
          <p>
            Os resultados são conferidos por um segundo programa, escrito à parte e sem código em comum, em cenários
            fixos e em centenas de entradas aleatórias. Essa conferência mostra que o programa faz o que as regras
            dizem. Um revisor jurídico validou 113 dos 121 cenários e os dois prazos materiais (mandado de segurança e ação rescisória) em 07/10/2026.
            Ainda aguardam validação os de <strong className="text-ink">CLT e Juizados Especiais</strong>.
          </p>
        </section>

        <section className="space-y-3" id="fontes">
          <h2 className="font-serif text-2xl font-semibold text-ink">Fontes jurídicas</h2>
          <p>Cada regra é lida na versão compilada da lei, no Planalto, e registrada com a data da leitura.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-ink">Prazos processuais:</strong> CPC, arts. 219, 220, 224 e 231; CLT, arts. 775 e
              775-A; CPP, arts. 798 e 798-A; Lei 9.099/1995, art. 12-A; Resolução CNJ 244/2016 (suspensão em todos os
              órgãos); Lei 11.419/2006 e Resolução CNJ 455/2022 para a comunicação eletrônica.
            </li>
            <li>
              <strong className="text-ink">Prazos materiais:</strong> mandado de segurança (Lei 12.016/2009, art. 23) e
              ação rescisória (CPC, art. 975), com o Código Civil, arts. 132 e 207.
            </li>
            <li>
              <strong className="text-ink">Feriados nacionais:</strong> Lei 662/1949 (redação da Lei 10.607/2002), Lei
              6.802/1980 e Lei 14.759/2023. Na Justiça Federal e nos tribunais superiores vale também a Lei 5.010/1966,
              art. 62.
            </li>
            <li>
              <strong className="text-ink">Calendário dos tribunais:</strong> lido nos atos oficiais de cada tribunal,
              dia por dia. Quando o resultado traz o selo de calendário conferido, ele lista os atos e os links.
            </li>
            <li>
              <strong className="text-ink">Normas:</strong> texto do CPC conforme o{' '}
              <a
                className="text-brand-text underline underline-offset-2"
                href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105compilada.htm"
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
              <strong className="text-ink">Calendário conferido hoje:</strong> STF, STJ, TJSP, TJMG e TJAL, só para 2026.
              O TJRJ está carregado até outubro de 2026, sem selo. Nos demais tribunais entram os feriados nacionais, a Lei 5.010
              na Justiça Federal e o feriado estadual fixado em lei em PE, RS e GO; o resto fica como dia pendente e aparece só como
              data alternativa.
            </li>
            <li>
              <strong className="text-ink">Anos futuros:</strong> os tribunais divulgam o calendário do ano seguinte perto
              do fim do ano. Fora de 2026, o resultado não recebe o selo.
            </li>
            <li>
              <strong className="text-ink">Feriados municipais</strong> não são considerados. Feriado local deve ser
              comprovado no ato de interposição do recurso (CPC, art. 1.003, § 6º).
            </li>
            <li>
              <strong className="text-ink">Atos pontuais</strong> (indisponibilidade do sistema, suspensão por comarca,
              pontos facultativos de última hora) não são cadastrados, salvo os do calendário já lido.
            </li>
            <li>
              <strong className="text-ink">Carnaval, Quarta-feira de Cinzas e Corpus Christi:</strong> só contam como dia
              sem expediente onde o ato do tribunal os prevê. Nos outros, a data alternativa mostra o efeito.
            </li>
            <li>
              <strong className="text-ink">TST e TSE:</strong> a Lei 5.010 menciona os tribunais superiores, mas ainda
              falta ato próprio de cada um.
            </li>
            <li>
              <strong className="text-ink">Prazo em dobro:</strong> o sistema duplica o prazo quando você marca a opção;
              não verifica se a lei fixou prazo próprio para a parte.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-semibold text-ink">Estado de cada ferramenta</h2>
          <ul className="space-y-2">
            <li>
              <strong className="text-ink">PrazoZero:</strong> disponível, com as limitações acima.
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
