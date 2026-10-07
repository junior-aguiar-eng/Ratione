# RATIONE — REVISÃO DOS CENÁRIOS DO PRAZOZERO

> **Gerado por `packages/prazozero/cenarios/oraculo.py`. Não edite este arquivo à mão:** a validação é registrada em `cenarios.json` (campo `validacao`) e este documento é regenerado.
> Cenários: **102** · validados: **0** · pendentes: **102**

## Como revisar

Para cada cenário: refaça a contagem com a lei na mão e confira (1) o **fundamento**, (2) a **data de publicação e o início da contagem** e (3) o **vencimento**. O item *Como foi contado* lista os dias que o cálculo excluiu e por quê; fins de semana e a suspensão de 20/12 a 20/01 vêm agregados.

**Para registrar a validação**, no `cenarios.json` troque, no cenário conferido, `"validacao": {"status": "pendente", "por": null, "em": null}` por `{"status": "validado", "por": "seu nome", "em": "AAAA-MM-DD"}`. Se discordar, anote o motivo no próprio cenário e me avise; o resultado esperado é do oráculo, não é verdade jurídica até você conferir.

**Convenções.** *Modo conservador*: só dias com base verificada (data mais cedo). *Modo completo*: inclui os dias ainda pendentes. *Alternativa*: data que valeria se os dias pendentes fossem confirmados. *Dia do começo*: o dia excluído da contagem (CPC, art. 224, caput).

## O que esta suíte não cobre

- **Indisponibilidade do sistema** (CPC, art. 224, § 1º, parte final): o motor não modela; é preciso o ato do tribunal.
- **Feriados estaduais e municipais**: só aparecem como pendentes (SP, 9 de julho) e o município nunca é calculado (CPC, art. 1.003, § 6º).
- **Calendário de STF e STJ fora de 2026**, e de TRFs e TJs além da Lei 5.010 e dos feriados nacionais.
- **Calendário de TRFs e TJs** além da Lei 5.010 e dos feriados nacionais (portarias anuais de cada tribunal).
- **Prazos criminais nas férias de STF e STJ**: coberto apenas pelo que os comunicados oficiais dizem (seguem o CPP, art. 798); a Portaria GDG 218/2024 do STF não foi lida, só o comunicado.

## Resumo

| Grupo | Cenários |
|---|---|
| Disponibilização no DJe | 5 |
| Feriados nacionais | 11 |
| Contagem básica | 2 |
| Recesso e suspensão de prazos | 8 |
| Prazo em dobro | 7 |
| Ano bissexto | 2 |
| CLT | 4 |
| CPP (prazos criminais) | 15 |
| Tribunais superiores | 1 |
| Dias ainda pendentes de conferência | 19 |
| Calendário verificado (STF, STJ, TRFs) | 17 |
| Intimação eletrônica | 5 |
| Juizados Especiais | 6 |

## Disponibilização no DJe

### 1. `dje-sexta`

**Disponibilização na sexta: publicação na segunda, contagem na terça**

