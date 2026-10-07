import { MotorPrazoZero } from './calculadora';
import { civil, deDias, ehDataIsoValida, formatarCivil, paraDias, somarDiasIso } from '../datas/civil';

/**
 * Prazos materiais (decadência), calculados fora do motor processual (PLANO F2-14).
 * Base lida no texto compilado em 07/10/2026:
 *  - Lei 12.016/2009, art. 23: o direito de requerer mandado de segurança se extingue em 120 dias, contados da ciência do ato impugnado.
 *  - CPC, art. 975: o direito à rescisão se extingue em 2 anos do trânsito em julgado da última decisão; o § 1º prorroga até o
 *    primeiro dia útil se o prazo expirar durante férias forenses, recesso, feriados ou dia sem expediente forense.
 *  - Código Civil, art. 132: exclui-se o dia do começo e inclui-se o do vencimento; § 1º prorroga ao dia útil se vencer em feriado;
 *    § 3º prazos de anos expiram no dia de igual número do de início, ou no imediato se faltar correspondência.
 *  - Código Civil, art. 207: à decadência não se aplicam as normas que impedem, suspendem ou interrompem a prescrição.
 */
export type TipoPrazoMaterial = 'mandado_seguranca' | 'acao_rescisoria';

export interface ParametrosPrazoMaterial {
  tipo: TipoPrazoMaterial;
  /** ISO. Mandado de segurança: ciência do ato impugnado. Ação rescisória: trânsito em julgado da última decisão. */
  dataInicio: string;
  /** Tribunal onde a ação será proposta (calendário de dias sem expediente). */
  tribunalId?: string;
  uf?: string;
}

export interface ItemMemoriaMaterial {
  data: string;
  descricao: string;
  fundamentoLegal: string;
}

export interface ResultadoPrazoMaterial {
  tipo: TipoPrazoMaterial;
  dataInicio: string;
  /** Último dia para propor a ação (data mais cedo defensável). */
  dataLimite: string;
  /** Data se o vencimento fosse prorrogado ao dia útil; só presente quando difere de `dataLimite`. */
  dataAlternativa?: string;
  descricaoAlternativa?: string;
  /** `true` quando `dataLimite` já é a data prorrogada por regra expressa (rescisória). */
  prorrogado: boolean;
  memoriaCalculo: ItemMemoriaMaterial[];
  avisos: string[];
  baseLegal: string;
}

const AVISO_CALENDARIO =
  'Atos específicos do tribunal (portarias de suspensão, indisponibilidade do sistema) e feriados municipais não são considerados; ' +
  'confira o calendário do tribunal e comprove feriado local (CPC, art. 1.003, § 6º).';

function validar(iso: string): void {
  if (!ehDataIsoValida(iso)) {
    throw new Error(`dataInicio inválida: "${iso}" (esperado uma data real no formato AAAA-MM-DD)`);
  }
}

const motor = new MotorPrazoZero();

export function calcularPrazoMaterial(p: ParametrosPrazoMaterial): ResultadoPrazoMaterial {
  validar(p.dataInicio);
  return p.tipo === 'mandado_seguranca' ? mandadoSeguranca(p) : acaoRescisoria(p);
}

function mandadoSeguranca(p: ParametrosPrazoMaterial): ResultadoPrazoMaterial {
  const BASE = 'Lei 12.016/2009, art. 23; Código Civil, arts. 132 e 207';
  const limite = somarDiasIso(p.dataInicio, 120);
  // Sem suspensão: o recesso não suspende a decadência (CC, art. 207). Só dias sem expediente conferidos.
  const ctx = { uf: p.uf, tribunalId: p.tribunalId, regime: 'cpc_dias_uteis' as const, suspensaoRecesso: false };
  const util = motor.verificarDiaUtil(limite, ctx);
  const memoria: ItemMemoriaMaterial[] = [
    { data: p.dataInicio, descricao: 'Ciência do ato impugnado (dia do começo, excluído da contagem)', fundamentoLegal: 'Lei 12.016/2009, art. 23; CC, art. 132' },
    { data: limite, descricao: '120º dia corrido: último dia para impetrar', fundamentoLegal: 'Lei 12.016/2009, art. 23' }
  ];
  const avisos = [
    'Decadência: não se suspende nem se interrompe, inclusive no recesso de 20/12 a 20/01 (Código Civil, art. 207). Conta dias corridos, não dias úteis.',
    'A página do Planalto marca o art. 23 com "Vide ADIN 4296": o efeito dessa ação sobre o prazo não foi verificado e fica para o revisor jurídico.',
    'A data é contada da ciência do ato impugnado; confirme qual foi o ato e quando o impetrante dele teve ciência.',
    AVISO_CALENDARIO
  ];
  const r: ResultadoPrazoMaterial = {
    tipo: 'mandado_seguranca',
    dataInicio: p.dataInicio,
    dataLimite: limite,
    prorrogado: false,
    memoriaCalculo: memoria,
    avisos,
    baseLegal: BASE
  };
  if (!util.diaUtil) {
    const prox = motor.obterProximoDiaUtil(limite, ctx);
    r.dataAlternativa = prox;
    r.descricaoAlternativa =
      `O 120º dia cai em dia sem expediente: ${util.descricao.replace(/ \(Dia não útil\)$/, '').toLowerCase()}. O art. 23 não prevê prorrogação e o Código Civil, art. 132, § 1º, só a prevê para feriado; ` +
      'se vale a prorrogação ao dia útil seguinte para fim de semana e ponto facultativo é questão de jurisprudência, que não foi verificada. ' +
      'Proponha a ação até a data-limite.';
    memoria.push({ data: limite, descricao: `Dia sem expediente: ${util.descricao}`, fundamentoLegal: 'CC, art. 132, § 1º (só feriado)' });
  }
  return r;
}

