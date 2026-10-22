/**
 * Leitor de CSV (RFC 4180) para os arquivos dos Dados Abertos do STJ e do STF (vírgula, ou ponto e vírgula nas exportações de súmulas do STF): campos entre aspas com vírgula, quebra de linha e aspas duplicadas,
 * BOM no começo e CRLF. Devolve cada linha como objeto pelo cabeçalho. Sem dependência: o formato é simples e o erro tem de ser nosso.
 */
/** Percorre as linhas do CSV uma a uma, sem guardá-las: para os arquivos grandes do STF (centenas de MB). Linhas vazias são puladas. */
export function* linhasDoCsv(texto: string, separador = ','): Generator<string[]> {
  const t = texto.charCodeAt(0) === 0xfeff ? texto.slice(1) : texto;
  let campo = '';
  let linha: string[] = [];
  let entreAspas = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (entreAspas) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          campo += '"';
          i++;
        } else entreAspas = false;
      } else campo += c;
    } else if (c === '"' && campo === '') entreAspas = true;
    else if (c === separador) {
      linha.push(campo);
      campo = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++;
      linha.push(campo);
      campo = '';
      if (linha.length > 1 || linha[0] !== '') yield linha;
      linha = [];
    } else campo += c;
  }
  if (entreAspas) throw new Error('CSV com aspas sem fechamento');
  if (campo !== '' || linha.length > 0) {
    linha.push(campo);
    yield linha;
  }
}

export function lerCsv(texto: string, separador = ','): Array<Record<string, string>> {
  const linhas = [...linhasDoCsv(texto, separador)];
  if (linhas.length === 0) return [];
  const cabecalho = linhas[0].map(h => h.trim());
  return linhas.slice(1).map((l, n) => {
    if (l.length !== cabecalho.length) throw new Error(`CSV: linha ${n + 2} tem ${l.length} campos, o cabeçalho tem ${cabecalho.length}`);
    return Object.fromEntries(cabecalho.map((h, i) => [h, l[i]]));
  });
}