- **Entrada:** disponibilização no DJe em **13/03/2026 (sexta-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 16/03/2026 (segunda-feira) · **início da contagem:** 17/03/2026 (terça-feira)
- **Vencimento esperado:** **09/04/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 6 sábados/domingos; 01/04/2026 Semana Santa (quarta); 02/04/2026 Semana Santa (quinta); 03/04/2026 Sexta-feira Santa
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 2. `dje-quinta`

**Disponibilização na quinta: publicação na sexta**

- **Entrada:** disponibilização no DJe em **12/03/2026 (quinta-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 13/03/2026 (sexta-feira) · **início da contagem:** 16/03/2026 (segunda-feira)
- **Vencimento esperado:** **08/04/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 8 sábados/domingos; 01/04/2026 Semana Santa (quarta); 02/04/2026 Semana Santa (quinta); 03/04/2026 Sexta-feira Santa
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 3. `dje-sabado`

**Disponibilização no sábado: publicação na segunda**

- **Entrada:** disponibilização no DJe em **14/03/2026 (sábado)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 16/03/2026 (segunda-feira) · **início da contagem:** 17/03/2026 (terça-feira)
- **Vencimento esperado:** **23/03/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 4. `dje-tjsp-exemplo`

**Apelação no TJSP: disponibilização 10/03/2026, 15 dias úteis**

- **Entrada:** disponibilização no DJe em **10/03/2026 (terça-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 11/03/2026 (quarta-feira) · **início da contagem:** 12/03/2026 (quinta-feira)
- **Vencimento esperado:** **01/04/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 6 sábados/domingos
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 5. `publicacao-sabado`

**Publicação em sábado: contagem inicia na segunda**

- **Entrada:** publicação em **14/03/2026 (sábado)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 14/03/2026 (sábado) · **início da contagem:** 16/03/2026 (segunda-feira)
- **Vencimento esperado:** **20/03/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 1 sábados/domingos
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

## Feriados nacionais

### 6. `dje-vespera-feriado`

**Disponibilização na segunda; terça é Tiradentes: publicação na quarta**

- **Entrada:** disponibilização no DJe em **20/04/2026 (segunda-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 22/04/2026 (quarta-feira) · **início da contagem:** 23/04/2026 (quinta-feira)
- **Vencimento esperado:** **29/04/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º; Lei 10.607/2002
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 7. `dje-sexta-antes-feriado`

**Disponibilização na sexta; segunda útil; termo inicial na terça é Tiradentes**

- **Entrada:** disponibilização no DJe em **17/04/2026 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 20/04/2026 (segunda-feira) · **início da contagem:** 22/04/2026 (quarta-feira)
- **Vencimento esperado:** **28/04/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 21/04/2026 Tiradentes
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º; Lei 10.607/2002
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 8. `vence-antes-feriado`

**Prazo que termina antes do feriado não é afetado**

- **Entrada:** publicação em **09/04/2026 (quinta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 09/04/2026 (quinta-feira) · **início da contagem:** 10/04/2026 (sexta-feira)
- **Vencimento esperado:** **16/04/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 9. `atravessa-tiradentes`

**Prazo atravessa Tiradentes (terça 21/04/2026)**

- **Entrada:** publicação em **14/04/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 14/04/2026 (terça-feira) · **início da contagem:** 15/04/2026 (quarta-feira)
- **Vencimento esperado:** **22/04/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 21/04/2026 Tiradentes
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º; Lei 10.607/2002
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 10. `atravessa-trabalho`

**Prazo atravessa 1º de maio (sexta)**

- **Entrada:** publicação em **29/04/2026 (quarta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 29/04/2026 (quarta-feira) · **início da contagem:** 30/04/2026 (quinta-feira)
- **Vencimento esperado:** **05/05/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 01/05/2026 Dia do Trabalho
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º; Lei 10.607/2002
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 11. `atravessa-independencia`

**Prazo atravessa 7 de setembro (segunda)**

- **Entrada:** publicação em **03/09/2026 (quinta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 03/09/2026 (quinta-feira) · **início da contagem:** 04/09/2026 (sexta-feira)
- **Vencimento esperado:** **11/09/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 07/09/2026 Independência
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º; Lei 10.607/2002
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 12. `atravessa-aparecida`

**Disponibilização 30/09/2026, 15 dias; 12/10 (segunda) não conta**

- **Entrada:** disponibilização no DJe em **30/09/2026 (quarta-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 01/10/2026 (quinta-feira) · **início da contagem:** 02/10/2026 (sexta-feira)
- **Vencimento esperado:** **23/10/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 6 sábados/domingos; 12/10/2026 Nossa Senhora Aparecida
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º; Lei 6.802/1980
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 13. `finados`

**Prazo atravessa Finados (segunda 02/11/2026)**

- **Entrada:** publicação em **30/10/2026 (sexta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 30/10/2026 (sexta-feira) · **início da contagem:** 03/11/2026 (terça-feira)
- **Vencimento esperado:** **04/11/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 02/11/2026 Finados
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º; Lei 10.607/2002
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 14. `consciencia-negra-2026`

**Consciência Negra (sexta 20/11/2026) é feriado nacional desde 2024**

- **Entrada:** publicação em **18/11/2026 (quarta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 18/11/2026 (quarta-feira) · **início da contagem:** 19/11/2026 (quinta-feira)
- **Vencimento esperado:** **24/11/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 20/11/2026 Consciência Negra
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º; Lei 14.759/2023
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 15. `consciencia-negra-2023`

**Em 2023 o 20/11 ainda não era nacional: depende de lei local (pendente)**

- **Entrada:** publicação em **17/11/2023 (sexta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 17/11/2023 (sexta-feira) · **início da contagem:** 20/11/2023 (segunda-feira)
- **Vencimento esperado:** **21/11/2023 (terça-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 22/11/2023 (quarta-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Lei 14.759/2023 (vigência a partir de 2024)
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 16. `tjsp-8-dezembro`

**TJSP: 8 de dezembro não é feriado forense (a Lei 5.010 vale para a Justiça Federal)**

- **Entrada:** publicação em **04/12/2026 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 04/12/2026 (sexta-feira) · **início da contagem:** 07/12/2026 (segunda-feira)
- **Vencimento esperado:** **09/12/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Lei 5.010/1966, art. 62 (Justiça Federal); sem ato do TJSP
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

## Contagem básica

### 17. `um-dia-sexta`

**Prazo de 1 dia com publicação na sexta vence na segunda**

- **Entrada:** publicação em **13/03/2026 (sexta-feira)** · prazo de **1 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 13/03/2026 (sexta-feira) · **início da contagem:** 16/03/2026 (segunda-feira)
- **Vencimento esperado:** **16/03/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 18. `um-dia-vespera-feriado`

**Prazo de 1 dia útil com publicação na quinta 30/04: sexta 1º/05 é feriado e vence na segunda 04/05**

- **Entrada:** publicação em **30/04/2026 (quinta-feira)** · prazo de **1 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 30/04/2026 (quinta-feira) · **início da contagem:** 04/05/2026 (segunda-feira)
- **Vencimento esperado:** **04/05/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 01/05/2026 Dia do Trabalho
- **Fundamento:** CPC, art. 219; Lei 662/1949, art. 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

## Recesso e suspensão de prazos

### 19. `recesso-15d`

**15 dias úteis atravessam o recesso de 20/12 a 20/01**

- **Entrada:** publicação em **15/12/2025 (segunda-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 15/12/2025 (segunda-feira) · **início da contagem:** 16/12/2025 (terça-feira)
- **Vencimento esperado:** **04/02/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 14 sábados/domingos; suspensão de 22 dias (22/12/2025 a 20/01/2026)
- **Fundamento:** CPC, art. 220
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 20. `recesso-5d-sexta`

**Publicação na sexta 19/12/2025: contagem só retoma em 21/01/2026**

- **Entrada:** publicação em **19/12/2025 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 19/12/2025 (sexta-feira) · **início da contagem:** 21/01/2026 (quarta-feira)
- **Vencimento esperado:** **27/01/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 12 sábados/domingos; suspensão de 22 dias (22/12/2025 a 20/01/2026)
- **Fundamento:** CPC, art. 220
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 21. `recesso-virada-ano`

**Publicação em 18/12/2026: virada de ano, retomada em 21/01/2027**

- **Entrada:** publicação em **18/12/2026 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 18/12/2026 (sexta-feira) · **início da contagem:** 21/01/2027 (quinta-feira)
- **Vencimento esperado:** **27/01/2027 (quarta-feira)**
- **Como foi contado (dias excluídos):** 12 sábados/domingos; suspensão de 23 dias (21/12/2026 a 20/01/2027)
- **Fundamento:** CPC, art. 220
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 22. `recesso-dje-dentro`

**Disponibilização dentro do recesso: publicação em 21/01/2026**

- **Entrada:** disponibilização no DJe em **22/12/2025 (segunda-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 21/01/2026 (quarta-feira) · **início da contagem:** 22/01/2026 (quinta-feira)
- **Vencimento esperado:** **28/01/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, arts. 220 e 224, § 2º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 23. `recesso-borda-20-jan`

**Publicação em 16/01/2026: 19 e 20/01 ainda são recesso**

- **Entrada:** publicação em **16/01/2026 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 16/01/2026 (sexta-feira) · **início da contagem:** 21/01/2026 (quarta-feira)
- **Vencimento esperado:** **23/01/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; suspensão de 2 dias (19/01/2026 a 20/01/2026)
- **Fundamento:** CPC, art. 220
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 24. `recesso-1-dia`

**1 dia útil com publicação em 19/12/2025 vence em 21/01/2026**

- **Entrada:** publicação em **19/12/2025 (sexta-feira)** · prazo de **1 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 19/12/2025 (sexta-feira) · **início da contagem:** 21/01/2026 (quarta-feira)
- **Vencimento esperado:** **21/01/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 10 sábados/domingos; suspensão de 22 dias (22/12/2025 a 20/01/2026)
- **Fundamento:** CPC, art. 220
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 25. `recesso-desligado`

**Recesso desligado explicitamente (suspensaoRecesso=false)**

- **Entrada:** publicação em **15/12/2025 (segunda-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador · suspensão desligada pelo usuário
- **Publicação / dia do começo:** 15/12/2025 (segunda-feira) · **início da contagem:** 16/12/2025 (terça-feira)
- **Vencimento esperado:** **22/12/2025 (segunda-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, art. 220 (não aplicado)
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 26. `recesso-pre-dezembro`

**15 dias úteis a partir de 01/12/2025: o 15º dia cai após o recesso**

- **Entrada:** publicação em **01/12/2025 (segunda-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 01/12/2025 (segunda-feira) · **início da contagem:** 02/12/2025 (terça-feira)
- **Vencimento esperado:** **21/01/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 14 sábados/domingos; suspensão de 22 dias (22/12/2025 a 20/01/2026)
- **Fundamento:** CPC, art. 220
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

## Prazo em dobro

### 27. `dobro-30d`

**Fazenda Pública: 15 dias em dobro (30 úteis)**

- **Entrada:** publicação em **02/03/2026 (segunda-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador · prazo em dobro
- **Publicação / dia do começo:** 02/03/2026 (segunda-feira) · **início da contagem:** 03/03/2026 (terça-feira)
- **Vencimento esperado:** **13/04/2026 (segunda-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 14/04/2026 (terça-feira)
- **Como foi contado (dias excluídos):** 12 sábados/domingos
- **Fundamento:** CPC, arts. 183 e 219
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 28. `dobro-recesso`

**Prazo em dobro atravessando o recesso**

- **Entrada:** publicação em **10/12/2025 (quarta-feira)** · prazo de **10 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador · prazo em dobro
- **Publicação / dia do começo:** 10/12/2025 (quarta-feira) · **início da contagem:** 11/12/2025 (quinta-feira)
- **Vencimento esperado:** **06/02/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 16 sábados/domingos; suspensão de 22 dias (22/12/2025 a 20/01/2026)
- **Fundamento:** CPC, arts. 183 e 220
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 29. `dobro-mp-intimacao-pessoal`

**Ministério Público: 15 dias em dobro (30 úteis) a partir da intimação pessoal por carga**

- **Entrada:** ciência pessoal (carga ou audiência) em **10/03/2026 (terça-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador · prazo em dobro
- **Publicação / dia do começo:** 10/03/2026 (terça-feira) · **início da contagem:** 11/03/2026 (quarta-feira)
- **Vencimento esperado:** **22/04/2026 (quarta-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 23/04/2026 (quinta-feira)
- **Como foi contado (dias excluídos):** 12 sábados/domingos; 21/04/2026 Tiradentes
- **Fundamento:** CPC, arts. 180 e 183, § 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 30. `dobro-defensoria-embargos`

**Defensoria Pública: embargos de declaração em dobro (10 úteis)**

- **Entrada:** ciência pessoal (carga ou audiência) em **10/03/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador · prazo em dobro
- **Publicação / dia do começo:** 10/03/2026 (terça-feira) · **início da contagem:** 11/03/2026 (quarta-feira)
- **Vencimento esperado:** **24/03/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos
- **Fundamento:** CPC, art. 186
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 31. `litisconsorcio-sem-dobro`

**Litisconsortes com advogados distintos: o art. 229 gera aviso e não duplica o prazo**

- **Entrada:** publicação em **10/03/2026 (terça-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador · litisconsortes com advogados distintos (aviso)
- **Publicação / dia do começo:** 10/03/2026 (terça-feira) · **início da contagem:** 11/03/2026 (quarta-feira)
- **Vencimento esperado:** **31/03/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 6 sábados/domingos
- **Fundamento:** CPC, art. 229 e § 2º (autos eletrônicos)
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 32. `stj-dobro-ferias-julho`

**STJ: prazo em dobro (30 úteis) interrompido pelas férias de julho e por 10 e 11/08**

- **Entrada:** publicação em **26/06/2026 (sexta-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador · prazo em dobro
- **Publicação / dia do começo:** 26/06/2026 (sexta-feira) · **início da contagem:** 29/06/2026 (segunda-feira)
- **Vencimento esperado:** **11/09/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 22 sábados/domingos; suspensão de 22 dias (02/07/2026 a 31/07/2026); 10/08/2026 Ponto facultativo (ato do tribunal); 11/08/2026 11 de agosto (Lei 5.010, art. 62, IV); 07/09/2026 Independência
- **Fundamento:** CPC, arts. 183 e 219; LC 35/1979, art. 66, § 1º; Portaria STJ/GDG 1.010/2025
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 33. `dobro-embargos-feriado`

**Fazenda: embargos de declaração em dobro (10 úteis) atravessando Tiradentes**

- **Entrada:** ciência pessoal (carga ou audiência) em **14/04/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador · prazo em dobro
- **Publicação / dia do começo:** 14/04/2026 (terça-feira) · **início da contagem:** 15/04/2026 (quarta-feira)
- **Vencimento esperado:** **29/04/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 21/04/2026 Tiradentes
- **Fundamento:** CPC, arts. 183 e 1.023
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

## Ano bissexto

### 34. `bissexto-2024`

**Fevereiro de 2024 (bissexto): 29/02 é dia útil**

- **Entrada:** publicação em **27/02/2024 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 27/02/2024 (terça-feira) · **início da contagem:** 28/02/2024 (quarta-feira)
- **Vencimento esperado:** **05/03/2024 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 35. `bissexto-2028`

**Fevereiro de 2028 (bissexto), Carnaval em 28 e 29/02**

- **Entrada:** publicação em **25/02/2028 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 25/02/2028 (sexta-feira) · **início da contagem:** 28/02/2028 (segunda-feira)
- **Vencimento esperado:** **03/03/2028 (sexta-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 08/03/2028 (quarta-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

## CLT

### 36. `clt-8d`

**Embargos na CLT: 8 dias úteis**

- **Entrada:** publicação em **04/03/2026 (quarta-feira)** · prazo de **8 dias** (CLT, dias úteis) · tribunal **TST** · modo conservador
- **Publicação / dia do começo:** 04/03/2026 (quarta-feira) · **início da contagem:** 05/03/2026 (quinta-feira)
- **Vencimento esperado:** **16/03/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos
- **Fundamento:** CLT, art. 775
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 37. `clt-recesso-775a`

**CLT: o recesso de 20/12 a 20/01 também suspende os prazos**

- **Entrada:** publicação em **15/12/2025 (segunda-feira)** · prazo de **8 dias** (CLT, dias úteis) · tribunal **TST** · modo conservador
- **Publicação / dia do começo:** 15/12/2025 (segunda-feira) · **início da contagem:** 16/12/2025 (terça-feira)
- **Vencimento esperado:** **26/01/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 12 sábados/domingos; suspensão de 22 dias (22/12/2025 a 20/01/2026)
- **Fundamento:** CLT, art. 775-A (Lei 13.545/2017)
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 38. `clt-ed-5d-feriado`

**CLT: embargos de declaração em 5 dias úteis atravessando 7 de setembro**

- **Entrada:** publicação em **03/09/2026 (quinta-feira)** · prazo de **5 dias** (CLT, dias úteis) · tribunal **TST** · modo conservador
- **Publicação / dia do começo:** 03/09/2026 (quinta-feira) · **início da contagem:** 04/09/2026 (sexta-feira)
- **Vencimento esperado:** **11/09/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 07/09/2026 Independência
- **Fundamento:** CLT, arts. 775 e 897-A; Lei 662/1949, art. 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 39. `clt-recesso-borda-20-jan`

**CLT: publicação em 16/01/2026; 19 e 20/01 ainda são recesso e a contagem retoma em 21/01**

- **Entrada:** publicação em **16/01/2026 (sexta-feira)** · prazo de **3 dias** (CLT, dias úteis) · tribunal **TST** · modo conservador
- **Publicação / dia do começo:** 16/01/2026 (sexta-feira) · **início da contagem:** 21/01/2026 (quarta-feira)
- **Vencimento esperado:** **23/01/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; suspensão de 2 dias (19/01/2026 a 20/01/2026)
- **Fundamento:** CLT, art. 775-A
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

## CPP (prazos criminais)

### 40. `cpp-5d-domingo`

**CPP: 5 dias corridos terminam no domingo, prorrogado para segunda**

- **Entrada:** publicação em **10/03/2026 (terça-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 10/03/2026 (terça-feira) · **início da contagem:** 11/03/2026 (quarta-feira)
- **Vencimento esperado:** **16/03/2026 (segunda-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 15/03/2026 vencimento em dia não útil (fim de semana), prorrogado (CPP, art. 798, § 3º)
- **Fundamento:** CPP, art. 798, caput e § 3º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 41. `cpp-5d-sabado`

**CPP: 5 dias corridos terminam no sábado, prorrogado para segunda**

- **Entrada:** publicação em **09/03/2026 (segunda-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 09/03/2026 (segunda-feira) · **início da contagem:** 10/03/2026 (terça-feira)
- **Vencimento esperado:** **16/03/2026 (segunda-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 14/03/2026 vencimento em dia não útil (fim de semana), prorrogado (CPP, art. 798, § 3º)
- **Fundamento:** CPP, art. 798, caput e § 3º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 42. `cpp-5d-util`

**CPP: 5 dias corridos terminam em dia útil, sem prorrogação**

- **Entrada:** publicação em **04/03/2026 (quarta-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 04/03/2026 (quarta-feira) · **início da contagem:** 05/03/2026 (quinta-feira)
- **Vencimento esperado:** **09/03/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** nenhum além do dia do começo
- **Fundamento:** CPP, art. 798, caput
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 43. `cpp-feriado`

**CPP: vencimento em Tiradentes, prorrogado para o dia útil seguinte**

- **Entrada:** publicação em **16/04/2026 (quinta-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 16/04/2026 (quinta-feira) · **início da contagem:** 17/04/2026 (sexta-feira)
- **Vencimento esperado:** **22/04/2026 (quarta-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 21/04/2026 vencimento em dia não útil (Tiradentes), prorrogado (CPP, art. 798, § 3º)
- **Fundamento:** CPP, art. 798, § 3º; Lei 10.607/2002
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 44. `cpp-10d`

**CPP: 10 dias corridos atravessando fins de semana**

- **Entrada:** publicação em **02/03/2026 (segunda-feira)** · prazo de **10 dias** (CPP, dias corridos) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 02/03/2026 (segunda-feira) · **início da contagem:** 03/03/2026 (terça-feira)
- **Vencimento esperado:** **12/03/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** nenhum além do dia do começo
- **Fundamento:** CPP, art. 798, caput
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 45. `cpp-trf3-reu-preso`

**CPP, réu preso no TRF3: sem suspensão (art. 798-A, I); vencimento em 20/12 cai em feriado forense (Lei 5.010, art. 62, I) e vai a 07/01**

- **Entrada:** publicação em **15/12/2026 (terça-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **TRF3** · modo conservador · exceção do CPP, art. 798-A (réu preso/Maria da Penha/urgência)
- **Publicação / dia do começo:** 15/12/2026 (terça-feira) · **início da contagem:** 16/12/2026 (quarta-feira)
- **Vencimento esperado:** **07/01/2027 (quinta-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 20/12/2026 vencimento em dia não útil (fim de semana), prorrogado (CPP, art. 798, § 3º)
- **Fundamento:** CPP, arts. 798, § 3º, e 798-A, I; Lei 5.010/1966, art. 62, I
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 46. `cpp-tjsp-reu-preso`

**CPP, réu preso no TJSP: sem suspensão; vencimento de domingo vai à segunda 21/12**

- **Entrada:** publicação em **15/12/2026 (terça-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **TJSP** · modo conservador · exceção do CPP, art. 798-A (réu preso/Maria da Penha/urgência)
- **Publicação / dia do começo:** 15/12/2026 (terça-feira) · **início da contagem:** 16/12/2026 (quarta-feira)
- **Vencimento esperado:** **21/12/2026 (segunda-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 20/12/2026 vencimento em dia não útil (fim de semana), prorrogado (CPP, art. 798, § 3º)
- **Fundamento:** CPP, arts. 798, § 3º, e 798-A, I
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 47. `cpp-recesso-suspende`

**CPP: prazo de 5 dias que atravessa 20/12 fica suspenso até 20/01 e retoma em 21/01**

- **Entrada:** publicação em **15/12/2026 (terça-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 15/12/2026 (terça-feira) · **início da contagem:** 16/12/2026 (quarta-feira)
- **Vencimento esperado:** **21/01/2027 (quinta-feira)**
- **Como foi contado (dias excluídos):** suspensão de 32 dias (20/12/2026 a 20/01/2027)
- **Fundamento:** CPP, art. 798-A (Lei 14.365/2022)
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 48. `cpp-recesso-10d`

**CPP: publicação em 19/12/2025, 10 dias corridos contados só depois de 20/01**

- **Entrada:** publicação em **19/12/2025 (sexta-feira)** · prazo de **10 dias** (CPP, dias corridos) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 19/12/2025 (sexta-feira) · **início da contagem:** 21/01/2026 (quarta-feira)
- **Vencimento esperado:** **30/01/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** suspensão de 32 dias (20/12/2025 a 20/01/2026)
- **Fundamento:** CPP, art. 798-A (Lei 14.365/2022)
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 49. `cpp-recesso-trf3`

**CPP no TRF3: suspensão até 20/01; a retomada em 21/01 é dia útil, sem prorrogação**

- **Entrada:** publicação em **15/12/2026 (terça-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **TRF3** · modo conservador
- **Publicação / dia do começo:** 15/12/2026 (terça-feira) · **início da contagem:** 16/12/2026 (quarta-feira)
- **Vencimento esperado:** **21/01/2027 (quinta-feira)**
- **Como foi contado (dias excluídos):** suspensão de 32 dias (20/12/2026 a 20/01/2027)
- **Fundamento:** CPP, art. 798-A; Lei 5.010/1966, art. 62, I
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 50. `cpp-stj-ferias-julho`

**CPP no STJ: as férias de julho não suspendem prazo criminal; vencimento em domingo vai à segunda 06/07**

- **Entrada:** publicação em **30/06/2026 (terça-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 30/06/2026 (terça-feira) · **início da contagem:** 01/07/2026 (quarta-feira)
- **Vencimento esperado:** **06/07/2026 (segunda-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 05/07/2026 vencimento em dia não útil (fim de semana), prorrogado (CPP, art. 798, § 3º)
- **Fundamento:** CPP, art. 798, caput e § 3º; Portaria STJ/GP 280/2023
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 51. `cpp-stf-ferias-janeiro`

**CPP no STF: depois de 20/01 o prazo criminal corre mesmo nas férias de janeiro**

- **Entrada:** publicação em **22/01/2026 (quinta-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **STF** · modo conservador
- **Publicação / dia do começo:** 22/01/2026 (quinta-feira) · **início da contagem:** 23/01/2026 (sexta-feira)
- **Vencimento esperado:** **27/01/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** nenhum além do dia do começo
- **Fundamento:** CPP, arts. 798, caput, e 798-A; RISTF, art. 105; comunicado do STF (Portaria GDG 218/2024)
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 52. `cpp-stj-recesso-798a`

**CPP no STJ: suspenso até 20/01 (não até 31/01); retoma em 21/01 e o vencimento de domingo vai à segunda**

- **Entrada:** publicação em **19/12/2025 (sexta-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 19/12/2025 (sexta-feira) · **início da contagem:** 21/01/2026 (quarta-feira)
- **Vencimento esperado:** **26/01/2026 (segunda-feira)** · prorrogado
- **Como foi contado (dias excluídos):** suspensão de 32 dias (20/12/2025 a 20/01/2026); 25/01/2026 vencimento em dia não útil (fim de semana), prorrogado (CPP, art. 798, § 3º)
- **Fundamento:** CPP, art. 798-A; Portaria STJ/GP 584/2022
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 53. `cpp-8d-sabado`

**CPP: 8 dias corridos vencem no sábado 14/03 e vão para a segunda 16/03**

- **Entrada:** publicação em **06/03/2026 (sexta-feira)** · prazo de **8 dias** (CPP, dias corridos) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 06/03/2026 (sexta-feira) · **início da contagem:** 09/03/2026 (segunda-feira)
- **Vencimento esperado:** **16/03/2026 (segunda-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 14/03/2026 vencimento em dia não útil (fim de semana), prorrogado (CPP, art. 798, § 3º)
- **Fundamento:** CPP, art. 798, caput e § 3º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 54. `cpp-vence-aparecida`

**CPP: 3 dias corridos vencem em 12/10 (segunda, feriado) e vão para 13/10**

- **Entrada:** publicação em **09/10/2026 (sexta-feira)** · prazo de **3 dias** (CPP, dias corridos) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 09/10/2026 (sexta-feira) · **início da contagem:** 13/10/2026 (terça-feira)
- **Vencimento esperado:** **13/10/2026 (terça-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 12/10/2026 vencimento em dia não útil (Nossa Senhora Aparecida), prorrogado (CPP, art. 798, § 3º)
- **Fundamento:** CPP, art. 798, § 3º; Lei 6.802/1980, art. 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

## Tribunais superiores

### 55. `stf-sem-uf`

**STF (sem UF): calendário 2026 verificado**

- **Entrada:** disponibilização no DJe em **03/09/2026 (quinta-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **STF** · modo conservador
- **Publicação / dia do começo:** 04/09/2026 (sexta-feira) · **início da contagem:** 08/09/2026 (terça-feira)
- **Vencimento esperado:** **28/09/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 8 sábados/domingos; 07/09/2026 Independência
- **Fundamento:** Calendário oficial do STF 2026 (Portaria GDG/STF 189/2025); CPC, arts. 219 e 224, §§ 2º e 3º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

## Dias ainda pendentes de conferência

### 56. `carnaval-2026-conservador`

**Carnaval 2026 ignorado no modo conservador (data mais cedo)**

- **Entrada:** publicação em **13/02/2026 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 13/02/2026 (sexta-feira) · **início da contagem:** 16/02/2026 (segunda-feira)
- **Vencimento esperado:** **20/02/2026 (sexta-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 25/02/2026 (quarta-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 57. `carnaval-2026-completo`

**Carnaval 2026 considerado; Quarta de Cinzas protrai o dia do começo**

- **Entrada:** publicação em **13/02/2026 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo completo
- **Publicação / dia do começo:** 13/02/2026 (sexta-feira) · **início da contagem:** 19/02/2026 (quinta-feira)
- **Vencimento esperado:** **25/02/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 16/02/2026 Carnaval (segunda); 17/02/2026 Carnaval (terça); 18/02/2026 Quarta-feira de Cinzas (expediente parcial): protrai o dia do começo
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 58. `cinzas-meio-conservador`

**Quarta de Cinzas no meio do prazo (conservador)**

- **Entrada:** publicação em **12/02/2026 (quinta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 12/02/2026 (quinta-feira) · **início da contagem:** 13/02/2026 (sexta-feira)
- **Vencimento esperado:** **19/02/2026 (quinta-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 23/02/2026 (segunda-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 59. `cinzas-meio-completo`

**Quarta de Cinzas no meio do prazo conta normalmente**

- **Entrada:** publicação em **12/02/2026 (quinta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo completo
- **Publicação / dia do começo:** 12/02/2026 (quinta-feira) · **início da contagem:** 13/02/2026 (sexta-feira)
- **Vencimento esperado:** **23/02/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 16/02/2026 Carnaval (segunda); 17/02/2026 Carnaval (terça)
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 60. `cinzas-vencimento-conservador`

**Prazo de 4 dias; sem Carnaval vence na segunda 16/02**

- **Entrada:** publicação em **10/02/2026 (terça-feira)** · prazo de **4 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 10/02/2026 (terça-feira) · **início da contagem:** 11/02/2026 (quarta-feira)
- **Vencimento esperado:** **16/02/2026 (segunda-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 19/02/2026 (quinta-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 61. `cinzas-vencimento-completo`

**Prazo de 4 dias; vencimento cairia na Quarta de Cinzas e é protraído**

- **Entrada:** publicação em **10/02/2026 (terça-feira)** · prazo de **4 dias** (CPC, dias úteis) · tribunal **TJSP** · modo completo
- **Publicação / dia do começo:** 10/02/2026 (terça-feira) · **início da contagem:** 11/02/2026 (quarta-feira)
- **Vencimento esperado:** **19/02/2026 (quinta-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 16/02/2026 Carnaval (segunda); 17/02/2026 Carnaval (terça); 18/02/2026 Quarta-feira de Cinzas (expediente parcial): protrai o vencimento (CPC, art. 224, § 1º)
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 62. `carnaval-2028-completo`

**Carnaval 2028 em 28 e 29/02 (bissexto), Cinzas em 01/03**

- **Entrada:** publicação em **25/02/2028 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo completo
- **Publicação / dia do começo:** 25/02/2028 (sexta-feira) · **início da contagem:** 02/03/2028 (quinta-feira)
- **Vencimento esperado:** **08/03/2028 (quarta-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 28/02/2028 Carnaval (segunda); 29/02/2028 Carnaval (terça); 01/03/2028 Quarta-feira de Cinzas (expediente parcial): protrai o dia do começo
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 63. `corpus-christi-conservador`

**Corpus Christi 2026 (04/06) ignorado no modo conservador**

- **Entrada:** publicação em **02/06/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 02/06/2026 (terça-feira) · **início da contagem:** 03/06/2026 (quarta-feira)
- **Vencimento esperado:** **09/06/2026 (terça-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 10/06/2026 (quarta-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 64. `corpus-christi-completo`

**Corpus Christi 2026 considerado**

- **Entrada:** publicação em **02/06/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo completo
- **Publicação / dia do começo:** 02/06/2026 (terça-feira) · **início da contagem:** 03/06/2026 (quarta-feira)
- **Vencimento esperado:** **10/06/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 04/06/2026 Corpus Christi
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 65. `sexta-santa-conservador`

**Sexta-feira Santa 2026 (03/04) ignorada no modo conservador**

- **Entrada:** publicação em **01/04/2026 (quarta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 01/04/2026 (quarta-feira) · **início da contagem:** 02/04/2026 (quinta-feira)
- **Vencimento esperado:** **06/04/2026 (segunda-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 07/04/2026 (terça-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; Lei 9.093/1995, art. 2º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 66. `sexta-santa-completo`

**Sexta-feira Santa 2026 considerada (TJSP)**

- **Entrada:** publicação em **01/04/2026 (quarta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJSP** · modo completo
- **Publicação / dia do começo:** 01/04/2026 (quarta-feira) · **início da contagem:** 02/04/2026 (quinta-feira)
- **Vencimento esperado:** **07/04/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 03/04/2026 Sexta-feira Santa
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; Lei 9.093/1995, art. 2º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 67. `onze-agosto-tjsp-completo`

**11 de agosto não é feriado forense no TJSP**

- **Entrada:** publicação em **07/08/2026 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJSP** · modo completo
- **Publicação / dia do começo:** 07/08/2026 (sexta-feira) · **início da contagem:** 10/08/2026 (segunda-feira)
- **Vencimento esperado:** **12/08/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 68. `sp-9-julho-conservador`

**9 de julho ignorado no modo conservador**

- **Entrada:** publicação em **08/07/2026 (quarta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 08/07/2026 (quarta-feira) · **início da contagem:** 09/07/2026 (quinta-feira)
- **Vencimento esperado:** **15/07/2026 (quarta-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 16/07/2026 (quinta-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; lei estadual a conferir
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 69. `sp-9-julho-completo`

**9 de julho considerado em SP**

- **Entrada:** publicação em **08/07/2026 (quarta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo completo
- **Publicação / dia do começo:** 08/07/2026 (quarta-feira) · **início da contagem:** 10/07/2026 (sexta-feira)
- **Vencimento esperado:** **16/07/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 09/07/2026 Revolução Constitucionalista (estadual, pendente)
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; lei estadual a conferir
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 70. `consciencia-negra-2023-completo`

**20/11/2023 considerado (lei local, pendente)**

- **Entrada:** publicação em **17/11/2023 (sexta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **TJSP** · modo completo
- **Publicação / dia do começo:** 17/11/2023 (sexta-feira) · **início da contagem:** 21/11/2023 (terça-feira)
- **Vencimento esperado:** **22/11/2023 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 20/11/2023 Consciência Negra
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 71. `dobro-sexta-santa-completo`

**Prazo em dobro com Sexta-feira Santa considerada**

- **Entrada:** publicação em **02/03/2026 (segunda-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **TJSP** · modo completo · prazo em dobro
- **Publicação / dia do começo:** 02/03/2026 (segunda-feira) · **início da contagem:** 03/03/2026 (terça-feira)
- **Vencimento esperado:** **14/04/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 12 sábados/domingos; 03/04/2026 Sexta-feira Santa
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 72. `cpp-sexta-santa-completo`

**CPP: vencimento na Sexta-feira Santa (completo) é prorrogado**

- **Entrada:** publicação em **30/03/2026 (segunda-feira)** · prazo de **4 dias** (CPP, dias corridos) · tribunal **TJSP** · modo completo
- **Publicação / dia do começo:** 30/03/2026 (segunda-feira) · **início da contagem:** 31/03/2026 (terça-feira)
- **Vencimento esperado:** **06/04/2026 (segunda-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 03/04/2026 vencimento em dia não útil (Sexta-feira Santa), prorrogado (CPP, art. 798, § 3º)
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; CPP, art. 798, § 3º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 73. `tst-semana-santa-conservador`

**TST: art. 62 cita 'Tribunais Superiores', mas não há ato do TST conferido (conservador)**

- **Entrada:** publicação em **01/04/2026 (quarta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TST** · modo conservador
- **Publicação / dia do começo:** 01/04/2026 (quarta-feira) · **início da contagem:** 02/04/2026 (quinta-feira)
- **Vencimento esperado:** **06/04/2026 (segunda-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 08/04/2026 (quarta-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; Lei 5.010/1966, art. 62, II
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 74. `trf3-carnaval-conservador`

**TRF3: Carnaval é feriado (Lei 5.010); Quarta de Cinzas ainda sem ato do TRF3 (conservador)**

- **Entrada:** publicação em **13/02/2026 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TRF3** · modo conservador
- **Publicação / dia do começo:** 13/02/2026 (sexta-feira) · **início da contagem:** 18/02/2026 (quarta-feira)
- **Vencimento esperado:** **20/02/2026 (sexta-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 23/02/2026 (segunda-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 16/02/2026 Carnaval (segunda); 17/02/2026 Carnaval (terça)
- **Fundamento:** Lei 5.010/1966, art. 62, III; Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar (Cinzas)
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

## Calendário verificado (STF, STJ, TRFs)

### 75. `stj-semana-santa-2026`

**STJ: Quarta, Quinta e Sexta Santas de 2026 não contam**

- **Entrada:** publicação em **01/04/2026 (quarta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 01/04/2026 (quarta-feira) · **início da contagem:** 06/04/2026 (segunda-feira)
- **Vencimento esperado:** **08/04/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 02/04/2026 Semana Santa (quinta); 03/04/2026 Sexta-feira Santa
- **Fundamento:** Portaria STJ/GDG 1.010/2025, art. 1º, IV; Lei 5.010/1966, art. 62, II
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 76. `trf3-semana-santa-2026`

**TRF3: Semana Santa é feriado forense pela Lei 5.010 (Justiça Federal)**

- **Entrada:** publicação em **01/04/2026 (quarta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TRF3** · modo conservador
- **Publicação / dia do começo:** 01/04/2026 (quarta-feira) · **início da contagem:** 06/04/2026 (segunda-feira)
- **Vencimento esperado:** **08/04/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 02/04/2026 Semana Santa (quinta); 03/04/2026 Sexta-feira Santa
- **Fundamento:** Lei 5.010/1966, art. 62, II
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 77. `stj-onze-agosto-2026`

**STJ: 10/08 (ponto facultativo) e 11/08 (Lei 5.010, art. 62, IV) não contam**

- **Entrada:** publicação em **07/08/2026 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 07/08/2026 (sexta-feira) · **início da contagem:** 12/08/2026 (quarta-feira)
- **Vencimento esperado:** **14/08/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 10/08/2026 Ponto facultativo (ato do tribunal); 11/08/2026 11 de agosto (Lei 5.010, art. 62, IV)
- **Fundamento:** Portaria STJ/GDG 1.010/2025, art. 1º, X e XI
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 78. `stj-corpus-christi-2026`

**STJ: Corpus Christi e 05/06 sem expediente em 2026**

- **Entrada:** publicação em **02/06/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 02/06/2026 (terça-feira) · **início da contagem:** 03/06/2026 (quarta-feira)
- **Vencimento esperado:** **11/06/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 04/06/2026 Ponto facultativo (ato do tribunal); 05/06/2026 Ponto facultativo (ato do tribunal)
- **Fundamento:** Portaria STJ/GDG 1.010/2025, art. 1º, VIII e IX
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 79. `stf-corpus-christi-2026`

**STF: Corpus Christi e 05/06 sem expediente em 2026**

- **Entrada:** publicação em **02/06/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **STF** · modo conservador
- **Publicação / dia do começo:** 02/06/2026 (terça-feira) · **início da contagem:** 03/06/2026 (quarta-feira)
- **Vencimento esperado:** **11/06/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 04/06/2026 Ponto facultativo (ato do tribunal); 05/06/2026 Ponto facultativo (ato do tribunal)
- **Fundamento:** Calendário oficial do STF 2026 (Portaria GDG/STF 189/2025)
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 80. `stj-cinzas-comeco-2026`

**STJ: Carnaval e Quarta de Cinzas (até 14h) protraem o dia do começo**

- **Entrada:** publicação em **13/02/2026 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 13/02/2026 (sexta-feira) · **início da contagem:** 19/02/2026 (quinta-feira)
- **Vencimento esperado:** **25/02/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 16/02/2026 Carnaval (segunda); 17/02/2026 Carnaval (terça); 18/02/2026 Quarta-feira de Cinzas (ponto facultativo até as 14h): protrai o dia do começo
- **Fundamento:** Portaria STJ/GDG 1.010/2025, art. 1º, II e III; CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 81. `stf-ponto-facultativo-30-out`

**STF: 30/10/2026 (transferência do Dia do Servidor) e Finados não contam**

- **Entrada:** publicação em **28/10/2026 (quarta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **STF** · modo conservador
- **Publicação / dia do começo:** 28/10/2026 (quarta-feira) · **início da contagem:** 29/10/2026 (quinta-feira)
- **Vencimento esperado:** **03/11/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 30/10/2026 Ponto facultativo (ato do tribunal); 02/11/2026 Finados
- **Fundamento:** Calendário oficial do STF 2026 (Portaria GDG/STF 189/2025)
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 82. `stj-ferias-julho-5d`

**STJ: prazos suspensos de 2 a 31 de julho; retoma em 03/08**

- **Entrada:** publicação em **30/06/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 30/06/2026 (terça-feira) · **início da contagem:** 01/07/2026 (quarta-feira)
- **Vencimento esperado:** **06/08/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 10 sábados/domingos; suspensão de 22 dias (02/07/2026 a 31/07/2026)
- **Fundamento:** LC 35/1979, art. 66, § 1º; RISTJ, arts. 81 e 106; Portaria STJ/GP 455/2026
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 83. `stj-ferias-julho-8d`

**STJ: após as férias de julho, 10/08 (PF) e 11/08 não contam**

- **Entrada:** publicação em **30/06/2026 (terça-feira)** · prazo de **8 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 30/06/2026 (terça-feira) · **início da contagem:** 01/07/2026 (quarta-feira)
- **Vencimento esperado:** **13/08/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 12 sábados/domingos; suspensão de 22 dias (02/07/2026 a 31/07/2026); 10/08/2026 Ponto facultativo (ato do tribunal); 11/08/2026 11 de agosto (Lei 5.010, art. 62, IV)
- **Fundamento:** LC 35/1979, art. 66, § 1º; Portaria STJ/GDG 1.010/2025
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 84. `stf-ferias-julho-5d`

**STF: prazos não correm nas férias de julho**

- **Entrada:** publicação em **30/06/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **STF** · modo conservador
- **Publicação / dia do começo:** 30/06/2026 (terça-feira) · **início da contagem:** 01/07/2026 (quarta-feira)
- **Vencimento esperado:** **06/08/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 10 sábados/domingos; suspensão de 22 dias (02/07/2026 a 31/07/2026)
- **Fundamento:** LC 35/1979, art. 66, § 1º; RISTF, arts. 78 e 105
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 85. `tjsp-sem-ferias-julho`

**TJSP não tem férias coletivas em julho (contraste com STJ/STF)**

- **Entrada:** publicação em **30/06/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 30/06/2026 (terça-feira) · **início da contagem:** 01/07/2026 (quarta-feira)
- **Vencimento esperado:** **07/07/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CF, art. 93, XII (vedadas férias coletivas em 2º grau)
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 86. `stj-recesso-ate-31-jan`

**STJ: prazos suspensos de 20/12 a 31/01 (não a 20/01) e Cinzas protrai o vencimento**

- **Entrada:** publicação em **15/12/2025 (segunda-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 15/12/2025 (segunda-feira) · **início da contagem:** 16/12/2025 (terça-feira)
- **Vencimento esperado:** **19/02/2026 (quinta-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 18 sábados/domingos; suspensão de 30 dias (22/12/2025 a 30/01/2026); 16/02/2026 Carnaval (segunda); 17/02/2026 Carnaval (terça); 18/02/2026 Quarta-feira de Cinzas (ponto facultativo até as 14h): protrai o vencimento (CPC, art. 224, § 1º)
- **Fundamento:** LC 35/1979, art. 66, § 1º; RISTJ, arts. 81 e 106; Portaria STJ/GP 941/2025
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 87. `stf-recesso-ate-31-jan`

**STF: prazos não correm de 20/12 a 31/01**

- **Entrada:** publicação em **19/12/2025 (sexta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **STF** · modo conservador
- **Publicação / dia do começo:** 19/12/2025 (sexta-feira) · **início da contagem:** 02/02/2026 (segunda-feira)
- **Vencimento esperado:** **03/02/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 14 sábados/domingos; suspensão de 30 dias (22/12/2025 a 30/01/2026)
- **Fundamento:** RISTF, arts. 78 e 105; LC 35/1979, art. 66, § 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 88. `stf-dje-ferias-janeiro`

**STF: disponibilização em 30/01/2026 (férias); publicação só em 02/02 e contagem a partir de 03/02**

- **Entrada:** disponibilização no DJe em **30/01/2026 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **STF** · modo conservador
- **Publicação / dia do começo:** 02/02/2026 (segunda-feira) · **início da contagem:** 03/02/2026 (terça-feira)
- **Vencimento esperado:** **09/02/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** RISTF, arts. 78 e 105; CPC, art. 224, § 2º; Calendário oficial do STF 2026 (Portaria GDG/STF 189/2025)
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 89. `stj-dje-semana-santa`

**STJ: disponibilização em 31/03/2026; 1 a 3/04 são feriados, publicação na segunda 06/04**

- **Entrada:** disponibilização no DJe em **31/03/2026 (terça-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 06/04/2026 (segunda-feira) · **início da contagem:** 07/04/2026 (terça-feira)
- **Vencimento esperado:** **09/04/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** nenhum além do dia do começo
- **Fundamento:** CPC, art. 224, § 2º; Portaria STJ/GDG 1.010/2025, art. 1º, IV
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 90. `trf3-finados`

**TRF3: 2 de novembro (segunda) não conta**

- **Entrada:** publicação em **30/10/2026 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TRF3** · modo conservador
- **Publicação / dia do começo:** 30/10/2026 (sexta-feira) · **início da contagem:** 03/11/2026 (terça-feira)
- **Vencimento esperado:** **05/11/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 02/11/2026 Finados
- **Fundamento:** Lei 662/1949, art. 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 91. `stj-7-e-8-dezembro`

**STJ: 7/12 (ponto facultativo) e 8/12 (Dia da Justiça) não contam**

- **Entrada:** publicação em **04/12/2026 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 04/12/2026 (sexta-feira) · **início da contagem:** 09/12/2026 (quarta-feira)
- **Vencimento esperado:** **11/12/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 07/12/2026 Ponto facultativo (ato do tribunal); 08/12/2026 Dia da Justiça (Lei 5.010, art. 62, IV)
- **Fundamento:** Portaria STJ/GDG 1.010/2025, art. 1º, XVII e XVIII
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

## Intimação eletrônica

### 92. `portal-segunda`

**Intimação eletrônica: consulta na segunda; dia do começo na terça; contagem a partir de quarta**

- **Entrada:** consulta à intimação eletrônica em **09/03/2026 (segunda-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 10/03/2026 (terça-feira) · **início da contagem:** 11/03/2026 (quarta-feira)
- **Vencimento esperado:** **17/03/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, arts. 224, caput, e 231, V; Lei 11.419/2006, art. 5º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 93. `portal-sexta`

**Intimação eletrônica: consulta na sexta; dia do começo na segunda**

- **Entrada:** consulta à intimação eletrônica em **13/03/2026 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 16/03/2026 (segunda-feira) · **início da contagem:** 17/03/2026 (terça-feira)
- **Vencimento esperado:** **23/03/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, arts. 224, caput, e 231, V; Lei 11.419/2006, art. 5º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 94. `portal-sabado`

**Intimação eletrônica: consulta no sábado (leitura literal do art. 231, V; ver nota de revisão)**

- **Entrada:** consulta à intimação eletrônica em **14/03/2026 (sábado)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 16/03/2026 (segunda-feira) · **início da contagem:** 17/03/2026 (terça-feira)
- **Vencimento esperado:** **23/03/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, art. 231, V; Lei 11.419/2006, art. 5º, § 2º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 95. `portal-feriado`

**Intimação eletrônica: consulta na véspera de Tiradentes; dia do começo é o dia útil seguinte**

- **Entrada:** consulta à intimação eletrônica em **20/04/2026 (segunda-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 22/04/2026 (quarta-feira) · **início da contagem:** 23/04/2026 (quinta-feira)
- **Vencimento esperado:** **29/04/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, art. 231, V; Lei 662/1949, art. 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 96. `portal-recesso`

**Intimação eletrônica consultada em 19/12/2025: o dia do começo é 21/01/2026, depois do recesso**

- **Entrada:** consulta à intimação eletrônica em **19/12/2025 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 21/01/2026 (quarta-feira) · **início da contagem:** 22/01/2026 (quinta-feira)
- **Vencimento esperado:** **28/01/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, arts. 220 e 231, V; Lei 11.419/2006, art. 5º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

## Juizados Especiais

### 97. `jef-5d-embargos`

**JEF: embargos de declaração em 5 dias úteis (Lei 9.099, art. 49)**

- **Entrada:** publicação em **10/03/2026 (terça-feira)** · prazo de **5 dias** (JEF, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 10/03/2026 (terça-feira) · **início da contagem:** 11/03/2026 (quarta-feira)
- **Vencimento esperado:** **17/03/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Lei 9.099/1995, art. 12-A (dias úteis); art. 49
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 98. `jef-10d-recurso`

**JEF: recurso inominado em 10 dias úteis (Lei 9.099, arts. 42 e 12-A)**

- **Entrada:** publicação em **10/03/2026 (terça-feira)** · prazo de **10 dias** (JEF, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 10/03/2026 (terça-feira) · **início da contagem:** 11/03/2026 (quarta-feira)
- **Vencimento esperado:** **24/03/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos
- **Fundamento:** Lei 9.099/1995, art. 12-A (dias úteis); art. 42
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 99. `jef-dobro-ignorado`

**JEF: o prazo em dobro não é aplicado a ente público (Lei 10.259, art. 9º; Lei 12.153, art. 7º)**

- **Entrada:** publicação em **10/03/2026 (terça-feira)** · prazo de **10 dias** (JEF, dias úteis) · tribunal **TJSP** · modo conservador · prazo em dobro
- **Publicação / dia do começo:** 10/03/2026 (terça-feira) · **início da contagem:** 11/03/2026 (quarta-feira)
- **Vencimento esperado:** **24/03/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos
- **Fundamento:** Lei 9.099/1995, art. 12-A (dias úteis); Lei 10.259/2001, art. 9º; Lei 12.153/2009, art. 7º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 100. `jef-recesso`

**JEF: a suspensão de 20/12 a 20/01 vale nos Juizados (Res. CNJ 244/2016, art. 3º)**

- **Entrada:** publicação em **15/12/2025 (segunda-feira)** · prazo de **10 dias** (JEF, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 15/12/2025 (segunda-feira) · **início da contagem:** 16/12/2025 (terça-feira)
- **Vencimento esperado:** **28/01/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 12 sábados/domingos; suspensão de 22 dias (22/12/2025 a 20/01/2026)
- **Fundamento:** Res. CNJ 244/2016, art. 3º; CPC, art. 220; Lei 9.099/1995, art. 12-A
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 101. `jef-recesso-desligado`

**JEF: suspensão desligada pelo usuário conta o recesso (resultado de quem opta por não suspender)**

- **Entrada:** publicação em **15/12/2025 (segunda-feira)** · prazo de **10 dias** (JEF, dias úteis) · tribunal **TJSP** · modo conservador · suspensão desligada pelo usuário
- **Publicação / dia do começo:** 15/12/2025 (segunda-feira) · **início da contagem:** 16/12/2025 (terça-feira)
- **Vencimento esperado:** **30/12/2025 (terça-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 25/12/2025 Natal
- **Fundamento:** Opção do usuário; ver Res. CNJ 244/2016, art. 3º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 102. `jef-dje-sexta`

**JEF: disponibilização na sexta 13/03, publicação na segunda, recurso inominado de 10 dias úteis**

- **Entrada:** disponibilização no DJe em **13/03/2026 (sexta-feira)** · prazo de **10 dias** (JEF, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 16/03/2026 (segunda-feira) · **início da contagem:** 17/03/2026 (terça-feira)
- **Vencimento esperado:** **30/03/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos
- **Fundamento:** Lei 9.099/1995, arts. 42 e 12-A; CPC, art. 224, § 2º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

