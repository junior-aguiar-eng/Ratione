'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import PageHeader from '../../components/PageHeader';
import Notice from '../../components/Notice';
import { obterSupabase } from '../../lib/supabase/client';
import { useSessao } from '../../lib/useSessao';
import { traduzirErroAuth } from '../../lib/erros-auth';

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

  useEffect(() => {
    if (usuario) router.replace('/meu-espaco');
  }, [usuario, router]);

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
      <Notice tom="info" titulo="Conta indisponível nesta instalação">
        O login ainda não está configurado neste ambiente. Você pode usar todas as ferramentas normalmente; os registros de Meu espaço ficam
        neste navegador.
      </Notice>
    );
  }

  const titulos: Record<Modo, string> = { entrar: 'Entrar', cadastrar: 'Criar conta', recuperar: 'Recuperar a senha' };

  return (
    <div className="max-w-md">
      <div className="flex gap-1 mb-6" role="group" aria-label="Escolha uma opção">
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

      <form onSubmit={enviar} className="card p-6 space-y-5" aria-label={titulos[modo]}>
        <div>
          <label htmlFor="email" className="label">
            E-mail
          </label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="field" />
        </div>

        {modo !== 'recuperar' && (
          <div>
            <label htmlFor="senha" className="label">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              required
              minLength={modo === 'cadastrar' ? 8 : undefined}
              autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
              value={senha}
              onChange={e => setSenha(e.target.value)}
              className="field"
            />
            {modo === 'cadastrar' && <p className="text-sm text-ink-mute mt-1.5">Mínimo de 8 caracteres.</p>}
          </div>
        )}

        {modo === 'cadastrar' && (
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={aceite}
              onChange={e => setAceite(e.target.checked)}
              className="mt-1 w-4 h-4 accent-[rgb(var(--brand))]"
            />
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

        <button type="submit" disabled={enviando} className="btn-primary w-full justify-center disabled:opacity-60">
          {enviando ? 'Aguarde…' : titulos[modo]}
        </button>

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

      <p className="text-sm text-ink-mute mt-5 leading-relaxed">
        A conta é opcional. Com ela, seus registros de Meu espaço ficam guardados no seu perfil (servidor no Brasil) e acompanham você em outros
        dispositivos. Sem ela, tudo continua funcionando só neste navegador.
      </p>
    </div>
  );
}

export default function EntrarPage() {
  return (
    <div>
      <PageHeader eyebrow="Conta" title="Entrar no Ratione" description="Entre ou crie uma conta para guardar seus registros e levá-los a outros dispositivos." />
      <Suspense fallback={null}>
        <Formulario />
      </Suspense>
    </div>
  );
}
