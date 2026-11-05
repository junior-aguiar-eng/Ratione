'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { prepararDecisao, restaurar } from '@ratione/argumenta';
import { TRIBUNAIS_BRASIL } from '@ratione/core';
import { Button } from '@/components/ui/button';
import { campoClasses } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSessao } from '../../lib/useSessao';
import { dataCurta } from '../../lib/datas';
import type { SaidaIntimacao } from '../../lib/ia/tarefas/lerIntimacao';

const ROTULO_DO_EVENTO: Record<Exclude<SaidaIntimacao['tipoEvento'], 'nao_informado'>, string> = {
  disponibilizacao_dje: 'Disponibilização no Diário de Justiça eletrônico',
  publicacao: 'Publicação já considerada no Diário',
  intimacao_portal: 'Intimação eletrônica no portal do tribunal',
  carga_ou_audiencia: 'Ciência pessoal, em audiência ou por mandado'
};

/** O que a leitura entrega ao formulário do PrazoZero: só o que o texto trouxe. */
export interface DadosDaIntimacao {
  tribunalId?: string;
  tipoEvento?: Exclude<SaidaIntimacao['tipoEvento'], 'nao_informado'>;
  dataEvento?: string;
}

type Estado =
  | { tipo: 'ocioso' }
  | { tipo: 'lendo' }
  | { tipo: 'lido'; saida: SaidaIntimacao; restaurar: (s: string) => string; aplicado: boolean }
  | { tipo: 'erro'; mensagem: string };

const MAX_CARACTERES = 8_000;

/**
 * "Preencher pela intimação" (tarefa "ler-intimacao" do catálogo de IA): a pessoa cola a intimação, o navegador troca nomes e números por marcadores, e a
 * IA só **extrai** tribunal, tipo e data do evento. A pessoa confere cada campo, com o trecho do texto de onde ele veio, e só então usa os dados; o cálculo
 * do prazo continua sendo do motor do PrazoZero. Só quando a pessoa clica; nada é guardado.
 */
