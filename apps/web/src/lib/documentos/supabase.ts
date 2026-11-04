/**
 * F5-01: o armazenamento e o banco reais (Supabase) por trás de `servico.ts`. Só o servidor, com a chave de serviço: o bucket `documentos`
 * é privado e sem política, e a tabela `documentos` só deixa o usuário ler a própria linha (supabase/migrations/20261104000001_documentos.sql).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DependenciasDeDocumentos, RegistroDeDocumento } from './servico';
import type { TipoDeDocumento } from './validar';

const BUCKET = 'documentos';

interface Linha {
  id: string;
  usuario_id: string;
  tipo: TipoDeDocumento;
  tamanho_bytes: number;
  caminho: string;
  criado_em: string;
  expira_em: string;
}

const registro = (l: Linha): RegistroDeDocumento => ({
  id: l.id,
  usuarioId: l.usuario_id,
  tipo: l.tipo,
  tamanhoBytes: l.tamanho_bytes,
  caminho: l.caminho,
  criadoEm: new Date(l.criado_em),
  expiraEm: new Date(l.expira_em)
});

export function armazenamentoEBanco(sb: SupabaseClient): Pick<DependenciasDeDocumentos, 'armazenamento' | 'banco'> {
  return {
    armazenamento: {
      async gravar(caminho, conteudo) {
        const r = await sb.storage.from(BUCKET).upload(caminho, conteudo, { contentType: 'application/octet-stream', upsert: false });
        if (r.error) throw new Error(r.error.message);
      },
      async remover(caminhos) {
        if (caminhos.length === 0) return;
        const r = await sb.storage.from(BUCKET).remove(caminhos);
        if (r.error) throw new Error(r.error.message);
      }
    },
    banco: {
      async inserir(r) {
        const e = await sb.from('documentos').insert({
          id: r.id,
          usuario_id: r.usuarioId,
          tipo: r.tipo,
          tamanho_bytes: r.tamanhoBytes,
          caminho: r.caminho,
          criado_em: r.criadoEm.toISOString(),
          expira_em: r.expiraEm.toISOString()
        });
        if (e.error) throw new Error(e.error.message);
      },
      async doUsuario(usuarioId) {
        const r = await sb.from('documentos').select('*').eq('usuario_id', usuarioId).order('criado_em', { ascending: false }).limit(100);
        if (r.error) throw new Error(r.error.message);
        return ((r.data ?? []) as Linha[]).map(registro);
      },
      async remover(ids) {
        if (ids.length === 0) return;
        const r = await sb.from('documentos').delete().in('id', ids);
        if (r.error) throw new Error(r.error.message);
      },
      async vencidos(ate, limite) {
        const r = await sb.from('documentos').select('*').lte('expira_em', ate.toISOString()).order('expira_em').limit(limite);
        if (r.error) throw new Error(r.error.message);
        return ((r.data ?? []) as Linha[]).map(registro);
      }
    }
  };
}
