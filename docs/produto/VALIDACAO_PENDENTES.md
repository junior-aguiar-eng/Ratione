# RATIONE — CENÁRIOS PENDENTES DE VALIDAÇÃO

> **Gerado por `packages/prazozero/cenarios/oraculo.py`. Não edite à mão.** Lista os cenários ainda não validados, numerados de 1 a 4. Detalhe de cada um (fundamento e contagem completa): `REVISAO_CENARIOS.md`, pelo identificador.
> Total: **314** cenários · validados: **310** · pendentes: **4**

## Como responder

Basta dizer, por número, o que está certo e o que está errado. Exemplos: *"1 a 20 certos"*; *"7 errado: o certo é 14/03, porque …"*. Eu registro as respostas no gabarito e corrijo o motor onde você discordar. **Dica:** responda por grupo; a mesma regra se repete dentro do grupo.

Convenções: o **dia do começo não conta** e o do vencimento conta (CPC, art. 224); em dias úteis, sábados, domingos, feriados e dias sem expediente não contam (arts. 216 e 219). Pela intimação no Diário, a publicação é o primeiro dia útil depois da disponibilização, e a contagem começa no dia útil seguinte (art. 224, §§ 2º e 3º).

## Resumo

| Grupo | Números | Cenários |
|---|---|---|
| Calendário verificado (tribunais com ato lido) | 1 a 3 | 3 |
| Prazo em dobro | 4 a 4 | 1 |

## Calendário verificado (tribunais com ato lido) (1 a 3)

*O calendário do tribunal foi lido no ato oficial. O que se valida é a **regra de contagem** e se o dia citado realmente não conta.*

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 1 | `stj-corpus-christi-2026`<br>STJ: Corpus Christi e 05/06 sem expediente em 2026 | publicação em 02/06/2026 (terça-feira); 5 dias (CPC, dias úteis); STJ; modo conservador | **09/06/2026 (terça-feira)**<br>Alternativa: 11/06/2026 (quinta-feira) | 2 sáb./dom. |
| 2 | `stf-corpus-christi-2026`<br>STF: Corpus Christi e 05/06 sem expediente em 2026 | publicação em 02/06/2026 (terça-feira); 5 dias (CPC, dias úteis); STF; modo conservador | **09/06/2026 (terça-feira)**<br>Alternativa: 11/06/2026 (quinta-feira) | 2 sáb./dom. |
| 3 | `stj-ferias-julho-8d`<br>STJ: após as férias de julho, 10/08 (PF) e 11/08 não contam | publicação em 30/06/2026 (terça-feira); 8 dias (CPC, dias úteis); STJ; modo conservador | **12/08/2026 (quarta-feira)**<br>Alternativa: 13/08/2026 (quinta-feira) | 12 sáb./dom.; suspensão 02/07 a 31/07/2026; 11/08 11 de agosto (Lei 5.010, art. 62, IV) |

## Prazo em dobro (4 a 4)

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 4 | `stj-dobro-ferias-julho`<br>STJ: prazo em dobro (30 úteis) interrompido pelas férias de julho e por 10 e 11/08 | publicação em 26/06/2026 (sexta-feira); 15 dias (CPC, dias úteis); STJ; modo conservador; em dobro | **10/09/2026 (quinta-feira)**<br>Alternativa: 11/09/2026 (sexta-feira) | 22 sáb./dom.; suspensão 02/07 a 31/07/2026; 11/08 11 de agosto (Lei 5.010, art. 62, IV); 07/09 Independência |

