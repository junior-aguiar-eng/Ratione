export function gerarIcs(dataFinal: string, descricao: string, titulo: string): string {
  const inicio = dataFinal.replace(/-/g, '');
  const fim = new Date(`${dataFinal}T12:00:00Z`);
  fim.setUTCDate(fim.getUTCDate() + 1);
  const fimStr = fim.toISOString().slice(0, 10).replace(/-/g, '');
  const carimbo = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const escapar = (t: string) => t.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ratione//PrazoZero//PT',
    'BEGIN:VEVENT',
    `UID:${inicio}-${Math.random().toString(36).slice(2, 10)}@ratione`,
    `DTSTAMP:${carimbo}`,
    `DTSTART;VALUE=DATE:${inicio}`,
    `DTEND;VALUE=DATE:${fimStr}`,
    `SUMMARY:${escapar(`Prazo final: ${titulo}`)}`,
    `DESCRIPTION:${escapar(descricao)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}
