# RATIONE — CENÁRIOS PENDENTES DE VALIDAÇÃO

> **Gerado por `packages/prazozero/cenarios/oraculo.py`. Não edite à mão.** Lista os cenários ainda não validados, numerados de 1 a 13. Detalhe de cada um (fundamento e contagem completa): `REVISAO_CENARIOS.md`, pelo identificador.
> Total: **121** cenários · validados: **108** · pendentes: **13**

## Como responder

Basta dizer, por número, o que está certo e o que está errado. Exemplos: *"1 a 20 certos"*; *"7 errado: o certo é 14/03, porque …"*. Eu registro as respostas no gabarito e corrijo o motor onde você discordar. **Dica:** responda por grupo; a mesma regra se repete dentro do grupo.

Convenções: o **dia do começo não conta** e o do vencimento conta (CPC, art. 224); em dias úteis, sábados, domingos, feriados e dias sem expediente não contam (arts. 216 e 219). Pela intimação no Diário, a publicação é o primeiro dia útil depois da disponibilização, e a contagem começa no dia útil seguinte (art. 224, §§ 2º e 3º).

## Resumo

| Grupo | Números | Cenários |
|---|---|---|
| CLT | 1 a 3 | 3 |
| Intimação eletrônica | 4 a 8 | 5 |
| Juizados Especiais | 9 a 13 | 5 |

## CLT (1 a 3)

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 1 | `clt-recesso-775a`<br>CLT: o recesso de 20/12 a 20/01 também suspende os prazos | publicação em 15/12/2025 (segunda-feira); 8 dias (CLT, dias úteis); TST; modo conservador | **26/01/2026 (segunda-feira)** | 12 sáb./dom.; suspensão 22/12 a 20/01/2026 |
| 2 | `clt-ed-5d-feriado`<br>CLT: embargos de declaração em 5 dias úteis atravessando 7 de setembro | publicação em 03/09/2026 (quinta-feira); 5 dias (CLT, dias úteis); TST; modo conservador | **11/09/2026 (sexta-feira)** | 2 sáb./dom.; 07/09 Independência |
| 3 | `clt-recesso-borda-20-jan`<br>CLT: publicação em 16/01/2026; 19 e 20/01 ainda são recesso e a contagem retoma em 21/01 | publicação em 16/01/2026 (sexta-feira); 3 dias (CLT, dias úteis); TST; modo conservador | **23/01/2026 (sexta-feira)** | 2 sáb./dom.; suspensão 19/01 a 20/01/2026 |

## Intimação eletrônica (4 a 8)

*Intimação eletrônica (CPC, art. 231, V; Lei 11.419, art. 5º). O caso `portal-sabado` tem dúvida registrada em `VERIFICACAO_FONTES.md`, seção 7, item 1.*

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 4 | `portal-segunda`<br>Intimação eletrônica: consulta na segunda; dia do começo na terça; contagem a partir de quarta | consulta à intimação eletrônica em 09/03/2026 (segunda-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador | **17/03/2026 (terça-feira)** | 2 sáb./dom. |
| 5 | `portal-sexta`<br>Intimação eletrônica: consulta na sexta; dia do começo na segunda | consulta à intimação eletrônica em 13/03/2026 (sexta-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador | **23/03/2026 (segunda-feira)** | 2 sáb./dom. |
| 6 | `portal-sabado`<br>Intimação eletrônica: consulta no sábado (leitura literal do art. 231, V; ver nota de revisão) | consulta à intimação eletrônica em 14/03/2026 (sábado); 5 dias (CPC, dias úteis); TJSP; modo conservador | **23/03/2026 (segunda-feira)** | 2 sáb./dom. |
| 7 | `portal-feriado`<br>Intimação eletrônica: consulta na véspera de Tiradentes; dia do começo é o dia útil seguinte | consulta à intimação eletrônica em 20/04/2026 (segunda-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador | **29/04/2026 (quarta-feira)** | 2 sáb./dom. |
| 8 | `portal-recesso`<br>Intimação eletrônica consultada em 19/12/2025: o dia do começo é 21/01/2026, depois do recesso | consulta à intimação eletrônica em 19/12/2025 (sexta-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador | **28/01/2026 (quarta-feira)** | 2 sáb./dom. |

## Juizados Especiais (9 a 13)

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 9 | `jef-5d-embargos`<br>JEF: embargos de declaração em 5 dias úteis (Lei 9.099, art. 49) | publicação em 10/03/2026 (terça-feira); 5 dias (JEF, dias úteis); TJSP; modo conservador | **17/03/2026 (terça-feira)** | 2 sáb./dom. |
| 10 | `jef-dobro-ignorado`<br>JEF: o prazo em dobro não é aplicado a ente público (Lei 10.259, art. 9º; Lei 12.153, art. 7º) | publicação em 10/03/2026 (terça-feira); 10 dias (JEF, dias úteis); TJSP; modo conservador; em dobro | **24/03/2026 (terça-feira)** | 4 sáb./dom. |
| 11 | `jef-recesso`<br>JEF: a suspensão de 20/12 a 20/01 vale nos Juizados (Res. CNJ 244/2016, art. 3º) | publicação em 15/12/2025 (segunda-feira); 10 dias (JEF, dias úteis); TJSP; modo conservador | **28/01/2026 (quarta-feira)** | 12 sáb./dom.; suspensão 22/12 a 20/01/2026 |
| 12 | `jef-recesso-desligado`<br>JEF: suspensão desligada pelo usuário conta o recesso (resultado de quem opta por não suspender) | publicação em 15/12/2025 (segunda-feira); 10 dias (JEF, dias úteis); TJSP; modo conservador; suspensão desligada | **30/12/2025 (terça-feira)** | 4 sáb./dom.; 25/12 Natal |
| 13 | `jef-dje-sexta`<br>JEF: disponibilização na sexta 13/03, publicação na segunda, recurso inominado de 10 dias úteis | disponibilização no DJe em 13/03/2026 (sexta-feira); 10 dias (JEF, dias úteis); TJSP; modo conservador | **30/03/2026 (segunda-feira)** | 4 sáb./dom. |

