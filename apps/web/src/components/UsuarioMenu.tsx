'use client';

import Link from 'next/link';
import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import { iniciais } from '../lib/nomeDeExibicao';
import { sairDaConta } from '../lib/sairDaConta';

const item =
  'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink-soft outline-none cursor-pointer data-[highlighted]:bg-surface-2 data-[highlighted]:text-ink';

/** Quem está logado, no cabeçalho: o nome curto abre um menu com Minha conta e Sair. */
export default function UsuarioMenu({ nome, ativo }: { nome: string; ativo: boolean }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={`hidden md:inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand ${
          ativo ? 'text-ink bg-surface-2' : 'text-ink-soft hover:text-ink hover:bg-surface-2'
        }`}
        aria-label={`Menu da conta de ${nome}`}
      >
        <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-tint text-xs font-semibold text-brand-text">
          {iniciais(nome)}
        </span>
        <span className="max-w-[9rem] truncate">{nome}</span>
        <ChevronDown className="h-4 w-4 text-ink-mute" aria-hidden />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-[60] min-w-[11rem] rounded-lg border border-line bg-canvas p-1.5 shadow-lg"
        >
          <DropdownMenu.Item asChild>
            <Link href="/conta" className={item}>
              <UserRound className="h-4 w-4" aria-hidden />
              Minha conta
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-line" />
          <DropdownMenu.Item className={item} onSelect={() => void sairDaConta()}>
            <LogOut className="h-4 w-4" aria-hidden />
            Sair
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
