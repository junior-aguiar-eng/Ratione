import { diferencaDiasIso, somarDiasIso } from '@ratione/prazozero';
import { dataCurta, diaDaSemana } from './datas';

/**
 * Lembretes de prazo por e-mail (F2-10): aviso 3 dias e 1 dia antes do vencimento, em dias corridos, uma vez cada.
 * A lógica fica separada da rota para ser testada sem rede: a rota entrega as operações reais (Supabase e Resend);
 * os testes entregam simulações.
 *
 * Privacidade: o e-mail leva só o título que o próprio usuário escolheu, a data e o aviso de conferir no tribunal.
 * Nunca leva dados do processo, e o endereço de e-mail não é gravado nem registrado em log.
 */
export interface Lembrete {
  id: string;
  usuario_id: string;
  titulo: string;
  tribunal: string | null;
  /** AAAA-MM-DD */
  vencimento: string;
  avisar_3_dias: boolean;
  avisar_1_dia: boolean;
  enviado_3_dias_em: string | null;
  enviado_1_dia_em: string | null;
}

export type Momento = 'tres_dias' | 'um_dia';

/**
 * Valor de segredo vindo do ambiente, sem espaços nem quebras de linha nas pontas. Segredos guardados pelo terminal costumam levar uma
 * quebra de linha no fim (o PowerShell acrescenta uma ao enviar por pipe); sem isto, o segredo da rota nunca confere e a chave do
 * provedor de e-mail vira um cabeçalho inválido. Vazio vira `undefined`.
 */
export function limparSegredo(valor: string | null | undefined): string | undefined {
  const limpo = valor?.trim();
  return limpo ? limpo : undefined;
}

/** Data civil de hoje em Brasília (o servidor roda em UTC; perto da meia-noite a data local é outra). */
export function hojeNoBrasil(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(agora);
}

/**
 * Qual aviso deve sair hoje para este lembrete, se algum. Um por dia: o de "1 dia" vale quando faltam 1 ou 0 dias,
 * o de "3 dias" quando faltam 3 ou 2 (o dia a mais cobre um envio perdido). Aviso já enviado nunca se repete.
 */
export function avisoDevido(l: Lembrete, hoje: string): Momento | null {
  const dias = diferencaDiasIso(hoje, l.vencimento);
  if (l.avisar_1_dia && !l.enviado_1_dia_em && (dias === 1 || dias === 0)) return 'um_dia';
  if (l.avisar_3_dias && !l.enviado_3_dias_em && (dias === 3 || dias === 2)) return 'tres_dias';
  return null;
}

