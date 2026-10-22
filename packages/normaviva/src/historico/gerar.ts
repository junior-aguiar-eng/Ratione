/**
 * `pnpm historico`: regenera `corpus/historico-conhecido.json` e `docs/produto/NORMAS_DE_TESTE.md` a partir do corpus.
 * A validação (`validacao`) de cada caso é preservada. Não altera o corpus.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gerarHistorico, type CasoHistorico } from './historico';

const PASTA = join(__dirname, '..', '..', 'corpus');
const ARQUIVO = join(PASTA, 'historico-conhecido.json');
const DOC = join(__dirname, '..', '..', '..', '..', 'docs', 'produto', 'NORMAS_DE_TESTE.md');

const br = (iso: string) => iso.split('-').reverse().join('/');
/** Parecido entre A e B por palavras (0 a 1). Muito baixo sugere que a lei renumerou: A seria o texto que ocupava o rótulo, não a versão anterior do mesmo dispositivo. */
export function semelhanca(a: string, b: string): number {
  const palavras = (t: string) => new Set(t.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []);
  const x = palavras(a);
  const y = palavras(b);
  const comuns = [...x].filter(w => y.has(w)).length;
  return comuns / Math.max(1, x.size + y.size - comuns);
}
export const SEMELHANCA_MINIMA = 0.25;

const cel = (t: string) => t.replace(/\|/g, '\\|').replace(/\s+/g, ' ');

export function documentoDeRevisao(casos: CasoHistorico[], normasSemCaso: string[]): string {
  const validados = casos.filter(c => c.validacao.status === 'validado').length;
  const normas = new Set(casos.map(c => c.normaId));
  const L: string[] = [];
  L.push('# Normas de teste com histórico conhecido (F3-07)');
  L.push('');
  L.push('> **Gerado por `pnpm historico` (em `packages/normaviva`). Não edite à mão:** a validação fica em `packages/normaviva/corpus/historico-conhecido.json` (campo `validacao`) e este documento é regenerado.');
  L.push('');
  L.push(`**${casos.length} casos em ${normas.size} normas** · validados: **${validados}** · pendentes: **${casos.length - validados}**`);
  L.push('');
  L.push('Cada caso diz: até a véspera da publicação do ato, o dispositivo tinha a redação **A**; a partir dela, a redação **B** (a vigente hoje). Servem de gabarito para a consulta temporal do NormaViva (F3-04).');
  L.push('');
  L.push('## De onde vem cada coisa');
  L.push('');
  L.push('- **Redação B:** o corpus, lido do Planalto (só a redação vigente).');
  L.push('- **Redação A:** o texto **tachado** da página do Planalto, só quando o trecho tachado é o dispositivo inteiro (mesmo tipo e número). Tachado de palavras soltas não reconstrói o texto e fica de fora. O tachado vale aqui só como evidência histórica, nunca como texto vigente. A página é a do próprio corpus; nas normas cujo corpus vem da versão compilada (que não traz o tachado), é a **página anotada** da mesma norma, coletada à parte em `corpus/planalto/anotadas/` (`pnpm coletar:anotadas`). A linha **Fonte** de cada caso diz qual foi.');
  L.push('- **Data:** a da publicação do ato que deu a redação B (API do Senado). **É provisória** (`vigenciaConfirmada: false`): a vigência pode ter começado em outro dia (*vacatio legis*, cláusula própria).');
  L.push('- **O caso vale pelo rótulo.** Se a lei renumerou dispositivos, A é o texto que ocupava aquele rótulo na época; os casos em que A e B quase não se parecem trazem um aviso.');
  L.push('- **Limite:** só as normas cujas páginas do Planalto trazem texto tachado de redações antigas têm casos. Sem casos: ' + normasSemCaso.join(', ') + '. A Lei 12.965 só tem tachado de medida provisória rejeitada ("Rejeitada"), que não é alteração de lei; as Leis 11.419 e 12.016 não têm tachado nenhum.');
  L.push('');
  L.push('## Como validar');
  L.push('');
  L.push('Confira, no Diário Oficial ou no texto original do ato, se A era mesmo a redação anterior e B a que o ato deu. Para registrar, em `corpus/historico-conhecido.json`, troque no caso `"validacao": {"status": "pendente", "por": null, "em": null}` por `{"status": "validado", "por": "<nome>", "em": "AAAA-MM-DD"}` e rode `pnpm historico`.');
  L.push('');
  let atual = '';
  for (const c of casos) {
    if (c.normaId !== atual) {
      atual = c.normaId;
      L.push(`## ${c.normaNome} (${c.normaId})`);
      L.push('');
    }
    L.push(`### ${c.rotulo}`);
    L.push('');
    L.push(`- **Ato que deu a redação B:** ${c.depois.atoRotulo} · publicado em **${br(c.depois.vigenteDe)}** (provisório)`);
    L.push(`- **Redação A** (até ${br(c.consultas[0].em)}): ${cel(c.antes.texto)}${c.antes.anotacao ? ` *(anotação do Planalto: ${cel(c.antes.anotacao)})*` : ''}`);
    L.push(`- **Redação B** (a partir de ${br(c.consultas[1].em)}): ${cel(c.depois.texto)}`);
    if (semelhanca(c.antes.texto, c.depois.texto) < SEMELHANCA_MINIMA) {
      L.push('- **Atenção:** A e B são muito diferentes. Pode ter havido renumeração: nesse caso A é o texto que ocupava este rótulo, não a versão anterior do mesmo dispositivo. Confira no ato antes de validar.');
    }
    L.push(`- **Fonte:** [${c.fonte.tipoPagina === 'compilada' ? 'texto compilado' : 'página anotada'} do Planalto](${c.fonte.url}), lido em ${br(c.fonte.lidoEm)}`);
    L.push(`- **Validação:** ${c.validacao.status === 'validado' ? `validado por ${c.validacao.por} em ${c.validacao.em && br(c.validacao.em)}` : 'pendente'}`);
    L.push('');
  }
  return L.join('\n');
}

function main() {
  // Os casos já gravados (com a validação) são mantidos enquanto existirem no corpus
  const anteriores: CasoHistorico[] = existsSync(ARQUIVO) ? JSON.parse(readFileSync(ARQUIVO, 'utf-8')) : [];
  const r = gerarHistorico(PASTA, anteriores);
  writeFileSync(ARQUIVO, JSON.stringify(r.casos, null, 2) + '\n', 'utf-8');
  const comCaso = new Set(r.casos.map(c => c.normaId));
  const sem = Object.keys(r.candidatos).filter(id => !comCaso.has(id));
  writeFileSync(DOC, documentoDeRevisao(r.casos, sem) + '\n', 'utf-8');
  console.log(`${r.casos.length} casos em ${comCaso.size} normas gravados em corpus/historico-conhecido.json e docs/produto/NORMAS_DE_TESTE.md`);
}

if (require.main === module) main();
