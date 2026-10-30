/** Texto de propriedade iCalendar (RFC 5545, 3.3.11): `\`, `;`, `,` e quebra de linha escapados. */
export function escaparTextoIcs(t: string): string {
  return t.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Linhas com no máximo 75 octetos; a continuação começa com um espaço (RFC 5545, 3.1). Não corta caractere no meio. */
export function dobrarLinhaIcs(linha: string): string {
  const codificador = new TextEncoder();
  const partes: string[] = [];
  let atual = '';
  let octetos = 0;
  for (const c of linha) {
    const n = codificador.encode(c).length;
    const limite = partes.length === 0 ? 75 : 74;
    if (octetos + n > limite) {
      partes.push(atual);
      atual = '';
      octetos = 0;
    }
    atual += c;
    octetos += n;
  }
  partes.push(atual);
  return partes.join('\r\n ');
}

function eventoIcs(dataFinal: string, descricao: string, titulo: string, carimbo: string): string[] {
  const inicio = dataFinal.replace(/-/g, '');
  const fim = new Date(`${dataFinal}T12:00:00Z`);
  fim.setUTCDate(fim.getUTCDate() + 1);
  const fimStr = fim.toISOString().slice(0, 10).replace(/-/g, '');
  return [
    'BEGIN:VEVENT',
    `UID:${inicio}-${Math.random().toString(36).slice(2, 10)}@ratione`,
    `DTSTAMP:${carimbo}`,
    `DTSTART;VALUE=DATE:${inicio}`,
    `DTEND;VALUE=DATE:${fimStr}`,
    `SUMMARY:${escaparTextoIcs(`Prazo final: ${titulo}`)}`,
    `DESCRIPTION:${escaparTextoIcs(descricao)}`,
    'END:VEVENT'
  ];
}

/** Vários prazos num só arquivo de calendário (a agenda de "Meu espaço"). */
export function gerarIcsDeEventos(eventos: ReadonlyArray<{ data: string; titulo: string; descricao: string }>): string {
  const carimbo = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ratione//PrazoZero//PT',
    ...eventos.flatMap(e => eventoIcs(e.data, e.descricao, e.titulo, carimbo)),
    'END:VCALENDAR'
  ]
    .map(dobrarLinhaIcs)
    .join('\r\n');
}

export function gerarIcs(dataFinal: string, descricao: string, titulo: string): string {
  return gerarIcsDeEventos([{ data: dataFinal, titulo, descricao }]);
}
