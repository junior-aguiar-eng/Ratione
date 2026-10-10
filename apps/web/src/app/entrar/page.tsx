'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Notice from '../../components/Notice';
import { obterSupabase } from '../../lib/supabase/client';
import { useSessao } from '../../lib/useSessao';
import { traduzirErroAuth } from '../../lib/erros-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cardClasses } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

type Modo = 'entrar' | 'cadastrar' | 'recuperar';

function Formulario() {
  const router = useRouter();
  const params = useSearchParams();
  const { usuario, carregando, contaDisponivel } = useSessao();
  const [modo, setModo] = useState<Modo>('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [aceite, setAceite] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    if (params.get('erro') === 'link') setErro('O link de confirmação é inválido ou expirou. Entre com a senha ou peça um novo link.');
  }, [params]);

  // Depois de entrar, volta para onde o usuário queria ir (só caminhos internos)
  const pedido = params.get('proximo') ?? '';
  const proximo = pedido.startsWith('/') && !pedido.startsWith('//') && !pedido.startsWith('/entrar') ? pedido : '/prazozero';

  useEffect(() => {
    if (usuario) router.replace(proximo);
  }, [usuario, router, proximo]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = obterSupabase();
    if (!sb) return;
    setErro(null);
    setAviso(null);
    setEnviando(true);
    const retorno = `${window.location.origin}/auth/callback`;
    try {
      if (modo === 'entrar') {
        const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: senha });
        if (error) setErro(traduzirErroAuth(error.message));
      } else if (modo === 'cadastrar') {
        if (senha.length < 8) {
          setErro('A senha precisa ter pelo menos 8 caracteres.');
        } else if (!aceite) {
          setErro('Para criar a conta, aceite os Termos de uso e a Política de privacidade.');
        } else {
          const { error } = await sb.auth.signUp({ email: email.trim(), password: senha, options: { emailRedirectTo: retorno } });
          if (error) setErro(traduzirErroAuth(error.message));
          else
            setAviso(
              'Enviamos uma mensagem de confirmação para o seu e-mail. Abra o link para ativar a conta. Se o e-mail já tiver cadastro, nada muda.'
            );
        }
      } else {
        const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${retorno}?proximo=/conta` });
        if (error) setErro(traduzirErroAuth(error.message));
        else setAviso('Se houver uma conta com esse e-mail, enviamos o link para criar uma nova senha.');
      }
    } finally {
      setEnviando(false);
    }
  };

  if (!carregando && !contaDisponivel) {
    return (
      <div className="max-w-md mx-auto">
        <Notice tom="info" titulo="Conta indisponível nesta instalação">
          O login ainda não está configurado neste ambiente (falta o arquivo .env.local do projeto). Nesta instalação de desenvolvimento as
          ferramentas abrem sem login.
        </Notice>
      </div>
    );
  }

  const titulos: Record<Modo, string> = { entrar: 'Entrar', cadastrar: 'Criar conta', recuperar: 'Recuperar a senha' };

  return (
    <div className="max-w-md mx-auto">
      <div className="flex justify-center gap-1 mb-6" role="group" aria-label="Escolha uma opção">
        {(['entrar', 'cadastrar'] as const).map(m => (
          <button
            key={m}
            type="button"
            aria-pressed={modo === m}
            onClick={() => {
              setModo(m);
              setErro(null);
              setAviso(null);
            }}
            className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
              modo === m ? 'bg-brand-tint text-brand-text' : 'text-ink-soft hover:text-ink hover:bg-surface-2'
            }`}
          >
            {titulos[m]}
          </button>
        ))}
      </div>

      <form onSubmit={enviar} className={cn(cardClasses, 'p-6 space-y-5')} aria-label={titulos[modo]}>
        <div>
          <Label htmlFor="email">
            E-mail
          </Label>
          <Input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        {modo !== 'recuperar' && (
          <div>
            <Label htmlFor="senha">
              Senha
            </Label>
            <Input
              id="senha"
              type="password"
              required
              minLength={modo === 'cadastrar' ? 8 : undefined}
              autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
              value={senha}
              onChange={e => setSenha(e.target.value)}
            />
            {modo === 'cadastrar' && <p className="text-sm text-ink-mute mt-1.5">Mínimo de 8 caracteres.</p>}
          </div>
        )}

        {modo === 'cadastrar' && (
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox checked={aceite} onCheckedChange={v => setAceite(v === true)} className="mt-1" />
            <span className="text-sm text-ink-soft leading-snug">
              Li e aceito os{' '}
              <Link href="/termos" className="underline underline-offset-2" target="_blank">
                Termos de uso
              </Link>{' '}
              e a{' '}
              <Link href="/privacidade" className="underline underline-offset-2" target="_blank">
                Política de privacidade
              </Link>
              .
            </span>
          </label>
        )}

        <div aria-live="polite" className="space-y-3">
          {erro && (
            <Notice tom="danger" titulo="Não foi possível continuar">
              {erro}
            </Notice>
          )}
          {aviso && (
            <Notice tom="info" titulo="Verifique seu e-mail">
              {aviso}
            </Notice>
          )}
        </div>

        <Button type="submit" disabled={enviando} className="w-full">
          {enviando ? 'Aguarde…' : titulos[modo]}
        </Button>

        {modo === 'entrar' && (
          <button
            type="button"
            onClick={() => {
              setModo('recuperar');
              setErro(null);
              setAviso(null);
            }}
            className="text-sm text-brand-text underline underline-offset-2"
          >
            Esqueci a senha
          </button>
        )}
        {modo === 'recuperar' && (
          <button type="button" onClick={() => setModo('entrar')} className="text-sm text-brand-text underline underline-offset-2">
            Voltar para entrar
          </button>
        )}
      </form>

      <p className="text-sm text-ink-mute mt-5 leading-relaxed text-center">
        Para usar as ferramentas do Ratione é preciso ter uma conta. O período de beta é gratuito. Seus registros de Meu espaço ficam guardados no seu
        perfil, em servidor no Brasil, e acompanham você em qualquer dispositivo.
      </p>
    </div>
  );
}

export default function EntrarPage() {
  return (
    <div className="pt-4 sm:pt-10 pb-10">
      <header className="text-center space-y-2 max-w-md mx-auto mb-8">
        <p className="eyebrow leading-6">Conta</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-ink">Entrar no Ratione</h1>
        <p className="text-base text-ink-soft leading-relaxed">Entre ou crie sua conta para usar as ferramentas.</p>
      </header>
      <Suspense fallback={null}>
        <Formulario />
      </Suspense>
    </div>
  );
}
