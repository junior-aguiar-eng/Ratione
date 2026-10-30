'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Trash2 } from 'lucide-react';
import { useSessao } from '../../lib/useSessao';
import { dataCurta, diaDaSemana, hojeIso } from '../../lib/datas';
import { cancelarLembrete, listarLembretes } from '../../lib/lembretes-cliente';
import type { Lembrete } from '../../lib/lembretes';
import { eventosDaAgenda, montarAgenda, type GrupoDaAgenda } from '../../lib/agenda';
import { gerarIcsDeEventos } from '../../lib/ics';
import { Button } from '@/components/ui/button';

/** A agenda como aparece na tela: separada do carregamento para poder ser vista (e testada) com dados de exemplo. */
export function AgendaView({ grupos, onCancelar, onExportar }: { grupos: GrupoDaAgenda[]; onCancelar: (id: string) => void; onExportar: () => void }) {
  return (
    <section className="mb-8" aria-labelledby="agenda-de-prazos">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="agenda-de-prazos" className="font-serif text-xl font-semibold text-ink flex items-center gap-2">
          <CalendarDays className="w-5 h-5" aria-hidden />
          Agenda de prazos
        </h2>
        <Button variant="secondary" type="button" onClick={onExportar}>
          <CalendarDays className="w-4 h-4" />
          Exportar para o calendário
        </Button>
      </div>
      <p className="text-sm text-ink-soft mt-1">Os prazos para os quais você pediu aviso por e-mail. Confira sempre o calendário do tribunal.</p>

      <div className="mt-4 flex flex-col gap-6">
        {grupos.map(g => (
          <div key={g.id}>
            <h3 className="eyebrow">{g.titulo}</h3>
            <ul className="divide-y divide-line border-y border-line mt-2">
              {g.itens.map(({ lembrete: a, quando }) => (
                <li key={a.id} className="flex items-start justify-between gap-4 py-4">
                  <div className="min-w-0 flex flex-col gap-0.5">
                    <p className="text-base font-medium text-ink">{a.titulo}</p>
                    <p className="text-sm text-ink-soft">
                      <span className="font-medium text-ink">{quando}</span> · {diaDaSemana(a.vencimento)}, {dataCurta(a.vencimento)}
                      {a.tribunal ? ` · ${a.tribunal}` : ''}
                    </p>
                    <p className="text-sm text-ink-mute">
                      {[
                        a.avisar_3_dias ? (a.enviado_3_dias_em ? '3 dias antes (enviado)' : '3 dias antes') : null,
                        a.avisar_1_dia ? (a.enviado_1_dia_em ? '1 dia antes (enviado)' : '1 dia antes') : null
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCancelar(a.id)}
                    aria-label={`Cancelar o aviso ${a.titulo}`}
                    className="p-2 rounded-md text-ink-mute hover:text-danger-text hover:bg-danger-tint transition-colors shrink-0"
                  >
                    <Trash2 className="w-[18px] h-[18px]" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Agenda de prazos: os prazos para os quais o usuário pediu aviso por e-mail (F2-10), do mais próximo ao mais distante, com o aviso de cada
 * um e a exportação de todos para o calendário. Só aparece para quem tem conta e ao menos um prazo por vir.
 */
export default function AgendaDePrazos() {
  const { usuario } = useSessao();
  const [lembretes, setLembretes] = useState<Lembrete[] | null>(null);

  useEffect(() => {
    if (!usuario) return;
    let ativo = true;
    void listarLembretes().then(l => {
      if (ativo) setLembretes(l);
    });
    return () => {
      ativo = false;
    };
  }, [usuario]);

  if (!usuario || !lembretes) return null;
  const hoje = hojeIso();
  const grupos = montarAgenda(lembretes, hoje);
  if (grupos.length === 0) return null;

  const cancelar = async (id: string) => {
    if (await cancelarLembrete(id)) setLembretes(atuais => (atuais ?? []).filter(a => a.id !== id));
  };

  const exportar = () => {
    const blob = new Blob([gerarIcsDeEventos(eventosDaAgenda(lembretes, hoje))], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agenda-de-prazos-${hoje}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return <AgendaView grupos={grupos} onCancelar={id => void cancelar(id)} onExportar={exportar} />;
}
