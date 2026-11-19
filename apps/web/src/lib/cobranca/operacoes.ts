import { situacaoDaAssinatura } from './estados';
import { ErroMp, ehErroJaCanceladaOuInexistenteNoMp, type ClienteMp, type NovaAssinatura } from './mercadopago';

/**
 * Confirma no Mercado Pago se o erro ocorrido ao cancelar corresponde a uma assinatura já cancelada ou inexistente.
 * Re-consulta `buscarAssinatura` apenas quando `cancelarAssinatura` falha fora do padrão claro de 404/already-cancelled.
 */
export async function confirmarCancelamentoNoMp(
  mpId: string,
  mp: Pick<ClienteMp, 'cancelarAssinatura'> & Partial<Pick<ClienteMp, 'buscarAssinatura'>>,
  aoFalhar?: (erro: unknown) => void
): Promise<{ ok: true; jaEstavaCancelada: boolean; fimAtual?: string | null } | { ok: false }> {
  let fimAtual: string | null | undefined;
  if (typeof mp.buscarAssinatura === 'function') {
    let atual: Awaited<ReturnType<ClienteMp['buscarAssinatura']>>;
    try {
      atual = await mp.buscarAssinatura(mpId);
    } catch (e) {
      aoFalhar?.(e);
      return { ok: false };
    }
    if (atual === null || situacaoDaAssinatura(atual.status) === 'cancelada') {
      return { ok: true, jaEstavaCancelada: true, fimAtual: atual?.proximaCobranca ?? null };
    }
    fimAtual = atual.proximaCobranca;
  }

  try {
    await mp.cancelarAssinatura(mpId);
    return { ok: true, jaEstavaCancelada: false, fimAtual };
  } catch (e) {
    if (ehErroJaCanceladaOuInexistenteNoMp(e)) {
      return { ok: true, jaEstavaCancelada: true, fimAtual: fimAtual ?? null };
    }
    if (typeof mp.buscarAssinatura === 'function' && e instanceof ErroMp && (e.status === 400 || e.status === 409)) {
      const conf = await mp.buscarAssinatura(mpId).catch(() => undefined);
      if (conf === null || (conf !== undefined && situacaoDaAssinatura(conf.status) === 'cancelada')) {
        return { ok: true, jaEstavaCancelada: true, fimAtual: conf?.proximaCobranca ?? fimAtual ?? null };
      }
    }
    aoFalhar?.(e);
    return { ok: false };
  }
}

/**
 * Cria a assinatura pendente no Mercado Pago e vincula o `mpId` localmente. Se o vínculo falhar após criar lá fora,
 * compensa tentando cancelar a assinatura recém-criada no Mercado Pago antes de encerrar a pendente local.
 */
export async function criarEVincularAssinatura(p: {
  mp: Pick<ClienteMp, 'criarAssinatura' | 'cancelarAssinatura'>;
  nova: NovaAssinatura;
  vincular: (mpId: string) => Promise<unknown>;
  cancelarLocal: () => Promise<unknown>;
  registrarErro: (mensagem: string, campos: Record<string, unknown>) => void;
}): Promise<{ url: string }> {
  let mpCriadaId: string | null = null;
  try {
    const criada = await p.mp.criarAssinatura(p.nova);
    mpCriadaId = criada.id;
    await p.vincular(criada.id);
    return { url: criada.linkDePagamento };
  } catch (e) {
    if (mpCriadaId) {
      try {
        await p.mp.cancelarAssinatura(mpCriadaId);
      } catch (eComp) {
        p.registrarErro('Cobrança: falha ao cancelar assinatura órfã no Mercado Pago após erro no vínculo local', {
          mp_assinatura_id: mpCriadaId,
          referencia: p.nova.referencia,
          erro_mensagem: (eComp instanceof Error ? eComp.message : String(eComp)).slice(0, 300)
        });
      }
    }
    await p.cancelarLocal().catch(() => undefined);
    throw e;
  }
}

/**
 * Cancela a assinatura no Mercado Pago de forma idempotente (lida com já cancelada/404 lá fora) e persiste `'cancelada'` no banco.
 * Garante que erros persistentes ao gravar localmente depois do cancelamento remoto não sejam mascarados como 502 genérico.
 */
export async function cancelarAssinaturaDoUsuario(p: {
  assinatura: { id: string; mpId: string; cicloFim: string | null };
  mp: Pick<ClienteMp, 'buscarAssinatura' | 'cancelarAssinatura'>;
  aplicarCancelada: (fim: string | null) => Promise<unknown>;
  registrarErro: (mensagem: string, campos: Record<string, unknown>) => void;
}): Promise<
  | { ok: true; status: 200; cicloFim: string | null }
  | { ok: false; status: 500 | 502; mensagem: string }
> {
  let erroMp: unknown = null;
  const resMp = await confirmarCancelamentoNoMp(p.assinatura.mpId, p.mp, e => {
    erroMp = e;
  });
  if (!resMp.ok) {
    p.registrarErro('Cobrança: erro ao cancelar', {
      erro_mensagem: (erroMp instanceof Error ? erroMp.message : String(erroMp)).slice(0, 300),
      status_mp: erroMp instanceof ErroMp ? erroMp.status : null
    });
    return { ok: false, status: 502, mensagem: 'Não foi possível cancelar agora. Tente de novo em alguns minutos.' };
  }

  const fim = resMp.fimAtual ?? null;
  try {
    await p.aplicarCancelada(fim);
  } catch {
    try {
      await p.aplicarCancelada(fim);
    } catch (eDb) {
      p.registrarErro('Cobrança: assinatura cancelada no Mercado Pago, mas falhou ao gravar no banco', {
        assinatura_id: p.assinatura.id,
        mp_assinatura_id: p.assinatura.mpId,
        erro_mensagem: (eDb instanceof Error ? eDb.message : String(eDb)).slice(0, 300)
      });
      return {
        ok: false,
        status: 500,
        mensagem: 'Cancelamos no Mercado Pago, mas houve uma falha ao atualizar seu registro. Aguarde alguns instantes ou tente novamente.'
      };
    }
  }
  return { ok: true, status: 200, cicloFim: fim ?? p.assinatura.cicloFim };
}
