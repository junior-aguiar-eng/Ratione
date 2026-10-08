# RATIONE — CENÁRIOS PENDENTES DE VALIDAÇÃO

> **Gerado por `packages/prazozero/cenarios/oraculo.py`. Não edite à mão.** Lista os cenários ainda não validados, numerados de 1 a 113. Detalhe de cada um (fundamento e contagem completa): `REVISAO_CENARIOS.md`, pelo identificador.
> Total: **121** cenários · validados: **8** · pendentes: **113**

## Como responder

Basta dizer, por número, o que está certo e o que está errado. Exemplos: *"1 a 20 certos"*; *"7 errado: o certo é 14/03, porque …"*. Eu registro as respostas no gabarito e corrijo o motor onde você discordar. **Dica:** responda por grupo; a mesma regra se repete dentro do grupo.

Convenções: o **dia do começo não conta** e o do vencimento conta (CPC, art. 224); em dias úteis, sábados, domingos, feriados e dias sem expediente não contam (arts. 216 e 219). Pela intimação no Diário, a publicação é o primeiro dia útil depois da disponibilização, e a contagem começa no dia útil seguinte (art. 224, §§ 2º e 3º).

## Resumo

| Grupo | Números | Cenários |
|---|---|---|
| Disponibilização no DJe | 1 a 4 | 4 |
| Feriados nacionais | 5 a 14 | 10 |
| Contagem básica | 15 a 16 | 2 |
| Recesso e suspensão de prazos | 17 a 23 | 7 |
| Prazo em dobro | 24 a 29 | 6 |
| Ano bissexto | 30 a 31 | 2 |
| CPP (prazos criminais) | 32 a 45 | 14 |
| Tribunais superiores | 46 a 46 | 1 |
| Dias ainda pendentes de conferência | 47 a 68 | 22 |
| Calendário verificado (tribunais com ato lido) | 69 a 100 | 32 |
| CLT | 101 a 103 | 3 |
| Intimação eletrônica | 104 a 108 | 5 |
| Juizados Especiais | 109 a 113 | 5 |

## Disponibilização no DJe (1 a 4)

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 1 | `dje-sexta`<br>Disponibilização na sexta: publicação na segunda, contagem na terça | disponibilização no DJe em 13/03/2026 (sexta-feira); 15 dias (CPC, dias úteis); STJ; modo conservador | **09/04/2026 (quinta-feira)** | 6 sáb./dom.; 01/04 Semana Santa (quarta); 02/04 Semana Santa (quinta); 03/04 Sexta-feira Santa |
| 2 | `dje-quinta`<br>Disponibilização na quinta: publicação na sexta | disponibilização no DJe em 12/03/2026 (quinta-feira); 15 dias (CPC, dias úteis); STJ; modo conservador | **08/04/2026 (quarta-feira)** | 8 sáb./dom.; 01/04 Semana Santa (quarta); 02/04 Semana Santa (quinta); 03/04 Sexta-feira Santa |
| 3 | `dje-sabado`<br>Disponibilização no sábado: publicação na segunda | disponibilização no DJe em 14/03/2026 (sábado); 5 dias (CPC, dias úteis); TJSP; modo conservador | **23/03/2026 (segunda-feira)** | 2 sáb./dom. |
| 4 | `publicacao-sabado`<br>Publicação em sábado: contagem inicia na segunda | publicação em 14/03/2026 (sábado); 5 dias (CPC, dias úteis); TJSP; modo conservador | **20/03/2026 (sexta-feira)** | 1 sáb./dom. |

