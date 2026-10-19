/**
 * Comparação de duas leituras de uma norma (F3-06): o que mudou, dispositivo a dispositivo.
 *
 * A atualização diária só decide por bytes (SHA-256). Quando eles diferem, este diff diz se a mudança é de TEXTO de lei
 * (dispositivo novo, removido, com texto ou anotação alterada) ou só de página (cabeçalho, menu, rodapé), para a fila
 * de revisão separar o que importa do ruído.
 */
import { paragrafosDoHtml, parsearDispositivos, type DispositivoParseado } from '../parser';

export interface MudancaDeDispositivo {
  rotulo: string;
  escopo: string;
  tipo: 'novo' | 'removido' | 'texto_alterado' | 'anotacao_alterada' | 'revogado';
  antes?: string;
  depois?: string;
}

export interface ResumoDaMudanca {
  /** `texto_de_lei` quando algum dispositivo mudou; `so_pagina` quando os bytes mudaram mas o texto parseado é o mesmo. */
  natureza: 'texto_de_lei' | 'so_pagina';
  novos: number;
  removidos: number;
  textoAlterado: number;
  anotacaoAlterada: number;
  revogados: number;
  /** Primeiras mudanças, para o revisor; o total está nos contadores. */
  amostra: MudancaDeDispositivo[];
}

const chave = (d: DispositivoParseado, n: number) => `${d.escopo}|${d.rotulo}#${n}`;

function indexar(ds: DispositivoParseado[]): Map<string, DispositivoParseado> {
  const vistos = new Map<string, number>();
  const mapa = new Map<string, DispositivoParseado>();
  for (const d of ds) {
    const base = `${d.escopo}|${d.rotulo}`;
    const n = (vistos.get(base) ?? 0) + 1;
    vistos.set(base, n);
    mapa.set(chave(d, n), d);
  }
  return mapa;
}

const textoDasAnotacoes = (d: DispositivoParseado) => d.anotacoes.map(a => a.texto).join(' | ');
const textoCompleto = (d: DispositivoParseado) => [d.texto, ...d.continuacao].join('\n');

export function compararHtml(htmlAntes: string, htmlDepois: string, limiteAmostra = 40): ResumoDaMudanca {
  const antes = indexar(parsearDispositivos(paragrafosDoHtml(htmlAntes)).dispositivos);
  const depois = indexar(parsearDispositivos(paragrafosDoHtml(htmlDepois)).dispositivos);
  const mudancas: MudancaDeDispositivo[] = [];
  const r = { novos: 0, removidos: 0, textoAlterado: 0, anotacaoAlterada: 0, revogados: 0 };

  for (const [k, d] of depois) {
    const a = antes.get(k);
    if (!a) {
      r.novos++;
      mudancas.push({ rotulo: d.rotulo, escopo: d.escopo, tipo: 'novo', depois: d.texto.slice(0, 200) });
      continue;
    }
    if (!a.revogado && d.revogado) {
      r.revogados++;
      mudancas.push({ rotulo: d.rotulo, escopo: d.escopo, tipo: 'revogado', antes: a.texto.slice(0, 200), depois: textoDasAnotacoes(d).slice(0, 200) });
    } else if (textoCompleto(a) !== textoCompleto(d)) {
      r.textoAlterado++;
      mudancas.push({ rotulo: d.rotulo, escopo: d.escopo, tipo: 'texto_alterado', antes: a.texto.slice(0, 200), depois: d.texto.slice(0, 200) });
    } else if (textoDasAnotacoes(a) !== textoDasAnotacoes(d)) {
      r.anotacaoAlterada++;
      mudancas.push({ rotulo: d.rotulo, escopo: d.escopo, tipo: 'anotacao_alterada', antes: textoDasAnotacoes(a).slice(0, 200), depois: textoDasAnotacoes(d).slice(0, 200) });
    }
  }
  for (const [k, a] of antes) {
    if (!depois.has(k)) {
      r.removidos++;
      mudancas.push({ rotulo: a.rotulo, escopo: a.escopo, tipo: 'removido', antes: a.texto.slice(0, 200) });
    }
  }
  const total = r.novos + r.removidos + r.textoAlterado + r.anotacaoAlterada + r.revogados;
  return { natureza: total > 0 ? 'texto_de_lei' : 'so_pagina', ...r, amostra: mudancas.slice(0, limiteAmostra) };
}
