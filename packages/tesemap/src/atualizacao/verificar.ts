/**
 * Atualização periódica do TeseMap. A partir de `packages/tesemap`:
 *
 *   pnpm verificar:tesemap
 *
 * 1) Dados Abertos do STJ (acesso automático permitido): baixa de novo o conjunto "Precedentes qualificados", compara o SHA-256 de cada arquivo com o
 *    manifesto e, se mudou, diz o que mudou nos precedentes que o grafo usa (tema ou IAC com tese, não cancelado): entrou, saiu, a tese mudou.
 * 2) Fontes que só entram pelo responsável (STF bloqueia o acesso automático; súmulas do STJ vêm da pesquisa do SCON impressa em PDF): avisa quando a
 *    última entrada passou de `PRAZO_FONTE_MANUAL_DIAS`.
 *
 * NÃO grava nada no corpus nem no banco: escreve o relatório em `corpus/atualizacao-relatorio.json` e sai com 0 (nada a fazer), 2 (há o que fazer)
 * ou 1 (erro de execução). O workflow semanal transforma o código 2 numa issue; quem atualiza é o responsável (`pnpm coletar:stj` e a carga).
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { baixarConjunto, type ManifestoStj } from '../stj/coletar';
import { carregarPrecedentesStj, manifestoStj } from '../stj/corpus';
import { temTeseFirmada, type PrecedenteStj } from '../stj/precedentes';
import { manifestoSumulasStj } from '../stj/sumulas-corpus';
import { manifestoStf } from '../stf/corpus';

export const PRAZO_FONTE_MANUAL_DIAS = 90;
const AMOSTRA = 30;

/** O que vira nó do grafo (mesmo critério de `nosDosPrecedentesStj`). */
const noGrafo = (p: PrecedenteStj) => temTeseFirmada(p) && !p.cancelado && (p.tipo === 'Tema' || p.tipo === 'IAC');
const espacos = (t: string | null) => (t ?? '').replace(/\s+/g, ' ').trim();

export interface MudancasNosPrecedentes {
  /** Passou a ter nó no grafo: precedente novo com tese, ou tese firmada agora. */
  entram: string[];
  /** Deixou de ter nó: cancelado, tese retirada ou precedente que sumiu do arquivo. */
  saem: string[];
  /** Continua no grafo com outra tese. */
  teseAlterada: string[];
  /** Mudou só a situação informada pelo STJ ("Afetado" → "Trânsito em Julgado"…), entre os que ficam no grafo. */
  situacaoAlterada: string[];
}

export function compararPrecedentes(antes: PrecedenteStj[], depois: PrecedenteStj[]): MudancasNosPrecedentes {
  const a = new Map(antes.map(p => [p.id, p]));
  const d = new Map(depois.map(p => [p.id, p]));
  const m: MudancasNosPrecedentes = { entram: [], saem: [], teseAlterada: [], situacaoAlterada: [] };
  for (const [id, novo] of d) {
    const velho = a.get(id);
    const estava = !!velho && noGrafo(velho);
    if (noGrafo(novo) && !estava) m.entram.push(id);
    else if (!noGrafo(novo) && estava) m.saem.push(id);
    else if (estava && velho) {
      if (espacos(velho.tese) !== espacos(novo.tese)) m.teseAlterada.push(id);
      else if (velho.situacao !== novo.situacao) m.situacaoAlterada.push(id);
    }
  }
  for (const [id, velho] of a) if (!d.has(id) && noGrafo(velho)) m.saem.push(id);
  const ordem = (x: string, y: string) => x.localeCompare(y, 'pt-BR', { numeric: true });
  return { entram: m.entram.sort(ordem), saem: m.saem.sort(ordem), teseAlterada: m.teseAlterada.sort(ordem), situacaoAlterada: m.situacaoAlterada.sort(ordem) };
}

export interface FonteManualVencida {
  fonte: string;
  lidoEm: string;
  dias: number;
  comoRenovar: string;
}

const diasEntre = (de: string, ate: string) => Math.floor((Date.parse(ate) - Date.parse(de)) / 86_400_000);

/** Fontes de entrada manual cuja última leitura passou do prazo, na data `hoje` (AAAA-MM-DD). */
export function fontesManuaisVencidas(hoje: string, entradas: Array<{ fonte: string; lidoEm: string; comoRenovar: string }>, prazo = PRAZO_FONTE_MANUAL_DIAS): FonteManualVencida[] {
  return entradas.map(e => ({ ...e, dias: diasEntre(e.lidoEm, hoje) })).filter(e => e.dias > prazo);
}

export interface RelatorioAtualizacao {
  lidoEm: string;
  stj: { mudou: boolean; arquivos: Array<{ nome: string; antes: string; depois: string; modificadoEm: string | null }>; mudancas: MudancasNosPrecedentes | null };
  fontesManuais: FonteManualVencida[];
  haOQueFazer: boolean;
}

function entradasManuais() {
  const stf = manifestoStf();
  const comoStf = 'baixar de novo no portal do STF (Transparência ou base de jurisprudência) e rodar `pnpm importar:stf ...`; depois `pnpm carregar:tesemap`';
  return [
    ...stf.arquivos.map(a => ({ fonte: `STF: ${a.nome}`, lidoEm: a.lidoEm, comoRenovar: comoStf })),
    {
      fonte: 'STJ: súmulas (pesquisa do SCON)',
      lidoEm: manifestoSumulasStj().lidoEm,
      comoRenovar: 'imprimir em PDF a pesquisa de súmulas do SCON e rodar `pnpm importar:stj-sumulas <pdf>`; depois `pnpm carregar:tesemap`'
    }
  ];
}

