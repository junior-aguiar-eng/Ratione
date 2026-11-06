/**
 * F5-10: salva, lista, reabre e apaga as análises que a pessoa decide guardar. A lógica fica separada das rotas para ser testada sem rede:
 * as rotas entregam o armazenamento e o banco reais (Supabase), os testes entregam simulações.
 *
 * Regras (RIPD do Argumenta, versão 0.3, seção 7.3):
 * - só grava quando a pessoa pede; o conteúdo (decisão completa com dados reais, resultados e selos) é **cifrado** (AES-256-GCM) antes de ir
 *   ao armazenamento privado, e **nada do conteúdo** vai ao banco: só caminho opaco, tamanho, datas, rótulo e os identificadores públicos das citações;
 * - o prazo é **escolhido pela pessoa** (30 dias, 6 meses, 1 ano ou até excluir) e a faxina apaga o vencido;
 * - **no máximo 10** por pessoa: para salvar outra, ela apaga uma;
 * - ninguém além do dono abre uma análise: de outra pessoa ou inexistente, a resposta é a mesma.
 */
import { randomUUID } from 'node:crypto';
import { cifrar, decifrar } from '../documentos/cifra';
import { LIMITES_DE_ANALISE_SALVA, PRAZOS_DE_ANALISE, lerPrazo, limparRotulo, validarConteudo, type ConteudoSalvo } from './validar';

export interface RegistroDeAnaliseSalva {
  id: string;
  usuarioId: string;
  caminho: string;
  rotulo: string | null;
  tamanhoBytes: number;
  citacoes: string[];
  criadoEm: Date;
  /** `null`: sem vencimento, só a pessoa apaga. */
  expiraEm: Date | null;
}

export interface DependenciasDeAnalisesSalvas {
  chave: Buffer;
  agora: () => Date;
  novoId: () => string;
  armazenamento: {
    gravar(caminho: string, conteudo: Buffer): Promise<void>;
    ler(caminho: string): Promise<Buffer | null>;
    remover(caminhos: string[]): Promise<void>;
  };
  banco: {
    inserir(r: RegistroDeAnaliseSalva): Promise<void>;
    doUsuario(usuarioId: string): Promise<RegistroDeAnaliseSalva[]>;
    remover(ids: string[]): Promise<void>;
    vencidas(ate: Date, limite: number): Promise<RegistroDeAnaliseSalva[]>;
  };
}

/** Apagar e faxinar não precisam da chave nem da flag: o que foi guardado tem de poder ser apagado mesmo com o salvamento desligado. */
export type DependenciasDeApagarAnalise = Pick<DependenciasDeAnalisesSalvas, 'agora' | 'armazenamento' | 'banco'>;

export const dependenciasPadrao = (): Pick<DependenciasDeAnalisesSalvas, 'agora' | 'novoId'> => ({ agora: () => new Date(), novoId: randomUUID });

/** O que a pessoa vê na lista: sem caminho e sem conteúdo. */
export interface AnaliseSalvaPublica {
  id: string;
  rotulo: string | null;
  criadoEm: string;
  expiraEm: string | null;
  tamanhoBytes: number;
}

const publica = (r: RegistroDeAnaliseSalva): AnaliseSalvaPublica => ({
  id: r.id,
  rotulo: r.rotulo,
  criadoEm: r.criadoEm.toISOString(),
  expiraEm: r.expiraEm ? r.expiraEm.toISOString() : null,
  tamanhoBytes: r.tamanhoBytes
});

const dias = (n: number) => n * 24 * 60 * 60 * 1000;
const LIMITE_ATINGIDO = `Você já tem ${LIMITES_DE_ANALISE_SALVA.maxPorUsuario} análises salvas. Exclua alguma para salvar outra.`;

/** Apaga, do armazenamento e do banco, as análises já vencidas da pessoa (primeiro o arquivo, depois a linha) e devolve as que restam. */
async function limparDoUsuario(usuarioId: string, dep: DependenciasDeApagarAnalise): Promise<RegistroDeAnaliseSalva[]> {
  const todas = await dep.banco.doUsuario(usuarioId);
  const agora = dep.agora().getTime();
  const vencidas = todas.filter(r => r.expiraEm !== null && r.expiraEm.getTime() <= agora);
  if (vencidas.length > 0) {
    await dep.armazenamento.remover(vencidas.map(r => r.caminho));
    await dep.banco.remover(vencidas.map(r => r.id));
  }
  return todas.filter(r => !vencidas.includes(r));
}

export type ResultadoDoSalvamento = { ok: true; analise: AnaliseSalvaPublica } | { ok: false; status: 400 | 413 | 429 | 500; mensagem: string };

export interface PedidoDeSalvamento {
  conteudo: unknown;
  rotulo?: unknown;
  prazo?: unknown;
}

