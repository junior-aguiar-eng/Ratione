/**
 * Avisos de vigência futura (F3-06): lei já publicada que altera uma norma do corpus mas só passa a valer depois. O Planalto só consolida o texto
 * na data de vigência, então até lá o corpus (e a tela) mostram a redação de hoje sem dizer que ela vai mudar. Os avisos vêm de
 * `corpus/vigencia-futura.json`, gerado por `pnpm vigencia` e conferido pelo revisor.
 */
import arquivo from './vigencia-futura.json';
import type { Vigencia } from './vigencia';

export interface AlteracaoNaNorma {
  normaId: string;
  /** Chaves dos artigos (`131`, `392-a`, `1015`), na ordem em que o Senado os lista. */
  artigos: string[];
  /** Dispositivos como o Senado os registra ("Art. 134, § 4", "Alteração"). */
  dispositivos: Array<{ dispositivo: string; acao: string }>;
}

export interface AvisoVigenciaFutura {
  ato: string;
  chave: string;
  /** AAAA-MM-DD. */
  publicacao: string | null;
  vigencia: Vigencia;
  /** AAAA-MM-DD; nulo quando a vigência é complexa e deve ser lida no ato. */
  vigenteEm: string | null;
  clausula: string;
  ementa: string;
  fonte: { url: string; lidoEm: string };
  alteracoes: AlteracaoNaNorma[];
}

export interface ArquivoVigenciaFutura {
  geradoEm: string;
  avisos: AvisoVigenciaFutura[];
  /** Atos já examinados (chave do ato → resultado), para não reler todo dia. */
  examinados: Record<string, string>;
}

export const VIGENCIA_FUTURA = arquivo as ArquivoVigenciaFutura;

/** "art. 392-A", "Art. 1.015, § 2º", "Art. 5º" → `392-a`, `1015`, `5`. Nulo se não começa por artigo. */
export function chaveDoArtigo(texto: string): string | null {
  const m = texto.trim().match(/^art(?:igo)?\.?\s*([\d.]+)\s*[ºo°]?\s*(?:-\s*([A-Za-z]+))?/i);
  if (!m) return null;
  return m[1].replace(/\./g, '') + (m[2] ? `-${m[2].toLowerCase()}` : '');
}

/** Avisos ainda por vir (ou sem data) que mexem no artigo do dispositivo mostrado. */
export function avisosDoArtigo(normaId: string, rotulo: string, hoje: string, avisos: AvisoVigenciaFutura[] = VIGENCIA_FUTURA.avisos): AvisoVigenciaFutura[] {
  const artigo = chaveDoArtigo(rotulo);
  if (!artigo) return [];
  return avisos.filter(a => (a.vigenteEm === null || a.vigenteEm > hoje) && a.alteracoes.some(x => x.normaId === normaId && x.artigos.includes(artigo)));
}
