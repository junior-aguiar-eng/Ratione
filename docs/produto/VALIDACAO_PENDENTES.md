# RATIONE — CENÁRIOS PENDENTES DE VALIDAÇÃO

> **Gerado por `packages/prazozero/cenarios/oraculo.py`. Não edite à mão.** Lista os cenários ainda não validados, numerados de 1 a 8. Detalhe de cada um (fundamento e contagem completa): `REVISAO_CENARIOS.md`, pelo identificador.
> Total: **129** cenários · validados: **121** · pendentes: **8**

## Como responder

Basta dizer, por número, o que está certo e o que está errado. Exemplos: *"1 a 20 certos"*; *"7 errado: o certo é 14/03, porque …"*. Eu registro as respostas no gabarito e corrijo o motor onde você discordar. **Dica:** responda por grupo; a mesma regra se repete dentro do grupo.

Convenções: o **dia do começo não conta** e o do vencimento conta (CPC, art. 224); em dias úteis, sábados, domingos, feriados e dias sem expediente não contam (arts. 216 e 219). Pela intimação no Diário, a publicação é o primeiro dia útil depois da disponibilização, e a contagem começa no dia útil seguinte (art. 224, §§ 2º e 3º).

## Resumo

| Grupo | Números | Cenários |
|---|---|---|
| Calendário verificado (tribunais com ato lido) | 1 a 6 | 6 |
| Dias ainda pendentes de conferência | 7 a 8 | 2 |

## Calendário verificado (tribunais com ato lido) (1 a 6)

*O calendário do tribunal foi lido no ato oficial. O que se valida é a **regra de contagem** e se o dia citado realmente não conta.*

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 1 | `tjpr-2026-carnaval`<br>TJPR 2026: 16/02 (suspensão) e 17/02 (Carnaval) não contam; vence 23/02 | publicação em 12/02/2026 (quinta-feira); 5 dias (CPC, dias úteis); TJPR; modo conservador | **23/02/2026 (segunda-feira)** | 4 sáb./dom.; 16/02 TJPR: Decreto Judiciário 621/2025; 17/02 TJPR: Decreto Judiciário 621/2025 |
| 2 | `tjpr-2026-corpus-christi`<br>TJPR 2026: 04/06 (Corpus Christi) e 05/06 (suspensão) não contam | publicação em 02/06/2026 (terça-feira); 5 dias (CPC, dias úteis); TJPR; modo conservador | **11/06/2026 (quinta-feira)** | 2 sáb./dom.; 04/06 TJPR: Decreto Judiciário 621/2025; 05/06 TJPR: Decreto Judiciário 621/2025 |
| 3 | `tjpr-2026-dia-servidor`<br>TJPR 2026: 30/10 (Dia do Funcionário Público, transferido de 28/10) e Finados (02/11) não contam | publicação em 28/10/2026 (quarta-feira); 2 dias (CPC, dias úteis); TJPR; modo conservador | **03/11/2026 (terça-feira)** | 2 sáb./dom.; 30/10 TJPR: Decreto Judiciário 621/2025; 02/11 Finados |
| 4 | `tjrs-2026-carnaval`<br>TJRS 2026: 16/02 e 17/02 (Carnaval) não contam; vence 23/02 | publicação em 12/02/2026 (quinta-feira); 5 dias (CPC, dias úteis); TJRS; modo conservador | **23/02/2026 (segunda-feira)** | 4 sáb./dom.; 16/02 TJRS: ato do Órgão Especial / Ato Conjunto 004/2026; 17/02 TJRS: ato do Órgão Especial / Ato Conjunto 004/2026 |
| 5 | `tjrs-2026-dia-da-justica`<br>TJRS 2026: 08/12 (Dia da Justiça) não conta | publicação em 04/12/2026 (sexta-feira); 3 dias (CPC, dias úteis); TJRS; modo conservador | **10/12/2026 (quinta-feira)** | 2 sáb./dom.; 08/12 TJRS: ato do Órgão Especial / Ato Conjunto 004/2026 |
| 6 | `tjrs-2026-ato-conjunto-energia`<br>TJRS: 02/07/2026 teve os prazos suspensos (falta de energia); não conta | publicação em 01/07/2026 (quarta-feira); 2 dias (CPC, dias úteis); TJRS; modo conservador | **06/07/2026 (segunda-feira)** | 2 sáb./dom.; 02/07 TJRS: ato do Órgão Especial / Ato Conjunto 004/2026 |

## Dias ainda pendentes de conferência (7 a 8)

*Cada caso mostra a data com o dia ainda **não conferido** no ato do tribunal. Valide a contagem **supondo que o dia conta como sem expediente**; se ele é mesmo dia sem expediente naquele tribunal é o que falta conferir, não é dúvida de contagem. A coluna *Alternativa* mostra a outra data possível.*

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 7 | `tjrs-2026-corpus-christi-conservador`<br>TJRS: Corpus Christi (04/06/2026) é feriado municipal de Porto Alegre; ignorado no modo conservador | publicação em 02/06/2026 (terça-feira); 5 dias (CPC, dias úteis); TJRS; modo conservador | **09/06/2026 (terça-feira)**<br>Alternativa: 10/06/2026 (quarta-feira) | 2 sáb./dom. |
| 8 | `tjrs-2026-corpus-christi-completo`<br>TJRS: Corpus Christi (04/06/2026) considerado no modo completo | publicação em 02/06/2026 (terça-feira); 5 dias (CPC, dias úteis); TJRS; modo completo | **10/06/2026 (quarta-feira)** | 2 sáb./dom.; 04/06 Corpus Christi |

