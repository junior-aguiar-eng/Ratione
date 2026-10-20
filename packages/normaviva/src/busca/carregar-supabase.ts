/**
 * Carga do corpus no Supabase real (F3-05). A partir de `packages/normaviva`, NO SEU COMPUTADOR:
 *
 *   pnpm carregar --simular   # só monta as linhas e mostra as contagens; não precisa de chave nem toca no banco
 *   pnpm carregar             # apaga o conteúdo das 4 tabelas do NormaViva e recarrega o corpus inteiro
 *
 * Variáveis de ambiente (defina no terminal, NUNCA em arquivo versionado nem em conversa):
 *   SUPABASE_URL                  https://<ref>.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY     chave secreta (service_role); só este script a usa
 *
 * Antes: aplicar no SQL Editor as migrações de `supabase/migrations` (a 20261021000001_versoes_anteriores.sql acrescenta colunas que a carga usa).
 * A carga inclui as redações anteriores dos casos do F3-07 (`historico-conhecido.json`) como segunda versão do dispositivo.
 * A recarga é completa e idempotente: `delete` em `normas` leva junto, em cascata, dispositivos, versões e relações.
 */
import { join } from 'node:path';
import { linhasDoCorpus, type LinhasDaNorma } from './carga';

const PASTA = join(__dirname, '..', '..', 'corpus');
const LOTE = 1000;

/** O mínimo do cliente do Supabase que a carga usa; o teste troca por um falso. */
export interface ClienteCarga {
  from(tabela: string): {
    insert(linhas: unknown[]): PromiseLike<{ error: { message: string } | null }>;
    delete(): { neq(coluna: string, valor: string): PromiseLike<{ error: { message: string } | null }> };
    select(colunas: string, opcoes: { count: 'exact'; head: true }): PromiseLike<{ count: number | null; error: { message: string } | null }>;
  };
  rpc(funcao: string): PromiseLike<{ data: unknown; error: { message: string } | null }>;
}

function checar(r: { error: { message: string } | null }, etapa: string) {
  if (r.error) throw new Error(`${etapa}: ${r.error.message}`);
}

export interface Contagens {
  normas: number;
  dispositivos: number;
  versoes_dispositivo: number;
  relacoes: number;
}

export function contar(l: LinhasDaNorma[]): Contagens {
  return {
    normas: l.length,
    dispositivos: l.reduce((s, n) => s + n.dispositivos.length, 0),
    versoes_dispositivo: l.reduce((s, n) => s + n.versoes.length, 0),
    relacoes: l.reduce((s, n) => s + n.relacoes.length, 0)
  };
}

export async function carregar(cliente: ClienteCarga, linhas: LinhasDaNorma[], log: (m: string) => void = () => {}): Promise<Contagens> {
  checar(await cliente.from('normas').delete().neq('id', '__nenhuma__'), 'limpar normas (cascata)');
  const inserir = async (tabela: string, todas: unknown[]) => {
    for (let i = 0; i < todas.length; i += LOTE) checar(await cliente.from(tabela).insert(todas.slice(i, i + LOTE)), `inserir ${tabela} (lote ${i / LOTE + 1})`);
    log(`  ${tabela}: ${todas.length} linhas`);
  };
  // Ordem das chaves estrangeiras: norma → dispositivos (pai antes do filho, como o parser ordena) → versões e relações
  await inserir('normas', linhas.map(l => l.norma));
  for (const l of linhas) await inserir('dispositivos', l.dispositivos);
  for (const l of linhas) await inserir('versoes_dispositivo', l.versoes);
  for (const l of linhas) await inserir('relacoes', l.relacoes);
  const r = await cliente.rpc('resolver_destinos_relacoes');
  checar(r, 'resolver destinos');
  log(`  remissões ligadas ao artigo de destino: ${r.data}`);

  const confirmado: Partial<Contagens> = {};
  for (const t of ['normas', 'dispositivos', 'versoes_dispositivo', 'relacoes'] as const) {
    const c = await cliente.from(t).select('*', { count: 'exact', head: true });
    checar(c, `contar ${t}`);
    confirmado[t] = c.count ?? 0;
  }
  return confirmado as Contagens;
}

async function main() {
  const simular = process.argv.includes('--simular');
  const linhas = linhasDoCorpus(PASTA, undefined, { comHistorico: true });
  const esperado = contar(linhas);
  console.log('Corpus montado:', esperado);
  if (simular) {
    console.log('Simulação: nada foi enviado ao banco.');
    return;
  }
  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) throw new Error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no terminal (veja o comentário no topo deste arquivo).');
  if (!/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(url)) throw new Error('SUPABASE_URL deve ser o endereço do projeto, no formato https://<ref>.supabase.co');
  const { createClient } = await import('@supabase/supabase-js');
  const cliente = createClient(url, chave, { auth: { persistSession: false } }) as unknown as ClienteCarga;
  console.log(`Carregando em ${url} ...`);
  const confirmado = await carregar(cliente, linhas, console.log);
  console.log('Contagem no banco:', confirmado);
  const bate = (Object.keys(esperado) as Array<keyof Contagens>).every(k => esperado[k] === confirmado[k]);
  if (!bate) throw new Error('A contagem no banco difere do corpus montado: investigue antes de usar.');
  console.log('Carga conferida: o banco tem exatamente o corpus.');
}

if (require.main === module) main().catch(e => {
  console.error(String(e instanceof Error ? e.message : e));
  process.exitCode = 1;
});
