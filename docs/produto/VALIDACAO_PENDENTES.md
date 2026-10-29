# RATIONE — CENÁRIOS PENDENTES DE VALIDAÇÃO

> **Gerado por `packages/prazozero/cenarios/oraculo.py`. Não edite à mão.** Lista os cenários ainda não validados, numerados de 1 a 16. Detalhe de cada um (fundamento e contagem completa): `REVISAO_CENARIOS.md`, pelo identificador.
> Total: **335** cenários · validados: **319** · pendentes: **16**

## Como responder

Basta dizer, por número, o que está certo e o que está errado. Exemplos: *"1 a 20 certos"*; *"7 errado: o certo é 14/03, porque …"*. Eu registro as respostas no gabarito e corrijo o motor onde você discordar. **Dica:** responda por grupo; a mesma regra se repete dentro do grupo.

Convenções: o **dia do começo não conta** e o do vencimento conta (CPC, art. 224); em dias úteis, sábados, domingos, feriados e dias sem expediente não contam (arts. 216 e 219). Pela intimação no Diário, a publicação é o primeiro dia útil depois da disponibilização, e a contagem começa no dia útil seguinte (art. 224, §§ 2º e 3º).

## Resumo

| Grupo | Números | Cenários |
|---|---|---|
| Calendário verificado (tribunais com ato lido) | 1 a 16 | 16 |

## Calendário verificado (tribunais com ato lido) (1 a 16)

