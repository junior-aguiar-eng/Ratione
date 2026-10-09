'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import PageHeader from '../../../components/PageHeader';
import Notice from '../../../components/Notice';
import { obterSupabase } from '../../../lib/supabase/client';
import { caminhoInterno, destinoPadrao, tipoLinkValido } from '../../../lib/link-email';

function Confirmar() {
  const router = useRouter();
  const params = useSearchParams();
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const tokenHash = params.get('token_hash');
  const tipoBruto = params.get('type');
  const tipo = tipoLinkValido(tipoBruto) ? tipoBruto : null;
  const recuperacao = tipo === 'recovery';

  if (!tokenHash || !tipo) {
    return (
      <Notice tom="danger" titulo="Link incompleto">
        Este link não está completo. Peça um novo na tela de <Link href="/entrar" className="underline underline-offset-2">entrada</Link>.
      </Notice>
    );
  }

  const confirmar = async () => {
    const sb = obterSupabase();
    if (!sb) return;
    setOcupado(true);
    setErro(null);
    const { error } = await sb.auth.verifyOtp({ token_hash: tokenHash, type: tipo });
    if (error) {
      setOcupado(false);
      setErro('O link é inválido ou já foi usado. Peça um novo na tela de entrada.');
      return;
    }
    router.replace(caminhoInterno(params.get('proximo'), destinoPadrao(tipo)));
  };

  return (
    <div className="max-w-md space-y-5">
      <p className="text-ink-soft leading-relaxed">
        {recuperacao
          ? 'Para criar uma nova senha, confirme abaixo. Em seguida você poderá definir a senha na tela da conta.'
          : 'Para ativar a sua conta, confirme abaixo.'}
      </p>
      {erro && <Notice tom="danger">{erro}</Notice>}
      <button type="button" onClick={confirmar} disabled={ocupado} className="btn-primary disabled:opacity-60">
        {recuperacao ? 'Continuar para criar nova senha' : 'Confirmar e entrar'}
      </button>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <div>
      <PageHeader eyebrow="Conta" title="Confirmação" />
      <Suspense fallback={null}>
        <Confirmar />
      </Suspense>
    </div>
  );
}
