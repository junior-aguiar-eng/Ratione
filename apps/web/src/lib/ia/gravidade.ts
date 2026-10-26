import type { Gravidade } from '../log';

type Campos = Record<string, string | number | boolean | null | undefined>;

/**
 * Falha da API que só o responsável resolve: saldo da conta da Anthropic esgotado, chave inválida ou sem permissão. Nesses casos a IA fica fora
 * do ar para todo mundo até alguém agir, então vira `ERROR`, que dispara o alerta por e-mail do Cloud Monitoring (filtro `severity>=ERROR`).
 * Falha passageira (limite de taxa, tempo esgotado, resposta cortada ou descartada) continua `WARNING`: o usuário tenta de novo.
 */
const PRECISA_DE_ACAO = /credit balance|billing|saldo|chave da API inv[aá]lida|\(401\)|\(403\)/i;

export function gravidadeDoAviso(mensagem: string, campos: Campos): Gravidade {
  // A IA gerou e cobrou, mas o banco não registrou (cota, custo ou cache): só o responsável resolve
  if (mensagem === 'IA: resultado gerado, mas o registro falhou') return 'ERROR';
  if (mensagem !== 'IA: chamada falhou') return 'WARNING';
  return PRECISA_DE_ACAO.test(String(campos.erro_mensagem ?? '')) ? 'ERROR' : 'WARNING';
}
