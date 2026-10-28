import { paragrafosDoCaso, type Caso } from './caso';

/**
 * Folha de conferência do revisor: a decisão com os parágrafos numerados como o modelo os recebe, e o modelo do gabarito para preencher.
 * É gerada do arquivo do caso e não é versionada (o texto já está no JSON).
 */
export function gerarFolha(caso: Caso): string {
  const paragrafos = paragrafosDoCaso(caso);
  return [
    `# Folha de gabarito: ${caso.id}`,
    '',
    `- **Fonte:** ${caso.fonte.descricao} (${caso.fonte.url}), acessada em ${caso.fonte.acessadoEm}`,
    `- **Tipo:** ${caso.tipo}`,
    `- **Parágrafos:** ${paragrafos.length}`,
    '',
    '## Como preencher',
    '',
    'Leia a decisão abaixo e preencha o bloco `gabarito` no arquivo do caso (`packages/argumenta/corpus/casos/' + caso.id + '.json`):',
    '',
    '- `dispositivo`: primeiro e último parágrafo do dispositivo (a parte que decide).',
    '- `questoes`: cada questão que a decisão **resolve** (preliminar, prejudicial, mérito e as acessórias de custas, honorários e juros), com a conclusão e **todos** os parágrafos em que ela é discutida e decidida. Não liste fato nem argumento solto, nem a consequência automática de outra questão.',
    '- `citacoes`: as normas e os precedentes que a decisão cita, como aparecem no texto. O que a decisão apenas transcreve de outro julgado não conta.',
    '',
    'Depois, `pnpm --filter web avaliacao validar ' + caso.id + '` confere os números e registra a validação.',
    '',
    '## Decisão',
    '',
    ...paragrafos.map((p, i) => `**§${i + 1}.** ${p}\n`),
    '## Modelo do gabarito',
    '',
    '```json',
    JSON.stringify({ dispositivo: { inicio: 0, fim: 0 }, questoes: [{ enunciado: '', conclusao: '', paragrafos: [] }], citacoes: [] }, null, 2),
    '```',
    ''
  ].join('\n');
}
