/**
 * F5-10: o armazenamento e o banco reais (Supabase) por trás de `servico.ts`. Só o servidor, com a chave de serviço: o bucket
 * `analises-salvas` é privado e sem política, e a tabela `analises_salvas` só deixa a pessoa ler a própria linha
 * (supabase/migrations/20261106000001_analises_salvas.sql).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DependenciasDeAnalisesSalvas, RegistroDeAnaliseSalva } from './servico';

const BUCKET = 'analises-salvas';

interface Linha {
  id: string;
  usuario_id: string;
  caminho: string;
  rotulo: string | null;
  tamanho_bytes: number;
  citacoes: string[];
  criado_em: string;
  expira_em: string | null;
}

const registro = (l: Linha): RegistroDeAnaliseSalva => ({
  id: l.id,
  usuarioId: l.usuario_id,
  caminho: l.caminho,
  rotulo: l.rotulo,
  tamanhoBytes: l.tamanho_bytes,
  citacoes: l.citacoes ?? [],
  criadoEm: new Date(l.criado_em),
  expiraEm: l.expira_em ? new Date(l.expira_em) : null
});

export function armazenamentoEBanco(sb: SupabaseClient): Pick<DependenciasDeAnalisesSalvas, 'armazenamento' | 'banco'> {
  return {
    armazenamento: {
      async gravar(caminho, conteudo) {
        const r = await sb.storage.from(BUCKET).upload(caminho, conteudo, { contentType: 'application/octet-stream', upsert: false });
        if (r.error) throw new Error(r.error.message);
      },
      async ler(caminho) {
        const r = await sb.storage.from(BUCKET).download(caminho);
        if (r.error || !r.data) return null;
        return Buffer.from(await r.data.arrayBuffer());
      },
      async remover(caminhos) {
        if (caminhos.length === 0) return;
        const r = await sb.storage.from(BUCKET).remove(caminhos);
        if (r.error) throw new Error(r.error.message);
      }
    },
    banco: {
      async inserir(r) {
        const e = await sb.from('analises_salvas').insert({
          id: r.id,
          usuario_id: r.usuarioId,
          caminho: r.caminho,
          rotulo: r.rotulo,
          tamanho_bytes: r.tamanhoBytes,
          citacoes: r.citacoes,
          criado_em: r.criadoEm.toISOString(),
          expira_em: r.expiraEm ? r.expiraEm.toISOString() : null
        });
        if (e.error) throw new Error(e.error.message);
      },
      async doUsuario(usuarioId) {
        const r = await sb.from('analises_salvas').select('*').eq('usuario_id', usuarioId).order('criado_em', { ascending: false }).limit(100);
        if (r.error) throw new Error(r.error.message);
        return ((r.data ?? []) as Linha[]).map(registro);
      },
      async remover(ids) {
        if (ids.length === 0) return;
        const r = await sb.from('analises_salvas').delete().in('id', ids);
        if (r.error) throw new Error(r.error.message);
      },
      async vencidas(ate, limite) {
        const r = await sb.from('analises_salvas').select('*').not('expira_em', 'is', null).lte('expira_em', ate.toISOString()).order('expira_em').limit(limite);
        if (r.error) throw new Error(r.error.message);
        return ((r.data ?? []) as Linha[]).map(registro);
      }
    }
  };
}
