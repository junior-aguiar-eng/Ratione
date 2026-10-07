import { obterFeriadosAno, suspensaoDePrazos, CALENDARIO_VERIFICADO, FeriadoLegal } from '../calendario/feriados';
import { TRIBUNAIS_BRASIL } from '@ratione/core';

export type TipoEventoOrigem =
  | 'disponibilizacao_dje'     // DJe / DJEN (Regra Canônica: pub no 1º dia útil seg; contagem no 1º útil pós-pub)
  | 'publicacao'               // Já publicado no Diário
  | 'intimacao_portal'         // Data da CONSULTA ao teor (ou do fim dos 10 dias): dia do começo = dia útil seguinte (CPC, art. 231, V)
  | 'carga_ou_audiencia'       // Carga dos autos, mandado cumprido ou ciência em audiência
  | 'manual';                  // Início da contagem direto

export type RegimeContagem =
  | 'cpc_dias_uteis'           // Art. 219 CPC/15 (Dias úteis + suspensão art. 220)
  | 'clt_dias_uteis'           // Art. 775 CLT (Dias úteis)
  | 'cpp_dias_corridos';       // Art. 798 CPP (Dias corridos, término prorroga se não útil)

/**
 * `conservador` (padrão): só dias não úteis com base verificada (lei federal, fins de semana, recesso do art. 220).
 * Mostra a data mais cedo e, se um dia pendente de conferência a alterasse, informa a alternativa.
 * `completo`: considera também os dias ainda pendentes de conferência (estaduais, Carnaval, Corpus Christi etc.).
 */
export type ModoCalculo = 'conservador' | 'completo';

export interface ParametrosCalculoPrazo {
  dataEvento: string;          // ISO "YYYY-MM-DD"
  tipoEvento: TipoEventoOrigem;
  diasPrazo: number;           // Ex: 15, 5, 8
  regime?: RegimeContagem;     // Padrão: 'cpc_dias_uteis'
  tribunalId?: string;         // Ex: 'TJSP', 'STJ'
  uf?: string;                 // Ex: 'SP'
  prazoEmDobro?: boolean;      // Fazenda Pública (art. 183), MP (art. 180), Defensoria (art. 186)
  suspensaoRecesso?: boolean;  // Suspensão de 20/dez a 20/jan (art. 220 CPC)
  nomeAto?: string;            // Ex: "Apelação Cível", "Embargos de Declaração"
  modo?: ModoCalculo;          // Padrão: 'conservador'
}

export interface ItemMemoriaCalculo {
  data: string;                // "YYYY-MM-DD"
  diaSemana: string;           // "Segunda-feira", "Sábado", etc.
  diaUtil: boolean;
  status:
    | 'disponibilizacao'
    | 'publicacao'
    | 'termo_inicial'
    | 'contagem_dia_util'
    | 'contagem_dia_corrido'
    | 'fim_de_semana'
    | 'feriado'
    | 'recesso_forense'
    | 'expediente_parcial'
    | 'vencimento_prorrogado'
    | 'termo_final';
  descricao: string;
  fundamentoLegal: string;
  diaContadoNumero: number | null; // 1, 2, ..., N
  /** Presente nos dias de feriado/expediente parcial: se o dia tem base verificada ou ainda está pendente. */
  verificacao?: FeriadoLegal['verificacao'];
}

export interface AlternativaPrazo {
  dataVencimentoFinal: string;
  descricao: string;
  /** Dias pendentes de conferência que, se confirmados, produzem a data alternativa. */
  eventosPendentes: Array<{ data: string; nome: string; fundamentoLegal: string }>;
}