export function montarRelatorio(hoje: string, atual: ManifestoStj, novo: ManifestoStj, mudancas: MudancasNosPrecedentes | null, manuais: FonteManualVencida[]): RelatorioAtualizacao {
  const arquivos = novo.arquivos.map(n => ({ nome: n.nome, antes: atual.arquivos.find(a => a.nome === n.nome)?.sha256 ?? '', depois: n.sha256, modificadoEm: n.modificadoEm }));
  const mudou = arquivos.some(a => a.antes !== a.depois);
  return { lidoEm: hoje, stj: { mudou, arquivos, mudancas: mudou ? mudancas : null }, fontesManuais: manuais, haOQueFazer: mudou || manuais.length > 0 };
}

const lista = (ids: string[]) => `${ids.slice(0, AMOSTRA).join(', ')}${ids.length > AMOSTRA ? ` e mais ${ids.length - AMOSTRA}` : ''}`;

/** Texto da issue que o workflow abre (ou comenta) quando há o que fazer. */
export function relatorioEmMarkdown(r: RelatorioAtualizacao): string {
  const L = [`Verificação do TeseMap (${r.lidoEm}). Nada foi alterado no repositório nem no banco.`, ''];
  if (r.stj.mudou && r.stj.mudancas) {
    const m = r.stj.mudancas;
    L.push('### Dados Abertos do STJ mudaram', '');
    for (const a of r.stj.arquivos.filter(x => x.antes !== x.depois)) L.push(`- ${a.nome}: modificado em ${a.modificadoEm ?? 'data não informada'}`);
    L.push('', `No grafo: **${m.entram.length}** entram, **${m.saem.length}** saem, **${m.teseAlterada.length}** com tese alterada e ${m.situacaoAlterada.length} só com a situação alterada.`, '');
    for (const [rotulo, ids] of [['Entram', m.entram], ['Saem', m.saem], ['Tese alterada', m.teseAlterada]] as const) if (ids.length > 0) L.push(`- ${rotulo}: ${lista(ids)}`);
    L.push('', '**O que fazer (responsável):** a partir de `packages/tesemap`, `pnpm coletar:stj`, conferir o diff do corpus e os testes (`pnpm test`), abrir o PR e, depois do merge, `pnpm carregar:tesemap` com a chave secreta.', '');
  }
  if (r.fontesManuais.length > 0) {
    L.push(`### Fontes de entrada manual a renovar (mais de ${PRAZO_FONTE_MANUAL_DIAS} dias)`, '');
    for (const f of r.fontesManuais) L.push(`- **${f.fonte}**: lida em ${f.lidoEm}, há ${f.dias} dias. Como renovar: ${f.comoRenovar}`);
    L.push('');
  }
  return L.join('\n');
}

async function main() {
  const hoje = new Date().toISOString().slice(0, 10);
  const atual = manifestoStj();
  const baixado = await baixarConjunto();
  const mudou = baixado.manifesto.arquivos.some(n => atual.arquivos.find(a => a.nome === n.nome)?.sha256 !== n.sha256);
  const mudancas = mudou ? compararPrecedentes(carregarPrecedentesStj(), baixado.precedentes) : null;
  const relatorio = montarRelatorio(hoje, atual, baixado.manifesto, mudancas, fontesManuaisVencidas(hoje, entradasManuais()));
  const pasta = join(__dirname, '..', '..', 'corpus');
  writeFileSync(join(pasta, 'atualizacao-relatorio.json'), JSON.stringify(relatorio, null, 2) + '\n', 'utf-8');
  writeFileSync(join(pasta, 'atualizacao-relatorio.md'), relatorioEmMarkdown(relatorio), 'utf-8');

  if (!relatorio.stj.mudou) console.log(`STJ: nada mudou nos Dados Abertos (lido em ${hoje}).`);
  else {
    const m = relatorio.stj.mudancas!;
    console.log(`STJ: o conjunto mudou (${relatorio.stj.arquivos.filter(a => a.antes !== a.depois).map(a => `${a.nome}, modificado em ${a.modificadoEm}`).join('; ')}).`);
    console.log(`  no grafo: ${m.entram.length} entram, ${m.saem.length} saem, ${m.teseAlterada.length} com tese alterada, ${m.situacaoAlterada.length} só com a situação alterada`);
    for (const [rotulo, ids] of [['entram', m.entram], ['saem', m.saem], ['tese alterada', m.teseAlterada]] as const) {
      if (ids.length > 0) console.log(`  ${rotulo}: ${ids.slice(0, AMOSTRA).join(', ')}${ids.length > AMOSTRA ? ` e mais ${ids.length - AMOSTRA}` : ''}`);
    }
  }
  for (const f of relatorio.fontesManuais) console.log(`Fonte manual com ${f.dias} dias (lida em ${f.lidoEm}): ${f.fonte}. Como renovar: ${f.comoRenovar}`);
  process.exitCode = relatorio.haOQueFazer ? 2 : 0;
}

if (require.main === module) {
  main().catch(e => {
    console.error(String(e instanceof Error ? e.message : e));
    process.exitCode = 1;
  });
}
