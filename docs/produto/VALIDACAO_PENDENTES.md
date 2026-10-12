# RATIONE — CENÁRIOS PENDENTES DE VALIDAÇÃO

> **Gerado por `packages/prazozero/cenarios/oraculo.py`. Não edite à mão.** Lista os cenários ainda não validados, numerados de 1 a 21. Detalhe de cada um (fundamento e contagem completa): `REVISAO_CENARIOS.md`, pelo identificador.
> Total: **196** cenários · validados: **175** · pendentes: **21**

## Como responder

Basta dizer, por número, o que está certo e o que está errado. Exemplos: *"1 a 20 certos"*; *"7 errado: o certo é 14/03, porque …"*. Eu registro as respostas no gabarito e corrijo o motor onde você discordar. **Dica:** responda por grupo; a mesma regra se repete dentro do grupo.

Convenções: o **dia do começo não conta** e o do vencimento conta (CPC, art. 224); em dias úteis, sábados, domingos, feriados e dias sem expediente não contam (arts. 216 e 219). Pela intimação no Diário, a publicação é o primeiro dia útil depois da disponibilização, e a contagem começa no dia útil seguinte (art. 224, §§ 2º e 3º).

## Resumo

| Grupo | Números | Cenários |
|---|---|---|
| Calendário verificado (tribunais com ato lido) | 1 a 15 | 15 |
| Dias ainda pendentes de conferência | 16 a 21 | 6 |

## Calendário verificado (tribunais com ato lido) (1 a 15)