export interface ResultadoCalculoPrazo {
  dataEvento: string;
  tipoEvento: TipoEventoOrigem;
  dataDisponibilizacao?: string;
  dataPublicacao: string;
  dataTermoInicial: string;     // Primeiro dia de contagem efetiva
  dataVencimentoFinal: string;  // Termo Ad Quem
  diasTotaisComputados: number;
  diasCorridosTotais: number;
  regime: RegimeContagem;
  tribunal?: string;
  uf?: string;
  foiProrrogadoTermoFinal: boolean;
  motivoProrrogacao?: string;
  memoriaCalculo: ItemMemoriaCalculo[];
  certidaoAuditavel: string;
  modo: ModoCalculo;
  /** `true` só quando o tribunal tem calendário conferido contra o ato oficial para todos os anos percorridos pelo cálculo. */
  calendarioVerificado: boolean;
  avisos: string[];
  alternativa?: AlternativaPrazo;
  /** Atos e URLs do calendário verificado do tribunal (presente apenas quando `calendarioVerificado` é true). */
  fontesCalendario?: Array<{ ato: string; url: string }>;
}

const DIAS_SEMANA_NOMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

const MAX_DIAS_PRAZO = 3650;

function parseIso(isoStr: string): Date {
  const [ano, mes, dia] = isoStr.split('-').map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia));
}

function formatIso(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function somarDias(date: Date, dias: number): Date {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + dias);
  return d;
}

function validarEntrada(p: ParametrosCalculoPrazo): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.dataEvento) || formatIso(parseIso(p.dataEvento)) !== p.dataEvento) {
    throw new Error(`dataEvento inválida: "${p.dataEvento}" (esperado uma data real no formato AAAA-MM-DD)`);
  }
  if (!Number.isInteger(p.diasPrazo) || p.diasPrazo < 1 || p.diasPrazo > MAX_DIAS_PRAZO) {
    throw new Error(`diasPrazo inválido: ${p.diasPrazo} (esperado inteiro entre 1 e ${MAX_DIAS_PRAZO})`);
  }
}

interface ContextoDia {
  uf?: string;
  tribunalId?: string;
  regime: RegimeContagem;
  suspensaoRecesso: boolean;
  incluirPendentes?: boolean;
}

export class MotorPrazoZero {
  private cacheFeriados = new Map<string, Map<string, FeriadoLegal>>();

  private obterFeriados(ano: number, uf?: string, tribunalId?: string): Map<string, FeriadoLegal> {
    const chave = `${ano}_${uf || ''}_${tribunalId || ''}`;
    if (!this.cacheFeriados.has(chave)) {
      this.cacheFeriados.set(chave, obterFeriadosAno(ano, uf, tribunalId));
    }
    return this.cacheFeriados.get(chave)!;
  }

  /**
   * Avalia determinística e legalmente se uma data é dia útil forense.
   * Sem `incluirPendentes`, ignora os dias ainda não conferidos contra o ato oficial.
   */
  public verificarDiaUtil(dataIso: string, params: ContextoDia): {
    diaUtil: boolean;
    motivoNaoUtil?: 'fim_de_semana' | 'feriado' | 'recesso_forense' | 'expediente_parcial';
    detalheFeriado?: FeriadoLegal;
    fundamentoLegal?: string;
    descricao: string;
  } {
    const data = parseIso(dataIso);
    const diaSemanaIndex = data.getUTCDay();

    // 1. Fim de semana (Sábado ou Domingo)
    if (diaSemanaIndex === 0 || diaSemanaIndex === 6) {
      return {
        diaUtil: false,
        motivoNaoUtil: 'fim_de_semana',
        descricao: diaSemanaIndex === 0 ? 'Domingo (Dia não útil)' : 'Sábado (Dia não útil)'
      };
    }

    // 2. Suspensão de prazos: recesso e férias (CPC, art. 220; CLT, art. 775-A; STF e STJ têm janela própria)
    if (params.suspensaoRecesso && (params.regime === 'cpc_dias_uteis' || params.regime === 'clt_dias_uteis')) {
      const s = suspensaoDePrazos(dataIso, params.tribunalId, params.regime);
      if (s.suspenso) {
        return {
          diaUtil: false,
          motivoNaoUtil: 'recesso_forense',
          fundamentoLegal: s.fundamentoLegal,
          descricao: `${s.descricao} (${s.fundamentoLegal})`
        };
      }
    }

    // 3. Feriados e expediente parcial
    const feriadosAno = this.obterFeriados(data.getUTCFullYear(), params.uf, params.tribunalId);
    const f = feriadosAno.get(dataIso);
    if (f && (params.incluirPendentes || f.verificacao !== 'pendente')) {
      return {
        diaUtil: false,
        motivoNaoUtil: f.efeito === 'expediente_parcial' ? 'expediente_parcial' : 'feriado',
        detalheFeriado: f,
        descricao: `${f.nome} (${f.fundamentoLegal})`
      };
    }

    return {
      diaUtil: true,
      descricao: 'Dia útil forense de expediente normal'
    };
  }