*O calendário do tribunal foi lido no ato oficial. O que se valida é a **regra de contagem** e se o dia citado realmente não conta.*

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 1 | `trt7-carnaval-cinzas`<br>TRT7 2026: Carnaval e Quarta-feira de Cinzas (16 a 18/02) não contam | publicação em 13/02/2026 (sexta-feira); 5 dias (CLT, dias úteis); TRT7; modo conservador | **25/02/2026 (quarta-feira)** | 4 sáb./dom.; 16/02 Carnaval; 17/02 Carnaval; 18/02 Quarta-feira de Cinzas (sem expediente) |
| 2 | `trt7-data-magna-ceara`<br>TRT7 2026: 25/03 (Data Magna do Ceará) não conta | publicação em 24/03/2026 (terça-feira); 2 dias (CLT, dias úteis); TRT7; modo conservador | **27/03/2026 (sexta-feira)** | 25/03 Data Magna do Ceará |
| 3 | `trt7-pontos-facultativos-agosto`<br>TRT7 2026: 10/08 (ponto facultativo, Portaria 64/2026) e 11/08 não contam | publicação em 07/08/2026 (sexta-feira); 3 dias (CLT, dias úteis); TRT7; modo conservador | **14/08/2026 (sexta-feira)** | 2 sáb./dom.; 10/08 Ponto facultativo (sem expediente, Portaria 64/2026); 11/08 Criação dos Cursos Jurídicos |
| 4 | `trt7-dia-do-servidor`<br>TRT7 2026: 28/10 conta e 30/10 (transferência do Dia do Servidor) não conta | publicação em 27/10/2026 (terça-feira); 3 dias (CLT, dias úteis); TRT7; modo conservador | **03/11/2026 (terça-feira)** | 2 sáb./dom.; 30/10 Dia do Servidor Público (transferido de 28/10); 02/11 Finados |
| 5 | `trt4-carnaval-cinzas`<br>TRT4 2026: Carnaval e Quarta-feira de Cinzas (ponto facultativo, RA 10/2026) não contam | publicação em 13/02/2026 (sexta-feira); 5 dias (CLT, dias úteis); TRT4; modo conservador | **25/02/2026 (quarta-feira)** | 4 sáb./dom.; 16/02 Carnaval; 17/02 Carnaval; 18/02 Quarta-feira de Cinzas (ponto facultativo: não há contagem de prazos) |
| 6 | `trt4-pontos-facultativos-abril`<br>TRT4 2026: 20/04 (ponto facultativo, RA 10/2026) e 21/04 (Tiradentes) não contam | publicação em 17/04/2026 (sexta-feira); 3 dias (CLT, dias úteis); TRT4; modo conservador | **24/04/2026 (sexta-feira)** | 2 sáb./dom.; 20/04 Ponto facultativo (não há contagem de prazos); 21/04 Tiradentes |
| 7 | `trt4-pontos-facultativos-agosto`<br>TRT4 2026: 10/08 (ponto facultativo, RA 10/2026) e 11/08 não contam | publicação em 07/08/2026 (sexta-feira); 3 dias (CLT, dias úteis); TRT4; modo conservador | **14/08/2026 (sexta-feira)** | 2 sáb./dom.; 10/08 Ponto facultativo (não há contagem de prazos); 11/08 Dia do Magistrado e do Advogado (Lei 5.010, art. 62, IV) |
| 8 | `trt4-dia-do-servidor`<br>TRT4 2026: 28/10 conta e 30/10 (transferência do Dia do Servidor) não conta | publicação em 27/10/2026 (terça-feira); 3 dias (CLT, dias úteis); TRT4; modo conservador | **03/11/2026 (terça-feira)** | 2 sáb./dom.; 30/10 Dia do Servidor Público (transferido de 28/10); 02/11 Finados |
| 9 | `trt6-carnaval-cinzas`<br>TRT6 2026: Carnaval e Quarta-feira de Cinzas (16 a 18/02) não contam | publicação em 13/02/2026 (sexta-feira); 5 dias (CLT, dias úteis); TRT6; modo conservador | **25/02/2026 (quarta-feira)** | 4 sáb./dom.; 16/02 Carnaval; 17/02 Carnaval; 18/02 Quarta-feira de Cinzas (feriado regimental) |
| 10 | `trt6-data-magna-pernambuco`<br>TRT6 2026: 06/03 (Data Magna de Pernambuco) não conta | publicação em 05/03/2026 (quinta-feira); 2 dias (CLT, dias úteis); TRT6; modo conservador | **10/03/2026 (terça-feira)** | 2 sáb./dom.; 06/03 Data Magna do Estado de Pernambuco |
| 11 | `trt6-corpus-christi-sao-joao`<br>TRT6 2026: Corpus Christi adiado para 23/06 e São João (24/06) não contam; 04/06 conta | publicação em 22/06/2026 (segunda-feira); 3 dias (CLT, dias úteis); TRT6; modo conservador | **29/06/2026 (segunda-feira)** | 2 sáb./dom.; 23/06 Corpus Christi (adiamento do feriado religioso); 24/06 São João (feriado estadual e regimental) |
| 12 | `trt6-dia-do-servidor`<br>TRT6 2026: 28/10 conta e 30/10 (adiamento do Dia do Servidor) não conta | publicação em 27/10/2026 (terça-feira); 3 dias (CLT, dias úteis); TRT6; modo conservador | **03/11/2026 (terça-feira)** | 2 sáb./dom.; 30/10 Dia do Servidor Público (adiamento do feriado); 02/11 Finados (Lei 5.010, art. 62, IV) |
| 13 | `trt15-carnaval-cinzas`<br>TRT15 2026: Carnaval e Quarta-feira de Cinzas (suspensão de expediente) não contam | publicação em 13/02/2026 (sexta-feira); 5 dias (CLT, dias úteis); TRT15; modo conservador | **25/02/2026 (quarta-feira)** | 4 sáb./dom.; 16/02 Carnaval; 17/02 Carnaval; 18/02 Quarta-feira de Cinzas (suspensão de expediente) |
| 14 | `trt15-suspensoes-abril`<br>TRT15 2026: 20/04 (suspensão de expediente) e 21/04 (Tiradentes) não contam | publicação em 17/04/2026 (sexta-feira); 3 dias (CLT, dias úteis); TRT15; modo conservador | **24/04/2026 (sexta-feira)** | 2 sáb./dom.; 20/04 Suspensão de expediente; 21/04 Tiradentes |
| 15 | `trt15-data-magna-sao-paulo`<br>TRT15 2026: 09/07 (Data Magna) e 10/07 (suspensão de expediente) não contam | publicação em 08/07/2026 (quarta-feira); 3 dias (CLT, dias úteis); TRT15; modo conservador | **15/07/2026 (quarta-feira)** | 2 sáb./dom.; 09/07 Data Magna do Estado de São Paulo; 10/07 Suspensão de expediente |
| 16 | `trt15-cursos-juridicos-agosto`<br>TRT15 2026: 10/08 (suspensão) não conta e 11/08 (transferido) conta | publicação em 07/08/2026 (sexta-feira); 3 dias (CLT, dias úteis); TRT15; modo conservador | **13/08/2026 (quinta-feira)** | 2 sáb./dom.; 10/08 Suspensão de expediente (feriado dos Cursos Jurídicos transferido de 11/08) |

