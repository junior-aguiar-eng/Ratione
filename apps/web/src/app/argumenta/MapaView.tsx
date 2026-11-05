import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import type { VerificacaoDaCitacao } from '../../lib/argumenta/verificarCitacoes';
import type { MapaDaDecisao } from '../../lib/argumenta/mapa';
import { CATEGORIA, FUNDAMENTO, RESULTADO } from '../../lib/argumenta/rotulos';
import SeloCitacao from './SeloCitacao';

/**
 * F5-03: a aba "Mapa". Mostra, por questão, o raciocínio na ordem em que ele se lê (fatos e provas, normas, doutrina, precedentes, argumento) até a
 * conclusão, e as normas e precedentes citados na decisão inteira. Só apresentação: os dados vêm de `lib/argumenta/mapa.ts`, que não chama o modelo.
 */
interface Props {
  mapa: MapaDaDecisao;
  selos: Map<string, VerificacaoDaCitacao>;
  /** Devolve o texto com os dados pessoais restaurados (só na tela). */
  r: (texto: string) => string;
  /** O link "Ver no texto" dos parágrafos de origem. */
  ref_: (paragrafos: readonly number[]) => ReactNode;
  carregandoFundamentos: boolean;
  fundamentosProntos: boolean;
}

export default function MapaView({ mapa, selos, r, ref_, carregandoFundamentos, fundamentosProntos }: Props) {
  /** `questaoId` leva o caso junto quando a citação é aberta no NormaViva ou no TeseMap. */
  const selo = (citacao: string, questaoId?: string) => {
    const v = citacao.trim() ? selos.get(citacao.trim()) : undefined;
    return v ? <SeloCitacao verificacao={v} questaoId={questaoId} /> : null;
  };

  return (
    <>
      <p className="text-base text-ink-soft leading-relaxed">
        O mapa reorganiza, na ordem do raciocínio, o que foi identificado em cada questão: fatos e provas, normas, doutrina, precedentes e o raciocínio
        da decisão, até a conclusão. Ele não avalia se a decisão está certa.
      </p>
      {carregandoFundamentos && <p className="text-sm text-ink-mute">Identificando os fundamentos…</p>}

      {mapa.autoridades.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-ink">Normas e precedentes citados</h3>
          <ul className="divide-y divide-line border-y border-line">
            {mapa.autoridades.map(a => (
              <li key={`${a.tipo}|${a.citacao}`} className="flex flex-col gap-1 py-3">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <Badge variant={FUNDAMENTO[a.tipo].tom} className="w-24 justify-center shrink-0">
                    {FUNDAMENTO[a.tipo].rotulo}
                  </Badge>
                  <span className="text-base text-ink">{r(a.citacao)}</span>
                  <span className="text-sm text-ink-soft">
                    {a.questoes.length === 1 ? `na questão ${a.questoes[0]}` : `em ${a.questoes.length} questões (${a.questoes.join(', ')})`}
                  </span>
                </div>
                {selo(a.citacao, mapa.questoes[a.questoes[0] - 1]?.questaoId)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {mapa.questoes.map((q, i) => (
        <section key={q.questaoId} className={`flex flex-col gap-4 ${i > 0 || mapa.autoridades.length > 0 ? 'border-t border-line pt-8' : ''}`}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="eyebrow">
              Questão {i + 1} · {CATEGORIA[q.categoria]}
            </span>
            <Badge variant={RESULTADO[q.resultado].tom}>{RESULTADO[q.resultado].rotulo}</Badge>
          </div>
          <h3 className="font-serif text-xl font-semibold text-ink leading-snug">{r(q.enunciado)}</h3>
          <ol className="flex flex-col">
            {q.camadas.map(c => (
              <li key={c.id} className="flex flex-col gap-2 border-l-2 border-line pl-4 pb-5">
                <span className="text-sm font-semibold text-ink-soft">{c.rotulo}</span>
                <ul className="flex flex-col gap-3">
                  {c.passos.map((p, k) => (
                    <li key={k} className="flex flex-col gap-0.5">
                      <p className="text-base text-ink leading-snug">{r(p.descricao)}</p>
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        {p.citacao && <span className="text-sm text-ink-soft">{r(p.citacao)}</span>}
                        {ref_(p.paragrafos)}
                      </div>
                      {selo(p.citacao, q.questaoId)}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            <li className="flex flex-col gap-1 border-l-2 border-brand pl-4">
              <span className="text-sm font-semibold text-brand-text">Conclusão (tese da questão)</span>
              <p className="text-base text-ink leading-snug">{r(q.conclusao)}</p>
              {ref_(q.paragrafosConclusao)}
            </li>
          </ol>
          {fundamentosProntos && q.totalDePassos === 0 && <p className="text-sm text-ink-mute">Nenhum fundamento identificado para esta questão.</p>}
        </section>
      ))}
    </>
  );
}
