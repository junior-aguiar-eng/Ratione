/**
 * `pnpm historico:sql`: gera `supabase/correcoes/20261021_versoes_anteriores.sql`, que leva as redações anteriores (casos do F3-07) ao banco já
 * carregado, sem recarregar o corpus. É o mesmo resultado de `pnpm carregar` com o histórico: uma segunda versão por caso, e a vigente marcada com
 * `texto_anterior_disponivel`. Idempotente (só insere onde o dispositivo ainda não tem redação anterior). Depende da migração
 * `20261021000001_versoes_anteriores.sql` (colunas novas) e do código novo da página já publicado (ver `supabase/LEIA-ME.md`).
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { linhasDoCorpus, type LinhaVersao } from '../busca/carga';

const PASTA = join(__dirname, '..', '..', 'corpus');
const DESTINO = join(__dirname, '..', '..', '..', '..', 'supabase', 'correcoes', '20261021_versoes_anteriores.sql');

/** Literal de texto com dollar-quoting; a etiqueta não pode aparecer no texto. */
function texto(valor: string | null): string {
  if (valor === null) return 'null';
  const tag = ['t', 'tx', 'tt'].find(t => !valor.includes(`$${t}$`));
  if (!tag) throw new Error(`texto com todas as etiquetas de citação: ${valor.slice(0, 40)}`);
  return `$${tag}$${valor}$${tag}$`;
}
const inteiro = (valor: number | null) => (valor === null ? 'null' : String(valor));

export function sqlDeVersoesAnteriores(anteriores: LinhaVersao[]): string {
  const valores = anteriores
    .map(
      v =>
        `  (${[
          texto(v.dispositivo_id), texto(v.texto), texto(v.origem), texto(v.ato_chave), texto(v.ato_rotulo), texto(v.ato_assinatura), texto(v.ato_publicacao), inteiro(v.ano_do_ato),
          texto(v.fonte_da_data), texto(v.vigente_de), texto(v.vigente_ate), texto(v.conhecido_em), texto(v.hash), texto(v.conferida_por), texto(v.conferida_em)
        ].join(', ')})`
    )
    .join(',\n');
  return `-- F3-04: redações anteriores no banco real (${anteriores.length} dispositivos), geradas dos casos do F3-07 (packages/normaviva/corpus/historico-conhecido.json).
-- Cada linha é a redação ANTERIOR de um dispositivo: texto lido do trecho tachado da página anotada do Planalto (fonte_do_texto = 'tachado_planalto'),
-- com o fim na véspera da publicação do ato que deu a redação atual e o início quando a anotação o nomeia. A vigência é provisória (publicação do ato).
-- As conferidas pelo revisor jurídico levam conferida_por e conferida_em; as demais ficam nulas e a tela avisa que o texto não foi conferido.
-- Também marca a redação vigente desses dispositivos com texto_anterior_disponivel. Idempotente: não repete a redação anterior que já existe.
-- ORDEM (supabase/LEIA-ME.md): 1) código novo da página publicado; 2) migração 20261021000001_versoes_anteriores.sql; 3) este arquivo.
-- A última consulta confere o resultado (esperado: ${anteriores.length} e ${anteriores.length}).

begin;

with novas (dispositivo_id, texto, origem, ato_chave, ato_rotulo, ato_assinatura, ato_publicacao, ano_do_ato, fonte_da_data, vigente_de, vigente_ate, conhecido_em, hash, conferida_por, conferida_em) as (
  values
${valores}
),
inseridas as (
  insert into public.versoes_dispositivo
    (dispositivo_id, texto, origem, ato_chave, ato_rotulo, ato_assinatura, ato_publicacao, ano_do_ato, fonte_da_data, vigente_de, vigente_ate,
     vigencia_confirmada, texto_anterior_disponivel, conhecido_em, hash, fonte_do_texto, conferida_por, conferida_em)
  select n.dispositivo_id, n.texto, n.origem, n.ato_chave, n.ato_rotulo, n.ato_assinatura::date, n.ato_publicacao::date, n.ano_do_ato::integer, n.fonte_da_data,
         n.vigente_de::date, n.vigente_ate::date, false, false, n.conhecido_em::date, n.hash, 'tachado_planalto', n.conferida_por, n.conferida_em::date
  from novas n
  where exists (select 1 from public.dispositivos d where d.id = n.dispositivo_id)
    and not exists (select 1 from public.versoes_dispositivo x where x.dispositivo_id = n.dispositivo_id and x.vigente_ate is not null)
  returning dispositivo_id
)
update public.versoes_dispositivo v set texto_anterior_disponivel = true
where v.vigente_ate is null and v.dispositivo_id in (select dispositivo_id from novas);

commit;

select
  (select count(*) from public.versoes_dispositivo where fonte_do_texto = 'tachado_planalto') as redacoes_anteriores,
  (select count(*) from public.versoes_dispositivo v where v.vigente_ate is null and v.texto_anterior_disponivel and exists (select 1 from public.versoes_dispositivo x where x.dispositivo_id = v.dispositivo_id and x.fonte_do_texto = 'tachado_planalto')) as vigentes_marcadas;
`;
}

export function versoesAnterioresDoCorpus(): LinhaVersao[] {
  const todas = linhasDoCorpus(PASTA, undefined, { comHistorico: true });
  return todas.flatMap(l => l.versoes.filter(v => v.fonte_do_texto === 'tachado_planalto')).sort((a, b) => a.dispositivo_id.localeCompare(b.dispositivo_id));
}

function main() {
  const anteriores = versoesAnterioresDoCorpus();
  writeFileSync(DESTINO, sqlDeVersoesAnteriores(anteriores), 'utf-8');
  console.log(`${anteriores.length} redações anteriores gravadas em supabase/correcoes/20261021_versoes_anteriores.sql`);
}

if (require.main === module) main();
