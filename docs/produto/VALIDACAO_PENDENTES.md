# RATIONE — CENÁRIOS PENDENTES DE VALIDAÇÃO

> **Gerado por `packages/prazozero/cenarios/oraculo.py`. Não edite à mão.** Lista os cenários ainda não validados, numerados de 1 a 14. Detalhe de cada um (fundamento e contagem completa): `REVISAO_CENARIOS.md`, pelo identificador.
> Total: **210** cenários · validados: **196** · pendentes: **14**

## Como responder

Basta dizer, por número, o que está certo e o que está errado. Exemplos: *"1 a 20 certos"*; *"7 errado: o certo é 14/03, porque …"*. Eu registro as respostas no gabarito e corrijo o motor onde você discordar. **Dica:** responda por grupo; a mesma regra se repete dentro do grupo.

Convenções: o **dia do começo não conta** e o do vencimento conta (CPC, art. 224); em dias úteis, sábados, domingos, feriados e dias sem expediente não contam (arts. 216 e 219). Pela intimação no Diário, a publicação é o primeiro dia útil depois da disponibilização, e a contagem começa no dia útil seguinte (art. 224, §§ 2º e 3º).

## Resumo

| Grupo | Números | Cenários |
|---|---|---|
| Calendário verificado (tribunais com ato lido) | 1 a 11 | 11 |
| Dias ainda pendentes de conferência | 12 a 14 | 3 |

## Calendário verificado (tribunais com ato lido) (1 a 11)

*O calendário do tribunal foi lido no ato oficial. O que se valida é a **regra de contagem** e se o dia citado realmente não conta.*

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 1 | `tjpa-2026-carnaval`<br>TJPA 2026: 16/02 (ponto facultativo), 17/02 (Carnaval) e 18/02 (Cinzas, ponto facultativo) não contam | publicação em 12/02/2026 (quinta-feira); 5 dias (CPC, dias úteis); TJPA; modo conservador | **24/02/2026 (terça-feira)** | 4 sáb./dom.; 16/02 TJPA: Portaria 4765/2025-GP; 17/02 TJPA: Portaria 4765/2025-GP; 18/02 TJPA: Portaria 4765/2025-GP |
| 2 | `tjpa-2026-semana-santa`<br>TJPA 2026: 02/04 (Quinta-feira Santa, ponto facultativo) e 03/04 (Sexta-feira Santa) não contam | publicação em 01/04/2026 (quarta-feira); 2 dias (CPC, dias úteis); TJPA; modo conservador | **07/04/2026 (terça-feira)** | 2 sáb./dom.; 02/04 TJPA: Portaria 4765/2025-GP; 03/04 TJPA: Portaria 4765/2025-GP |
| 3 | `tjpa-2026-ponto-facultativo-20-abril`<br>TJPA 2026: 20/04 é ponto facultativo sem expediente e 21/04 (Tiradentes) é feriado: nenhum conta | publicação em 16/04/2026 (quinta-feira); 3 dias (CPC, dias úteis); TJPA; modo conservador | **23/04/2026 (quinta-feira)** | 2 sáb./dom.; 20/04 TJPA: Portaria 4765/2025-GP; 21/04 Tiradentes |
| 4 | `tjpa-2026-corpus-christi`<br>TJPA 2026: 04/06 (Corpus Christi) e 05/06 (ponto facultativo) não contam | publicação em 02/06/2026 (terça-feira); 3 dias (CPC, dias úteis); TJPA; modo conservador | **09/06/2026 (terça-feira)** | 2 sáb./dom.; 04/06 TJPA: Portaria 4765/2025-GP; 05/06 TJPA: Portaria 4765/2025-GP |
| 5 | `tjpa-2026-recirio`<br>TJPA 2026: 26/10 (Recírio, ponto facultativo) não conta | publicação em 22/10/2026 (quinta-feira); 3 dias (CPC, dias úteis); TJPA; modo conservador | **28/10/2026 (quarta-feira)** | 2 sáb./dom.; 26/10 TJPA: Portaria 4765/2025-GP |
| 6 | `tjpa-2026-dia-servidor`<br>TJPA 2026: o Dia do Servidor foi transferido para 30/10 (art. 2º): 28/10 conta e 30/10 não | publicação em 27/10/2026 (terça-feira); 3 dias (CPC, dias úteis); TJPA; modo conservador | **03/11/2026 (terça-feira)** | 2 sáb./dom.; 30/10 TJPA: Portaria 4765/2025-GP; 02/11 Finados |
| 7 | `tjpa-2026-dia-da-justica`<br>TJPA 2026: 07/12 (ponto facultativo) e 08/12 (Dia da Justiça) não contam | publicação em 04/12/2026 (sexta-feira); 3 dias (CPC, dias úteis); TJPA; modo conservador | **11/12/2026 (sexta-feira)** | 2 sáb./dom.; 07/12 TJPA: Portaria 4765/2025-GP; 08/12 TJPA: Portaria 4765/2025-GP |
| 8 | `tjma-2026-adesao-do-maranhao`<br>TJMA 2026: 28/07 (Adesão do Maranhão à Independência) não conta | publicação em 27/07/2026 (segunda-feira); 2 dias (CPC, dias úteis); TJMA; modo conservador | **30/07/2026 (quinta-feira)** | 28/07 TJMA: Resolução-GP 131/2025 |
| 9 | `tjma-2026-dia-do-advogado`<br>TJMA 2026: 11/08 (Dia do Advogado, feriado forense) não conta | publicação em 07/08/2026 (sexta-feira); 2 dias (CPC, dias úteis); TJMA; modo conservador | **12/08/2026 (quarta-feira)** | 2 sáb./dom.; 11/08 TJMA: Resolução-GP 131/2025 |
| 10 | `tjma-2026-dia-servidor`<br>TJMA 2026: 28/10 (Dia do Servidor, sem transferência para 30/10 no ato) não conta; 30/10 conta | publicação em 27/10/2026 (terça-feira); 3 dias (CPC, dias úteis); TJMA; modo conservador | **03/11/2026 (terça-feira)** | 2 sáb./dom.; 28/10 TJMA: Resolução-GP 131/2025; 02/11 Finados |
| 11 | `tjma-2026-dia-da-justica`<br>TJMA 2026: 08/12 (Dia da Justiça) não conta | publicação em 07/12/2026 (segunda-feira); 3 dias (CPC, dias úteis); TJMA; modo conservador | **11/12/2026 (sexta-feira)** | 08/12 TJMA: Resolução-GP 131/2025 |

