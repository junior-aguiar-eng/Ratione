/**
 * Casos: pastas de "Meu espaço" para agrupar o que a pessoa já salva (normas, teses, prazos, análises). O caso guarda só o nome que ela dá a ele;
 * nenhum texto de decisão nem dado de processo entra aqui. Cada caso e cada vínculo são da pessoa (RLS no banco, `supabase/migrations/20261105000001_casos.sql`).
 * Só para quem tem conta: o armazenamento deste navegador não tem pastas.
 */
import { temDadoPessoal } from '@ratione/argumenta';
import { obterSupabase } from './supabase/client';
import type { RegistroHistorico } from './historico';

export interface Caso {
  id: string;
  nome: string;
  criadoEm: string;
}

export const TAMANHO_MAXIMO_DO_NOME = 80;

export type NomeValidado = { ok: true; nome: string } | { ok: false; mensagem: string };

/**
 * O nome do caso: sem espaços sobrando, de 1 a 80 caracteres e sem o que a detecção reconhece como dado pessoal (CPF, CNPJ, número de processo,
 * e-mail, telefone). Nome de parte a detecção não acha: a tela pede que a pessoa use um nome que só ela entenda.
 */
export function validarNomeDoCaso(entrada: string): NomeValidado {
  const nome = entrada.replace(/\s+/g, ' ').trim();
  if (nome.length === 0) return { ok: false, mensagem: 'Dê um nome ao caso.' };
  if (nome.length > TAMANHO_MAXIMO_DO_NOME) return { ok: false, mensagem: `Use até ${TAMANHO_MAXIMO_DO_NOME} caracteres.` };
  if (temDadoPessoal(nome)) return { ok: false, mensagem: 'O nome parece ter CPF, CNPJ, número de processo, e-mail ou telefone. Use um nome que só você entenda.' };
  return { ok: true, nome };
}

/** Quantos itens há em cada caso e quantos estão soltos (sem caso). */
export function contarPorCaso(itens: readonly Pick<RegistroHistorico, 'casoId'>[]): { porCaso: Map<string, number>; soltos: number } {
  const porCaso = new Map<string, number>();
  let soltos = 0;
  for (const i of itens) {
    if (i.casoId) porCaso.set(i.casoId, (porCaso.get(i.casoId) ?? 0) + 1);
    else soltos += 1;
  }
  return { porCaso, soltos };
}

/** Mensagem do gatilho do banco (supabase/migrations/20261105000001_casos.sql). */
export const ehErroDeLimiteDeCasos = (mensagem: string | undefined): boolean => /limite de \d+ casos/.test(mensagem ?? '');

export type ResultadoDoCaso = { ok: true; caso: Caso } | { ok: false; mensagem: string };

interface LinhaCaso {
  id: string;
  nome: string;
  criado_em: string;
}

const paraCaso = (l: LinhaCaso): Caso => ({ id: l.id, nome: l.nome, criadoEm: l.criado_em });

/** Os casos da pessoa, os mais antigos primeiro. `null` quando a conta ou a tabela não está disponível (a tela então esconde as pastas). */
export async function listarCasos(): Promise<Caso[] | null> {
  const sb = obterSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('casos').select('id, nome, criado_em').order('criado_em', { ascending: true });
  return error ? null : ((data ?? []) as LinhaCaso[]).map(paraCaso);
}

export async function criarCaso(entrada: string): Promise<ResultadoDoCaso> {
  const v = validarNomeDoCaso(entrada);
  if (!v.ok) return v;
  const sb = obterSupabase();
  if (!sb) return { ok: false, mensagem: 'A conta não está disponível agora.' };
  const { data: sessao } = await sb.auth.getSession();
  const usuarioId = sessao.session?.user.id;
  if (!usuarioId) return { ok: false, mensagem: 'Entre na sua conta para criar casos.' };
  const { data, error } = await sb.from('casos').insert({ usuario_id: usuarioId, nome: v.nome }).select('id, nome, criado_em').single();
  if (error || !data) return { ok: false, mensagem: ehErroDeLimiteDeCasos(error?.message) ? 'Você chegou ao limite de 50 casos. Apague um para criar outro.' : 'Não foi possível criar o caso agora.' };
  return { ok: true, caso: paraCaso(data as LinhaCaso) };
}

export async function renomearCaso(id: string, entrada: string): Promise<ResultadoDoCaso> {
  const v = validarNomeDoCaso(entrada);
  if (!v.ok) return v;
  const sb = obterSupabase();
  if (!sb) return { ok: false, mensagem: 'A conta não está disponível agora.' };
  const { data, error } = await sb.from('casos').update({ nome: v.nome }).eq('id', id).select('id, nome, criado_em').single();
  return error || !data ? { ok: false, mensagem: 'Não foi possível renomear o caso agora.' } : { ok: true, caso: paraCaso(data as LinhaCaso) };
}

/** Apaga só a pasta: os itens dela voltam a ficar soltos em "Meu espaço". */
export async function apagarCaso(id: string): Promise<boolean> {
  const sb = obterSupabase();
  if (!sb) return false;
  const { error } = await sb.from('casos').delete().eq('id', id);
  return !error;
}

/** Põe o item em um caso, ou o solta (`null`). */
export async function moverItemParaCaso(itemId: string, casoId: string | null): Promise<boolean> {
  const sb = obterSupabase();
  if (!sb) return false;
  const { error } = await sb.from('itens_salvos').update({ caso_id: casoId }).eq('id', itemId);
  return !error;
}