export async function salvarAnalise(usuarioId: string, pedido: PedidoDeSalvamento, dep: DependenciasDeAnalisesSalvas): Promise<ResultadoDoSalvamento> {
  const prazo = lerPrazo(pedido.prazo);
  if (!prazo) return { ok: false, status: 400, mensagem: 'Escolha por quanto tempo guardar a análise.' };
  const v = validarConteudo(pedido.conteudo);
  if (!v.ok) return { ok: false, status: 400, mensagem: v.mensagem };
  const bytes = Buffer.from(JSON.stringify(v.conteudo), 'utf8');
  if (bytes.length > LIMITES_DE_ANALISE_SALVA.maxBytes) {
    return { ok: false, status: 413, mensagem: `A análise passa de ${LIMITES_DE_ANALISE_SALVA.maxBytes / 1024 / 1024} MB.` };
  }

  const guardadas = await limparDoUsuario(usuarioId, dep);
  if (guardadas.length >= LIMITES_DE_ANALISE_SALVA.maxPorUsuario) return { ok: false, status: 429, mensagem: LIMITE_ATINGIDO };

  const id = dep.novoId();
  const agora = dep.agora();
  const duracao = PRAZOS_DE_ANALISE[prazo];
  // Caminho opaco: pasta da pessoa e o id da análise; sem rótulo nem dado da decisão no caminho
  const caminho = `${usuarioId}/${id}`;
  const registro: RegistroDeAnaliseSalva = {
    id,
    usuarioId,
    caminho,
    rotulo: limparRotulo(pedido.rotulo),
    tamanhoBytes: bytes.length,
    citacoes: v.citacoes,
    criadoEm: agora,
    expiraEm: duracao === null ? null : new Date(agora.getTime() + dias(duracao))
  };

  await dep.armazenamento.gravar(caminho, cifrar(bytes, dep.chave, caminho));
  try {
    await dep.banco.inserir(registro);
  } catch (e) {
    // Sem a linha no banco o arquivo ficaria órfão e fora do alcance da exclusão: desfaz
    await dep.armazenamento.remover([caminho]).catch(() => undefined);
    // O gatilho do banco recusa a 11ª quando duas gravações simultâneas passam pela contagem acima
    if (/limite de \d+ análises/.test((e as Error).message)) return { ok: false, status: 429, mensagem: LIMITE_ATINGIDO };
    throw e;
  }
  return { ok: true, analise: publica(registro) };
}

/** As análises da pessoa, da mais nova à mais antiga, já sem as vencidas. */
export async function listarAnalises(usuarioId: string, dep: DependenciasDeApagarAnalise): Promise<AnaliseSalvaPublica[]> {
  return (await limparDoUsuario(usuarioId, dep)).map(publica);
}

/** As análises da pessoa que citam o artigo ou o precedente (`normaviva:<dispositivo>` ou `tesemap:<nó>`), sem decifrar nada. */
export async function analisesQueCitam(usuarioId: string, citacao: string, dep: DependenciasDeApagarAnalise): Promise<AnaliseSalvaPublica[]> {
  return (await limparDoUsuario(usuarioId, dep)).filter(r => r.citacoes.includes(citacao)).map(publica);
}

export type ResultadoDaAbertura = { ok: true; conteudo: ConteudoSalvo; analise: AnaliseSalvaPublica } | { ok: false; status: 404 | 500; mensagem: string };

/** Abre uma análise da própria pessoa; de outra pessoa, vencida ou inexistente, o mesmo "não encontrada". */
export async function abrirAnalise(usuarioId: string, id: string, dep: DependenciasDeAnalisesSalvas): Promise<ResultadoDaAbertura> {
  const alvo = (await limparDoUsuario(usuarioId, dep)).find(r => r.id === id);
  if (!alvo) return { ok: false, status: 404, mensagem: 'Análise não encontrada.' };
  const guardado = await dep.armazenamento.ler(alvo.caminho);
  const claro = guardado ? decifrar(guardado, dep.chave, alvo.caminho) : null;
  if (!claro) return { ok: false, status: 500, mensagem: 'Não foi possível abrir esta análise agora.' };
  try {
    return { ok: true, conteudo: JSON.parse(claro.toString('utf8')) as ConteudoSalvo, analise: publica(alvo) };
  } catch {
    return { ok: false, status: 500, mensagem: 'Não foi possível abrir esta análise agora.' };
  }
}

/** Apaga uma análise da própria pessoa; `false` se não existe ou é de outra (o mesmo resultado, para não revelar ids alheios). */
export async function apagarAnalise(usuarioId: string, id: string, dep: DependenciasDeApagarAnalise): Promise<boolean> {
  const alvo = (await dep.banco.doUsuario(usuarioId)).find(r => r.id === id);
  if (!alvo) return false;
  await dep.armazenamento.remover([alvo.caminho]);
  await dep.banco.remover([alvo.id]);
  return true;
}

/** Apaga todas as análises da pessoa (exclusão da conta). Devolve quantas foram apagadas. */
export async function apagarTodasDoUsuario(usuarioId: string, dep: DependenciasDeApagarAnalise): Promise<number> {
  const todas = await dep.banco.doUsuario(usuarioId);
  if (todas.length === 0) return 0;
  await dep.armazenamento.remover(todas.map(r => r.caminho));
  await dep.banco.remover(todas.map(r => r.id));
  return todas.length;
}

/** Faxina geral dos vencidos, chamada pelo agendador. Em lotes, para o pedido não crescer sem limite. */
export async function limparVencidas(dep: DependenciasDeApagarAnalise, lote = 200): Promise<number> {
  const vencidas = await dep.banco.vencidas(dep.agora(), lote);
  if (vencidas.length === 0) return 0;
  await dep.armazenamento.remover(vencidas.map(r => r.caminho));
  await dep.banco.remover(vencidas.map(r => r.id));
  return vencidas.length;
}
