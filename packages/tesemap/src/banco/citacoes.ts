/**
 * Citações a dispositivos do NormaViva no texto de um precedente (F4-04). "A tese cita o art. 85, § 8º, do CPC" é fato do texto, não
 * interpretação: só entra a remissão em que o texto NOMEIA a norma (por extenso, sigla ou número) e que existe no corpus do NormaViva.
 * Não é aresta do grafo (aresta é relação validada por pessoa); é o atalho para ler o dispositivo citado.
 */
export interface CitacaoNormativa {
  normaId: string;
  /** Como o texto cita o artigo ("85", "5º", "1.015"). */
  artigo: string;
  detalhe: string | null;
  /** Id do dispositivo no NormaViva (`LEI-13105-2015|corpo|art. 85`): abre direto em `/normaviva?d=`. */
  dispositivoId: string;
}

/** O que `extrairRemissoes` (NormaViva) devolve, no mínimo que este módulo usa. */
export interface RemissaoBruta {
  artigo: string;
  detalhe: string | null;
  escopo: string;
  normaDestinoId: string | null;
}

export function citacoesNoTexto(texto: string, extrair: (t: string) => RemissaoBruta[], existeDispositivo: (id: string) => boolean): CitacaoNormativa[] {
  const vistas = new Set<string>();
  const saida: CitacaoNormativa[] = [];
  for (const r of extrair(texto)) {
    if (r.escopo !== 'explicito' || !r.normaDestinoId) continue;
    const dispositivoId = `${r.normaDestinoId}|corpo|art. ${r.artigo}`;
    const chave = `${dispositivoId}|${r.detalhe ?? ''}`;
    if (vistas.has(chave) || !existeDispositivo(dispositivoId)) continue;
    vistas.add(chave);
    saida.push({ normaId: r.normaDestinoId, artigo: r.artigo, detalhe: r.detalhe, dispositivoId });
  }
  return saida;
}