*O calendário do tribunal foi lido no ato oficial. O que se valida é a **regra de contagem** e se o dia citado realmente não conta.*

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 1 | `trf3-carnaval-conservador`<br>TRF3: Carnaval é feriado (Lei 5.010) e na Quarta de Cinzas o expediente começa às 14h: o começo do prazo passa para 19/02 | publicação em 13/02/2026 (sexta-feira); 3 dias (CPC, dias úteis); TRF3; modo conservador | **23/02/2026 (segunda-feira)** | 4 sáb./dom.; 16/02 Carnaval (segunda); 17/02 Carnaval (terça); 18/02 TRF3: Quarta-feira de Cinzas (expediente a partir das 14h): protrai o dia do começo |
| 2 | `trf1-2026-cinzas`<br>TRF1 2026: Carnaval não conta e a Quarta-feira de Cinzas (ponto facultativo até as 14h) protrai o começo do prazo | publicação em 13/02/2026 (sexta-feira); 3 dias (CPC, dias úteis); TRF1; modo conservador | **23/02/2026 (segunda-feira)** | 4 sáb./dom.; 16/02 Carnaval (segunda); 17/02 Carnaval (terça); 18/02 TRF1: Quarta-feira de Cinzas (ponto facultativo até as 14h): protrai o dia do começo |
| 3 | `trf2-2026-ponto-facultativo-20-abril`<br>TRF2 2026: 20/04 é ponto facultativo sem expediente (art. 1º) e 21/04 (Tiradentes) é feriado: nenhum conta | publicação em 16/04/2026 (quinta-feira); 3 dias (CPC, dias úteis); TRF2; modo conservador | **24/04/2026 (sexta-feira)** | 2 sáb./dom.; 20/04 TRF2: Portaria PRES/TRF2 843/2025, 30/2026 e 338/2026; 21/04 Tiradentes; 23/04 TRF2: Portaria PRES/TRF2 843/2025, 30/2026 e 338/2026 |
| 4 | `trf2-2026-sao-jorge`<br>TRF2 2026: 23/04 (Dia de São Jorge, Lei estadual RJ 5.198/2008) não conta | publicação em 22/04/2026 (quarta-feira); 2 dias (CPC, dias úteis); TRF2; modo conservador | **27/04/2026 (segunda-feira)** | 2 sáb./dom.; 23/04 TRF2: Portaria PRES/TRF2 843/2025, 30/2026 e 338/2026 |
| 5 | `trf2-2026-copa-29-junho`<br>TRF2 2026: 29/06 (jogo da Seleção, Portaria 338/2026) não conta | publicação em 26/06/2026 (sexta-feira); 2 dias (CPC, dias úteis); TRF2; modo conservador | **01/07/2026 (quarta-feira)** | 2 sáb./dom.; 29/06 TRF2: Portaria PRES/TRF2 843/2025, 30/2026 e 338/2026 |
| 6 | `trf2-2026-dia-servidor`<br>TRF2 2026: o Dia do Servidor foi transferido para 30/10 (Portaria 30/2026) e não conta | publicação em 27/10/2026 (terça-feira); 3 dias (CPC, dias úteis); TRF2; modo conservador | **03/11/2026 (terça-feira)** | 2 sáb./dom.; 30/10 TRF2: Portaria PRES/TRF2 843/2025, 30/2026 e 338/2026; 02/11 Finados |
| 7 | `trf3-2026-corpus-christi-ponto-facultativo`<br>TRF3 2026: 04/06 (Corpus Christi) e 05/06 (sem expediente, art. 2º) não contam | publicação em 02/06/2026 (terça-feira); 3 dias (CPC, dias úteis); TRF3; modo conservador | **09/06/2026 (terça-feira)** | 2 sáb./dom.; 04/06 TRF3: Portaria CATRF3R 48/2025, 53/2026 e 58/2026; 05/06 TRF3: Portaria CATRF3R 48/2025, 53/2026 e 58/2026 |
| 8 | `trf3-2026-revolucao-constitucionalista`<br>TRF3 2026: 09/07 (Revolução Constitucionalista, só na sede em São Paulo) não conta | publicação em 07/07/2026 (terça-feira); 3 dias (CPC, dias úteis); TRF3; modo conservador | **13/07/2026 (segunda-feira)** | 2 sáb./dom.; 09/07 TRF3: Portaria CATRF3R 48/2025, 53/2026 e 58/2026 |
| 9 | `trf3-2026-posse-2-marco`<br>TRF3 2026: 02/03 (posse dos dirigentes: prazos suspensos no Tribunal, Portaria 53/2026) não conta | publicação em 27/02/2026 (sexta-feira); 2 dias (CPC, dias úteis); TRF3; modo conservador | **04/03/2026 (quarta-feira)** | 2 sáb./dom.; 02/03 TRF3: Portaria CATRF3R 48/2025, 53/2026 e 58/2026 |
| 10 | `trf3-2026-dia-servidor`<br>TRF3 2026: o Dia do Servidor é 30/10 (originalmente 28/10) e não conta | publicação em 27/10/2026 (terça-feira); 3 dias (CPC, dias úteis); TRF3; modo conservador | **03/11/2026 (terça-feira)** | 2 sáb./dom.; 30/10 TRF3: Portaria CATRF3R 48/2025, 53/2026 e 58/2026; 02/11 Finados |
| 11 | `trf4-2026-ponto-facultativo-sem-ato`<br>TRF4 2026: 20/04 e 05/06 não são pontos facultativos do TRF4 (não constam do calendário): contam como dias úteis | publicação em 16/04/2026 (quinta-feira); 3 dias (CPC, dias úteis); TRF4; modo conservador | **22/04/2026 (quarta-feira)** | 2 sáb./dom.; 21/04 Tiradentes |
| 12 | `trf5-2026-carnaval-cinzas`<br>TRF5 2026: Carnaval e Quarta-feira de Cinzas (ponto facultativo sem expediente) não contam | publicação em 12/02/2026 (quinta-feira); 3 dias (CPC, dias úteis); TRF5; modo conservador | **20/02/2026 (sexta-feira)** | 2 sáb./dom.; 16/02 Carnaval (segunda); 17/02 Carnaval (terça); 18/02 TRF5: Ato 219/2026 |
| 13 | `trf5-2026-data-magna-pernambuco`<br>TRF5 2026: 06/03 (Data Magna de Pernambuco) não conta | publicação em 05/03/2026 (quinta-feira); 2 dias (CPC, dias úteis); TRF5; modo conservador | **10/03/2026 (terça-feira)** | 2 sáb./dom.; 06/03 TRF5: Ato 219/2026 |
| 14 | `trf6-2026-cinzas`<br>TRF6 2026: Carnaval não conta e a Quarta-feira de Cinzas (ponto facultativo até as 14h) protrai o começo do prazo | publicação em 13/02/2026 (sexta-feira); 3 dias (CPC, dias úteis); TRF6; modo conservador | **23/02/2026 (segunda-feira)** | 4 sáb./dom.; 16/02 Carnaval (segunda); 17/02 Carnaval (terça); 18/02 TRF6: Quarta-feira de Cinzas (ponto facultativo até as 14h): protrai o dia do começo |
| 15 | `trf6-2026-dois-de-novembro`<br>TRF6 2026: 02/11 (Finados, feriado forense, art. 62, IV, da Lei 5.010) não conta | publicação em 30/10/2026 (sexta-feira); 3 dias (CPC, dias úteis); TRF6; modo conservador | **05/11/2026 (quinta-feira)** | 2 sáb./dom.; 02/11 Finados |

