'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageHeader from '../../../components/PageHeader';
import Notice from '../../../components/Notice';
import EmptyState from '../../../components/EmptyState';
import { obterSupabase } from '../../../lib/supabase/client';
import { useSessao } from '../../../lib/useSessao';
import { traduzirErroAuth } from '../../../lib/erros-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cardClasses } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/** Destino do link de recuperação de senha: o link abre uma sessão, e aqui a pessoa define a senha nova antes de seguir. */
export default function NovaSenhaPage() {
  const router = useRouter();
  const { usuario, carregando, contaDisponivel } = useSessao();
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!carregando && contaDisponivel && !usuario) router.replace('/entrar');
  }, [carregando, contaDisponivel, usuario, router]);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = obterSupabase();
    if (!sb) return;
    if (senha.length < 8) return setErro('A senha precisa ter pelo menos 8 caracteres.');
    if (senha !== confirmacao) return setErro('As duas senhas não são iguais.');
    setOcupado(true);
    setErro(null);
    const { error } = await sb.auth.updateUser({ password: senha });
    if (error) {
      setOcupado(false);
      return setErro(traduzirErroAuth(error.message));
    }
    router.replace('/meu-espaco');
  };

  if (!carregando && !contaDisponivel) {
    return (
      <div>
        <PageHeader eyebrow="Conta" title="Criar nova senha" />
        <EmptyState titulo="Conta indisponível nesta instalação">O login ainda não está configurado neste ambiente.</EmptyState>
      </div>
    );
  }
  if (carregando || !usuario) return null;

  return (
    <div>
      <PageHeader eyebrow="Conta" title="Criar nova senha" description={usuario.email ?? undefined} />

      <form onSubmit={salvar} className={cn(cardClasses, 'p-6 space-y-5 max-w-md')} aria-label="Criar nova senha">
        {erro && (
          <div aria-live="polite">
            <Notice tom="danger">{erro}</Notice>
          </div>
        )}
        <div>
          <Label htmlFor="nova-senha">Nova senha</Label>
          <Input
            id="nova-senha"
            type="password"
            required
            minLength={8}
            autoFocus
            autoComplete="new-password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
          />
          <p className="text-sm text-ink-mute mt-1.5">Mínimo de 8 caracteres.</p>
        </div>
        <div>
          <Label htmlFor="confirmar-senha">Repita a nova senha</Label>
          <Input
            id="confirmar-senha"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmacao}
            onChange={e => setConfirmacao(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={ocupado} className="w-full">
          Salvar nova senha
        </Button>
        <p className="text-sm text-ink-soft leading-relaxed">
          Sem criar a senha agora, você continua conectado, mas a senha antiga segue valendo. Você também pode trocá-la depois em{' '}
          <Link href="/conta" className="underline underline-offset-2">
            Minha conta
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
