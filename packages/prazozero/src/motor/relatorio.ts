import { TRIBUNAIS_BRASIL } from '@ratione/core';
import { MotorPrazoZero, ParametrosCalculoPrazo, ResultadoCalculoPrazo } from './calculadora';

/**
 * Relatório "o que pode alterar este prazo" (PLANO F2-12).
 * Para um cálculo já feito, lista o que o cálculo não conhece ou ainda não confirmou e que pode mudar a data,
 * com o fundamento (texto lido em 07/10/2026 na versão compilada) e, quando é possível calcular, a data que resultaria.
 * Nada aqui altera o resultado principal.
 */
export type CategoriaAlteracao =
  | 'dia_pendente'
  | 'calendario_nao_conferido'
  | 'parte'
  | 'excecao_criminal'
  | 'sistema'
  | 'fato_do_caso'
  | 'ato_do_juiz'
  | 'local'
  | 'intimacao';

export interface ItemAlteracao {
  id: string;
  categoria: CategoriaAlteracao;
  titulo: string;
  descricao: string;
  fundamentoLegal: string;
  /** Vencimento que resultaria se o item se confirmar; ausente quando não dá para calcular. */
  dataSeAplicar?: string;
}

export interface RelatorioAlteracoes {
  dataVencimentoFinal: string;
  itens: ItemAlteracao[];
}

const motor = new MotorPrazoZero();

