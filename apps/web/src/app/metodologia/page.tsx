import PageHeader from '../../components/PageHeader';
import Notice from '../../components/Notice';
import { CALENDARIO_VERIFICADO, CENARIOS_VALIDADOS, CENARIOS_VALIDADOS_EM } from '@ratione/prazozero';
import { dataCurta } from '../../lib/datas';

export const metadata = { title: 'Metodologia | Ratione' };

/** "TJRS (2026 e 2027)": agrupa os tribunais pelos anos cobertos, a partir do que o código realmente carrega. */
function resumoCalendarioConferido(): string {
  const porAnos = new Map<string, string[]>();
  for (const [tribunal, c] of Object.entries(CALENDARIO_VERIFICADO).sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))) {
    const anos = [...c.anos].sort().join(' e ');
    porAnos.set(anos, [...(porAnos.get(anos) ?? []), tribunal]);
  }
  return [...porAnos.entries()].map(([anos, lista]) => `${lista.join(', ')} (${anos})`).join('; ');
}

export default function MetodologiaPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Transparência"
        title="Metodologia e limitações"
        description="Como os resultados são produzidos, de onde vêm as informações e o que ainda não está coberto."
      />

      <div className="flex flex-col gap-12 text-base text-ink-soft leading-relaxed">
        <section className="flex flex-col gap-3">
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
            dizem. Um revisor jurídico validou os {CENARIOS_VALIDADOS} cenários (o último em {dataCurta(CENARIOS_VALIDADOS_EM)}) e os dois prazos materiais (mandado de segurança e ação rescisória).
            A validação cobre a <strong className="text-ink">regra de contagem</strong>; o calendário de cada tribunal segue o que está descrito abaixo.
          </p>
        </section>

        <section className="flex flex-col gap-3" id="fontes">
          <h2 className="font-serif text-2xl font-semibold text-ink">Fontes jurídicas</h2>
          <p>Cada regra é lida na versão compilada da lei, no Planalto, e registrada com a data da leitura.</p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
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
              <strong className="text-ink">Normas:</strong> texto das 28 normas federais (Constituição, códigos e principais
              leis) conforme a versão compilada ou a página anotada (descartados os trechos tachados) no{' '}
              <a
                className="text-brand-text underline underline-offset-2"
                href="https://www.planalto.gov.br/ccivil_03/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Planalto
              </a>
              .
            </li>
            <li>
              <strong className="text-ink">Jurisprudência:</strong> precedentes qualificados (Dados Abertos do STJ, licença
              CC BY) e súmulas do STJ; temas de repercussão geral, súmulas e ações de controle concentrado (Portal da
              Transparência e base de jurisprudência do STF), com as fontes e datas de leitura registradas em cada registro.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl font-semibold text-ink">O que ainda não está coberto</h2>
          <Notice tom="warn" titulo="Confira sempre o calendário do tribunal">
            O resultado é um instrumento de apoio e não dispensa a conferência dos atos do tribunal.
          </Notice>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong className="text-ink">Calendário conferido contra o ato do tribunal:</strong> {resumoCalendarioConferido()}.
              O TJRJ (ocorrências até outubro de 2026 e regras da Lei estadual 10.633/2024), o TRT13 e o TRT18 têm carga
              parcial, sem selo. Nos demais casos (como o TSE e anos ainda não conferidos), entram os feriados nacionais, a
              Lei 5.010 na Justiça Federal e nos tribunais superiores e os feriados estaduais já conferidos por lei; o resto fica como dia pendente e aparece só como data
              alternativa.
            </li>
            <li>
              <strong className="text-ink">Anos futuros:</strong> os tribunais divulgam o calendário do ano seguinte perto
              do fim do ano. Fora dos anos listados acima, o resultado não recebe o selo.
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
              <strong className="text-ink">TSE e férias no TST:</strong> a Lei 5.010 menciona os tribunais superiores; o
              calendário de 2026 do TST está conferido pelo Ato Conjunto TST.CSJT.GP nº 5/2026 (sem modelar as férias
              coletivas de julho dos ministros), e ainda falta ato próprio do TSE.
            </li>
            <li>
              <strong className="text-ink">Prazo em dobro:</strong> o sistema duplica o prazo quando você marca a opção;
              não verifica se a lei fixou prazo próprio para a parte.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-2xl font-semibold text-ink">Estado de cada ferramenta</h2>
          <ul className="flex flex-col gap-2">
            <li>
              <strong className="text-ink">PrazoZero:</strong> disponível, com as limitações acima.
            </li>
            <li>
              <strong className="text-ink">NormaViva:</strong> disponível, com 28 normas federais (29.294 dispositivos da
              Constituição, códigos e principais leis), consulta por citação, norma ou assunto, remissões entre artigos,
              avisos de vigência futura, precedentes ligados ao dispositivo e 57 redações anteriores conferidas em 25 normas
              (onde não há redação anterior validada, informa que o texto anterior não está na base). Confira sempre o texto
              na fonte oficial antes de citar.
            </li>
            <li>
              <strong className="text-ink">TeseMap:</strong> disponível, com 7.734 nós de fontes oficiais (1.150 precedentes
              qualificados e 646 súmulas em vigor do STJ; 1.141 temas de repercussão geral, 785 súmulas e 4.008 ações de
              controle concentrado com mérito do STF; além de 4 dispositivos do grafo mínimo) e 5 relações validadas por
              revisão jurídica (Tema 1.076/STJ), com ligações registradas pelos tribunais, devoluções à origem no STF e
              atalhos para o NormaViva. Confira sempre a tese na fonte oficial antes de citar.
            </li>
            <li>
              <strong className="text-ink">Argumenta:</strong> prévia. Analisa uma decisão colada como texto (estrutura,
              questões, conclusões, fundamentos com acesso aos trechos originais e mapa argumentativo montado por código),
              com IA e com os dados pessoais trocados por marcadores no navegador antes do envio; o texto e o resultado ficam
              só na aba do navegador e não são guardados. As citações reconhecidas de normas e precedentes são conferidas por código contra
              o NormaViva e o TeseMap (recebem selo de encontrada na base, não localizada na base ou fora da base — o selo verifica
              apenas a existência na base, sem atestar acerto jurídico) e permitem navegar até os dispositivos e precedentes
              relacionados. Avaliado em um corpus de 30 decisões públicas com gabarito validado. O envio de arquivos
              (PDF/DOCX), a detecção de fragilidades da fundamentação e o salvamento de análises ainda não estão habilitados
              na interface.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
