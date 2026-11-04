/**
 * F5-07 (RIPD, R1): o que a pseudonimização deixa passar nas decisões do corpus. Não há gabarito de nomes: o script roda `prepararDecisao`
 * e lista, no texto que SERIA ENVIADO ao modelo, os nomes que parecem de pessoa (duas ou mais palavras iniciadas em maiúscula, sem termo
 * de instituição, lei ou tribunal), para o revisor conferir à mão quais são nomes de verdade. Uso: pnpm --filter web exec tsx scripts/cobertura-detector.ts
 */
import path from 'node:path';
import { prepararDecisao } from '@ratione/argumenta';
import { lerCasos } from '../src/lib/avaliacao/arquivos';

const INSTITUICAO = /\b(tribunal|superior|justi[çc]a|minist[ée]rio|federal|estadual|municipal|uni[ãa]o|estado|munic[ií]pio|rep[úu]blica|c[óo]digo|lei|decreto|constitui|turma|se[çc][ãa]o|c[âa]mara|corte|conselho|supremo|regi[ãa]o|vara|comarca|juizado|defensoria|procuradoria|instituto|banco|caixa|empresa|companhia|sociedade|associa[çc][ãa]o|fundo|nacional|geral|p[úu]blic|processo|recurso|especial|extraordin|ordin[áa]rio|agravo|embargos|habeas|mandado|ac[óo]rd[ãa]o|senten[çc]a|decis[ãa]o|artigo|par[áa]grafo|inciso|s[úu]mula|tema|orienta[çc][ãa]o|enunciado|resolu[çc][ãa]o|portaria|medida|provis[óo]ria|emenda|complementar|rela[çc][ãa]o|trabalho|trabalhista|previd[êe]nc|seguro|social|sa[úu]de|sistema|programa|servi[çc]o|secretaria|autoridade|agência|comiss[ãa]o|di[áa]rio|oficial|documento|p[áa]gina|relator|ministro|ministra|desembargador|desembargadora|juiz|juíza|dr|dra|brasil|brasília|alagoas|minas|gerais|paran[áa]|rio grande|santa catarina|s[ãa]o paulo|bahia|pernambuco|distrito)\b/i;
const NOME = /(?:\b[A-ZÀ-Ú][a-zà-ú]{2,}(?:\s+(?:d[aeo]s?|e)\s+|\s+)){1,4}\b[A-ZÀ-Ú][a-zà-ú]{2,}\b/g;

async function main() {
  const pastas = { raiz: process.env.AVALIACAO_CORPUS ?? path.resolve(process.cwd(), '../../packages/argumenta/corpus') };
  const casos = await lerCasos(pastas);
  let marcadores = 0;
  const porCaso: Array<{ id: string; trocas: number; candidatos: string[] }> = [];
  for (const c of casos) {
    const p = prepararDecisao(c.texto);
    marcadores += p.substituicoes.length;
    const texto = p.paragrafos.join('\n');
    const achados = [...new Set([...texto.matchAll(NOME)].map(m => m[0].replace(/\s+/g, ' ')).filter(n => !INSTITUICAO.test(n)))];
    porCaso.push({ id: c.id, trocas: p.substituicoes.length, candidatos: achados });
  }
  console.log(`${casos.length} casos; ${marcadores} trocas feitas; candidatos a nome que ficaram no texto enviado:\n`);
  for (const r of porCaso) {
    console.log(`## ${r.id}: ${r.trocas} trocas, ${r.candidatos.length} candidatos`);
    for (const n of r.candidatos.slice(0, 40)) console.log(`  - ${n}`);
  }
}

main().catch(e => {
  console.error((e as Error).message);
  process.exit(1);
});