  /**
   * Avança determinística até o próximo dia útil
   */
  public obterProximoDiaUtil(dataIso: string, params: ContextoDia): string {
    let atual = somarDias(parseIso(dataIso), 1);
    while (true) {
      const iso = formatIso(atual);
      const res = this.verificarDiaUtil(iso, params);
      if (res.diaUtil) {
        return iso;
      }
      atual = somarDias(atual, 1);
    }
  }

  /**
   * Calcula o prazo. No modo conservador (padrão) devolve a data mais cedo e, se dias ainda
   * pendentes de conferência a alterassem, descreve a alternativa em `alternativa`.
   */
  public calcularPrazo(p: ParametrosCalculoPrazo): ResultadoCalculoPrazo {
    validarEntrada(p);
    const modo: ModoCalculo = p.modo ?? 'conservador';
    const avisos: string[] = [
      'Atos específicos do tribunal (portarias de suspensão, indisponibilidade do sistema) e feriados municipais não são considerados; ' +
        'confira o calendário do tribunal e comprove feriado local (CPC, art. 1.003, § 6º).'
    ];

    const principal = this.executar(p, modo === 'completo');
    let alternativa: AlternativaPrazo | undefined;

    if (modo === 'conservador') {
      const completo = this.executar(p, true);
      if (completo.dataVencimentoFinal !== principal.dataVencimentoFinal) {
        const eventosPendentes = completo.memoriaCalculo
          .filter(i => i.verificacao === 'pendente' && (i.status === 'feriado' || i.status === 'expediente_parcial'))
          .map(i => ({
            data: i.data,
            nome: i.descricao.replace(/ \(não computado\)$/, '').replace(` (${i.fundamentoLegal})`, ''),
            fundamentoLegal: i.fundamentoLegal
          }));
        alternativa = {
          dataVencimentoFinal: completo.dataVencimentoFinal,
          descricao: `Se os dias pendentes de conferência forem confirmados para este tribunal, o vencimento passa para ${completo.dataVencimentoFinal}.`,
          eventosPendentes
        };
        avisos.push(
          `Exibida a data mais cedo (modo conservador). ${alternativa.descricao} Confirme no ato do tribunal antes de contar com a data posterior.`
        );
      }
    }

    const certidao = alternativa
      ? `${principal.certidaoAuditavel}\n• Atenção: ${alternativa.descricao}`
      : principal.certidaoAuditavel;

    const anoInicio = parseInt(principal.dataPublicacao.slice(0, 4), 10);
    const anoFim = parseInt(principal.dataVencimentoFinal.slice(0, 4), 10);
    const cobertura = p.tribunalId ? CALENDARIO_VERIFICADO[p.tribunalId.toUpperCase()] : undefined;
    const calendarioVerificado =
      !!cobertura && Array.from({ length: anoFim - anoInicio + 1 }, (_, i) => anoInicio + i).every(a => cobertura.anos.includes(a));
    if (cobertura && !calendarioVerificado) {
      avisos.push(
        `O calendário de ${p.tribunalId} foi conferido apenas para ${cobertura.anos.join(', ')}; este cálculo percorre ${anoInicio === anoFim ? anoInicio : `${anoInicio} a ${anoFim}`}. ` +
          'Pontos facultativos e portarias dos demais anos não estão carregados.'
      );
    }

    return {
      ...principal,
      certidaoAuditavel: certidao,
      modo,
      calendarioVerificado,
      avisos,
      alternativa,
      ...(calendarioVerificado ? { fontesCalendario: cobertura!.fontes } : {})
    };
  }

