import type { QualquerTarefa } from './contrato';
import { explicarDispositivo } from './tarefas/explicarDispositivo';

/**
 * Catálogo de tarefas de IA: o único lugar em que uma tarefa existe. A rota `/api/ia/<id>` só executa o que está aqui, e o teste
 * `catalogo.test.ts` confere o contrato de cada uma e falha se algum código chamar o modelo por fora do executor.
 * Para acrescentar uma tarefa: o contrato completo (`contrato.ts`), decisão do responsável e o registro em `docs/produto/IA_TAREFAS.md`.
 */
export const CATALOGO = {
  'explicar-dispositivo': explicarDispositivo
} as const satisfies Record<string, QualquerTarefa>;

export type IdTarefa = keyof typeof CATALOGO;

export function tarefaDoCatalogo(id: unknown): QualquerTarefa | null {
  return typeof id === 'string' && Object.hasOwn(CATALOGO, id) ? CATALOGO[id as IdTarefa] : null;
}
