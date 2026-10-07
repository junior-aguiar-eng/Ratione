'use client';

import React, { useState } from 'react';
import { Bookmark, CalendarPlus, Check, Copy, FileDown } from 'lucide-react';
import type { ResultadoPrazoMaterial } from '@ratione/prazozero';
import Notice from '../../components/Notice';
import { dataCurta, dataLonga, diaDaSemana } from '../../lib/datas';
import { salvarRegistro } from '../../lib/historico';
import { gerarIcs } from '../../lib/ics';
import { exportarPdf, nomeArquivoSeguro } from '../../lib/imprimir';

export default function ResultadoMaterial({ resultado, titulo, tribunalId }: { resultado: ResultadoPrazoMaterial; titulo: string; tribunalId: string }) {
  const [copiado, setCopiado] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const rotuloInicio = resultado.tipo === 'mandado_seguranca' ? 'Ciência do ato' : 'Trânsito em julgado';

  const memoriaTexto = [
    `${titulo} (${resultado.baseLegal})`,
    ...resultado.memoriaCalculo.map(i => `${dataCurta(i.data)}: ${i.descricao} (${i.fundamentoLegal})`),
    `Último dia: ${dataLonga(resultado.dataLimite)}`
  ].join('\n');

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(memoriaTexto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // área de transferência indisponível
    }
  };

  const adicionarAoCalendario = () => {
    const blob = new Blob([gerarIcs(resultado.dataLimite, memoriaTexto, `Último dia: ${titulo}`)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prazo-final-${resultado.dataLimite}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportar = () => exportarPdf(`prazozero-${nomeArquivoSeguro(titulo)}-${resultado.dataLimite}`);

  const salvar = () => {
    salvarRegistro({
      modulo: 'PrazoZero',
      tipo: 'prazo',
      titulo,
      detalhe: `${tribunalId} · último dia em ${dataCurta(resultado.dataLimite)}`,
      url: '/prazozero'
    });
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  };

  return (
    <section className="space-y-5">
      <div className="hidden print:block border-b border-line pb-3 text-sm text-ink-soft">
        <p className="font-semibold text-ink">Ratione · PrazoZero: memória de cálculo</p>
        <p>Gerado em {new Date().toLocaleString('pt-BR')}. Instrumento de apoio: confira o calendário do tribunal.</p>
      </div>
      <div>
        <p className="text-sm font-medium text-ink-mute">Último dia para propor a ação</p>
        <p className="font-serif text-4xl sm:text-5xl font-semibold text-ink leading-tight sm:leading-none mt-1">
          {dataLonga(resultado.dataLimite)}
        </p>
        <p className="text-base text-ink-soft mt-2">
          {diaDaSemana(resultado.dataLimite)} · {titulo} · {resultado.baseLegal}
        </p>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-line border border-line rounded-lg overflow-hidden">
        <div className="bg-surface p-4">
          <dt className="text-sm text-ink-mute">{rotuloInicio}</dt>
          <dd className="text-lg font-semibold text-ink num mt-0.5">{dataCurta(resultado.dataInicio)}</dd>
          <dd className="text-sm text-ink-soft">{diaDaSemana(resultado.dataInicio)}</dd>
        </div>
        <div className="bg-surface p-4">
          <dt className="text-sm text-ink-mute">{resultado.prorrogado ? 'Vencimento antes da prorrogação' : 'Contagem'}</dt>
          <dd className="text-lg font-semibold text-ink num mt-0.5">
            {dataCurta(resultado.memoriaCalculo[1].data)}
          </dd>
          <dd className="text-sm text-ink-soft">Decadência: não se suspende nem se interrompe</dd>
        </div>
      </dl>

      {resultado.prorrogado && (
        <Notice tom="warn" titulo="Vencimento prorrogado (CPC, art. 975, § 1º)">
          O prazo expirou em dia sem expediente e passa ao primeiro dia útil seguinte.
        </Notice>
      )}

      {resultado.dataAlternativa && resultado.descricaoAlternativa && (
        <Notice tom="warn" titulo={`Pode valer até ${dataCurta(resultado.dataAlternativa)}`}>
          Mostramos a data mais cedo, para você não perder o prazo. {resultado.descricaoAlternativa}
        </Notice>
      )}

      <Notice tom="info" titulo="O que este cálculo não decide">
        <ul className="space-y-1.5">
          {resultado.avisos.map(a => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </Notice>

      <div>
        <h2 className="font-serif text-2xl font-semibold text-ink">Como foi calculado</h2>
        <ol className="mt-3 space-y-2 text-sm text-ink-soft leading-snug">
          {resultado.memoriaCalculo.map((i, k) => (
            <li key={k}>
              <span className="num font-medium text-ink">{dataCurta(i.data)}</span> · {i.descricao}
              <span className="block text-xs text-ink-mute">{i.fundamentoLegal}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap gap-2 no-print">
        <button type="button" onClick={exportar} className="btn-secondary">
          <FileDown className="w-4 h-4" />
          Exportar PDF
        </button>
        <button type="button" onClick={copiar} className="btn-secondary">
          {copiado ? <Check className="w-4 h-4 text-ok-text" /> : <Copy className="w-4 h-4" />}
          {copiado ? 'Copiado' : 'Copiar memória de cálculo'}
        </button>
        <button type="button" onClick={adicionarAoCalendario} className="btn-secondary">
          <CalendarPlus className="w-4 h-4" />
          Adicionar ao calendário
        </button>
        <button type="button" onClick={salvar} className="btn-secondary">
          {salvo ? <Check className="w-4 h-4 text-ok-text" /> : <Bookmark className="w-4 h-4" />}
          {salvo ? 'Salvo em Meu espaço' : 'Salvar em Meu espaço'}
        </button>
      </div>
    </section>
  );
}