function escaparHtml(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export interface Email {
  assunto: string;
  texto: string;
  html: string;
}

export function montarEmail(l: Lembrete, hoje: string, enderecoSite = 'https://ratione.nexojuris.ia.br'): Email {
  const dias = diferencaDiasIso(hoje, l.vencimento);
  const quando = dias <= 0 ? 'vence hoje' : dias === 1 ? 'vence amanhã' : `vence em ${dias} dias`;
  const data = `${diaDaSemana(l.vencimento)}, ${dataCurta(l.vencimento)}`;
  // O nome padrão do aviso já traz o tribunal ("Embargos de declaração · TJSP"): não repete
  const tribunal = l.tribunal && !l.titulo.toUpperCase().includes(l.tribunal.toUpperCase()) ? ` (${l.tribunal})` : '';
  const assunto = `Ratione: seu prazo ${quando} (${dataCurta(l.vencimento)})`;
  const link = `${enderecoSite}/meu-espaco`;
  const linhas = [
    `Você pediu um aviso no Ratione: o prazo "${l.titulo}"${tribunal} ${quando}, em ${data}.`,
    'Este é um lembrete do cálculo que você fez. Confira a data no tribunal antes de contar com ela: calendário, ponto facultativo e suspensões podem mudar.',
    `Para cancelar este aviso, entre em Meu espaço: ${link}`
  ];
  const html =
    `<p>Você pediu um aviso no Ratione: o prazo <strong>“${escaparHtml(l.titulo)}”</strong>${escaparHtml(tribunal)} ${quando}, em <strong>${escaparHtml(data)}</strong>.</p>` +
    '<p>Este é um lembrete do cálculo que você fez. Confira a data no tribunal antes de contar com ela: calendário, ponto facultativo e suspensões podem mudar.</p>' +
    `<p>Para cancelar este aviso, entre em <a href="${link}">Meu espaço</a>.</p>`;
  return { assunto, texto: linhas.join('\n\n'), html };
}

export interface DependenciasEnvio {
  hoje: () => string;
  /** Lembretes com vencimento entre as duas datas (inclusive). */
  listarProximos: (de: string, ate: string) => Promise<Lembrete[]>;
  /** E-mail da conta, lido no momento do envio; `null` se não houver. */
  emailDe: (usuarioId: string) => Promise<string | null>;
  /** Reserva o aviso (grava a marca de envio só se ainda estiver vazia). `false` se outro envio já o reservou. */
  reservar: (id: string, momento: Momento) => Promise<boolean>;
  /** Desfaz a reserva quando o e-mail não saiu, para tentar de novo no próximo dia. */
  liberar: (id: string, momento: Momento) => Promise<void>;
  enviar: (para: string, email: Email) => Promise<boolean>;
  /** Sem chave do provedor de e-mail: conta o que sairia, mas não envia nem reserva nada. */
  simulacao: boolean;
}

export interface ResumoEnvio {
  analisados: number;
  enviados: number;
  simulados: number;
  semEmail: number;
  falhas: number;
}

const CONCORRENCIA_PADRAO = 8;

export async function executarEnvio(dep: DependenciasEnvio, opcoes: { concorrencia?: number } = {}): Promise<ResumoEnvio> {
  const hoje = dep.hoje();
  const lembretes = await dep.listarProximos(hoje, somarDiasIso(hoje, 3));
  const resumo: ResumoEnvio = { analisados: lembretes.length, enviados: 0, simulados: 0, semEmail: 0, falhas: 0 };
  const pendentes: Array<{ l: Lembrete; momento: Momento }> = [];

  for (const l of lembretes) {
    const momento = avisoDevido(l, hoje);
    if (!momento) continue;
    if (dep.simulacao) {
      resumo.simulados++;
      continue;
    }
    pendentes.push({ l, momento });
  }

  const concorrencia = Math.max(1, Math.floor(opcoes.concorrencia ?? CONCORRENCIA_PADRAO));
  // Cacheia a Promise para que lembretes do mesmo usuário no mesmo lote consultem `emailDe` uma única vez.
  const emails = new Map<string, Promise<string | null>>();
  const emailDe = (usuarioId: string): Promise<string | null> => {
    let promessa = emails.get(usuarioId);
    if (!promessa) {
      promessa = Promise.resolve()
        .then(() => dep.emailDe(usuarioId))
        .catch(() => null);
      emails.set(usuarioId, promessa);
    }
    return promessa;
  };

  const processar = async ({ l, momento }: { l: Lembrete; momento: Momento }) => {
    const para = await emailDe(l.usuario_id);
    if (!para) {
      resumo.semEmail++;
      return;
    }
    if (!(await dep.reservar(l.id, momento))) return; // outro envio já cuidou deste aviso
    let ok = false;
    try {
      ok = await dep.enviar(para, montarEmail(l, hoje));
    } catch {
      ok = false;
    }
    if (ok) {
      resumo.enviados++;
    } else {
      resumo.falhas++;
      await dep.liberar(l.id, momento).catch(() => undefined);
    }
  };

  for (let i = 0; i < pendentes.length; i += concorrencia) {
    await Promise.allSettled(pendentes.slice(i, i + concorrencia).map(processar));
  }
  return resumo;
}
