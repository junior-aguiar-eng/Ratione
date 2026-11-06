'use client';

import { useState } from 'react';
import { FolderPlus, Pencil, Trash2 } from 'lucide-react';
import type { Caso } from '../../lib/casos';
import { TAMANHO_MAXIMO_DO_NOME } from '../../lib/casos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/** O que a lista mostra: tudo, só o que está sem caso, ou o conteúdo de um caso. */
export type FiltroDeCaso = 'todos' | 'soltos' | string;

interface Props {
  casos: Caso[];
  porCaso: Map<string, number>;
  soltos: number;
  total: number;
  selecionado: FiltroDeCaso;
  onSelecionar: (f: FiltroDeCaso) => void;
  /** Devolve a mensagem de erro, ou `null` se deu certo. */
  onCriar: (nome: string) => Promise<string | null>;
  onRenomear: (id: string, nome: string) => Promise<string | null>;
  onApagar: (id: string) => Promise<void>;
}

/**
 * Os casos de "Meu espaço": pastas para agrupar o que a pessoa salvou. Escolher um caso mostra só o que está nele; apagar o caso não apaga os itens.
 * O nome é um rótulo da própria pessoa: a tela pede que ela não use nome de parte nem número de processo.
 */
export default function PastasDeCasos({ casos, porCaso, soltos, total, selecionado, onSelecionar, onCriar, onRenomear, onApagar }: Props) {
  const [modo, setModo] = useState<'nenhum' | 'novo' | 'renomear' | 'apagar'>('nenhum');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const caso = casos.find(c => c.id === selecionado) ?? null;

  const fechar = () => {
    setModo('nenhum');
    setNome('');
    setErro(null);
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setOcupado(true);
    const mensagem = modo === 'renomear' && caso ? await onRenomear(caso.id, nome) : await onCriar(nome);
    setOcupado(false);
    if (mensagem) setErro(mensagem);
    else fechar();
  };

  const chip = (ativo: boolean) =>
    `px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${ativo ? 'bg-brand-tint text-brand-text' : 'text-ink-soft hover:text-ink hover:bg-surface-2'}`;

  return (
    <section aria-labelledby="casos-meu-espaco" className="mb-6 flex flex-col gap-3" data-testid="casos">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="casos-meu-espaco" className="font-serif text-xl font-semibold text-ink">
          Casos
        </h2>
        <Button variant="secondary" type="button" onClick={() => (modo === 'novo' ? fechar() : (fechar(), setModo('novo')))}>
          <FolderPlus className="w-4 h-4" aria-hidden />
          Novo caso
        </Button>
      </div>

      <div className="flex flex-wrap gap-1" role="group" aria-label="Filtrar por caso">
        <button type="button" aria-pressed={selecionado === 'todos'} onClick={() => onSelecionar('todos')} className={chip(selecionado === 'todos')}>
          Tudo ({total})
        </button>
        {casos.map(c => (
          <button key={c.id} type="button" aria-pressed={selecionado === c.id} onClick={() => onSelecionar(c.id)} className={chip(selecionado === c.id)}>
            {c.nome} ({porCaso.get(c.id) ?? 0})
          </button>
        ))}
        {casos.length > 0 && (
          <button type="button" aria-pressed={selecionado === 'soltos'} onClick={() => onSelecionar('soltos')} className={chip(selecionado === 'soltos')}>
            Sem caso ({soltos})
          </button>
        )}
      </div>

      {casos.length === 0 && modo !== 'novo' && (
        <p className="text-sm text-ink-soft">Crie um caso para agrupar as normas, teses, prazos e análises de um mesmo processo.</p>
      )}

      {(modo === 'novo' || modo === 'renomear') && (
        <form onSubmit={enviar} className="flex flex-col gap-2 max-w-xl">
          <label htmlFor="nome-do-caso" className="text-sm font-medium text-ink">
            {modo === 'novo' ? 'Nome do caso' : 'Novo nome do caso'}
          </label>
          <div className="flex gap-2">
            <Input id="nome-do-caso" value={nome} onChange={e => setNome(e.target.value)} maxLength={TAMANHO_MAXIMO_DO_NOME} autoFocus autoComplete="off" placeholder="Ex.: Cobrança contra a construtora A" />
            <Button type="submit" disabled={ocupado || nome.trim() === ''}>
              {modo === 'novo' ? 'Criar' : 'Salvar'}
            </Button>
            <Button type="button" variant="secondary" onClick={fechar}>
              Cancelar
            </Button>
          </div>
          <p className="text-xs text-ink-mute">Use um nome que só você entenda. Não escreva nome de parte, número de processo nem dado de cliente.</p>
          {erro && <p className="text-sm text-danger-text">{erro}</p>}
        </form>
      )}

      {caso && modo !== 'renomear' && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              fechar();
              setNome(caso.nome);
              setModo('renomear');
            }}
          >
            <Pencil className="w-4 h-4" aria-hidden />
            Renomear
          </Button>
          {modo === 'apagar' ? (
            <>
              <span className="text-ink-soft">Apagar o caso &ldquo;{caso.nome}&rdquo;? Os itens dele continuam em Meu espaço, sem caso.</span>
              <Button
                type="button"
                onClick={async () => {
                  await onApagar(caso.id);
                  fechar();
                }}
              >
                Apagar o caso
              </Button>
              <Button type="button" variant="secondary" onClick={fechar}>
                Cancelar
              </Button>
            </>
          ) : (
            <Button variant="secondary" type="button" onClick={() => (fechar(), setModo('apagar'))}>
              <Trash2 className="w-4 h-4" aria-hidden />
              Apagar o caso
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
