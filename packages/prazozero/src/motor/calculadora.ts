import { obterFeriadosAno, estaEmRecessoForenseCpc, FeriadoLegal } from '../calendario/feriados';
import { TRIBUNAIS_BRASIL } from '@ratione/core';

export type TipoEventoOrigem =
  | 'disponibilizacao_dje'     // DJe / DJEN (Regra Canônica: pub no 1º dia útil seg; contagem no 1º útil pós-pub)
  | 'publicacao'               // Já publicado no Diário
  | 'intimacao_portal'         // Intimação no sistema/portal eletrônico (Lei 11.419/06)
  | 'carga_ou_audiencia'       // Carga dos autos, mandado cumprido ou ciência em audiência
  | 'manual';                  // Início da contagem direto

export type RegimeContagem =
  | 'cpc_dias_uteis'           // Art. 219 CPC/15 (Dias úteis + suspensão art. 220)
  | 'clt_dias_uteis'           // Art. 775 CLT (Dias úteis)
  | 'cpp_dias_corridos';       // Art. 798 CPP (Dias corridos, término prorroga se não útil)

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
    | 'vencimento_prorrogado'
    | 'termo_final';
  descricao: string;
  fundamentoLegal: string;
  diaContadoNumero: number | null; // 1, 2, ..., N
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
   * Avalia determinística e legalmente se uma data é dia útil forense
   */
  public verificarDiaUtil(dataIso: string, params: { uf?: string; tribunalId?: string; regime: RegimeContagem; suspensaoRecesso: boolean }): {
    diaUtil: boolean;
    motivoNaoUtil?: 'fim_de_semana' | 'feriado' | 'recesso_forense';
    detalheFeriado?: FeriadoLegal;
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

    // 2. Recesso Forense (Art. 220 CPC)
    if (params.suspensaoRecesso && (params.regime === 'cpc_dias_uteis' || params.regime === 'clt_dias_uteis')) {
      if (estaEmRecessoForenseCpc(dataIso)) {
        return {
          diaUtil: false,
          motivoNaoUtil: 'recesso_forense',
          descricao: 'Suspensão de prazos processuais e recesso forense (CPC, art. 220)'
        };
      }
    }

    // 3. Feriados e Pontos Facultativos Forenses
    const feriadosAno = this.obterFeriados(data.getUTCFullYear(), params.uf, params.tribunalId);
    if (feriadosAno.has(dataIso)) {
      const f = feriadosAno.get(dataIso)!;
      return {
        diaUtil: false,
        motivoNaoUtil: 'feriado',
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
  public obterProximoDiaUtil(dataIso: string, params: { uf?: string; tribunalId?: string; regime: RegimeContagem; suspensaoRecesso: boolean }): string {
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
   * Executa a contagem com rigor processual canônico
   */
  public calcularPrazo(p: ParametrosCalculoPrazo): ResultadoCalculoPrazo {
    const regime = p.regime || 'cpc_dias_uteis';
    const suspensaoRecesso = p.suspensaoRecesso ?? (regime === 'cpc_dias_uteis');
    const multiplicador = p.prazoEmDobro ? 2 : 1;
    const diasPrazoEfetivo = p.diasPrazo * multiplicador;

    // Resolver UF a partir do Tribunal se não informada
    let uf = p.uf;
    if (!uf && p.tribunalId && TRIBUNAIS_BRASIL[p.tribunalId]?.uf) {
      uf = TRIBUNAIS_BRASIL[p.tribunalId].uf;
    }

    const contextConfig = { uf, tribunalId: p.tribunalId, regime, suspensaoRecesso };
    const memoria: ItemMemoriaCalculo[] = [];

    let dataDisponibilizacao: string | undefined = undefined;
    let dataPublicacao = p.dataEvento;

    // Etapa 1: Resolução de Disponibilização e Publicação
    if (p.tipoEvento === 'disponibilizacao_dje') {
      dataDisponibilizacao = p.dataEvento;
      const dataDispDate = parseIso(dataDisponibilizacao);
      memoria.push({
        data: dataDisponibilizacao,
        diaSemana: DIAS_SEMANA_NOMES[dataDispDate.getUTCDay()],
        diaUtil: this.verificarDiaUtil(dataDisponibilizacao, contextConfig).diaUtil,
        status: 'disponibilizacao',
        descricao: 'Disponibilização da intimação no Diário de Justiça eletrônico (DJe/DJEN)',
        fundamentoLegal: 'CPC, art. 224, § 2º e Resolução CNJ nº 455/2022',
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
        descricao: 'Data considerada de publicação oficial do ato',
        fundamentoLegal: 'CPC, art. 224, § 2º (1º dia útil seguinte à disponibilização)',
        diaContadoNumero: null
      });
    } else {
      const dataPubDate = parseIso(dataPublicacao);
      memoria.push({
        data: dataPublicacao,
        diaSemana: DIAS_SEMANA_NOMES[dataPubDate.getUTCDay()],
        diaUtil: this.verificarDiaUtil(dataPublicacao, contextConfig).diaUtil,
        status: 'publicacao',
        descricao: p.tipoEvento === 'intimacao_portal'
          ? 'Intimação eletrônica aperfeiçoada no portal'
          : 'Comunicação oficial do ato processual',
        fundamentoLegal: p.tipoEvento === 'intimacao_portal' ? 'Lei Federal nº 11.419/2006, art. 5º' : 'CPC, art. 231',
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

      if (regime === 'cpc_dias_uteis' || regime === 'clt_dias_uteis') {
        if (analise.diaUtil) {
          diasContados++;
          const ehUltimo = diasContados === diasPrazoEfetivo;
          memoria.push({
            data: dataIso,
            diaSemana,
            diaUtil: true,
            status: ehUltimo ? 'termo_final' : 'contagem_dia_util',
            descricao: ehUltimo
              ? `Termo Ad Quem alcançado (${diasContados}º dia útil)`
              : `${diasContados}º dia útil computado no prazo`,
            fundamentoLegal: regime === 'cpc_dias_uteis' ? 'CPC, art. 219' : 'CLT, art. 775',
            diaContadoNumero: diasContados
          });
          if (ehUltimo) {
            dataFinalVencimento = dataIso;
            break;
          }
        } else {
          memoria.push({
            data: dataIso,
            diaSemana,
            diaUtil: false,
            status: analise.motivoNaoUtil === 'fim_de_semana'
              ? 'fim_de_semana'
              : analise.motivoNaoUtil === 'recesso_forense'
              ? 'recesso_forense'
              : 'feriado',
            descricao: `${analise.descricao} (não computado)`,
            fundamentoLegal: analise.detalheFeriado?.fundamentoLegal || 'CPC, art. 219',
            diaContadoNumero: null
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
          diaContadoNumero: diasContados
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