export default function LerIntimacao({ onUsar }: { onUsar: (dados: DadosDaIntimacao) => void }) {
  const { usuario, carregando, contaDisponivel } = useSessao();
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState<Estado>({ tipo: 'ocioso' });

  // O campo só existe quando a instalação ligou a funcionalidade no build (NEXT_PUBLIC_IA_INTIMACAO=sim)
  if (process.env.NEXT_PUBLIC_IA_INTIMACAO !== 'sim' || !contaDisponivel || carregando) return null;

  const ler = async () => {
    const preparada = prepararDecisao(texto);
    if (preparada.paragrafos.length === 0) return;
    setEstado({ tipo: 'lendo' });
    try {
      const resposta = await fetch('/api/ia/ler-intimacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entrada: { paragrafos: preparada.paragrafos } })
      });
      const corpo = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setEstado({ tipo: 'erro', mensagem: corpo.mensagem ?? 'Não foi possível ler a intimação agora.' });
        return;
      }
      setEstado({ tipo: 'lido', saida: corpo.resposta as SaidaIntimacao, restaurar: s => restaurar(s, preparada.substituicoes), aplicado: false });
    } catch {
      setEstado({ tipo: 'erro', mensagem: 'Sem conexão. Tente de novo.' });
    }
  };

  const usar = () => {
    if (estado.tipo !== 'lido') return;
    const s = estado.saida;
    const dados: DadosDaIntimacao = {};
    if (s.tribunal && Object.hasOwn(TRIBUNAIS_BRASIL, s.tribunal)) dados.tribunalId = s.tribunal;
    if (s.tipoEvento !== 'nao_informado') dados.tipoEvento = s.tipoEvento;
    if (s.dataEvento) dados.dataEvento = s.dataEvento;
    onUsar(dados);
    setEstado({ ...estado, aplicado: true });
  };

  const achou = estado.tipo === 'lido' && (estado.saida.tribunal || estado.saida.dataEvento || estado.saida.tipoEvento !== 'nao_informado');

  return (
    <details className="group text-sm" data-testid="ler-intimacao">
      <summary className="inline-flex w-fit cursor-pointer items-center gap-2 text-brand-text hover:underline underline-offset-2">
        <Sparkles className="w-4 h-4" aria-hidden />
        Preencher pela intimação
      </summary>
      <div className="mt-3 flex flex-col gap-3 border-l-2 border-line pl-4">
        <div>
          <Label htmlFor="texto-intimacao">Cole o texto da intimação ou da publicação</Label>
          <textarea
            id="texto-intimacao"
            value={texto}
            onChange={e => setTexto(e.target.value)}
            maxLength={MAX_CARACTERES}
            rows={6}
            className={`${campoClasses} resize-y`}
            placeholder="Ex.: Disponibilizado no DJe em 03/11/2026. Fica a parte intimada para, no prazo de 15 dias…"
          />
          <p className="mt-1.5 text-xs text-ink-mute">Nomes, CPF, CNPJ, número do processo e outros dados pessoais são trocados por marcadores antes do envio.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={ler} disabled={!usuario || !texto.trim() || estado.tipo === 'lendo'}>
            {estado.tipo === 'lendo' ? 'Lendo…' : 'Ler a intimação'}
          </Button>
          {!usuario && <span className="text-xs text-ink-soft">Entre na sua conta para usar este recurso.</span>}
        </div>

        {estado.tipo === 'erro' && <p className="text-sm text-danger-text">{estado.mensagem}</p>}

        {estado.tipo === 'lido' && (
          <div className="flex flex-col gap-3 rounded-lg border border-ia/30 bg-ia-tint p-4" aria-live="polite">
            <p className="inline-flex items-center gap-2 font-medium text-ia-text">
              <Sparkles className="w-4 h-4" aria-hidden />
              {achou ? 'Encontrado na intimação' : 'Nada para preencher'}
            </p>
            {!achou && <p className="text-ink-soft">O texto não traz o tribunal nem a data do evento. Preencha o formulário abaixo.</p>}
            <dl className="flex flex-col gap-2.5">
              {estado.saida.tribunal && (
                <Campo rotulo="Tribunal" valor={TRIBUNAIS_BRASIL[estado.saida.tribunal as keyof typeof TRIBUNAIS_BRASIL]?.nome ?? estado.saida.tribunal} trecho={estado.restaurar(estado.saida.trechoTribunal)} />
              )}
              {estado.saida.tipoEvento !== 'nao_informado' && <Campo rotulo="Como ocorreu" valor={ROTULO_DO_EVENTO[estado.saida.tipoEvento]} trecho="" />}
              {estado.saida.dataEvento && <Campo rotulo="Data" valor={dataCurta(estado.saida.dataEvento)} trecho={estado.restaurar(estado.saida.trechoData)} />}
              {estado.saida.diasMencionados > 0 && (
                <Campo rotulo="Prazo mencionado" valor={`${estado.saida.diasMencionados} dias`} trecho={estado.restaurar(estado.saida.trechoPrazo)} nota="Só informação: escolha o ato no formulário." />
              )}
            </dl>
            {achou && (
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" onClick={usar} disabled={estado.aplicado}>
                  {estado.aplicado ? 'Dados no formulário' : 'Usar estes dados'}
                </Button>
                {estado.aplicado && <span className="text-xs text-ink-soft">Confira o formulário abaixo antes de ler o prazo.</span>}
              </div>
            )}
            <p className="border-t border-ia/20 pt-2.5 text-xs text-ink-soft">
              Lida por IA só a partir do texto colado, sem outras fontes. Confira cada campo antes de usar. O prazo continua calculado pelas regras do PrazoZero, e nada do texto fica guardado.
            </p>
          </div>
        )}
      </div>
    </details>
  );
}

function Campo({ rotulo, valor, trecho, nota }: { rotulo: string; valor: string; trecho: string; nota?: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-soft">{rotulo}</dt>
      <dd className="font-medium text-ink">{valor}</dd>
      {trecho && <dd className="font-serif text-sm text-ink-soft leading-snug">“{trecho}”</dd>}
      {nota && <dd className="text-xs text-ink-soft">{nota}</dd>}
    </div>
  );
}