/** Soma 2 anos: dia de igual número, ou o dia mais cedo se faltar correspondência (só 29/02). */
function maisDoisAnos(iso: string): { data: string; semCorrespondencia: boolean; imediato?: string } {
  const { ano: a, mes: m, dia: d } = civil(iso);
  if (ehDataIsoValida(formatarCivil({ ano: a + 2, mes: m, dia: d }))) {
    return { data: formatarCivil({ ano: a + 2, mes: m, dia: d }), semCorrespondencia: false };
  }
  // 29/02 sem equivalente: o dia imediato é 1º/03 (leitura literal) ou 28/02 (último dia do mês). Fica o mais cedo.
  const primeiroMarco = paraDias(a + 2, m + 1, 1);
  return { data: formatarCivil(deDias(primeiroMarco - 1)), semCorrespondencia: true, imediato: formatarCivil(deDias(primeiroMarco)) };
}

function acaoRescisoria(p: ParametrosPrazoMaterial): ResultadoPrazoMaterial {
  const BASE = 'CPC, art. 975; Código Civil, art. 132';
  const { data: bruto, semCorrespondencia, imediato } = maisDoisAnos(p.dataInicio);
  const ctx = { uf: p.uf, tribunalId: p.tribunalId, regime: 'cpc_dias_uteis' as const, suspensaoRecesso: true };
  const memoria: ItemMemoriaMaterial[] = [
    { data: p.dataInicio, descricao: 'Trânsito em julgado da última decisão (dia do começo, excluído da contagem)', fundamentoLegal: 'CPC, art. 975, caput; CC, art. 132' },
    { data: bruto, descricao: 'Mesmo dia e mês, 2 anos depois: vencimento antes da prorrogação', fundamentoLegal: 'CC, art. 132, § 3º' }
  ];
  const avisos = [
    'Decadência de 2 anos contados do trânsito em julgado da última decisão (CPC, art. 975, caput). O trânsito é o que consta da certidão do processo; este cálculo não o determina.',
    'Se a ação se funda em prova nova (art. 966, VII), o prazo começa na descoberta da prova, limitado a 5 anos do trânsito (art. 975, § 2º). Em simulação ou colusão, para o terceiro prejudicado e o Ministério Público, começa com a ciência (art. 975, § 3º). Nenhum dos dois casos é calculado aqui.',
    AVISO_CALENDARIO
  ];
  if (semCorrespondencia) {
    avisos.push(
      `O dia ${p.dataInicio.slice(8)}/${p.dataInicio.slice(5, 7)} não existe dois anos depois. O Código Civil, art. 132, § 3º, manda expirar "no imediato"; ` +
        `foi adotado ${bruto.split('-').reverse().join('/')} (a data mais cedo); a leitura literal seria ${imediato!.split('-').reverse().join('/')}. Confirme com o revisor jurídico.`
    );
  }
  // Prorrogação expressa (art. 975, § 1º): fim de semana, feriado, recesso/férias forenses ou dia sem expediente.
  const util = motor.verificarDiaUtil(bruto, ctx);
  let limite = bruto;
  let prorrogado = false;
  if (!util.diaUtil) {
    limite = motor.obterProximoDiaUtil(bruto, ctx);
    prorrogado = true;
    memoria.push({ data: bruto, descricao: `Vencimento em dia sem expediente: ${util.descricao}`, fundamentoLegal: 'CPC, art. 975, § 1º' });
    memoria.push({ data: limite, descricao: 'Primeiro dia útil seguinte: último dia para propor a ação', fundamentoLegal: 'CPC, art. 975, § 1º' });
  } else {
    memoria.push({ data: limite, descricao: 'Último dia para propor a ação', fundamentoLegal: 'CPC, art. 975, caput' });
  }
  const r: ResultadoPrazoMaterial = {
    tipo: 'acao_rescisoria',
    dataInicio: p.dataInicio,
    dataLimite: limite,
    prorrogado,
    memoriaCalculo: memoria,
    avisos,
    baseLegal: BASE
  };
  // Dias do calendário ainda não conferidos (estaduais, Carnaval etc.) que, se confirmados, alterariam a data.
  const ctxCompleto = { ...ctx, incluirPendentes: true };
  const utilCompleto = motor.verificarDiaUtil(bruto, ctxCompleto);
  const limiteCompleto = utilCompleto.diaUtil ? bruto : motor.obterProximoDiaUtil(bruto, ctxCompleto);
  if (limiteCompleto !== limite) {
    r.dataAlternativa = limiteCompleto;
    r.descricaoAlternativa =
      'Há dia ainda não conferido contra o ato oficial do tribunal (feriado estadual, Carnaval, Corpus Christi etc.) que prorrogaria o vencimento para esta data. ' +
      'A data-limite acima não o considera.';
  }
  return r;
}
