/**
 * Parâmetros de um cálculo ou consulta guardados na URL de "Meu espaço", para que abrir o item recupere o que foi salvo
 * (antes só abria a ferramenta vazia). Tudo o que vem da URL é validado: valor desconhecido é ignorado.
 */
import { CATALOGO_PRAZOS, ehDataIsoValida, type RegimeContagem, type TipoEventoOrigem } from '@ratione/prazozero';
import { TRIBUNAIS_BRASIL } from '@ratione/core';

const TIPOS_EVENTO = ['disponibilizacao_dje', 'publicacao', 'intimacao_portal', 'carga_ou_audiencia'] as const;
const REGIMES = ['cpc_dias_uteis', 'clt_dias_uteis', 'jef_dias_uteis', 'cpp_dias_corridos'] as const;

export interface ParametrosPrazoZero {
  atoId: string;
  /** Só no prazo personalizado ("outro"). */
  dias?: number;
  nome?: string;
  tipoEvento?: TipoEventoOrigem;
  /** AAAA-MM-DD */
  data: string;
  tribunalId: string;
  regime?: RegimeContagem;
  dobro?: boolean;
  litisconsortes?: boolean;
  excecaoCriminal?: boolean;
}

export function urlDoPrazoZero(p: ParametrosPrazoZero): string {
  const q = new URLSearchParams();
  q.set('ato', p.atoId);
  if (p.atoId === 'outro') {
    if (p.dias) q.set('dias', String(p.dias));
    if (p.nome) q.set('nome', p.nome.slice(0, 80));
  }
  if (p.tipoEvento) q.set('evento', p.tipoEvento);
  q.set('data', p.data);
  q.set('tribunal', p.tribunalId);
  if (p.regime) q.set('regime', p.regime);
  if (p.dobro) q.set('dobro', '1');
  if (p.litisconsortes) q.set('litis', '1');
  if (p.excecaoCriminal) q.set('excecao', '1');
  return `/prazozero?${q.toString()}`;
}

/** O que a URL traz de válido; ausente ou inválido fica de fora. */
export function lerPrazoZero(busca: string): Partial<ParametrosPrazoZero> {
  const q = new URLSearchParams(busca);
  const r: Partial<ParametrosPrazoZero> = {};
  const ato = q.get('ato');
  if (ato && (ato === 'outro' || CATALOGO_PRAZOS.some(p => p.id === ato))) r.atoId = ato;
  const dias = Number(q.get('dias'));
  if (r.atoId === 'outro' && Number.isInteger(dias) && dias >= 1 && dias <= 365) r.dias = dias;
  const nome = q.get('nome');
  if (r.atoId === 'outro' && nome) r.nome = nome.slice(0, 80);
  const evento = q.get('evento');
  if (evento && (TIPOS_EVENTO as readonly string[]).includes(evento)) r.tipoEvento = evento as TipoEventoOrigem;
  const data = q.get('data');
  if (data && ehDataIsoValida(data)) r.data = data;
  const tribunal = q.get('tribunal');
  if (tribunal && Object.hasOwn(TRIBUNAIS_BRASIL, tribunal)) r.tribunalId = tribunal;
  const regime = q.get('regime');
  if (regime && (REGIMES as readonly string[]).includes(regime)) r.regime = regime as RegimeContagem;
  if (q.get('dobro') === '1') r.dobro = true;
  if (q.get('litis') === '1') r.litisconsortes = true;
  if (q.get('excecao') === '1') r.excecaoCriminal = true;
  return r;
}

export interface ParametrosNormaViva {
  dispositivoId: string;
  /** Data da redação consultada (AAAA-MM-DD); ausente = hoje. */
  em?: string;
}

export function urlDoNormaViva(p: ParametrosNormaViva): string {
  const q = new URLSearchParams({ d: p.dispositivoId });
  if (p.em) q.set('em', p.em);
  return `/normaviva?${q.toString()}`;
}

export function lerNormaViva(busca: string): Partial<ParametrosNormaViva> {
  const q = new URLSearchParams(busca);
  const r: Partial<ParametrosNormaViva> = {};
  const d = q.get('d');
  if (d && d.length <= 200) r.dispositivoId = d;
  const em = q.get('em');
  if (em && ehDataIsoValida(em)) r.em = em;
  return r;
}
