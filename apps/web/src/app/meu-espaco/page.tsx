'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import Notice from '../../components/Notice';
import { useSessao } from '../../lib/useSessao';
import {
  carregarHistorico,
  importarNavegadorParaConta,
  lerHistorico,
  removerDaConta,
  removerRegistro,
  RegistroHistorico,
  TipoHistorico
} from '../../lib/historico';
import { tempoRelativo } from '../../lib/datas';
import AvisosAtivos from './AvisosAtivos';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const FILTROS: { id: 'todos' | TipoHistorico; rotulo: string }[] = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'decisao', rotulo: 'Decisões' },
  { id: 'norma', rotulo: 'Normas' },
  { id: 'tese', rotulo: 'Teses' },
  { id: 'prazo', rotulo: 'Prazos' }
];

export default function MeuEspacoPage() {
  const [registros, setRegistros] = useState<RegistroHistorico[]>([]);
  const [carregado, setCarregado] = useState(false);
  const { usuario, carregando } = useSessao();
  const [origem, setOrigem] = useState<'conta' | 'navegador'>('navegador');
  const [locais, setLocais] = useState(0);
  const [importando, setImportando] = useState(false);
  const [resultadoImportacao, setResultadoImportacao] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'todos' | TipoHistorico>('todos');
  const [busca, setBusca] = useState('');

  const recarregar = async () => {
    const h = await carregarHistorico();
    setRegistros(h.itens);
    setOrigem(h.origem);
    setLocais(lerHistorico().length);
    setCarregado(true);
  };

  useEffect(() => {
    if (carregando) return;
    void recarregar();
  }, [carregando, usuario]);

  const importar = async () => {
    setImportando(true);
    const n = await importarNavegadorParaConta();
    setImportando(false);
    setResultadoImportacao(n > 0 ? `${n} ${n === 1 ? 'registro enviado' : 'registros enviados'} para a sua conta e removidos deste navegador.` : 'Não foi possível enviar agora. Seus registros continuam neste navegador.');
    await recarregar();
  };

  const remover = async (r: RegistroHistorico) => {
    if (origem === 'conta') {
      if (await removerDaConta(r.id)) setRegistros(atuais => atuais.filter(x => x.id !== r.id));
    } else {
      setRegistros(removerRegistro(r.id));
    }
  };

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return registros.filter(
      r =>
        (filtro === 'todos' || r.tipo === filtro) &&
        (q === '' || `${r.titulo} ${r.detalhe ?? ''} ${r.modulo}`.toLowerCase().includes(q))
    );
  }, [registros, filtro, busca]);

  return (
    <div>
      <PageHeader
        eyebrow="Biblioteca pessoal"
        title="Meu espaço"
        description={
          origem === 'conta'
            ? 'Os cálculos, normas, teses e análises que você salvou. Os registros ficam guardados na sua conta.'
            : 'Os cálculos, normas, teses e análises que você salvou. Nesta instalação, sem login configurado, os registros ficam neste navegador.'
        }
      />

      {usuario && locais > 0 && (
        <div className="mb-6">
          <Notice tom="info" titulo={`${locais} ${locais === 1 ? 'registro está salvo' : 'registros estão salvos'} só neste navegador`}>
            Deseja enviá-los para a sua conta? Eles passam a acompanhar você em outros dispositivos e são removidos deste navegador. Se preferir, deixe
            como está.
            <div className="mt-3">
              <Button variant="secondary" type="button" onClick={importar} disabled={importando}>
                {importando ? 'Enviando…' : 'Enviar para a minha conta'}
              </Button>
            </div>
          </Notice>
        </div>
      )}
      {resultadoImportacao && (
        <div className="mb-6" aria-live="polite">
          <Notice tom="info">{resultadoImportacao}</Notice>
        </div>
      )}

      <AvisosAtivos />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filtrar por tipo">
          {FILTROS.map(f => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filtro === f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                filtro === f.id ? 'bg-brand-tint text-brand-text' : 'text-ink-soft hover:text-ink hover:bg-surface-2'
              }`}
            >
              {f.rotulo}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-ink-mute absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
          <Input
            type="search"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Pesquisar nos registros"
            aria-label="Pesquisar nos registros"
            className="pl-9"
          />
        </div>
      </div>

      {!carregado ? null : registros.length === 0 ? (
        <EmptyState
          titulo="Você ainda não salvou nada"
          acao={
            <Link href="/prazozero" className={buttonVariants()}>
              Calcular um prazo
            </Link>
          }
        >
          Use o botão &ldquo;Salvar em Meu espaço&rdquo; nas ferramentas para guardar cálculos, normas, teses e análises.
        </EmptyState>
      ) : visiveis.length === 0 ? (
        <EmptyState titulo="Nenhum registro encontrado">Altere o filtro ou a pesquisa.</EmptyState>
      ) : (
        <ul className="divide-y divide-line border-y border-line mt-4">
          {visiveis.map(r => (
            <li key={r.id} className="flex items-start justify-between gap-4 py-5">
              <div className="min-w-0 space-y-1">
                <Link href={r.url} className="text-lg font-medium text-ink hover:text-brand-text">
                  {r.titulo}
                </Link>
                <p className="text-sm text-ink-mute">
                  {r.modulo} · {tempoRelativo(r.criadoEm)}
                </p>
                {r.detalhe && <p className="text-sm text-ink-soft">{r.detalhe}</p>}
              </div>
              <button
                type="button"
                onClick={() => void remover(r)}
                aria-label={`Remover ${r.titulo}`}
                className="p-2 rounded-md text-ink-mute hover:text-danger-text hover:bg-danger-tint transition-colors shrink-0"
              >
                <Trash2 className="w-[18px] h-[18px]" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
