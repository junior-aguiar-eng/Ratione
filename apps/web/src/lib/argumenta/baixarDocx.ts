/**
 * F5-09: desenha o documento da análise em Word (.docx) e o entrega para download. Roda só no navegador: a biblioteca é carregada na hora
 * do clique (não pesa na abertura da página) e o arquivo nasce numa `Blob` local, sem requisição nenhuma.
 */
import type { DocumentoDaAnalise } from './documento';

const FONTE = 'Calibri';
export const TIPO_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export async function montarDocx(d: DocumentoDaAnalise): Promise<Blob> {
  const { AlignmentType, Document, Footer, HeadingLevel, Packer, PageNumber, Paragraph, TextRun } = await import('docx');

  const texto = (t: string, o: { bold?: boolean; italics?: boolean; size?: number; color?: string } = {}) => new TextRun({ text: t, font: FONTE, ...o });
  const paragrafo = (t: string, o: { bold?: boolean; italics?: boolean; size?: number; color?: string; depois?: number } = {}) =>
    new Paragraph({ spacing: { after: o.depois ?? 120 }, children: [texto(t, o)] });
  const titulo = (t: string, nivel: (typeof HeadingLevel)[keyof typeof HeadingLevel]) => new Paragraph({ heading: nivel, spacing: { before: 280, after: 120 }, children: [texto(t, { bold: true })] });
  const marcador = (t: string) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 80 }, children: [texto(t)] });

  const filhos: InstanceType<typeof Paragraph>[] = [
    new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 60 }, children: [texto(d.titulo, { bold: true })] }),
    paragrafo(`Gerada em ${d.geradoEm}`, { color: '555555', depois: 200 }),
    ...d.avisos.map(a => paragrafo(a, { italics: true, size: 20, color: '555555' })),
    titulo('Visão geral', HeadingLevel.HEADING_1),
    new Paragraph({ spacing: { after: 80 }, children: [texto('Tipo: ', { bold: true }), texto(d.tipo)] }),
    new Paragraph({ spacing: { after: 80 }, children: [texto('Resultado: ', { bold: true }), texto(d.resultado)] }),
    paragrafo(d.resumo)
  ];

  if (d.pedidos.length > 0) {
    filhos.push(titulo('Pedidos', HeadingLevel.HEADING_2), ...d.pedidos.map(marcador));
  }

  if (d.questoes.length > 0) {
    filhos.push(titulo('Questões e fundamentos', HeadingLevel.HEADING_1));
    for (const q of d.questoes) {
      filhos.push(
        titulo(q.cabecalho, HeadingLevel.HEADING_2),
        new Paragraph({ spacing: { after: 80 }, children: [texto('Situação: ', { bold: true }), texto(q.resultado)] }),
        new Paragraph({ spacing: { after: 80 }, children: [texto(q.enunciado, { bold: true })] }),
        new Paragraph({ spacing: { after: 120 }, children: [texto('Conclusão: ', { bold: true }), texto(q.conclusao)] })
      );
      if (q.fundamentos === null) {
        filhos.push(paragrafo('Os fundamentos desta questão não foram identificados nesta análise.', { italics: true, color: '555555' }));
      } else if (q.fundamentos.length === 0) {
        filhos.push(paragrafo('Nenhum fundamento identificado para esta questão.', { italics: true, color: '555555' }));
      } else {
        for (const f of q.fundamentos) {
          filhos.push(
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [texto(`${f.rotulo}: `, { bold: true }), texto(f.descricao)] }),
            ...(f.citacao ? [new Paragraph({ indent: { left: 720 }, spacing: { after: f.conferencia ? 20 : 80 }, children: [texto(f.citacao, { size: 20 })] })] : []),
            ...(f.conferencia ? [new Paragraph({ indent: { left: 720 }, spacing: { after: 80 }, children: [texto(f.conferencia, { italics: true, size: 18, color: '555555' })] })] : [])
          );
        }
      }
    }
  }

  const documento = new Document({
    creator: 'Ratione',
    title: d.titulo,
    sections: [
      {
        children: filhos,
        footers: {
          default: new Footer({
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: ['Página ', PageNumber.CURRENT, ' de ', PageNumber.TOTAL_PAGES], font: FONTE, size: 18, color: '555555' })] })]
          })
        }
      }
    ]
  });
  return Packer.toBlob(documento);
}

/** Entrega a `Blob` como download, sem passar por servidor. */
export function baixarBlob(blob: Blob, nomeArquivo: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function baixarDocx(d: DocumentoDaAnalise, nomeArquivo: string): Promise<void> {
  baixarBlob(await montarDocx(d), `${nomeArquivo}.docx`);
}
