/**
 * F5-04: confere as citações reconhecidas contra o corpus público (NormaViva e TeseMap). A leitura é a mesma de qualquer visitante, feita pelo
 * navegador com a chave publicável: só a string da citação ("CDC, art. 14") sai da página, nunca o texto da decisão, e nada é gravado.
 * "Não localizada" quer dizer que a base do Ratione não tem a citação, e não que ela esteja errada.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { urlDoNormaViva, urlDoTeseMap } from '../parametrosSalvos';
import { reconhecerCitacao, type CitacaoReconhecida, type Tribunal } from './citacoes';

export type EstadoCitacao = 'encontrada' | 'nao_localizada' | 'fora_do_corpus';

export interface LinkDaCitacao {
  rotulo: string;
  href: string;
}

export interface VerificacaoDaCitacao {
  estado: EstadoCitacao;
  links: LinkDaCitacao[];
  /** Explica o estado em uma frase, sem afirmar que a citação esteja certa ou errada. */
  aviso?: string;
}

/** O que a verificação lê do banco; separado para os testes não precisarem de um banco. */
export interface BancoDeCitacoes {
  dispositivoId(normaId: string, rotulo: string): Promise<string | null>;
  sumulas(tribunais: Tribunal[], referencias: string[]): Promise<Array<{ id: string; rotulo: string }>>;
  nosPorId(ids: string[]): Promise<Array<{ id: string; rotulo: string }>>;
}

export const LIMITE_DE_CITACOES = 60;

export function bancoSupabase(db: SupabaseClient): BancoDeCitacoes {
  return {
    async dispositivoId(normaId, rotulo) {
      const r = await db.from('dispositivos').select('id').eq('norma_id', normaId).eq('escopo', 'corpo').eq('rotulo', rotulo).limit(1);
      if (r.error) throw new Error(r.error.message);
      return r.data?.[0]?.id ?? null;
    },
    async sumulas(tribunais, referencias) {
      const r = await db.from('tesemap_nos').select('id, rotulo').eq('tipo', 'sumula').in('tribunal', tribunais).in('numero_referencia', referencias).limit(10);
      if (r.error) throw new Error(r.error.message);
      return (r.data ?? []) as Array<{ id: string; rotulo: string }>;
    },
    async nosPorId(ids) {
      const r = await db.from('tesemap_nos').select('id, rotulo').in('id', ids).limit(10);
      if (r.error) throw new Error(r.error.message);
      return (r.data ?? []) as Array<{ id: string; rotulo: string }>;
    }
  };
}

const NAO_LOCALIZADA = 'A base do Ratione não tem esta citação. Isso não quer dizer que ela esteja errada: confira na fonte oficial.';

async function conferir(c: CitacaoReconhecida, normasConhecidas: string[], banco: BancoDeCitacoes): Promise<VerificacaoDaCitacao> {
  switch (c.tipo) {
    case 'fora':
      return { estado: 'fora_do_corpus', links: [], aviso: `${c.motivo} Não foi possível conferir.` };

    case 'norma':
      return normasConhecidas.includes(c.normaId)
        ? { estado: 'encontrada', links: [{ rotulo: 'Abrir no NormaViva', href: '/normaviva' }] }
        : { estado: 'fora_do_corpus', links: [], aviso: 'Norma que a base ainda não cobre. Não foi possível conferir.' };

    case 'dispositivo': {
      const artigo = await banco.dispositivoId(c.normaId, `art. ${c.artigo}`);
      if (!artigo) return { estado: 'nao_localizada', links: [], aviso: NAO_LOCALIZADA };
      if (!c.detalhe) return { estado: 'encontrada', links: [{ rotulo: 'Abrir no NormaViva', href: urlDoNormaViva({ dispositivoId: artigo }) }] };
      const detalhado = await banco.dispositivoId(c.normaId, `art. ${c.artigo}, ${c.detalhe}`);
      return detalhado
        ? { estado: 'encontrada', links: [{ rotulo: 'Abrir no NormaViva', href: urlDoNormaViva({ dispositivoId: detalhado }) }] }
        : {
            estado: 'encontrada',
            links: [{ rotulo: 'Abrir o artigo no NormaViva', href: urlDoNormaViva({ dispositivoId: artigo }) }],
            aviso: 'O artigo existe na base. O parágrafo, inciso ou alínea citado não foi conferido.'
          };
    }

    case 'sumula': {
      const referencia = c.vinculante ? `SV ${c.numero}` : `Súmula ${c.numero}`;
      const nos = await banco.sumulas(c.tribunais, [referencia]);
      return nos.length > 0
        ? { estado: 'encontrada', links: nos.map(n => ({ rotulo: n.rotulo, href: urlDoTeseMap({ noId: n.id }) })) }
        : { estado: 'nao_localizada', links: [], aviso: NAO_LOCALIZADA };
    }

    case 'tema': {
      const ids = c.tribunais.map(t => (t === 'STF' ? `STF-RG-${c.numero}` : `STJ-TEMA-${c.numero}`));
      const nos = await banco.nosPorId(ids);
      return nos.length > 0
        ? { estado: 'encontrada', links: nos.map(n => ({ rotulo: n.rotulo, href: urlDoTeseMap({ noId: n.id }) })) }
        : { estado: 'nao_localizada', links: [], aviso: NAO_LOCALIZADA };
    }

    case 'acao': {
      const nos = await banco.nosPorId([`STF-${c.classe}-${c.numero}`]);
      // A base só tem as ações com mérito julgado: ausência aqui não indica que o número esteja errado
      return nos.length > 0
        ? { estado: 'encontrada', links: nos.map(n => ({ rotulo: n.rotulo, href: urlDoTeseMap({ noId: n.id }) })) }
        : { estado: 'fora_do_corpus', links: [], aviso: 'A base só tem as ações de controle concentrado com mérito julgado. Não foi possível conferir.' };
    }
  }
}

/**
 * Confere cada citação distinta. A chave do resultado é a citação como veio. Citação sem formato conhecido não entra no resultado (sem selo),
 * e a que falha na leitura do banco também não: na dúvida, a tela não afirma nada.
 */
export async function verificarCitacoes(
  citacoes: readonly string[],
  normasConhecidas: string[],
  banco: BancoDeCitacoes
): Promise<Map<string, VerificacaoDaCitacao>> {
  const distintas = [...new Set(citacoes.map(c => c.trim()).filter(Boolean))].slice(0, LIMITE_DE_CITACOES);
  const resultado = new Map<string, VerificacaoDaCitacao>();
  await Promise.all(
    distintas.map(async texto => {
      const reconhecida = reconhecerCitacao(texto, normasConhecidas);
      if (!reconhecida) return;
      try {
        resultado.set(texto, await conferir(reconhecida, normasConhecidas, banco));
      } catch {
        /* sem selo */
      }
    })
  );
  return resultado;
}
