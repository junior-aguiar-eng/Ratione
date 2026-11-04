/**
 * F5-01: guarda, lista e apaga os documentos que o usuário envia. A lógica fica separada das rotas para ser testada sem rede: as rotas
 * entregam o armazenamento e o banco reais (Supabase), os testes entregam simulações.
 *
 * Regras (RIPD do Argumenta, seção 7, condições 1 a 3):
 * - o arquivo é **cifrado** (AES-256-GCM, chave do ambiente) antes de ir ao armazenamento privado;
 * - **nada do conteúdo nem o nome do arquivo** vai ao banco: só tipo, tamanho, caminho opaco e datas;
 * - cada arquivo **expira** (`retencaoDias`) e é apagado sozinho; o usuário também apaga quando quiser;
 * - limites de tamanho e de quantidade por usuário.
 * A leitura do texto do documento (Docling) é a F5-02; aqui só se guarda.
 */
import { randomUUID } from 'node:crypto';
import { cifrar } from './cifra';
import { LIMITES_DE_DOCUMENTO, validarDocumento, type TipoDeDocumento } from './validar';

export interface RegistroDeDocumento {
  id: string;
  usuarioId: string;
  tipo: TipoDeDocumento;
  tamanhoBytes: number;
  caminho: string;
  criadoEm: Date;
  expiraEm: Date;
}

export interface DependenciasDeDocumentos {
  /** Chave AES-256 (já lida do ambiente). */
  chave: Buffer;
  retencaoDias: number;
  agora: () => Date;
  novoId: () => string;
  armazenamento: {
    gravar(caminho: string, conteudo: Buffer): Promise<void>;
    remover(caminhos: string[]): Promise<void>;
  };
  banco: {
    inserir(r: RegistroDeDocumento): Promise<void>;
    doUsuario(usuarioId: string): Promise<RegistroDeDocumento[]>;
    remover(ids: string[]): Promise<void>;
    vencidos(ate: Date, limite: number): Promise<RegistroDeDocumento[]>;
  };
}

/** Apagar e faxinar não precisam da chave de cifra nem da flag: o que foi guardado tem de poder ser apagado mesmo com o envio desligado. */
export type DependenciasDeApagar = Pick<DependenciasDeDocumentos, 'agora' | 'armazenamento' | 'banco'>;

export const dependenciasPadrao = (): Pick<DependenciasDeDocumentos, 'agora' | 'novoId'> => ({ agora: () => new Date(), novoId: randomUUID });

export type ResultadoDeEnvio =
  | { ok: true; documento: DocumentoPublico }
  | { ok: false; status: 400 | 413 | 429 | 500; mensagem: string };

/** O que o usuário vê: sem caminho e sem nome (o caminho é opaco e interno). */
export interface DocumentoPublico {
  id: string;
  tipo: TipoDeDocumento;
  tamanhoBytes: number;
  criadoEm: string;
  expiraEm: string;
}

const publico = (r: RegistroDeDocumento): DocumentoPublico => ({
  id: r.id,
  tipo: r.tipo,
  tamanhoBytes: r.tamanhoBytes,
  criadoEm: r.criadoEm.toISOString(),
  expiraEm: r.expiraEm.toISOString()
});

const dias = (n: number) => n * 24 * 60 * 60 * 1000;

/** Apaga, do armazenamento e do banco, os documentos já vencidos do usuário (primeiro o arquivo, depois a linha). */
async function limparDoUsuario(usuarioId: string, dep: DependenciasDeApagar): Promise<RegistroDeDocumento[]> {
  const todos = await dep.banco.doUsuario(usuarioId);
  const agora = dep.agora().getTime();
  const vencidos = todos.filter(r => r.expiraEm.getTime() <= agora);
  if (vencidos.length > 0) {
    await dep.armazenamento.remover(vencidos.map(r => r.caminho));
    await dep.banco.remover(vencidos.map(r => r.id));
  }
  return todos.filter(r => !vencidos.includes(r));
}

export async function enviarDocumento(usuarioId: string, conteudo: Uint8Array, dep: DependenciasDeDocumentos): Promise<ResultadoDeEnvio> {
  if (conteudo.length > LIMITES_DE_DOCUMENTO.maxBytes) {
    return { ok: false, status: 413, mensagem: `O arquivo passa de ${LIMITES_DE_DOCUMENTO.maxBytes / 1024 / 1024} MB.` };
  }
  const v = validarDocumento(conteudo);
  if (!v.ok) return { ok: false, status: 400, mensagem: v.mensagem };

  const guardados = await limparDoUsuario(usuarioId, dep);
  if (guardados.length >= LIMITES_DE_DOCUMENTO.maxPorUsuario) {
    return {
      ok: false,
      status: 429,
      mensagem: `Você já tem ${LIMITES_DE_DOCUMENTO.maxPorUsuario} arquivos guardados. Apague algum para enviar outro.`
    };
  }

  const id = dep.novoId();
  const agora = dep.agora();
  // Caminho opaco: pasta do usuário e o id do documento; sem nome nem tipo no caminho
  const caminho = `${usuarioId}/${id}`;
  const registro: RegistroDeDocumento = {
    id,
    usuarioId,
    tipo: v.tipo,
    tamanhoBytes: conteudo.length,
    caminho,
    criadoEm: agora,
    expiraEm: new Date(agora.getTime() + dias(dep.retencaoDias))
  };

  await dep.armazenamento.gravar(caminho, cifrar(conteudo, dep.chave, caminho));
  try {
    await dep.banco.inserir(registro);
  } catch (e) {
    // Sem a linha no banco o arquivo ficaria órfão e fora do alcance da exclusão: desfaz
    await dep.armazenamento.remover([caminho]).catch(() => undefined);
    throw e;
  }
  return { ok: true, documento: publico(registro) };
}

export async function listarDocumentos(usuarioId: string, dep: DependenciasDeApagar): Promise<DocumentoPublico[]> {
  return (await limparDoUsuario(usuarioId, dep)).map(publico);
}

/** Apaga um documento do próprio usuário; `false` se não existe ou é de outro (o mesmo erro, para não revelar ids alheios). */
export async function apagarDocumento(usuarioId: string, id: string, dep: DependenciasDeApagar): Promise<boolean> {
  const alvo = (await dep.banco.doUsuario(usuarioId)).find(r => r.id === id);
  if (!alvo) return false;
  await dep.armazenamento.remover([alvo.caminho]);
  await dep.banco.remover([alvo.id]);
  return true;
}

/** Apaga todos os documentos do usuário (exclusão da conta). Devolve quantos foram apagados. */
export async function apagarTodosDoUsuario(usuarioId: string, dep: DependenciasDeApagar): Promise<number> {
  const todos = await dep.banco.doUsuario(usuarioId);
  if (todos.length === 0) return 0;
  await dep.armazenamento.remover(todos.map(r => r.caminho));
  await dep.banco.remover(todos.map(r => r.id));
  return todos.length;
}

/** Faxina geral dos vencidos, chamada pelo agendador. Em lotes, para o pedido não crescer sem limite. */
export async function limparVencidos(dep: DependenciasDeApagar, lote = 200): Promise<number> {
  const vencidos = await dep.banco.vencidos(dep.agora(), lote);
  if (vencidos.length === 0) return 0;
  await dep.armazenamento.remover(vencidos.map(r => r.caminho));
  await dep.banco.remover(vencidos.map(r => r.id));
  return vencidos.length;
}