## Dias ainda pendentes de conferência (12 a 14)

*Cada caso mostra a data com o dia ainda **não conferido** no ato do tribunal. Valide a contagem **supondo que o dia conta como sem expediente**; se ele é mesmo dia sem expediente naquele tribunal é o que falta conferir, não é dúvida de contagem. A coluna *Alternativa* mostra a outra data possível.*

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 12 | `tjma-2026-carnaval`<br>TJMA 2026: 16 e 17/02 (Carnaval) não contam e 18/02 (Cinzas, ponto facultativo) só alerta | publicação em 12/02/2026 (quinta-feira); 5 dias (CPC, dias úteis); TJMA; modo conservador | **23/02/2026 (segunda-feira)**<br>Alternativa: 24/02/2026 (terça-feira) | 4 sáb./dom.; 16/02 TJMA: Resolução-GP 131/2025; 17/02 TJMA: Resolução-GP 131/2025 |
| 13 | `tjma-2026-semana-santa`<br>TJMA 2026: 01/04 (ponto facultativo) só alerta; 02/04 e 03/04 não contam | publicação em 31/03/2026 (terça-feira); 3 dias (CPC, dias úteis); TJMA; modo conservador | **07/04/2026 (terça-feira)**<br>Alternativa: 08/04/2026 (quarta-feira) | 2 sáb./dom.; 02/04 TJMA: Resolução-GP 131/2025; 03/04 TJMA: Resolução-GP 131/2025 |
| 14 | `tjma-2026-corpus-christi`<br>TJMA 2026: 04/06 (Corpus Christi) não conta e 05/06 (ponto facultativo) só alerta | publicação em 02/06/2026 (terça-feira); 3 dias (CPC, dias úteis); TJMA; modo conservador | **08/06/2026 (segunda-feira)**<br>Alternativa: 09/06/2026 (terça-feira) | 2 sáb./dom.; 04/06 TJMA: Resolução-GP 131/2025 |

