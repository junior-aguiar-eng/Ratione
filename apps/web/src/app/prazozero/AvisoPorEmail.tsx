'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BellRing, Check } from 'lucide-react';
import Notice from '../../components/Notice';
import { useSessao } from '../../lib/useSessao';
import { dataCurta, hojeIso } from '../../lib/datas';
import { criarLembrete, opcoesDeAviso } from '../../lib/lembretes-cliente';

/**
 * "Avisar por e-mail" (F2-10): 3 dias e 1 dia antes do vencimento, para quem tem conta. O e-mail leva só o título
 * escolhido aqui, a data e o lembrete de conferir no tribunal; por isso o campo pede que não se escrevam dados do processo.
 */
export default function AvisoPorEmail({ tituloPadrao, tribunal, vencimento }: { tituloPadrao: string; tribunal?: string; vencimento: string }) {
  const { usuario, contaDisponivel } = useSessao();
  const [titulo, setTitulo] = useState(tituloPadrao);
  const [tres, setTres] = useState(true);
  const [um, setUm] = useState(true);
  const [estado, setEstado] = useState<'pronto' | 'salvando' | 'ativo'>('pronto');
  const [erro, setErro] = useState<string | null>(null);

  const opcoes = opcoesDeAviso(hojeIso(), vencimento);

  // Um novo cálculo é outro prazo: recomeça o formulário
  useEffect(() => {
    setTitulo(tituloPadrao);
    setEstado('pronto');
    setErro(null);
    const o = opcoesDeAviso(hojeIso(), vencimento);
    setTres(o.tres);
    setUm(o.um);
  }, [tituloPadrao, vencimento]);

  if (!contaDisponivel || !usuario) return null;

  const ativar = async () => {
    setEstado('salvando');
    setErro(null);
    const r = await criarLembrete({ titulo, tribunal, vencimento, avisar3Dias: tres && opcoes.tres, avisar1Dia: um && opcoes.um }, usuario.id);
    if (r.ok) setEstado('ativo');
    else {
      setErro(r.mensagem);
      setEstado('pronto');
    }
  };

  return (
    <section className="border-t border-line pt-7 space-y-4 no-print" aria-labelledby="aviso-email">
      <div>
        <h2 id="aviso-email" className="font-serif text-2xl font-semibold text-ink">
          Avisar por e-mail
        </h2>
        <p className="text-sm text-ink-soft mt-1">
          Receba um lembrete antes de {dataCurta(vencimento)}, no e-mail da sua conta. Ele é um lembrete do cálculo, não substitui a conferência no tribunal.
        </p>
      </div>

      {opcoes.dias < 1 ? (
        <Notice tom="info">Este prazo vence hoje ou já passou, então não há como avisar antes.</Notice>
      ) : estado === 'ativo' ? (
        <Notice tom="info" titulo="Aviso ativado">
          Você receberá o e-mail{tres && opcoes.tres && um ? ' 3 dias e 1 dia antes' : tres && opcoes.tres ? ' 3 dias antes' : ' 1 dia antes'} do vencimento. Para cancelar, abra{' '}
          <Link href="/meu-espaco" className="underline">
            Meu espaço
          </Link>
          .
        </Notice>
      ) : (
        <div className="space-y-4 max-w-xl">
          <div>
            <label htmlFor="titulo-aviso" className="label">
              Nome do aviso
            </label>
            <input id="titulo-aviso" type="text" maxLength={200} value={titulo} onChange={e => setTitulo(e.target.value)} className="field" />
            <p className="text-xs text-ink-soft mt-1.5">
              Este nome vai no e-mail, enviado por um serviço de terceiros. Não escreva nome de partes nem número de processo.
            </p>
          </div>
          <fieldset className="space-y-2">
            <legend className="label mb-1">Quando avisar</legend>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={tres && opcoes.tres} disabled={!opcoes.tres} onChange={e => setTres(e.target.checked)} />3 dias antes
              {!opcoes.tres && <span className="text-ink-soft"> (faltam menos de 3 dias)</span>}
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={um && opcoes.um} disabled={!opcoes.um} onChange={e => setUm(e.target.checked)} />1 dia antes
            </label>
          </fieldset>
          {erro && <Notice tom="danger">{erro}</Notice>}
          <button
            type="button"
            onClick={ativar}
            disabled={estado === 'salvando' || !titulo.trim() || !((tres && opcoes.tres) || (um && opcoes.um))}
            className="btn-secondary disabled:opacity-60"
          >
            {estado === 'salvando' ? <Check className="w-4 h-4" /> : <BellRing className="w-4 h-4" />}
            {estado === 'salvando' ? 'Ativando…' : 'Ativar aviso por e-mail'}
          </button>
        </div>
      )}
    </section>
  );
}