  /**
   * Executa a contagem com rigor processual canônico
   */
  private executar(
    p: ParametrosCalculoPrazo,
    incluirPendentes: boolean
  ): Omit<ResultadoCalculoPrazo, 'modo' | 'calendarioVerificado' | 'avisos' | 'alternativa'> {
    const regime = p.regime || 'cpc_dias_uteis';
    const suspensaoRecesso = p.suspensaoRecesso ?? (regime === 'cpc_dias_uteis' || regime === 'clt_dias_uteis');
    const multiplicador = p.prazoEmDobro ? 2 : 1;
    const diasPrazoEfetivo = p.diasPrazo * multiplicador;

    // Resolver UF a partir do Tribunal se não informada
    let uf = p.uf;
    if (!uf && p.tribunalId && TRIBUNAIS_BRASIL[p.tribunalId]?.uf) {
      uf = TRIBUNAIS_BRASIL[p.tribunalId].uf;
    }

    const contextConfig: ContextoDia = { uf, tribunalId: p.tribunalId, regime, suspensaoRecesso, incluirPendentes };
    const memoria: ItemMemoriaCalculo[] = [];

    let dataDisponibilizacao: string | undefined = undefined;
    let dataPublicacao = p.dataEvento;

    // Etapa 1: Resolução de Disponibilização e Publicação
    const viaPortal = p.tipoEvento === 'intimacao_portal';
    if (p.tipoEvento === 'disponibilizacao_dje' || viaPortal) {
      dataDisponibilizacao = p.dataEvento;
      const dataDispDate = parseIso(dataDisponibilizacao);
      memoria.push({
        data: dataDisponibilizacao,
        diaSemana: DIAS_SEMANA_NOMES[dataDispDate.getUTCDay()],
        diaUtil: this.verificarDiaUtil(dataDisponibilizacao, contextConfig).diaUtil,
        status: 'disponibilizacao',
        descricao: viaPortal
          ? 'Consulta ao teor da intimação eletrônica (ou término dos 10 dias para a consulta)'
          : 'Disponibilização da intimação no Diário de Justiça eletrônico (DJe/DJEN)',
        fundamentoLegal: viaPortal
          ? 'Lei 11.419/2006, art. 5º, §§ 1º a 3º'
          : 'CPC, art. 224, § 2º e Resolução CNJ nº 455/2022',
        diaContadoNumero: null
      });

      // A publicação ocorre no 1º dia útil seguinte
      dataPublicacao = this.obterProximoDiaUtil(dataDisponibilizacao, contextConfig);
      const dataPubDate = parseIso(dataPublicacao);
      memoria.push({
        data: dataPublicacao,
        diaSemana: DIAS_SEMANA_NOMES[dataPubDate.getUTCDay()],
        diaUtil: true,
        status: 'publicacao',
        descricao: viaPortal ? 'Dia do começo do prazo (dia útil seguinte à consulta)' : 'Data considerada de publicação oficial do ato',
        fundamentoLegal: viaPortal
          ? 'CPC, art. 231, V (dia útil seguinte à consulta); o dia do começo é excluído (art. 224, caput)'
          : 'CPC, art. 224, § 2º (1º dia útil seguinte à disponibilização)',
        diaContadoNumero: null
      });
    } else {
      const dataPubDate = parseIso(dataPublicacao);
      memoria.push({
        data: dataPublicacao,
        diaSemana: DIAS_SEMANA_NOMES[dataPubDate.getUTCDay()],
        diaUtil: this.verificarDiaUtil(dataPublicacao, contextConfig).diaUtil,
        status: 'publicacao',
        descricao: 'Dia do começo do prazo (comunicação do ato)',
        fundamentoLegal: 'CPC, art. 231',
        diaContadoNumero: null
      });
    }

    // Etapa 2: Determinação do Termo Inicial da Contagem (CPC, art. 224, § 3º)
    // "excluindo o dia do começo e incluindo o do vencimento"
    const dataTermoInicial = this.obterProximoDiaUtil(dataPublicacao, contextConfig);

    // Etapa 3: Iteração determinística dia a dia
    let cursor = somarDias(parseIso(dataPublicacao), 1);
    let diasContados = 0;
    let dataFinalVencimento = '';
    let foiProrrogadoTermoFinal = false;
    let motivoProrrogacao: string | undefined = undefined;

    while (diasContados < diasPrazoEfetivo) {
      const dataIso = formatIso(cursor);
      const diaSemana = DIAS_SEMANA_NOMES[cursor.getUTCDay()];
      const analise = this.verificarDiaUtil(dataIso, contextConfig);
      const verificacao = analise.detalheFeriado?.verificacao;

      if (regime === 'cpc_dias_uteis' || regime === 'clt_dias_uteis') {
        // Expediente parcial só protrai o dia do começo e o do vencimento (CPC, art. 224, § 1º);
        // no meio do prazo o dia é contado normalmente.
        const parcial = analise.motivoNaoUtil === 'expediente_parcial';
        const ehDiaDoComeco = diasContados === 0;
        const ehDiaDoVencimento = diasContados + 1 === diasPrazoEfetivo;
        const parcialProtraido = parcial && (ehDiaDoComeco || ehDiaDoVencimento);
        const contaComoUtil = analise.diaUtil || (parcial && !parcialProtraido);

        if (contaComoUtil) {
          diasContados++;
          const ehUltimo = diasContados === diasPrazoEfetivo;
          memoria.push({
            data: dataIso,
            diaSemana,
            diaUtil: true,
            status: ehUltimo ? 'termo_final' : 'contagem_dia_util',
            descricao: (ehUltimo
              ? `Termo Ad Quem alcançado (${diasContados}º dia útil)`
              : `${diasContados}º dia útil computado no prazo`) +
              (parcial ? ` — expediente parcial: ${analise.detalheFeriado!.nome}` : ''),
            fundamentoLegal: parcial
              ? analise.detalheFeriado!.fundamentoLegal
              : regime === 'cpc_dias_uteis' ? 'CPC, art. 219' : 'CLT, art. 775',
            diaContadoNumero: diasContados,
            ...(parcial ? { verificacao } : {})
          });
          if (ehUltimo) {
            dataFinalVencimento = dataIso;
            break;
          }
        } else {
          if (parcialProtraido && ehDiaDoVencimento && !ehDiaDoComeco) {
            foiProrrogadoTermoFinal = true;
            motivoProrrogacao = `Vencimento protraído por expediente parcial (${analise.detalheFeriado!.nome}), CPC, art. 224, § 1º`;
          }
          memoria.push({
            data: dataIso,
            diaSemana,
            diaUtil: false,
            status: analise.motivoNaoUtil === 'fim_de_semana'
              ? 'fim_de_semana'
              : analise.motivoNaoUtil === 'recesso_forense'
              ? 'recesso_forense'
              : parcialProtraido
              ? 'expediente_parcial'
              : 'feriado',
            descricao: `${analise.descricao} (não computado)`,
            fundamentoLegal: analise.fundamentoLegal || analise.detalheFeriado?.fundamentoLegal || 'CPC, art. 219',
            diaContadoNumero: null,
            ...(analise.detalheFeriado ? { verificacao } : {})
          });
        }
      } else {
        // CPP (Dias corridos)
        diasContados++;
        const ehUltimo = diasContados === diasPrazoEfetivo;
        memoria.push({
          data: dataIso,
          diaSemana,
          diaUtil: analise.diaUtil,
          status: ehUltimo ? 'termo_final' : 'contagem_dia_corrido',
          descricao: ehUltimo
            ? `Último dia do prazo processual penal (${diasContados}º dia corrido)`
            : `${diasContados}º dia corrido computado`,
          fundamentoLegal: 'CPP, art. 798, caput',
          diaContadoNumero: diasContados,
          ...(analise.detalheFeriado ? { verificacao } : {})
        });

        if (ehUltimo) {
          // No CPP, se o dia do vencimento cair em dia não útil, prorroga-se para o primeiro dia útil seguinte (§ 3º do art. 798)
          if (!analise.diaUtil) {
            foiProrrogadoTermoFinal = true;
            motivoProrrogacao = `Vencimento em dia não útil (${analise.descricao}) prorrogado nos termos do CPP, art. 798, § 3º`;
            const proxUtil = this.obterProximoDiaUtil(dataIso, contextConfig);
            dataFinalVencimento = proxUtil;
            const proxDate = parseIso(proxUtil);
            memoria.push({
              data: proxUtil,
              diaSemana: DIAS_SEMANA_NOMES[proxDate.getUTCDay()],
              diaUtil: true,
              status: 'vencimento_prorrogado',
              descricao: `Prorrogação do vencimento final: ${motivoProrrogacao}`,
              fundamentoLegal: 'CPP, art. 798, § 3º',
              diaContadoNumero: diasContados
            });
          } else {
            dataFinalVencimento = dataIso;
          }
          break;
        }
      }

      cursor = somarDias(cursor, 1);
    }

    const dataInicioDate = parseIso(p.dataEvento);
    const dataFimDate = parseIso(dataFinalVencimento);
    const diffMs = dataFimDate.getTime() - dataInicioDate.getTime();
    const diasCorridosTotais = Math.round(diffMs / (1000 * 60 * 60 * 24));

    // Certidão Textual Auditável Formatada
    const tribunalNome = p.tribunalId ? (TRIBUNAIS_BRASIL[p.tribunalId]?.nome || p.tribunalId) : 'Poder Judiciário';
    const certidao = [
      `MEMÓRIA DESCRITIVA DE CÁLCULO DE TEMPESTIVIDADE FORENSE`,
      `Plataforma: Ratione — Módulo PrazoZero (Motor Determinístico)`,
      `Órgão Judiciário: ${tribunalNome} ${uf ? `(UF: ${uf})` : ''}`,
      `Ato Processual: ${p.nomeAto || 'Prazo em dias'} (${diasPrazoEfetivo} dias ${regime === 'cpp_dias_corridos' ? 'corridos' : 'úteis'}${p.prazoEmDobro ? ' - Prazo em Dobro' : ''})`,
      dataDisponibilizacao ? `• Disponibilização (DJe): ${dataDisponibilizacao} (CPC, art. 224, § 2º)` : '',
      `• Publicação Oficial: ${dataPublicacao}`,
      `• Termo Inicial da Contagem: ${dataTermoInicial} (CPC, art. 224, § 3º)`,
      `• TERMO AD QUEM (VENCIMENTO FINAL): ${dataFinalVencimento}`,
      `• Total de dias corridos transcorridos: ${diasCorridosTotais} dias`,
      foiProrrogadoTermoFinal ? `• Observação de Prorrogação: ${motivoProrrogacao}` : '',
      `Fundamentação Legal: ${regime === 'cpc_dias_uteis' ? 'CPC/2015, arts. 219, 220 e 224' : regime === 'clt_dias_uteis' ? 'CLT, art. 775' : 'CPP, art. 798'}.`
    ].filter(Boolean).join('\n');

    return {
      dataEvento: p.dataEvento,
      tipoEvento: p.tipoEvento,
      dataDisponibilizacao,
      dataPublicacao,
      dataTermoInicial,
      dataVencimentoFinal: dataFinalVencimento,
      diasTotaisComputados: diasPrazoEfetivo,
      diasCorridosTotais,
      regime,
      tribunal: p.tribunalId,
      uf,
      foiProrrogadoTermoFinal,
      motivoProrrogacao,
      memoriaCalculo: memoria,
      certidaoAuditavel: certidao
    };
  }
}
