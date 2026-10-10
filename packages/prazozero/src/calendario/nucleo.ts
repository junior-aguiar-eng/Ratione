import { FonteSchema, type Fonte } from '@ratione/core';
import { FONTES_CALENDARIO, type FonteCalendario } from './eventos';

/** Uma fonte do calendário no formato do núcleo (a chave do registro vira o `id`). */
export function fonteCalendarioParaNucleo(id: string, fonte: FonteCalendario): Fonte {
  return FonteSchema.parse({ id, ato: fonte.ato, url: fonte.url, lido: fonte.lido, lidoEm: fonte.lidoEm });
}

/** Todas as fontes do calendário, validadas pelo esquema do núcleo. */
export function fontesDoCalendario(): Fonte[] {
  return Object.entries(FONTES_CALENDARIO as Record<string, FonteCalendario>).map(([id, f]) => fonteCalendarioParaNucleo(id, f));
}