## Feriados nacionais (5 a 14)

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 5 | `dje-vespera-feriado`<br>Disponibilização na segunda; terça é Tiradentes: publicação na quarta | disponibilização no DJe em 20/04/2026 (segunda-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador | **29/04/2026 (quarta-feira)** | 2 sáb./dom. |
| 6 | `dje-sexta-antes-feriado`<br>Disponibilização na sexta; segunda útil; termo inicial na terça é Tiradentes | disponibilização no DJe em 17/04/2026 (sexta-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador | **29/04/2026 (quarta-feira)** | 2 sáb./dom. |
| 7 | `vence-antes-feriado`<br>Prazo que termina antes do feriado não é afetado | publicação em 09/04/2026 (quinta-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador | **16/04/2026 (quinta-feira)** | 2 sáb./dom. |
| 8 | `atravessa-trabalho`<br>Prazo atravessa 1º de maio (sexta) | publicação em 29/04/2026 (quarta-feira); 3 dias (CPC, dias úteis); TJSP; modo conservador | **05/05/2026 (terça-feira)** | 2 sáb./dom.; 01/05 Dia do Trabalho |
| 9 | `atravessa-independencia`<br>Prazo atravessa 7 de setembro (segunda) | publicação em 03/09/2026 (quinta-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador | **11/09/2026 (sexta-feira)** | 2 sáb./dom.; 07/09 Independência |
| 10 | `atravessa-aparecida`<br>Disponibilização 30/09/2026, 15 dias; 12/10 (segunda) não conta | disponibilização no DJe em 30/09/2026 (quarta-feira); 15 dias (CPC, dias úteis); STJ; modo conservador | **23/10/2026 (sexta-feira)** | 6 sáb./dom.; 12/10 Nossa Senhora Aparecida |
| 11 | `finados`<br>Prazo atravessa Finados (segunda 02/11/2026) | publicação em 30/10/2026 (sexta-feira); 2 dias (CPC, dias úteis); TJSP; modo conservador | **04/11/2026 (quarta-feira)** | 2 sáb./dom.; 02/11 Finados |
| 12 | `consciencia-negra-2026`<br>Consciência Negra (sexta 20/11/2026) é feriado nacional desde 2024 | publicação em 18/11/2026 (quarta-feira); 3 dias (CPC, dias úteis); TJSP; modo conservador | **24/11/2026 (terça-feira)** | 2 sáb./dom.; 20/11 Consciência Negra |
| 13 | `consciencia-negra-2023`<br>Em 2023 o 20/11 ainda não era nacional: depende de lei local (pendente) | publicação em 17/11/2023 (sexta-feira); 2 dias (CPC, dias úteis); TJSP; modo conservador | **21/11/2023 (terça-feira)**<br>Alternativa: 22/11/2023 (quarta-feira) | 2 sáb./dom. |
| 14 | `tjsp-8-dezembro`<br>TJSP 2026: 7/12 (suspensão do expediente) e 8/12 (Dia da Justiça) não contam | publicação em 04/12/2026 (sexta-feira); 3 dias (CPC, dias úteis); TJSP; modo conservador | **11/12/2026 (sexta-feira)** | 2 sáb./dom.; 07/12 TJSP: 12-07; 08/12 TJSP: 12-08 |

## Contagem básica (15 a 16)

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 15 | `um-dia-sexta`<br>Prazo de 1 dia com publicação na sexta vence na segunda | publicação em 13/03/2026 (sexta-feira); 1 dias (CPC, dias úteis); TJSP; modo conservador | **16/03/2026 (segunda-feira)** | 2 sáb./dom. |
| 16 | `um-dia-vespera-feriado`<br>Prazo de 1 dia útil com publicação na quinta 30/04: sexta 1º/05 é feriado e vence na segunda 04/05 | publicação em 30/04/2026 (quinta-feira); 1 dias (CPC, dias úteis); TJSP; modo conservador | **04/05/2026 (segunda-feira)** | 2 sáb./dom.; 01/05 Dia do Trabalho |

## Recesso e suspensão de prazos (17 a 23)

*Suspensão de 20/12 a 20/01 (CPC, art. 220): nenhum dia conta, nem fim de semana.*

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 17 | `recesso-5d-sexta`<br>Publicação na sexta 19/12/2025: contagem só retoma em 21/01/2026 | publicação em 19/12/2025 (sexta-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador | **27/01/2026 (terça-feira)** | 12 sáb./dom.; suspensão 22/12 a 20/01/2026 |
| 18 | `recesso-virada-ano`<br>Publicação em 18/12/2026: virada de ano, retomada em 21/01/2027 | publicação em 18/12/2026 (sexta-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador | **27/01/2027 (quarta-feira)** | 12 sáb./dom.; suspensão 21/12 a 20/01/2027 |
| 19 | `recesso-dje-dentro`<br>Disponibilização dentro do recesso: publicação em 21/01/2026 | disponibilização no DJe em 22/12/2025 (segunda-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador | **28/01/2026 (quarta-feira)** | 2 sáb./dom. |
| 20 | `recesso-borda-20-jan`<br>Publicação em 16/01/2026: 19 e 20/01 ainda são recesso | publicação em 16/01/2026 (sexta-feira); 3 dias (CPC, dias úteis); TJSP; modo conservador | **23/01/2026 (sexta-feira)** | 2 sáb./dom.; suspensão 19/01 a 20/01/2026 |
| 21 | `recesso-1-dia`<br>1 dia útil com publicação em 19/12/2025 vence em 21/01/2026 | publicação em 19/12/2025 (sexta-feira); 1 dias (CPC, dias úteis); TJSP; modo conservador | **21/01/2026 (quarta-feira)** | 10 sáb./dom.; suspensão 22/12 a 20/01/2026 |
| 22 | `recesso-desligado`<br>Recesso desligado explicitamente (suspensaoRecesso=false) | publicação em 15/12/2025 (segunda-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador; suspensão desligada | **22/12/2025 (segunda-feira)** | 2 sáb./dom. |
| 23 | `recesso-pre-dezembro`<br>15 dias úteis a partir de 01/12/2025: o 15º dia cai após o recesso | publicação em 01/12/2025 (segunda-feira); 15 dias (CPC, dias úteis); TJSP; modo conservador | **21/01/2026 (quarta-feira)** | 14 sáb./dom.; suspensão 22/12 a 20/01/2026 |

## Prazo em dobro (24 a 29)

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 24 | `dobro-30d`<br>Fazenda Pública: 15 dias em dobro (30 úteis) | publicação em 02/03/2026 (segunda-feira); 15 dias (CPC, dias úteis); TJPR; modo conservador; em dobro | **13/04/2026 (segunda-feira)**<br>Alternativa: 14/04/2026 (terça-feira) | 12 sáb./dom. |
| 25 | `dobro-recesso`<br>Prazo em dobro atravessando o recesso | publicação em 10/12/2025 (quarta-feira); 10 dias (CPC, dias úteis); TJSP; modo conservador; em dobro | **06/02/2026 (sexta-feira)** | 16 sáb./dom.; suspensão 22/12 a 20/01/2026 |
| 26 | `dobro-mp-intimacao-pessoal`<br>Ministério Público: 15 dias em dobro (30 úteis) a partir da intimação pessoal por carga | ciência pessoal (carga ou audiência) em 10/03/2026 (terça-feira); 15 dias (CPC, dias úteis); TJSP; modo conservador; em dobro | **27/04/2026 (segunda-feira)** | 14 sáb./dom.; 02/04 TJSP: 04-02; 03/04 TJSP: 04-03; 20/04 TJSP: 04-20; 21/04 Tiradentes |
| 27 | `litisconsorcio-sem-dobro`<br>Litisconsortes com advogados distintos: o art. 229 gera aviso e não duplica o prazo | publicação em 10/03/2026 (terça-feira); 15 dias (CPC, dias úteis); TJSP; modo conservador; litisconsortes (só aviso) | **31/03/2026 (terça-feira)** | 6 sáb./dom. |
| 28 | `stj-dobro-ferias-julho`<br>STJ: prazo em dobro (30 úteis) interrompido pelas férias de julho e por 10 e 11/08 | publicação em 26/06/2026 (sexta-feira); 15 dias (CPC, dias úteis); STJ; modo conservador; em dobro | **11/09/2026 (sexta-feira)** | 22 sáb./dom.; suspensão 02/07 a 31/07/2026; 10/08 Ponto facultativo (ato do tribunal); 11/08 11 de agosto (Lei 5.010, art. 62, IV); 07/09 Independência |
| 29 | `dobro-embargos-feriado`<br>Fazenda: embargos de declaração em dobro (10 úteis) atravessando Tiradentes | ciência pessoal (carga ou audiência) em 14/04/2026 (terça-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador; em dobro | **30/04/2026 (quinta-feira)** | 4 sáb./dom.; 20/04 TJSP: 04-20; 21/04 Tiradentes |

## Ano bissexto (30 a 31)

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 30 | `bissexto-2024`<br>Fevereiro de 2024 (bissexto): 29/02 é dia útil | publicação em 27/02/2024 (terça-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador | **05/03/2024 (terça-feira)** | 2 sáb./dom. |
| 31 | `bissexto-2028`<br>Fevereiro de 2028 (bissexto), Carnaval em 28 e 29/02 | publicação em 25/02/2028 (sexta-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador | **03/03/2028 (sexta-feira)**<br>Alternativa: 08/03/2028 (quarta-feira) | 2 sáb./dom. |

## CPP (prazos criminais) (32 a 45)

*Prazos criminais: dias corridos (CPP, art. 798) e suspensão de 20/12 a 20/01 (art. 798-A), salvo réu preso, Maria da Penha ou medida urgente.*

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 32 | `cpp-5d-sabado`<br>CPP: 5 dias corridos terminam no sábado, prorrogado para segunda | publicação em 09/03/2026 (segunda-feira); 5 dias (CPP, dias corridos); TJSP; modo conservador | **16/03/2026 (segunda-feira)** (prorrogado) | 14/03 vencimento em dia não útil (fim de semana), prorrogado (CPP, art. 798, § 3º) |
| 33 | `cpp-5d-util`<br>CPP: 5 dias corridos terminam em dia útil, sem prorrogação | publicação em 04/03/2026 (quarta-feira); 5 dias (CPP, dias corridos); TJSP; modo conservador | **09/03/2026 (segunda-feira)** | só o dia do começo |
| 34 | `cpp-feriado`<br>CPP: vencimento em Tiradentes, prorrogado para o dia útil seguinte | publicação em 16/04/2026 (quinta-feira); 5 dias (CPP, dias corridos); TJSP; modo conservador | **22/04/2026 (quarta-feira)** (prorrogado) | 21/04 vencimento em dia não útil (Tiradentes), prorrogado (CPP, art. 798, § 3º) |
| 35 | `cpp-10d`<br>CPP: 10 dias corridos atravessando fins de semana | publicação em 02/03/2026 (segunda-feira); 10 dias (CPP, dias corridos); TJSP; modo conservador | **12/03/2026 (quinta-feira)** | só o dia do começo |
| 36 | `cpp-trf3-reu-preso`<br>CPP, réu preso no TRF3: sem suspensão (art. 798-A, I); vencimento em 20/12 cai em feriado forense (Lei 5.010, art. 62, I) e vai a 07/01 | publicação em 15/12/2026 (terça-feira); 5 dias (CPP, dias corridos); TRF3; modo conservador; réu preso/exceção do art. 798-A | **07/01/2027 (quinta-feira)** (prorrogado) | 20/12 vencimento em dia não útil (fim de semana), prorrogado (CPP, art. 798, § 3º) |
| 37 | `cpp-tjsp-reu-preso`<br>CPP, réu preso no TJSP: sem suspensão; vence no domingo 20/12 e, com 21 a 31/12 em recesso sem expediente, vai a 04/01/2027 (o recesso de 1º a 6/01/2027 ainda não está carregado: sem selo) | publicação em 15/12/2026 (terça-feira); 5 dias (CPP, dias corridos); TJSP; modo conservador; réu preso/exceção do art. 798-A | **04/01/2027 (segunda-feira)** (prorrogado) | 20/12 vencimento em dia não útil (fim de semana), prorrogado (CPP, art. 798, § 3º) |
| 38 | `cpp-recesso-suspende`<br>CPP: prazo de 5 dias que atravessa 20/12 fica suspenso até 20/01 e retoma em 21/01 | publicação em 15/12/2026 (terça-feira); 5 dias (CPP, dias corridos); TJSP; modo conservador | **21/01/2027 (quinta-feira)** | suspensão 20/12 a 20/01/2027 |
| 39 | `cpp-recesso-10d`<br>CPP: publicação em 19/12/2025, 10 dias corridos contados só depois de 20/01 | publicação em 19/12/2025 (sexta-feira); 10 dias (CPP, dias corridos); TJSP; modo conservador | **30/01/2026 (sexta-feira)** | suspensão 20/12 a 20/01/2026 |
| 40 | `cpp-recesso-trf3`<br>CPP no TRF3: suspensão até 20/01; a retomada em 21/01 é dia útil, sem prorrogação | publicação em 15/12/2026 (terça-feira); 5 dias (CPP, dias corridos); TRF3; modo conservador | **21/01/2027 (quinta-feira)** | suspensão 20/12 a 20/01/2027 |
| 41 | `cpp-stj-ferias-julho`<br>CPP no STJ: as férias de julho não suspendem prazo criminal; vencimento em domingo vai à segunda 06/07 | publicação em 30/06/2026 (terça-feira); 5 dias (CPP, dias corridos); STJ; modo conservador | **06/07/2026 (segunda-feira)** (prorrogado) | 05/07 vencimento em dia não útil (fim de semana), prorrogado (CPP, art. 798, § 3º) |
| 42 | `cpp-stf-ferias-janeiro`<br>CPP no STF: depois de 20/01 o prazo criminal corre mesmo nas férias de janeiro | publicação em 22/01/2026 (quinta-feira); 5 dias (CPP, dias corridos); STF; modo conservador | **27/01/2026 (terça-feira)** | só o dia do começo |
| 43 | `cpp-stj-recesso-798a`<br>CPP no STJ: suspenso até 20/01 (não até 31/01); retoma em 21/01 e o vencimento de domingo vai à segunda | publicação em 19/12/2025 (sexta-feira); 5 dias (CPP, dias corridos); STJ; modo conservador | **26/01/2026 (segunda-feira)** (prorrogado) | suspensão 20/12 a 20/01/2026; 25/01 vencimento em dia não útil (fim de semana), prorrogado (CPP, art. 798, § 3º) |
| 44 | `cpp-8d-sabado`<br>CPP: 8 dias corridos vencem no sábado 14/03 e vão para a segunda 16/03 | publicação em 06/03/2026 (sexta-feira); 8 dias (CPP, dias corridos); TJSP; modo conservador | **16/03/2026 (segunda-feira)** (prorrogado) | 14/03 vencimento em dia não útil (fim de semana), prorrogado (CPP, art. 798, § 3º) |
| 45 | `cpp-vence-aparecida`<br>CPP: 3 dias corridos vencem em 12/10 (segunda, feriado) e vão para 13/10 | publicação em 09/10/2026 (sexta-feira); 3 dias (CPP, dias corridos); TJSP; modo conservador | **13/10/2026 (terça-feira)** (prorrogado) | 12/10 vencimento em dia não útil (Nossa Senhora Aparecida), prorrogado (CPP, art. 798, § 3º) |

## Tribunais superiores (46 a 46)

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 46 | `stf-sem-uf`<br>STF (sem UF): calendário 2026 verificado | disponibilização no DJe em 03/09/2026 (quinta-feira); 15 dias (CPC, dias úteis); STF; modo conservador | **28/09/2026 (segunda-feira)** | 8 sáb./dom.; 07/09 Independência |

## Dias ainda pendentes de conferência (47 a 68)

*Cada caso mostra a data com o dia ainda **não conferido** no ato do tribunal. Valide a contagem **supondo que o dia conta como sem expediente**; se ele é mesmo dia sem expediente naquele tribunal é o que falta conferir, não é dúvida de contagem. A coluna *Alternativa* mostra a outra data possível.*

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 47 | `carnaval-2026-conservador`<br>Carnaval 2026 ignorado no modo conservador (data mais cedo) | publicação em 13/02/2026 (sexta-feira); 5 dias (CPC, dias úteis); TJPR; modo conservador | **20/02/2026 (sexta-feira)**<br>Alternativa: 25/02/2026 (quarta-feira) | 2 sáb./dom. |
| 48 | `carnaval-2026-completo`<br>Carnaval 2026 considerado; Quarta de Cinzas protrai o dia do começo | publicação em 13/02/2026 (sexta-feira); 5 dias (CPC, dias úteis); TJPR; modo completo | **25/02/2026 (quarta-feira)** | 4 sáb./dom.; 16/02 Carnaval (segunda); 17/02 Carnaval (terça); 18/02 Quarta-feira de Cinzas (expediente parcial): protrai o dia do começo |
| 49 | `cinzas-meio-conservador`<br>Quarta de Cinzas no meio do prazo (conservador) | publicação em 12/02/2026 (quinta-feira); 5 dias (CPC, dias úteis); TJPR; modo conservador | **19/02/2026 (quinta-feira)**<br>Alternativa: 23/02/2026 (segunda-feira) | 2 sáb./dom. |
| 50 | `cinzas-meio-completo`<br>Quarta de Cinzas no meio do prazo conta normalmente | publicação em 12/02/2026 (quinta-feira); 5 dias (CPC, dias úteis); TJPR; modo completo | **23/02/2026 (segunda-feira)** | 4 sáb./dom.; 16/02 Carnaval (segunda); 17/02 Carnaval (terça) |
| 51 | `cinzas-vencimento-conservador`<br>Prazo de 4 dias; sem Carnaval vence na segunda 16/02 | publicação em 10/02/2026 (terça-feira); 4 dias (CPC, dias úteis); TJPR; modo conservador | **16/02/2026 (segunda-feira)**<br>Alternativa: 19/02/2026 (quinta-feira) | 2 sáb./dom. |
| 52 | `cinzas-vencimento-completo`<br>Prazo de 4 dias; vencimento cairia na Quarta de Cinzas e é protraído | publicação em 10/02/2026 (terça-feira); 4 dias (CPC, dias úteis); TJPR; modo completo | **19/02/2026 (quinta-feira)** (prorrogado) | 2 sáb./dom.; 16/02 Carnaval (segunda); 17/02 Carnaval (terça); 18/02 Quarta-feira de Cinzas (expediente parcial): protrai o vencimento (CPC, art. 224, § 1º) |
| 53 | `carnaval-2028-completo`<br>Carnaval 2028 em 28 e 29/02 (bissexto), Cinzas em 01/03 | publicação em 25/02/2028 (sexta-feira); 5 dias (CPC, dias úteis); TJSP; modo completo | **08/03/2028 (quarta-feira)** | 4 sáb./dom.; 28/02 Carnaval (segunda); 29/02 Carnaval (terça); 01/03 Quarta-feira de Cinzas (expediente parcial): protrai o dia do começo |
| 54 | `corpus-christi-conservador`<br>Corpus Christi 2026 (04/06) ignorado no modo conservador | publicação em 02/06/2026 (terça-feira); 5 dias (CPC, dias úteis); TJPR; modo conservador | **09/06/2026 (terça-feira)**<br>Alternativa: 10/06/2026 (quarta-feira) | 2 sáb./dom. |
| 55 | `corpus-christi-completo`<br>Corpus Christi 2026 considerado | publicação em 02/06/2026 (terça-feira); 5 dias (CPC, dias úteis); TJPR; modo completo | **10/06/2026 (quarta-feira)** | 2 sáb./dom.; 04/06 Corpus Christi |
| 56 | `sexta-santa-conservador`<br>Sexta-feira Santa 2026 (03/04) ignorada no modo conservador | publicação em 01/04/2026 (quarta-feira); 3 dias (CPC, dias úteis); TJPR; modo conservador | **06/04/2026 (segunda-feira)**<br>Alternativa: 07/04/2026 (terça-feira) | 2 sáb./dom. |
| 57 | `sexta-santa-completo`<br>Sexta-feira Santa 2026 considerada (TJSP) | publicação em 01/04/2026 (quarta-feira); 3 dias (CPC, dias úteis); TJPR; modo completo | **07/04/2026 (terça-feira)** | 2 sáb./dom.; 03/04 Sexta-feira Santa |
| 58 | `onze-agosto-tjsp-completo`<br>11 de agosto não é feriado forense no TJSP | publicação em 07/08/2026 (sexta-feira); 3 dias (CPC, dias úteis); TJSP; modo completo | **12/08/2026 (quarta-feira)** | 2 sáb./dom. |
| 59 | `sp-9-julho-conservador`<br>TJSP 2027 (sem provimento publicado): 9 de julho ignorado no modo conservador | publicação em 08/07/2027 (quinta-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador | **15/07/2027 (quinta-feira)**<br>Alternativa: 16/07/2027 (sexta-feira) | 2 sáb./dom. |
| 60 | `sp-9-julho-completo`<br>TJSP 2027 (sem provimento publicado): 9 de julho considerado no modo completo | publicação em 08/07/2027 (quinta-feira); 5 dias (CPC, dias úteis); TJSP; modo completo | **16/07/2027 (sexta-feira)** | 2 sáb./dom.; 09/07 Revolução Constitucionalista de 1932 (estadual, pendente) |
| 61 | `consciencia-negra-2023-completo`<br>20/11/2023 considerado (lei local, pendente) | publicação em 17/11/2023 (sexta-feira); 2 dias (CPC, dias úteis); TJSP; modo completo | **22/11/2023 (quarta-feira)** | 2 sáb./dom.; 20/11 Consciência Negra |
| 62 | `dobro-sexta-santa-completo`<br>Prazo em dobro com Sexta-feira Santa considerada | publicação em 02/03/2026 (segunda-feira); 15 dias (CPC, dias úteis); TJPR; modo completo; em dobro | **14/04/2026 (terça-feira)** | 12 sáb./dom.; 03/04 Sexta-feira Santa |
| 63 | `cpp-sexta-santa-completo`<br>CPP: vencimento na Sexta-feira Santa (completo) é prorrogado | publicação em 30/03/2026 (segunda-feira); 4 dias (CPP, dias corridos); TJPR; modo completo | **06/04/2026 (segunda-feira)** (prorrogado) | 03/04 vencimento em dia não útil (Sexta-feira Santa), prorrogado (CPP, art. 798, § 3º) |
| 64 | `tst-semana-santa-conservador`<br>TST: art. 62 cita 'Tribunais Superiores', mas não há ato do TST conferido (conservador) | publicação em 01/04/2026 (quarta-feira); 3 dias (CPC, dias úteis); TST; modo conservador | **06/04/2026 (segunda-feira)**<br>Alternativa: 08/04/2026 (quarta-feira) | 2 sáb./dom. |
| 65 | `trf3-carnaval-conservador`<br>TRF3: Carnaval é feriado (Lei 5.010); Quarta de Cinzas ainda sem ato do TRF3 (conservador) | publicação em 13/02/2026 (sexta-feira); 3 dias (CPC, dias úteis); TRF3; modo conservador | **20/02/2026 (sexta-feira)**<br>Alternativa: 23/02/2026 (segunda-feira) | 2 sáb./dom.; 16/02 Carnaval (segunda); 17/02 Carnaval (terça) |
| 66 | `tjmg-corpus-christi-comarca`<br>TJMG: 4 e 5/06 dependem da comarca (feriado municipal em Belo Horizonte e em outras): pendente | publicação em 02/06/2026 (terça-feira); 3 dias (CPC, dias úteis); TJMG; modo conservador | **05/06/2026 (sexta-feira)**<br>Alternativa: 09/06/2026 (terça-feira) | só o dia do começo |
| 67 | `tjal-junho-art37-pendente`<br>TJAL: o art. 37 da Lei 6.564/2005 (feriados forenses de 23/06 a 01/07) ainda não teve a vigência confirmada: data alternativa grande | publicação em 19/06/2026 (sexta-feira); 5 dias (CPC, dias úteis); TJAL; modo conservador | **26/06/2026 (sexta-feira)**<br>Alternativa: 07/07/2026 (terça-feira) | 2 sáb./dom. |
| 68 | `tjes-penha-pendente`<br>TJES: Nossa Senhora da Penha (segunda após a oitava da Páscoa, Lei ES 11.010/2019, texto não lido): só data alternativa | publicação em 02/04/2027 (sexta-feira); 3 dias (CPC, dias úteis); TJES; modo conservador | **07/04/2027 (quarta-feira)**<br>Alternativa: 08/04/2027 (quinta-feira) | 2 sáb./dom. |

## Calendário verificado (tribunais com ato lido) (69 a 100)

*O calendário do tribunal foi lido no ato oficial. O que se valida é a **regra de contagem** e se o dia citado realmente não conta.*

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 69 | `stj-semana-santa-2026`<br>STJ: Quarta, Quinta e Sexta Santas de 2026 não contam | publicação em 01/04/2026 (quarta-feira); 3 dias (CPC, dias úteis); STJ; modo conservador | **08/04/2026 (quarta-feira)** | 2 sáb./dom.; 02/04 Semana Santa (quinta); 03/04 Sexta-feira Santa |
| 70 | `trf3-semana-santa-2026`<br>TRF3: Semana Santa é feriado forense pela Lei 5.010 (Justiça Federal) | publicação em 01/04/2026 (quarta-feira); 3 dias (CPC, dias úteis); TRF3; modo conservador | **08/04/2026 (quarta-feira)** | 2 sáb./dom.; 02/04 Semana Santa (quinta); 03/04 Sexta-feira Santa |
| 71 | `stj-onze-agosto-2026`<br>STJ: 10/08 (ponto facultativo) e 11/08 (Lei 5.010, art. 62, IV) não contam | publicação em 07/08/2026 (sexta-feira); 3 dias (CPC, dias úteis); STJ; modo conservador | **14/08/2026 (sexta-feira)** | 2 sáb./dom.; 10/08 Ponto facultativo (ato do tribunal); 11/08 11 de agosto (Lei 5.010, art. 62, IV) |
| 72 | `stj-corpus-christi-2026`<br>STJ: Corpus Christi e 05/06 sem expediente em 2026 | publicação em 02/06/2026 (terça-feira); 5 dias (CPC, dias úteis); STJ; modo conservador | **11/06/2026 (quinta-feira)** | 2 sáb./dom.; 04/06 Ponto facultativo (ato do tribunal); 05/06 Ponto facultativo (ato do tribunal) |
| 73 | `stf-corpus-christi-2026`<br>STF: Corpus Christi e 05/06 sem expediente em 2026 | publicação em 02/06/2026 (terça-feira); 5 dias (CPC, dias úteis); STF; modo conservador | **11/06/2026 (quinta-feira)** | 2 sáb./dom.; 04/06 Ponto facultativo (ato do tribunal); 05/06 Ponto facultativo (ato do tribunal) |
| 74 | `stj-cinzas-comeco-2026`<br>STJ: Carnaval e Quarta de Cinzas (até 14h) protraem o dia do começo | publicação em 13/02/2026 (sexta-feira); 5 dias (CPC, dias úteis); STJ; modo conservador | **25/02/2026 (quarta-feira)** | 4 sáb./dom.; 16/02 Carnaval (segunda); 17/02 Carnaval (terça); 18/02 Quarta-feira de Cinzas (ponto facultativo até as 14h): protrai o dia do começo |
| 75 | `stf-ponto-facultativo-30-out`<br>STF: 30/10/2026 (transferência do Dia do Servidor) e Finados não contam | publicação em 28/10/2026 (quarta-feira); 2 dias (CPC, dias úteis); STF; modo conservador | **03/11/2026 (terça-feira)** | 2 sáb./dom.; 30/10 Ponto facultativo (ato do tribunal); 02/11 Finados |
| 76 | `stj-ferias-julho-8d`<br>STJ: após as férias de julho, 10/08 (PF) e 11/08 não contam | publicação em 30/06/2026 (terça-feira); 8 dias (CPC, dias úteis); STJ; modo conservador | **13/08/2026 (quinta-feira)** | 12 sáb./dom.; suspensão 02/07 a 31/07/2026; 10/08 Ponto facultativo (ato do tribunal); 11/08 11 de agosto (Lei 5.010, art. 62, IV) |
| 77 | `stf-ferias-julho-5d`<br>STF: prazos não correm nas férias de julho | publicação em 30/06/2026 (terça-feira); 5 dias (CPC, dias úteis); STF; modo conservador | **06/08/2026 (quinta-feira)** | 10 sáb./dom.; suspensão 02/07 a 31/07/2026 |
| 78 | `tjsp-sem-ferias-julho`<br>TJSP não tem férias coletivas em julho (contraste com STJ/STF) | publicação em 30/06/2026 (terça-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador | **07/07/2026 (terça-feira)** | 2 sáb./dom. |
| 79 | `stj-recesso-ate-31-jan`<br>STJ: prazos suspensos de 20/12 a 31/01 (não a 20/01) e Cinzas protrai o vencimento | publicação em 15/12/2025 (segunda-feira); 15 dias (CPC, dias úteis); STJ; modo conservador | **19/02/2026 (quinta-feira)** (prorrogado) | 18 sáb./dom.; suspensão 22/12 a 30/01/2026; 16/02 Carnaval (segunda); 17/02 Carnaval (terça); 18/02 Quarta-feira de Cinzas (ponto facultativo até as 14h): protrai o vencimento (CPC, art. 224, § 1º) |
| 80 | `stf-recesso-ate-31-jan`<br>STF: prazos não correm de 20/12 a 31/01 | publicação em 19/12/2025 (sexta-feira); 2 dias (CPC, dias úteis); STF; modo conservador | **03/02/2026 (terça-feira)** | 14 sáb./dom.; suspensão 22/12 a 30/01/2026 |
| 81 | `stf-dje-ferias-janeiro`<br>STF: disponibilização em 30/01/2026 (férias); publicação só em 02/02 e contagem a partir de 03/02 | disponibilização no DJe em 30/01/2026 (sexta-feira); 5 dias (CPC, dias úteis); STF; modo conservador | **09/02/2026 (segunda-feira)** | 2 sáb./dom. |
| 82 | `stj-dje-semana-santa`<br>STJ: disponibilização em 31/03/2026; 1 a 3/04 são feriados, publicação na segunda 06/04 | disponibilização no DJe em 31/03/2026 (terça-feira); 3 dias (CPC, dias úteis); STJ; modo conservador | **09/04/2026 (quinta-feira)** | só o dia do começo |
| 83 | `trf3-finados`<br>TRF3: 2 de novembro (segunda) não conta | publicação em 30/10/2026 (sexta-feira); 3 dias (CPC, dias úteis); TRF3; modo conservador | **05/11/2026 (quinta-feira)** | 2 sáb./dom.; 02/11 Finados |
| 84 | `stj-7-e-8-dezembro`<br>STJ: 7/12 (ponto facultativo) e 8/12 (Dia da Justiça) não contam | publicação em 04/12/2026 (sexta-feira); 3 dias (CPC, dias úteis); STJ; modo conservador | **11/12/2026 (sexta-feira)** | 2 sáb./dom.; 07/12 Ponto facultativo (ato do tribunal); 08/12 Dia da Justiça (Lei 5.010, art. 62, IV) |
| 85 | `tjsp-cinzas-2026`<br>TJSP 2026: Carnaval (16 e 17/02) e Quarta de Cinzas com expediente parcial protraem o dia do começo | publicação em 13/02/2026 (sexta-feira); 3 dias (CPC, dias úteis); TJSP; modo conservador | **23/02/2026 (segunda-feira)** | 4 sáb./dom.; 16/02 TJSP: 02-16; 17/02 TJSP: 02-17; 18/02 Quarta-feira de Cinzas (TJSP: jornada começa 3 horas depois): protrai o dia do começo |
| 86 | `tjsp-9-julho-2026`<br>TJSP 2026: 9 de julho (Data Magna, Lei Estadual 9.497/1997) e 10/07 (suspensão) não contam | publicação em 08/07/2026 (quarta-feira); 3 dias (CPC, dias úteis); TJSP; modo conservador | **15/07/2026 (quarta-feira)** | 2 sáb./dom.; 09/07 TJSP: 07-09; 10/07 TJSP: 07-10 |
| 87 | `tjsp-semana-santa-2026`<br>TJSP 2026: Endoenças (02/04) e Sexta-feira da Paixão (03/04) não contam | publicação em 01/04/2026 (quarta-feira); 3 dias (CPC, dias úteis); TJSP; modo conservador | **08/04/2026 (quarta-feira)** | 2 sáb./dom.; 02/04 TJSP: 04-02; 03/04 TJSP: 04-03 |
| 88 | `tjsp-dje-recesso-2026`<br>TJSP: disponibilização em 18/12/2026; recesso até 20/01/2027; 2027 ainda sem provimento (sem selo) | disponibilização no DJe em 18/12/2026 (sexta-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador | **28/01/2027 (quinta-feira)** | 2 sáb./dom. |
| 89 | `tjmg-carnaval-2026`<br>TJMG 2026: segunda, terça e quarta-feira de cinzas (16 a 18/02) suspensas por inteiro | publicação em 13/02/2026 (sexta-feira); 3 dias (CPC, dias úteis); TJMG; modo conservador | **23/02/2026 (segunda-feira)** | 4 sáb./dom.; 16/02 TJMG: Carnaval/Semana Santa (Res. 458/2004); 17/02 TJMG: Carnaval/Semana Santa (Res. 458/2004); 18/02 TJMG: Carnaval/Semana Santa (Res. 458/2004) |
| 90 | `tjmg-semana-santa-2026`<br>TJMG 2026: quarta a sexta-feira da Semana Santa (01 a 03/04) suspensas | publicação em 31/03/2026 (terça-feira); 3 dias (CPC, dias úteis); TJMG; modo conservador | **08/04/2026 (quarta-feira)** | 2 sáb./dom.; 01/04 TJMG: Carnaval/Semana Santa (Res. 458/2004); 02/04 TJMG: Carnaval/Semana Santa (Res. 458/2004); 03/04 TJMG: Carnaval/Semana Santa (Res. 458/2004) |
| 91 | `tjmg-permanente-2028`<br>TJMG 2028 (sem portaria anual): Carnaval de segunda a quarta (28/02 a 01/03) pela resolução permanente; sem selo | publicação em 25/02/2028 (sexta-feira); 3 dias (CPC, dias úteis); TJMG; modo conservador | **06/03/2028 (segunda-feira)** | 4 sáb./dom.; 28/02 TJMG: Carnaval/Semana Santa (Res. 458/2004); 29/02 TJMG: Carnaval/Semana Santa (Res. 458/2004); 01/03 TJMG: Carnaval/Semana Santa (Res. 458/2004) |
| 92 | `tjal-atos-2026`<br>TJAL 2026: 20/04 (Tiradentes, suspensão) e 21/04 não contam | publicação em 16/04/2026 (quinta-feira); 3 dias (CPC, dias úteis); TJAL; modo conservador | **23/04/2026 (quinta-feira)** | 2 sáb./dom.; 20/04 TJAL: Ato Normativo 03/2026; 21/04 Tiradentes |
| 93 | `tjrj-carnaval-2026`<br>TJRJ 2026: ponto facultativo de 13/02 e Carnaval (16 a 18/02) não contam | publicação em 12/02/2026 (quinta-feira); 3 dias (CPC, dias úteis); TJRJ; modo conservador | **23/02/2026 (segunda-feira)** | 4 sáb./dom.; 13/02 TJRJ: 02-13; 16/02 TJRJ: 02-16; 17/02 TJRJ: 02-17; 18/02 TJRJ: 02-18 |
| 94 | `tjrj-sao-jorge-2026`<br>TJRJ 2026: 23/04 (São Jorge, feriado estadual) e 24/04 (ponto facultativo) não contam | publicação em 22/04/2026 (quarta-feira); 3 dias (CPC, dias úteis); TJRJ; modo conservador | **29/04/2026 (quarta-feira)** | 2 sáb./dom.; 23/04 TJRJ: 04-23; 24/04 TJRJ: 04-24 |
| 95 | `tjrj-copa-2026`<br>TJRJ 2026: jogos da Copa em 24/06 (prazos suspensos) e 29/06 (expediente e prazos) não contam | publicação em 23/06/2026 (terça-feira); 3 dias (CPC, dias úteis); TJRJ; modo conservador | **30/06/2026 (terça-feira)** | 2 sáb./dom.; 24/06 TJRJ: 06-24; 29/06 TJRJ: 06-29 |
| 96 | `tjpe-data-magna`<br>TJPE: 6 de março (Data Magna, Lei estadual PE 16.241/2017, art. 49) não conta em nenhum ano | publicação em 05/03/2026 (quinta-feira); 3 dias (CPC, dias úteis); TJPE; modo conservador | **11/03/2026 (quarta-feira)** | 2 sáb./dom.; 06/03 TJPE: Data Magna (Lei estadual PE 16.241/2017, art. 49) |
| 97 | `tjrs-20-setembro`<br>TJRS: 20 de setembro (data magna, Constituição estadual, art. 6º; Decreto 36.180/1995) não conta | publicação em 17/09/2027 (sexta-feira); 3 dias (CPC, dias úteis); TJRS; modo conservador | **23/09/2027 (quinta-feira)** | 2 sáb./dom.; 20/09 TJRS: data magna (Constituição estadual, art. 6º; Decreto 36.180/1995) |
| 98 | `tjgo-24-outubro`<br>TJGO: 24 de outubro (pedra fundamental de Goiânia, feriado estadual) não conta | publicação em 23/10/2028 (segunda-feira); 3 dias (CPC, dias úteis); TJGO; modo conservador | **27/10/2028 (sexta-feira)** | 24/10 TJGO: pedra fundamental de Goiânia (Lei estadual GO 19.850/2017) |
| 99 | `tjpr-19-dezembro-nao-feriado`<br>TJPR: 19 de dezembro não é feriado civil (Lei estadual PR 18.384/2014, art. 1º); sem decreto lido, conta como dia útil | publicação em 18/12/2025 (quinta-feira); 1 dias (CPC, dias úteis); TJPR; modo conservador | **19/12/2025 (sexta-feira)** | só o dia do começo |
| 100 | `tjdf-dia-evangelico-util`<br>TJDF: 30 de novembro (Dia do Evangélico, lei distrital) conta como dia útil: o TJDFT é órgão federal | publicação em 27/11/2026 (sexta-feira); 2 dias (CPC, dias úteis); TJDF; modo conservador | **01/12/2026 (terça-feira)** | 2 sáb./dom. |

## CLT (101 a 103)

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 101 | `clt-recesso-775a`<br>CLT: o recesso de 20/12 a 20/01 também suspende os prazos | publicação em 15/12/2025 (segunda-feira); 8 dias (CLT, dias úteis); TST; modo conservador | **26/01/2026 (segunda-feira)** | 12 sáb./dom.; suspensão 22/12 a 20/01/2026 |
| 102 | `clt-ed-5d-feriado`<br>CLT: embargos de declaração em 5 dias úteis atravessando 7 de setembro | publicação em 03/09/2026 (quinta-feira); 5 dias (CLT, dias úteis); TST; modo conservador | **11/09/2026 (sexta-feira)** | 2 sáb./dom.; 07/09 Independência |
| 103 | `clt-recesso-borda-20-jan`<br>CLT: publicação em 16/01/2026; 19 e 20/01 ainda são recesso e a contagem retoma em 21/01 | publicação em 16/01/2026 (sexta-feira); 3 dias (CLT, dias úteis); TST; modo conservador | **23/01/2026 (sexta-feira)** | 2 sáb./dom.; suspensão 19/01 a 20/01/2026 |

## Intimação eletrônica (104 a 108)

*Intimação eletrônica (CPC, art. 231, V; Lei 11.419, art. 5º). O caso `portal-sabado` tem dúvida registrada em `VERIFICACAO_FONTES.md`, seção 7, item 1.*

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 104 | `portal-segunda`<br>Intimação eletrônica: consulta na segunda; dia do começo na terça; contagem a partir de quarta | consulta à intimação eletrônica em 09/03/2026 (segunda-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador | **17/03/2026 (terça-feira)** | 2 sáb./dom. |
| 105 | `portal-sexta`<br>Intimação eletrônica: consulta na sexta; dia do começo na segunda | consulta à intimação eletrônica em 13/03/2026 (sexta-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador | **23/03/2026 (segunda-feira)** | 2 sáb./dom. |
| 106 | `portal-sabado`<br>Intimação eletrônica: consulta no sábado (leitura literal do art. 231, V; ver nota de revisão) | consulta à intimação eletrônica em 14/03/2026 (sábado); 5 dias (CPC, dias úteis); TJSP; modo conservador | **23/03/2026 (segunda-feira)** | 2 sáb./dom. |
| 107 | `portal-feriado`<br>Intimação eletrônica: consulta na véspera de Tiradentes; dia do começo é o dia útil seguinte | consulta à intimação eletrônica em 20/04/2026 (segunda-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador | **29/04/2026 (quarta-feira)** | 2 sáb./dom. |
| 108 | `portal-recesso`<br>Intimação eletrônica consultada em 19/12/2025: o dia do começo é 21/01/2026, depois do recesso | consulta à intimação eletrônica em 19/12/2025 (sexta-feira); 5 dias (CPC, dias úteis); TJSP; modo conservador | **28/01/2026 (quarta-feira)** | 2 sáb./dom. |

## Juizados Especiais (109 a 113)

| Nº | Caso | Dados | Sistema diz | Dias que não contaram |
|---|---|---|---|---|
| 109 | `jef-5d-embargos`<br>JEF: embargos de declaração em 5 dias úteis (Lei 9.099, art. 49) | publicação em 10/03/2026 (terça-feira); 5 dias (JEF, dias úteis); TJSP; modo conservador | **17/03/2026 (terça-feira)** | 2 sáb./dom. |
| 110 | `jef-dobro-ignorado`<br>JEF: o prazo em dobro não é aplicado a ente público (Lei 10.259, art. 9º; Lei 12.153, art. 7º) | publicação em 10/03/2026 (terça-feira); 10 dias (JEF, dias úteis); TJSP; modo conservador; em dobro | **24/03/2026 (terça-feira)** | 4 sáb./dom. |
| 111 | `jef-recesso`<br>JEF: a suspensão de 20/12 a 20/01 vale nos Juizados (Res. CNJ 244/2016, art. 3º) | publicação em 15/12/2025 (segunda-feira); 10 dias (JEF, dias úteis); TJSP; modo conservador | **28/01/2026 (quarta-feira)** | 12 sáb./dom.; suspensão 22/12 a 20/01/2026 |
| 112 | `jef-recesso-desligado`<br>JEF: suspensão desligada pelo usuário conta o recesso (resultado de quem opta por não suspender) | publicação em 15/12/2025 (segunda-feira); 10 dias (JEF, dias úteis); TJSP; modo conservador; suspensão desligada | **30/12/2025 (terça-feira)** | 4 sáb./dom.; 25/12 Natal |
| 113 | `jef-dje-sexta`<br>JEF: disponibilização na sexta 13/03, publicação na segunda, recurso inominado de 10 dias úteis | disponibilização no DJe em 13/03/2026 (sexta-feira); 10 dias (JEF, dias úteis); TJSP; modo conservador | **30/03/2026 (segunda-feira)** | 4 sáb./dom. |