## Dias ainda pendentes de conferência (16 a 21)

*Cada caso mostra a data com o dia ainda **não conferido** no ato do tribunal. Valide a contagem **supondo que o dia conta como sem expediente**; se ele é mesmo dia sem expediente naquele tribunal é o que falta conferir, não é dúvida de contagem. A coluna *Alternativa* mostra a outra data possível.*

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 16 | `trf1-2026-ponto-facultativo-20-abril`<br>TRF1 2026: 20/04 é ponto facultativo (alerta, o ato só o divulga); 21/04 (Tiradentes) não conta | publicação em 16/04/2026 (quinta-feira); 3 dias (CPC, dias úteis); TRF1; modo conservador | **22/04/2026 (quarta-feira)**<br>Alternativa: 23/04/2026 (quinta-feira) | 2 sáb./dom.; 21/04 Tiradentes |
| 17 | `trf1-2026-corpus-christi`<br>TRF1 2026: 04/06 (Corpus Christi) e 05/06 são pontos facultativos (alerta) | publicação em 02/06/2026 (terça-feira); 3 dias (CPC, dias úteis); TRF1; modo conservador | **05/06/2026 (sexta-feira)**<br>Alternativa: 09/06/2026 (terça-feira) | só o dia do começo |
| 18 | `trf4-2026-dia-servidor`<br>TRF4 2026: 30/10 (Dia do Servidor, Portaria 233/2026 não lida) só alerta | publicação em 27/10/2026 (terça-feira); 3 dias (CPC, dias úteis); TRF4; modo conservador | **30/10/2026 (sexta-feira)**<br>Alternativa: 03/11/2026 (terça-feira) | só o dia do começo |
| 19 | `trf5-2026-sao-joao`<br>TRF5 2026: 23/06 (ponto facultativo sem expediente) não conta; 24/06 (São João, feriado municipal do Recife) só alerta | publicação em 22/06/2026 (segunda-feira); 3 dias (CPC, dias úteis); TRF5; modo conservador | **26/06/2026 (sexta-feira)**<br>Alternativa: 29/06/2026 (segunda-feira) | 23/06 TRF5: Ato 219/2026 |
| 20 | `trf5-2026-dia-servidor`<br>TRF5 2026: Dia do Servidor (28/10, transferido para 30/10 pelo Ato 498/2026, não lido) só alerta | publicação em 26/10/2026 (segunda-feira); 3 dias (CPC, dias úteis); TRF5; modo conservador | **29/10/2026 (quinta-feira)**<br>Alternativa: 03/11/2026 (terça-feira) | só o dia do começo |
| 21 | `trf6-2026-corpus-christi`<br>TRF6 2026: 04/06 (Corpus Christi, listado como feriado) não conta e 05/06 é ponto facultativo (alerta) | publicação em 03/06/2026 (quarta-feira); 3 dias (CPC, dias úteis); TRF6; modo conservador | **09/06/2026 (terça-feira)**<br>Alternativa: 10/06/2026 (quarta-feira) | 2 sáb./dom.; 04/06 TRF6: ponto facultativo / feriado do ato |

