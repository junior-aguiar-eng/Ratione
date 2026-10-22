/** Utilitários de texto e data comuns aos leitores de fontes oficiais (NormaViva, TeseMap). */

/** Junta espaços, tabulações e quebras de linha num espaço só e apara as pontas. */
export const juntarEspacos = (texto: string) => texto.replace(/\s+/g, ' ').trim();

/** "2/12/2025" ou "02/12/2025" → "2025-12-02". Recusa formato estranho e data inexistente (31/02). */
export function dataBrParaIso(br: string): string {
  const m = br.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) throw new Error(`data fora do formato DD/MM/AAAA: "${br}"`);
  const [d, mes, a] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(a, mes - 1, d));
  if (dt.getUTCFullYear() !== a || dt.getUTCMonth() !== mes - 1 || dt.getUTCDate() !== d) throw new Error(`data inexistente: ${br}`);
  return `${a}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** User-Agent de navegador: sites `.gov.br` e `.jus.br` descartam clientes que se identificam como Node ou curl. */
export const USER_AGENT_NAVEGADOR = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
