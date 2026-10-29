# RATIONE — CENÁRIOS PENDENTES DE VALIDAÇÃO

> **Gerado por `packages/prazozero/cenarios/oraculo.py`. Não edite à mão.** Lista os cenários ainda não validados, numerados de 1 a 4. Detalhe de cada um (fundamento e contagem completa): `REVISAO_CENARIOS.md`, pelo identificador.
> Total: **323** cenários · validados: **319** · pendentes: **4**

## Como responder

Basta dizer, por número, o que está certo e o que está errado. Exemplos: *"1 a 20 certos"*; *"7 errado: o certo é 14/03, porque …"*. Eu registro as respostas no gabarito e corrijo o motor onde você discordar. **Dica:** responda por grupo; a mesma regra se repete dentro do grupo.

Convenções: o **dia do começo não conta** e o do vencimento conta (CPC, art. 224); em dias úteis, sábados, domingos, feriados e dias sem expediente não contam (arts. 216 e 219). Pela intimação no Diário, a publicação é o primeiro dia útil depois da disponibilização, e a contagem começa no dia útil seguinte (art. 224, §§ 2º e 3º).

## Resumo

| Grupo | Números | Cenários |
|---|---|---|
| Calendário verificado (tribunais com ato lido) | 1 a 4 | 4 |

## Calendário verificado (tribunais com ato lido) (1 a 4)

*O calendário do tribunal foi lido no ato oficial. O que se valida é a **regra de contagem** e se o dia citado realmente não conta.*

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 1 | `trt7-carnaval-cinzas`<br>TRT7 2026: Carnaval e Quarta-feira de Cinzas (16 a 18/02) não contam | publicação em 13/02/2026 (sexta-feira); 5 dias (CLT, dias úteis); TRT7; modo conservador | **25/02/2026 (quarta-feira)** | 4 sáb./dom.; 16/02 Carnaval; 17/02 Carnaval; 18/02 Quarta-feira de Cinzas (sem expediente) |
| 2 | `trt7-data-magna-ceara`<br>TRT7 2026: 25/03 (Data Magna do Ceará) não conta | publicação em 24/03/2026 (terça-feira); 2 dias (CLT, dias úteis); TRT7; modo conservador | **27/03/2026 (sexta-feira)** | 25/03 Data Magna do Ceará |
| 3 | `trt7-pontos-facultativos-agosto`<br>TRT7 2026: 10/08 (ponto facultativo, Portaria 64/2026) e 11/08 não contam | publicação em 07/08/2026 (sexta-feira); 3 dias (CLT, dias úteis); TRT7; modo conservador | **14/08/2026 (sexta-feira)** | 2 sáb./dom.; 10/08 Ponto facultativo (sem expediente, Portaria 64/2026); 11/08 Criação dos Cursos Jurídicos |
| 4 | `trt7-dia-do-servidor`<br>TRT7 2026: 28/10 conta e 30/10 (transferência do Dia do Servidor) não conta | publicação em 27/10/2026 (terça-feira); 3 dias (CLT, dias úteis); TRT7; modo conservador | **03/11/2026 (terça-feira)** | 2 sáb./dom.; 30/10 Dia do Servidor Público (transferido de 28/10); 02/11 Finados |

