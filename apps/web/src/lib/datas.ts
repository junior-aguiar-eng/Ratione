export function hojeIso(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}

function paraDate(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T12:00:00Z`);
}

/** 2026-04-01 -> 01/04/2026 */
export function dataCurta(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

/** 2026-04-01 -> 1º de abril de 2026 */
export function dataLonga(iso: string): string {
  const d = paraDate(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dia = d.getUTCDate() === 1 ? '1º' : String(d.getUTCDate());
  const mes = d.toLocaleDateString('pt-BR', { month: 'long', timeZone: 'UTC' });
  return `${dia} de ${mes} de ${d.getUTCFullYear()}`;
}

/** 2026-04-01 -> quarta-feira */
export function diaDaSemana(iso: string): string {
  return paraDate(iso).toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'UTC' });
}

/** Tempo relativo em português para registros salvos. */
export function tempoRelativo(isoCompleto: string, agora: Date = new Date()): string {
  const quando = new Date(isoCompleto);
  const minutos = Math.floor((agora.getTime() - quando.getTime()) / 60000);
  if (minutos < 1) return 'agora há pouco';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return horas === 1 ? 'há 1 hora' : `há ${horas} horas`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return 'ontem';
  if (dias < 7) return `há ${dias} dias`;
  const curto = quando.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '');
  return `salvo em ${curto}`;
}