export function relatorioAlteracoes(p: ParametrosCalculoPrazo, r: ResultadoCalculoPrazo): RelatorioAlteracoes {
  const regime = p.regime ?? 'cpc_dias_uteis';
  const itens: ItemAlteracao[] = [];
  const venc = r.dataVencimentoFinal;
  const uf = p.uf ?? (p.tribunalId ? TRIBUNAIS_BRASIL[p.tribunalId]?.uf : undefined);
  const ctx = {
    uf,
    tribunalId: p.tribunalId,
    regime,
    suspensaoRecesso: p.suspensaoRecesso ?? (regime !== 'cpp_dias_corridos' || !p.excecaoSuspensaoCriminal)
  };

  // 1. Dias do calendário ainda não conferidos (os mesmos da data alternativa)
  if (r.alternativa) {
    itens.push({
      id: 'dias-pendentes',
      categoria: 'dia_pendente',
      titulo: 'Dias sem expediente ainda não conferidos no ato do tribunal',
      descricao:
        r.alternativa.eventosPendentes.map(e => `${e.data.split('-').reverse().join('/')} (${e.nome})`).join('; ') +
        '. Se o tribunal confirmar algum deles como dia sem expediente, o vencimento se move.',
      fundamentoLegal: 'CPC, art. 219 e art. 224, § 1º; ato do tribunal',
      dataSeAplicar: r.alternativa.dataVencimentoFinal
    });
  }

  // 2. Cobertura do calendário
  if (!r.calendarioVerificado) {
    itens.push({
      id: 'calendario-nao-conferido',
      categoria: 'calendario_nao_conferido',
      titulo: 'Calendário do tribunal não conferido para este período',
      descricao:
        'Portarias de feriado, ponto facultativo e suspensão de expediente do tribunal que não estão carregadas podem acrescentar dias sem expediente e adiar o vencimento. Consulte o calendário do tribunal.',
      fundamentoLegal: 'CPC, art. 224, § 1º; ato do tribunal'
    });
  }

  // 3. Quem é a parte: dobro (só onde a base foi lida)
  if (!p.prazoEmDobro && (regime === 'cpc_dias_uteis' || regime === 'clt_dias_uteis')) {
    const dobro = motor.calcularPrazo({ ...p, prazoEmDobro: true, modo: p.modo }).dataVencimentoFinal;
    itens.push({
      id: 'prazo-em-dobro',
      categoria: 'parte',
      titulo: 'A parte tem prazo em dobro',
      descricao:
        regime === 'cpc_dias_uteis'
          ? 'União, Estados, DF, Municípios e suas autarquias e fundações de direito público (art. 183), Ministério Público (art. 180) e Defensoria Pública (art. 186) têm prazo em dobro, contado da intimação pessoal. Não vale quando a lei fixa prazo próprio.'
          : 'Na Justiça do Trabalho, a União, os Estados, o DF, os Municípios e as autarquias e fundações de direito público têm prazo em dobro para recurso. Não foi verificado o benefício para outros atos nem para o Ministério Público do Trabalho.',
      fundamentoLegal: regime === 'cpc_dias_uteis' ? 'CPC, arts. 180, 183 e 186' : 'Decreto-Lei 779/1969, art. 1º, III',
      dataSeAplicar: dobro
    });
  }

  // 4. CPP: exceção da suspensão de 20/12 a 20/01 (art. 798-A)
  if (regime === 'cpp_dias_corridos') {
    const inverso = motor.calcularPrazo({ ...p, excecaoSuspensaoCriminal: !p.excecaoSuspensaoCriminal, modo: p.modo }).dataVencimentoFinal;
    if (inverso !== venc) {
      itens.push({
        id: 'excecao-criminal',
        categoria: 'excecao_criminal',
        titulo: p.excecaoSuspensaoCriminal
          ? 'O caso não se enquadra na exceção (réu preso, Maria da Penha, medida urgente)'
          : 'O caso é de réu preso, Lei Maria da Penha ou medida urgente',
        descricao: p.excecaoSuspensaoCriminal
          ? 'Sem a exceção, o prazo fica suspenso de 20/12 a 20/01 e o vencimento se move.'
          : 'Nesses casos o prazo não se suspende de 20/12 a 20/01 e o vencimento se move.',
        fundamentoLegal: 'CPP, art. 798-A, I a III',
        dataSeAplicar: inverso
      });
    }
  }

  // 5. Indisponibilidade do sistema no último dia
  itens.push({
    id: 'indisponibilidade',
    categoria: 'sistema',
    titulo: 'Indisponibilidade do sistema do tribunal',
    descricao:
      'Se o sistema ficar indisponível por motivo técnico, o prazo para petição eletrônica se prorroga para o primeiro dia útil seguinte à resolução do problema. A data supõe a indisponibilidade no último dia. Confira o ato do tribunal que a declara.',
    fundamentoLegal: 'Lei 11.419/2006, art. 10, §§ 1º e 2º; CPC, art. 224, § 1º',
    dataSeAplicar: motor.obterProximoDiaUtil(venc, ctx)
  });

  // 6. Intimação eletrônica pelo portal
  if (p.tipoEvento === 'intimacao_portal') {
    itens.push({
      id: 'consulta-portal',
      categoria: 'intimacao',
      titulo: 'A data da consulta ao teor da intimação',
      descricao:
        'A intimação se realiza no dia da consulta (no dia útil seguinte, se a consulta foi em dia não útil). Sem consulta em 10 dias corridos do envio, considera-se realizada no término desse prazo. Confira a certidão de consulta nos autos.',
      fundamentoLegal: 'Lei 11.419/2006, art. 5º, §§ 1º a 3º; CPC, art. 231, V'
    });
  }

  // 7. Fatos do caso e atos do juiz (sem data calculável)
  itens.push({
    id: 'suspensao-processo',
    categoria: 'fato_do_caso',
    titulo: 'Suspensão do prazo por obstáculo ou por suspensão do processo',
    descricao:
      'O prazo se suspende por obstáculo criado em detrimento da parte ou nas hipóteses do art. 313 (morte ou perda de capacidade da parte ou do advogado, convenção das partes, força maior, parto ou adoção da única patrona, paternidade do único patrono, entre outras), e é restituído por tempo igual ao que faltava. Também se suspende durante programa de autocomposição do Judiciário.',
    fundamentoLegal: 'CPC, art. 221 e art. 313'
  });
  itens.push({
    id: 'justa-causa',
    categoria: 'fato_do_caso',
    titulo: 'Justa causa para o ato fora do prazo',
    descricao:
      'Evento alheio à vontade da parte que a impediu de praticar o ato permite ao juiz assinar novo prazo, se a parte o provar. Não altera a data do vencimento, mas pode salvar o ato.',
    fundamentoLegal: 'CPC, art. 223, §§ 1º e 2º'
  });
  itens.push({
    id: 'prorrogacao-juiz',
    categoria: 'ato_do_juiz',
    titulo: 'Prorrogação pelo juiz em comarca de difícil transporte ou em calamidade',
    descricao: 'O juiz pode prorrogar os prazos por até 2 meses (mais, em calamidade pública), e não pode reduzir prazo peremptório sem anuência das partes.',
    fundamentoLegal: 'CPC, art. 222'
  });
  itens.push({
    id: 'feriado-local',
    categoria: 'local',
    titulo: 'Feriado local (municipal)',
    descricao:
      'Feriado municipal não é considerado pelo cálculo. Se houver na comarca dentro do prazo, ele deve ser comprovado no ato de interposição do recurso.',
    fundamentoLegal: 'CPC, art. 1.003, § 6º'
  });

  return { dataVencimentoFinal: venc, itens };
}
