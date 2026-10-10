# RATIONE — REVISÃO DOS CENÁRIOS DO PRAZOZERO

> **Gerado por `packages/prazozero/cenarios/oraculo.py`. Não edite este arquivo à mão:** a validação é registrada em `cenarios.json` (campo `validacao`) e este documento é regenerado.
> Cenários: **161** · validados: **121** · pendentes: **40**

## Como revisar

Para cada cenário: refaça a contagem com a lei na mão e confira (1) o **fundamento**, (2) a **data de publicação e o início da contagem** e (3) o **vencimento**. O item *Como foi contado* lista os dias que o cálculo excluiu e por quê; fins de semana e a suspensão de 20/12 a 20/01 vêm agregados.

**Para registrar a validação**, no `cenarios.json` troque, no cenário conferido, `"validacao": {"status": "pendente", "por": null, "em": null}` por `{"status": "validado", "por": "seu nome", "em": "AAAA-MM-DD"}`. Se discordar, anote o motivo no próprio cenário e me avise; o resultado esperado é do oráculo, não é verdade jurídica até você conferir.

**Convenções.** *Modo conservador*: só dias com base verificada (data mais cedo). *Modo completo*: inclui os dias ainda pendentes. *Alternativa*: data que valeria se os dias pendentes fossem confirmados. *Dia do começo*: o dia excluído da contagem (CPC, art. 224, caput).

## O que esta suíte não cobre

- **Indisponibilidade do sistema** (CPC, art. 224, § 1º, parte final): o motor não modela; é preciso o ato do tribunal.
- **Feriados estaduais e municipais**: TJSP, TJMG e TJRJ (2026) têm ato lido e PE, RS e GO têm feriado estadual lido em lei; a tabela estadual dos demais segue pendente e feriado municipal nunca é calculado (CPC, art. 1.003, § 6º).
- **Calendário fora de 2026** (os tribunais só divulgam o ano seguinte no fim do ano) e **TJRS, TJPR, TJSC, TJBA, TJDF, TJGO, TJPE, TJCE, TJES e TRFs** além da Lei 5.010 e dos feriados nacionais; **TJRJ** só até 12/10/2026 e sem selo (informativo oficial; os atos não foram lidos); **TJAL** com selo, mas o recesso de 23/06 a 01/07 (art. 37 da Lei 6.564/2005) e o 28/08 (só em alguns municípios) ficam pendentes.
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
| Dias ainda pendentes de conferência | 28 |
| Calendário verificado (tribunais com ato lido) | 67 |
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
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 2. `dje-quinta`

**Disponibilização na quinta: publicação na sexta**

- **Entrada:** disponibilização no DJe em **12/03/2026 (quinta-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 13/03/2026 (sexta-feira) · **início da contagem:** 16/03/2026 (segunda-feira)
- **Vencimento esperado:** **08/04/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 8 sábados/domingos; 01/04/2026 Semana Santa (quarta); 02/04/2026 Semana Santa (quinta); 03/04/2026 Sexta-feira Santa
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 3. `dje-sabado`

**Disponibilização no sábado: publicação na segunda**

- **Entrada:** disponibilização no DJe em **14/03/2026 (sábado)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 16/03/2026 (segunda-feira) · **início da contagem:** 17/03/2026 (terça-feira)
- **Vencimento esperado:** **23/03/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 4. `dje-tjsp-exemplo`

**Apelação no TJSP: disponibilização 10/03/2026, 15 dias úteis**

- **Entrada:** disponibilização no DJe em **10/03/2026 (terça-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 11/03/2026 (quarta-feira) · **início da contagem:** 12/03/2026 (quinta-feira)
- **Vencimento esperado:** **01/04/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 6 sábados/domingos
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 5. `publicacao-sabado`

**Publicação em sábado: contagem inicia na segunda**

- **Entrada:** publicação em **14/03/2026 (sábado)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 14/03/2026 (sábado) · **início da contagem:** 16/03/2026 (segunda-feira)
- **Vencimento esperado:** **20/03/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 1 sábados/domingos
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

## Feriados nacionais

### 6. `dje-vespera-feriado`

**Disponibilização na segunda; terça é Tiradentes: publicação na quarta**

- **Entrada:** disponibilização no DJe em **20/04/2026 (segunda-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 22/04/2026 (quarta-feira) · **início da contagem:** 23/04/2026 (quinta-feira)
- **Vencimento esperado:** **29/04/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º; Lei 10.607/2002
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 7. `dje-sexta-antes-feriado`

**Disponibilização na sexta; segunda útil; termo inicial na terça é Tiradentes**

- **Entrada:** disponibilização no DJe em **17/04/2026 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 22/04/2026 (quarta-feira) · **início da contagem:** 23/04/2026 (quinta-feira)
- **Vencimento esperado:** **29/04/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º; Lei 10.607/2002
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 8. `vence-antes-feriado`

**Prazo que termina antes do feriado não é afetado**

- **Entrada:** publicação em **09/04/2026 (quinta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 09/04/2026 (quinta-feira) · **início da contagem:** 10/04/2026 (sexta-feira)
- **Vencimento esperado:** **16/04/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 9. `atravessa-tiradentes`

**Prazo atravessa Tiradentes (terça 21/04/2026)**

- **Entrada:** publicação em **14/04/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 14/04/2026 (terça-feira) · **início da contagem:** 15/04/2026 (quarta-feira)
- **Vencimento esperado:** **23/04/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 20/04/2026 TJSP: 04-20; 21/04/2026 Tiradentes
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º; Lei 10.607/2002
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 10. `atravessa-trabalho`

**Prazo atravessa 1º de maio (sexta)**

- **Entrada:** publicação em **29/04/2026 (quarta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 29/04/2026 (quarta-feira) · **início da contagem:** 30/04/2026 (quinta-feira)
- **Vencimento esperado:** **05/05/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 01/05/2026 Dia do Trabalho
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º; Lei 10.607/2002
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 11. `atravessa-independencia`

**Prazo atravessa 7 de setembro (segunda)**

- **Entrada:** publicação em **03/09/2026 (quinta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 03/09/2026 (quinta-feira) · **início da contagem:** 04/09/2026 (sexta-feira)
- **Vencimento esperado:** **11/09/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 07/09/2026 Independência
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º; Lei 10.607/2002
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 12. `atravessa-aparecida`

**Disponibilização 30/09/2026, 15 dias; 12/10 (segunda) não conta**

- **Entrada:** disponibilização no DJe em **30/09/2026 (quarta-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 01/10/2026 (quinta-feira) · **início da contagem:** 02/10/2026 (sexta-feira)
- **Vencimento esperado:** **23/10/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 6 sábados/domingos; 12/10/2026 Nossa Senhora Aparecida
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º; Lei 6.802/1980
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 13. `finados`

**Prazo atravessa Finados (segunda 02/11/2026)**

- **Entrada:** publicação em **30/10/2026 (sexta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 30/10/2026 (sexta-feira) · **início da contagem:** 03/11/2026 (terça-feira)
- **Vencimento esperado:** **04/11/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 02/11/2026 Finados
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º; Lei 10.607/2002
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 14. `consciencia-negra-2026`

**Consciência Negra (sexta 20/11/2026) é feriado nacional desde 2024**

- **Entrada:** publicação em **18/11/2026 (quarta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 18/11/2026 (quarta-feira) · **início da contagem:** 19/11/2026 (quinta-feira)
- **Vencimento esperado:** **24/11/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 20/11/2026 Consciência Negra
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º; Lei 14.759/2023
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 15. `consciencia-negra-2023`

**Em 2023 o 20/11 ainda não era nacional: depende de lei local (pendente)**

- **Entrada:** publicação em **17/11/2023 (sexta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 17/11/2023 (sexta-feira) · **início da contagem:** 20/11/2023 (segunda-feira)
- **Vencimento esperado:** **21/11/2023 (terça-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 22/11/2023 (quarta-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Lei 14.759/2023 (vigência a partir de 2024)
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 16. `tjsp-8-dezembro`

**TJSP 2026: 7/12 (suspensão do expediente) e 8/12 (Dia da Justiça) não contam**

- **Entrada:** publicação em **04/12/2026 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 04/12/2026 (sexta-feira) · **início da contagem:** 09/12/2026 (quarta-feira)
- **Vencimento esperado:** **11/12/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 07/12/2026 TJSP: 12-07; 08/12/2026 TJSP: 12-08
- **Fundamento:** Provimento CSM 2.813/2025, art. 1º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

## Contagem básica

### 17. `um-dia-sexta`

**Prazo de 1 dia com publicação na sexta vence na segunda**

- **Entrada:** publicação em **13/03/2026 (sexta-feira)** · prazo de **1 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 13/03/2026 (sexta-feira) · **início da contagem:** 16/03/2026 (segunda-feira)
- **Vencimento esperado:** **16/03/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 18. `um-dia-vespera-feriado`

**Prazo de 1 dia útil com publicação na quinta 30/04: sexta 1º/05 é feriado e vence na segunda 04/05**

- **Entrada:** publicação em **30/04/2026 (quinta-feira)** · prazo de **1 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 30/04/2026 (quinta-feira) · **início da contagem:** 04/05/2026 (segunda-feira)
- **Vencimento esperado:** **04/05/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 01/05/2026 Dia do Trabalho
- **Fundamento:** CPC, art. 219; Lei 662/1949, art. 1º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

## Recesso e suspensão de prazos

### 19. `recesso-15d`

**15 dias úteis atravessam o recesso de 20/12 a 20/01**

- **Entrada:** publicação em **15/12/2025 (segunda-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 15/12/2025 (segunda-feira) · **início da contagem:** 16/12/2025 (terça-feira)
- **Vencimento esperado:** **04/02/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 14 sábados/domingos; suspensão de 22 dias (22/12/2025 a 20/01/2026)
- **Fundamento:** CPC, art. 220
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 20. `recesso-5d-sexta`

**Publicação na sexta 19/12/2025: contagem só retoma em 21/01/2026**

- **Entrada:** publicação em **19/12/2025 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 19/12/2025 (sexta-feira) · **início da contagem:** 21/01/2026 (quarta-feira)
- **Vencimento esperado:** **27/01/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 12 sábados/domingos; suspensão de 22 dias (22/12/2025 a 20/01/2026)
- **Fundamento:** CPC, art. 220
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 21. `recesso-virada-ano`

**Publicação em 18/12/2026: virada de ano, retomada em 21/01/2027**

- **Entrada:** publicação em **18/12/2026 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 18/12/2026 (sexta-feira) · **início da contagem:** 21/01/2027 (quinta-feira)
- **Vencimento esperado:** **27/01/2027 (quarta-feira)**
- **Como foi contado (dias excluídos):** 12 sábados/domingos; suspensão de 23 dias (21/12/2026 a 20/01/2027)
- **Fundamento:** CPC, art. 220
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 22. `recesso-dje-dentro`

**Disponibilização dentro do recesso: publicação em 21/01/2026**

- **Entrada:** disponibilização no DJe em **22/12/2025 (segunda-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 21/01/2026 (quarta-feira) · **início da contagem:** 22/01/2026 (quinta-feira)
- **Vencimento esperado:** **28/01/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, arts. 220 e 224, § 2º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 23. `recesso-borda-20-jan`

**Publicação em 16/01/2026: 19 e 20/01 ainda são recesso**

- **Entrada:** publicação em **16/01/2026 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 16/01/2026 (sexta-feira) · **início da contagem:** 21/01/2026 (quarta-feira)
- **Vencimento esperado:** **23/01/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; suspensão de 2 dias (19/01/2026 a 20/01/2026)
- **Fundamento:** CPC, art. 220
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 24. `recesso-1-dia`

**1 dia útil com publicação em 19/12/2025 vence em 21/01/2026**

- **Entrada:** publicação em **19/12/2025 (sexta-feira)** · prazo de **1 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 19/12/2025 (sexta-feira) · **início da contagem:** 21/01/2026 (quarta-feira)
- **Vencimento esperado:** **21/01/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 10 sábados/domingos; suspensão de 22 dias (22/12/2025 a 20/01/2026)
- **Fundamento:** CPC, art. 220
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 25. `recesso-desligado`

**Recesso desligado explicitamente (suspensaoRecesso=false)**

- **Entrada:** publicação em **15/12/2025 (segunda-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador · suspensão desligada pelo usuário
- **Publicação / dia do começo:** 15/12/2025 (segunda-feira) · **início da contagem:** 16/12/2025 (terça-feira)
- **Vencimento esperado:** **22/12/2025 (segunda-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, art. 220 (não aplicado)
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 26. `recesso-pre-dezembro`

**15 dias úteis a partir de 01/12/2025: o 15º dia cai após o recesso**

- **Entrada:** publicação em **01/12/2025 (segunda-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 01/12/2025 (segunda-feira) · **início da contagem:** 02/12/2025 (terça-feira)
- **Vencimento esperado:** **21/01/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 14 sábados/domingos; suspensão de 22 dias (22/12/2025 a 20/01/2026)
- **Fundamento:** CPC, art. 220
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

## Prazo em dobro

### 27. `dobro-30d`

**Fazenda Pública: 15 dias em dobro (30 úteis)**

- **Entrada:** publicação em **02/03/2026 (segunda-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **TJGO** · modo conservador · prazo em dobro
- **Publicação / dia do começo:** 02/03/2026 (segunda-feira) · **início da contagem:** 03/03/2026 (terça-feira)
- **Vencimento esperado:** **13/04/2026 (segunda-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 14/04/2026 (terça-feira)
- **Como foi contado (dias excluídos):** 12 sábados/domingos
- **Fundamento:** CPC, arts. 183 e 219
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 28. `dobro-recesso`

**Prazo em dobro atravessando o recesso**

- **Entrada:** publicação em **10/12/2025 (quarta-feira)** · prazo de **10 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador · prazo em dobro
- **Publicação / dia do começo:** 10/12/2025 (quarta-feira) · **início da contagem:** 11/12/2025 (quinta-feira)
- **Vencimento esperado:** **06/02/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 16 sábados/domingos; suspensão de 22 dias (22/12/2025 a 20/01/2026)
- **Fundamento:** CPC, arts. 183 e 220
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 29. `dobro-mp-intimacao-pessoal`

**Ministério Público: 15 dias em dobro (30 úteis) a partir da intimação pessoal por carga**

- **Entrada:** ciência pessoal (carga ou audiência) em **10/03/2026 (terça-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador · prazo em dobro
- **Publicação / dia do começo:** 10/03/2026 (terça-feira) · **início da contagem:** 11/03/2026 (quarta-feira)
- **Vencimento esperado:** **27/04/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 14 sábados/domingos; 02/04/2026 TJSP: 04-02; 03/04/2026 TJSP: 04-03; 20/04/2026 TJSP: 04-20; 21/04/2026 Tiradentes
- **Fundamento:** CPC, arts. 180 e 183, § 1º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 30. `dobro-defensoria-embargos`

**Defensoria Pública: embargos de declaração em dobro (10 úteis)**

- **Entrada:** ciência pessoal (carga ou audiência) em **10/03/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador · prazo em dobro
- **Publicação / dia do começo:** 10/03/2026 (terça-feira) · **início da contagem:** 11/03/2026 (quarta-feira)
- **Vencimento esperado:** **24/03/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos
- **Fundamento:** CPC, art. 186
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 31. `litisconsorcio-sem-dobro`

**Litisconsortes com advogados distintos: o art. 229 gera aviso e não duplica o prazo**

- **Entrada:** publicação em **10/03/2026 (terça-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador · litisconsortes com advogados distintos (aviso)
- **Publicação / dia do começo:** 10/03/2026 (terça-feira) · **início da contagem:** 11/03/2026 (quarta-feira)
- **Vencimento esperado:** **31/03/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 6 sábados/domingos
- **Fundamento:** CPC, art. 229 e § 2º (autos eletrônicos)
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 32. `stj-dobro-ferias-julho`

**STJ: prazo em dobro (30 úteis) interrompido pelas férias de julho e por 10 e 11/08**

- **Entrada:** publicação em **26/06/2026 (sexta-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador · prazo em dobro
- **Publicação / dia do começo:** 26/06/2026 (sexta-feira) · **início da contagem:** 29/06/2026 (segunda-feira)
- **Vencimento esperado:** **11/09/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 22 sábados/domingos; suspensão de 22 dias (02/07/2026 a 31/07/2026); 10/08/2026 Ponto facultativo (ato do tribunal); 11/08/2026 11 de agosto (Lei 5.010, art. 62, IV); 07/09/2026 Independência
- **Fundamento:** CPC, arts. 183 e 219; LC 35/1979, art. 66, § 1º; Portaria STJ/GDG 1.010/2025
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 33. `dobro-embargos-feriado`

**Fazenda: embargos de declaração em dobro (10 úteis) atravessando Tiradentes**

- **Entrada:** ciência pessoal (carga ou audiência) em **14/04/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador · prazo em dobro
- **Publicação / dia do começo:** 14/04/2026 (terça-feira) · **início da contagem:** 15/04/2026 (quarta-feira)
- **Vencimento esperado:** **30/04/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 20/04/2026 TJSP: 04-20; 21/04/2026 Tiradentes
- **Fundamento:** CPC, arts. 183 e 1.023
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

## Ano bissexto

### 34. `bissexto-2024`

**Fevereiro de 2024 (bissexto): 29/02 é dia útil**

- **Entrada:** publicação em **27/02/2024 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 27/02/2024 (terça-feira) · **início da contagem:** 28/02/2024 (quarta-feira)
- **Vencimento esperado:** **05/03/2024 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 35. `bissexto-2028`

**Fevereiro de 2028 (bissexto), Carnaval em 28 e 29/02**

- **Entrada:** publicação em **25/02/2028 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 25/02/2028 (sexta-feira) · **início da contagem:** 28/02/2028 (segunda-feira)
- **Vencimento esperado:** **03/03/2028 (sexta-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 08/03/2028 (quarta-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, arts. 219 e 224, §§ 2º e 3º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

## CLT

### 36. `clt-8d`

**Recurso ordinário na CLT: 8 dias úteis (CLT, art. 895)**

- **Entrada:** publicação em **04/03/2026 (quarta-feira)** · prazo de **8 dias** (CLT, dias úteis) · tribunal **TST** · modo conservador
- **Publicação / dia do começo:** 04/03/2026 (quarta-feira) · **início da contagem:** 05/03/2026 (quinta-feira)
- **Vencimento esperado:** **16/03/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos
- **Fundamento:** CLT, art. 775
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 37. `clt-recesso-775a`

**CLT: o recesso de 20/12 a 20/01 também suspende os prazos**

- **Entrada:** publicação em **15/12/2025 (segunda-feira)** · prazo de **8 dias** (CLT, dias úteis) · tribunal **TST** · modo conservador
- **Publicação / dia do começo:** 15/12/2025 (segunda-feira) · **início da contagem:** 16/12/2025 (terça-feira)
- **Vencimento esperado:** **26/01/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 12 sábados/domingos; suspensão de 22 dias (22/12/2025 a 20/01/2026)
- **Fundamento:** CLT, art. 775-A (Lei 13.545/2017)
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 38. `clt-ed-5d-feriado`

**CLT: embargos de declaração em 5 dias úteis atravessando 7 de setembro**

- **Entrada:** publicação em **03/09/2026 (quinta-feira)** · prazo de **5 dias** (CLT, dias úteis) · tribunal **TST** · modo conservador
- **Publicação / dia do começo:** 03/09/2026 (quinta-feira) · **início da contagem:** 04/09/2026 (sexta-feira)
- **Vencimento esperado:** **11/09/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 07/09/2026 Independência
- **Fundamento:** CLT, arts. 775 e 897-A; Lei 662/1949, art. 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 39. `clt-recesso-borda-20-jan`

**CLT: publicação em 16/01/2026; 19 e 20/01 ainda são recesso e a contagem retoma em 21/01**

- **Entrada:** publicação em **16/01/2026 (sexta-feira)** · prazo de **3 dias** (CLT, dias úteis) · tribunal **TST** · modo conservador
- **Publicação / dia do começo:** 16/01/2026 (sexta-feira) · **início da contagem:** 21/01/2026 (quarta-feira)
- **Vencimento esperado:** **23/01/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; suspensão de 2 dias (19/01/2026 a 20/01/2026)
- **Fundamento:** CLT, art. 775-A
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

## CPP (prazos criminais)

### 40. `cpp-5d-domingo`

**CPP: 5 dias corridos terminam no domingo, prorrogado para segunda**

- **Entrada:** publicação em **10/03/2026 (terça-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 10/03/2026 (terça-feira) · **início da contagem:** 11/03/2026 (quarta-feira)
- **Vencimento esperado:** **16/03/2026 (segunda-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 15/03/2026 vencimento em dia não útil (fim de semana), prorrogado (CPP, art. 798, § 3º)
- **Fundamento:** CPP, art. 798, caput e § 3º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 41. `cpp-5d-sabado`

**CPP: 5 dias corridos terminam no sábado, prorrogado para segunda**

- **Entrada:** publicação em **09/03/2026 (segunda-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 09/03/2026 (segunda-feira) · **início da contagem:** 10/03/2026 (terça-feira)
- **Vencimento esperado:** **16/03/2026 (segunda-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 14/03/2026 vencimento em dia não útil (fim de semana), prorrogado (CPP, art. 798, § 3º)
- **Fundamento:** CPP, art. 798, caput e § 3º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 42. `cpp-5d-util`

**CPP: 5 dias corridos terminam em dia útil, sem prorrogação**

- **Entrada:** publicação em **04/03/2026 (quarta-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 04/03/2026 (quarta-feira) · **início da contagem:** 05/03/2026 (quinta-feira)
- **Vencimento esperado:** **09/03/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** nenhum além do dia do começo
- **Fundamento:** CPP, art. 798, caput
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 43. `cpp-feriado`

**CPP: vencimento em Tiradentes, prorrogado para o dia útil seguinte**

- **Entrada:** publicação em **16/04/2026 (quinta-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 16/04/2026 (quinta-feira) · **início da contagem:** 17/04/2026 (sexta-feira)
- **Vencimento esperado:** **22/04/2026 (quarta-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 21/04/2026 vencimento em dia não útil (Tiradentes), prorrogado (CPP, art. 798, § 3º)
- **Fundamento:** CPP, art. 798, § 3º; Lei 10.607/2002
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 44. `cpp-10d`

**CPP: 10 dias corridos atravessando fins de semana**

- **Entrada:** publicação em **02/03/2026 (segunda-feira)** · prazo de **10 dias** (CPP, dias corridos) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 02/03/2026 (segunda-feira) · **início da contagem:** 03/03/2026 (terça-feira)
- **Vencimento esperado:** **12/03/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** nenhum além do dia do começo
- **Fundamento:** CPP, art. 798, caput
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 45. `cpp-trf3-reu-preso`

**CPP, réu preso no TRF3: sem suspensão (art. 798-A, I); vencimento em 20/12 cai em feriado forense (Lei 5.010, art. 62, I) e vai a 07/01**

- **Entrada:** publicação em **15/12/2026 (terça-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **TRF3** · modo conservador · exceção do CPP, art. 798-A (réu preso/Maria da Penha/urgência)
- **Publicação / dia do começo:** 15/12/2026 (terça-feira) · **início da contagem:** 16/12/2026 (quarta-feira)
- **Vencimento esperado:** **07/01/2027 (quinta-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 20/12/2026 vencimento em dia não útil (fim de semana), prorrogado (CPP, art. 798, § 3º)
- **Fundamento:** CPP, arts. 798, § 3º, e 798-A, I; Lei 5.010/1966, art. 62, I
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 46. `cpp-tjsp-reu-preso`

**CPP, réu preso no TJSP: sem suspensão; vence no domingo 20/12 e, com 21 a 31/12 em recesso sem expediente, vai a 04/01/2027 (o recesso de 1º a 6/01/2027 ainda não está carregado: sem selo)**

- **Entrada:** publicação em **15/12/2026 (terça-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **TJSP** · modo conservador · exceção do CPP, art. 798-A (réu preso/Maria da Penha/urgência)
- **Publicação / dia do começo:** 15/12/2026 (terça-feira) · **início da contagem:** 16/12/2026 (quarta-feira)
- **Vencimento esperado:** **04/01/2027 (segunda-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 20/12/2026 vencimento em dia não útil (fim de semana), prorrogado (CPP, art. 798, § 3º)
- **Fundamento:** CPP, arts. 798, § 3º, e 798-A, I
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 47. `cpp-recesso-suspende`

**CPP: prazo de 5 dias que atravessa 20/12 fica suspenso até 20/01 e retoma em 21/01**

- **Entrada:** publicação em **15/12/2026 (terça-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 15/12/2026 (terça-feira) · **início da contagem:** 16/12/2026 (quarta-feira)
- **Vencimento esperado:** **21/01/2027 (quinta-feira)**
- **Como foi contado (dias excluídos):** suspensão de 32 dias (20/12/2026 a 20/01/2027)
- **Fundamento:** CPP, art. 798-A (Lei 14.365/2022)
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 48. `cpp-recesso-10d`

**CPP: publicação em 19/12/2025, 10 dias corridos contados só depois de 20/01**

- **Entrada:** publicação em **19/12/2025 (sexta-feira)** · prazo de **10 dias** (CPP, dias corridos) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 19/12/2025 (sexta-feira) · **início da contagem:** 21/01/2026 (quarta-feira)
- **Vencimento esperado:** **30/01/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** suspensão de 32 dias (20/12/2025 a 20/01/2026)
- **Fundamento:** CPP, art. 798-A (Lei 14.365/2022)
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 49. `cpp-recesso-trf3`

**CPP no TRF3: suspensão até 20/01; a retomada em 21/01 é dia útil, sem prorrogação**

- **Entrada:** publicação em **15/12/2026 (terça-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **TRF3** · modo conservador
- **Publicação / dia do começo:** 15/12/2026 (terça-feira) · **início da contagem:** 16/12/2026 (quarta-feira)
- **Vencimento esperado:** **21/01/2027 (quinta-feira)**
- **Como foi contado (dias excluídos):** suspensão de 32 dias (20/12/2026 a 20/01/2027)
- **Fundamento:** CPP, art. 798-A; Lei 5.010/1966, art. 62, I
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 50. `cpp-stj-ferias-julho`

**CPP no STJ: as férias de julho não suspendem prazo criminal; vencimento em domingo vai à segunda 06/07**

- **Entrada:** publicação em **30/06/2026 (terça-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 30/06/2026 (terça-feira) · **início da contagem:** 01/07/2026 (quarta-feira)
- **Vencimento esperado:** **06/07/2026 (segunda-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 05/07/2026 vencimento em dia não útil (fim de semana), prorrogado (CPP, art. 798, § 3º)
- **Fundamento:** CPP, art. 798, caput e § 3º; Portaria STJ/GP 280/2023
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 51. `cpp-stf-ferias-janeiro`

**CPP no STF: depois de 20/01 o prazo criminal corre mesmo nas férias de janeiro**

- **Entrada:** publicação em **22/01/2026 (quinta-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **STF** · modo conservador
- **Publicação / dia do começo:** 22/01/2026 (quinta-feira) · **início da contagem:** 23/01/2026 (sexta-feira)
- **Vencimento esperado:** **27/01/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** nenhum além do dia do começo
- **Fundamento:** CPP, arts. 798, caput, e 798-A; RISTF, art. 105; comunicado do STF (Portaria GDG 218/2024)
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 52. `cpp-stj-recesso-798a`

**CPP no STJ: suspenso até 20/01 (não até 31/01); retoma em 21/01 e o vencimento de domingo vai à segunda**

- **Entrada:** publicação em **19/12/2025 (sexta-feira)** · prazo de **5 dias** (CPP, dias corridos) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 19/12/2025 (sexta-feira) · **início da contagem:** 21/01/2026 (quarta-feira)
- **Vencimento esperado:** **26/01/2026 (segunda-feira)** · prorrogado
- **Como foi contado (dias excluídos):** suspensão de 32 dias (20/12/2025 a 20/01/2026); 25/01/2026 vencimento em dia não útil (fim de semana), prorrogado (CPP, art. 798, § 3º)
- **Fundamento:** CPP, art. 798-A; Portaria STJ/GP 584/2022
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 53. `cpp-8d-sabado`

**CPP: 8 dias corridos vencem no sábado 14/03 e vão para a segunda 16/03**

- **Entrada:** publicação em **06/03/2026 (sexta-feira)** · prazo de **8 dias** (CPP, dias corridos) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 06/03/2026 (sexta-feira) · **início da contagem:** 09/03/2026 (segunda-feira)
- **Vencimento esperado:** **16/03/2026 (segunda-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 14/03/2026 vencimento em dia não útil (fim de semana), prorrogado (CPP, art. 798, § 3º)
- **Fundamento:** CPP, art. 798, caput e § 3º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 54. `cpp-vence-aparecida`

**CPP: 3 dias corridos vencem em 12/10 (segunda, feriado) e vão para 13/10**

- **Entrada:** publicação em **09/10/2026 (sexta-feira)** · prazo de **3 dias** (CPP, dias corridos) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 09/10/2026 (sexta-feira) · **início da contagem:** 13/10/2026 (terça-feira)
- **Vencimento esperado:** **13/10/2026 (terça-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 12/10/2026 vencimento em dia não útil (Nossa Senhora Aparecida), prorrogado (CPP, art. 798, § 3º)
- **Fundamento:** CPP, art. 798, § 3º; Lei 6.802/1980, art. 1º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

## Tribunais superiores

### 55. `stf-sem-uf`

**STF (sem UF): calendário 2026 verificado**

- **Entrada:** disponibilização no DJe em **03/09/2026 (quinta-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **STF** · modo conservador
- **Publicação / dia do começo:** 04/09/2026 (sexta-feira) · **início da contagem:** 08/09/2026 (terça-feira)
- **Vencimento esperado:** **28/09/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 8 sábados/domingos; 07/09/2026 Independência
- **Fundamento:** Calendário oficial do STF 2026 (Portaria GDG/STF 189/2025); CPC, arts. 219 e 224, §§ 2º e 3º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

## Dias ainda pendentes de conferência

### 56. `carnaval-2026-conservador`

**Carnaval 2026 ignorado no modo conservador (data mais cedo)**

- **Entrada:** publicação em **13/02/2026 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJGO** · modo conservador
- **Publicação / dia do começo:** 13/02/2026 (sexta-feira) · **início da contagem:** 16/02/2026 (segunda-feira)
- **Vencimento esperado:** **20/02/2026 (sexta-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 25/02/2026 (quarta-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 57. `carnaval-2026-completo`

**Carnaval 2026 considerado; Quarta de Cinzas protrai o dia do começo**

- **Entrada:** publicação em **13/02/2026 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJGO** · modo completo
- **Publicação / dia do começo:** 13/02/2026 (sexta-feira) · **início da contagem:** 19/02/2026 (quinta-feira)
- **Vencimento esperado:** **25/02/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 16/02/2026 Carnaval (segunda); 17/02/2026 Carnaval (terça); 18/02/2026 Quarta-feira de Cinzas (expediente parcial): protrai o dia do começo
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 58. `cinzas-meio-conservador`

**Quarta de Cinzas no meio do prazo (conservador)**

- **Entrada:** publicação em **12/02/2026 (quinta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJGO** · modo conservador
- **Publicação / dia do começo:** 12/02/2026 (quinta-feira) · **início da contagem:** 13/02/2026 (sexta-feira)
- **Vencimento esperado:** **19/02/2026 (quinta-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 23/02/2026 (segunda-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 59. `cinzas-meio-completo`

**Quarta de Cinzas no meio do prazo conta normalmente**

- **Entrada:** publicação em **12/02/2026 (quinta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJGO** · modo completo
- **Publicação / dia do começo:** 12/02/2026 (quinta-feira) · **início da contagem:** 13/02/2026 (sexta-feira)
- **Vencimento esperado:** **23/02/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 16/02/2026 Carnaval (segunda); 17/02/2026 Carnaval (terça)
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 60. `cinzas-vencimento-conservador`

**Prazo de 4 dias; sem Carnaval vence na segunda 16/02**

- **Entrada:** publicação em **10/02/2026 (terça-feira)** · prazo de **4 dias** (CPC, dias úteis) · tribunal **TJGO** · modo conservador
- **Publicação / dia do começo:** 10/02/2026 (terça-feira) · **início da contagem:** 11/02/2026 (quarta-feira)
- **Vencimento esperado:** **16/02/2026 (segunda-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 19/02/2026 (quinta-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 61. `cinzas-vencimento-completo`

**Prazo de 4 dias; vencimento cairia na Quarta de Cinzas e é protraído**

- **Entrada:** publicação em **10/02/2026 (terça-feira)** · prazo de **4 dias** (CPC, dias úteis) · tribunal **TJGO** · modo completo
- **Publicação / dia do começo:** 10/02/2026 (terça-feira) · **início da contagem:** 11/02/2026 (quarta-feira)
- **Vencimento esperado:** **19/02/2026 (quinta-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 16/02/2026 Carnaval (segunda); 17/02/2026 Carnaval (terça); 18/02/2026 Quarta-feira de Cinzas (expediente parcial): protrai o vencimento (CPC, art. 224, § 1º)
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 62. `carnaval-2028-completo`

**Carnaval 2028 em 28 e 29/02 (bissexto), Cinzas em 01/03**

- **Entrada:** publicação em **25/02/2028 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo completo
- **Publicação / dia do começo:** 25/02/2028 (sexta-feira) · **início da contagem:** 02/03/2028 (quinta-feira)
- **Vencimento esperado:** **08/03/2028 (quarta-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 28/02/2028 Carnaval (segunda); 29/02/2028 Carnaval (terça); 01/03/2028 Quarta-feira de Cinzas (expediente parcial): protrai o dia do começo
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 63. `corpus-christi-conservador`

**Corpus Christi 2026 (04/06) ignorado no modo conservador**

- **Entrada:** publicação em **02/06/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJGO** · modo conservador
- **Publicação / dia do começo:** 02/06/2026 (terça-feira) · **início da contagem:** 03/06/2026 (quarta-feira)
- **Vencimento esperado:** **09/06/2026 (terça-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 10/06/2026 (quarta-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 64. `corpus-christi-completo`

**Corpus Christi 2026 considerado**

- **Entrada:** publicação em **02/06/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJGO** · modo completo
- **Publicação / dia do começo:** 02/06/2026 (terça-feira) · **início da contagem:** 03/06/2026 (quarta-feira)
- **Vencimento esperado:** **10/06/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 04/06/2026 Corpus Christi
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 65. `sexta-santa-conservador`

**Sexta-feira Santa 2026 (03/04) ignorada no modo conservador**

- **Entrada:** publicação em **01/04/2026 (quarta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJGO** · modo conservador
- **Publicação / dia do começo:** 01/04/2026 (quarta-feira) · **início da contagem:** 02/04/2026 (quinta-feira)
- **Vencimento esperado:** **06/04/2026 (segunda-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 07/04/2026 (terça-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; Lei 9.093/1995, art. 2º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 66. `sexta-santa-completo`

**Sexta-feira Santa 2026 considerada (TJSP)**

- **Entrada:** publicação em **01/04/2026 (quarta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJGO** · modo completo
- **Publicação / dia do começo:** 01/04/2026 (quarta-feira) · **início da contagem:** 02/04/2026 (quinta-feira)
- **Vencimento esperado:** **07/04/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 03/04/2026 Sexta-feira Santa
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; Lei 9.093/1995, art. 2º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 67. `onze-agosto-tjsp-completo`

**11 de agosto não é feriado forense no TJSP**

- **Entrada:** publicação em **07/08/2026 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJSP** · modo completo
- **Publicação / dia do começo:** 07/08/2026 (sexta-feira) · **início da contagem:** 10/08/2026 (segunda-feira)
- **Vencimento esperado:** **12/08/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 68. `sp-9-julho-conservador`

**TJSP 2027 (sem provimento publicado): 9 de julho ignorado no modo conservador**

- **Entrada:** publicação em **08/07/2027 (quinta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 08/07/2027 (quinta-feira) · **início da contagem:** 09/07/2027 (sexta-feira)
- **Vencimento esperado:** **15/07/2027 (quinta-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 16/07/2027 (sexta-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; lei estadual a conferir
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 69. `sp-9-julho-completo`

**TJSP 2027 (sem provimento publicado): 9 de julho considerado no modo completo**

- **Entrada:** publicação em **08/07/2027 (quinta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo completo
- **Publicação / dia do começo:** 08/07/2027 (quinta-feira) · **início da contagem:** 12/07/2027 (segunda-feira)
- **Vencimento esperado:** **16/07/2027 (sexta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 09/07/2027 Revolução Constitucionalista de 1932 (estadual, pendente)
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; lei estadual a conferir
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 70. `consciencia-negra-2023-completo`

**20/11/2023 considerado (lei local, pendente)**

- **Entrada:** publicação em **17/11/2023 (sexta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **TJSP** · modo completo
- **Publicação / dia do começo:** 17/11/2023 (sexta-feira) · **início da contagem:** 21/11/2023 (terça-feira)
- **Vencimento esperado:** **22/11/2023 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 20/11/2023 Consciência Negra
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 71. `dobro-sexta-santa-completo`

**Prazo em dobro com Sexta-feira Santa considerada**

- **Entrada:** publicação em **02/03/2026 (segunda-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **TJGO** · modo completo · prazo em dobro
- **Publicação / dia do começo:** 02/03/2026 (segunda-feira) · **início da contagem:** 03/03/2026 (terça-feira)
- **Vencimento esperado:** **14/04/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 12 sábados/domingos; 03/04/2026 Sexta-feira Santa
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 72. `cpp-sexta-santa-completo`

**CPP: vencimento na Sexta-feira Santa (completo) é prorrogado**

- **Entrada:** publicação em **30/03/2026 (segunda-feira)** · prazo de **4 dias** (CPP, dias corridos) · tribunal **TJGO** · modo completo
- **Publicação / dia do começo:** 30/03/2026 (segunda-feira) · **início da contagem:** 31/03/2026 (terça-feira)
- **Vencimento esperado:** **06/04/2026 (segunda-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 03/04/2026 vencimento em dia não útil (Sexta-feira Santa), prorrogado (CPP, art. 798, § 3º)
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; CPP, art. 798, § 3º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 73. `tst-semana-santa-conservador`

**TST: art. 62 cita 'Tribunais Superiores', mas não há ato do TST conferido (conservador)**

- **Entrada:** publicação em **01/04/2026 (quarta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TST** · modo conservador
- **Publicação / dia do começo:** 01/04/2026 (quarta-feira) · **início da contagem:** 02/04/2026 (quinta-feira)
- **Vencimento esperado:** **06/04/2026 (segunda-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 08/04/2026 (quarta-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar; Lei 5.010/1966, art. 62, II
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 74. `trf3-carnaval-conservador`

**TRF3: Carnaval é feriado (Lei 5.010); Quarta de Cinzas ainda sem ato do TRF3 (conservador)**

- **Entrada:** publicação em **13/02/2026 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TRF3** · modo conservador
- **Publicação / dia do começo:** 13/02/2026 (sexta-feira) · **início da contagem:** 18/02/2026 (quarta-feira)
- **Vencimento esperado:** **20/02/2026 (sexta-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 23/02/2026 (segunda-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 16/02/2026 Carnaval (segunda); 17/02/2026 Carnaval (terça)
- **Fundamento:** Lei 5.010/1966, art. 62, III; Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar (Cinzas)
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 75. `tjmg-corpus-christi-comarca`

**TJMG: 4 e 5/06 dependem da comarca (feriado municipal em Belo Horizonte e em outras): pendente**

- **Entrada:** publicação em **02/06/2026 (terça-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJMG** · modo conservador
- **Publicação / dia do começo:** 02/06/2026 (terça-feira) · **início da contagem:** 03/06/2026 (quarta-feira)
- **Vencimento esperado:** **05/06/2026 (sexta-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 09/06/2026 (terça-feira)
- **Como foi contado (dias excluídos):** nenhum além do dia do começo
- **Fundamento:** Portaria Conjunta 1.764/PR/2026 (TJMG), art. 1º, IV; Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 76. `tjal-junho-art37-pendente`

**TJAL: o art. 37 da Lei 6.564/2005 (feriados forenses de 23/06 a 01/07) ainda não teve a vigência confirmada: data alternativa grande**

- **Entrada:** publicação em **19/06/2026 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJAL** · modo conservador
- **Publicação / dia do começo:** 19/06/2026 (sexta-feira) · **início da contagem:** 22/06/2026 (segunda-feira)
- **Vencimento esperado:** **26/06/2026 (sexta-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 07/07/2026 (terça-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Lei estadual AL 6.564/2005, art. 37; Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 77. `tjes-penha-pendente`

**TJES: Nossa Senhora da Penha (segunda após a oitava da Páscoa, Lei ES 11.010/2019, texto não lido): só data alternativa**

- **Entrada:** publicação em **02/04/2027 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJES** · modo conservador
- **Publicação / dia do começo:** 02/04/2027 (sexta-feira) · **início da contagem:** 05/04/2027 (segunda-feira)
- **Vencimento esperado:** **07/04/2027 (quarta-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 08/04/2027 (quinta-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Lei 9.093/1995, art. 1º, II; CPC, art. 216; Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 78. `tjrs-2026-corpus-christi-conservador`

**TJRS: Corpus Christi (04/06/2026) é feriado municipal de Porto Alegre; ignorado no modo conservador**

- **Entrada:** publicação em **02/06/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJRS** · modo conservador
- **Publicação / dia do começo:** 02/06/2026 (terça-feira) · **início da contagem:** 03/06/2026 (quarta-feira)
- **Vencimento esperado:** **09/06/2026 (terça-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 10/06/2026 (quarta-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Ato 05/2025 do Órgão Especial do TJRS (lido em 10/10/2026); CPC, arts. 219 e 224 (asterisco: feriado municipal)
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 79. `tjrs-2026-corpus-christi-completo`

**TJRS: Corpus Christi (04/06/2026) considerado no modo completo**

- **Entrada:** publicação em **02/06/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJRS** · modo completo
- **Publicação / dia do começo:** 02/06/2026 (terça-feira) · **início da contagem:** 03/06/2026 (quarta-feira)
- **Vencimento esperado:** **10/06/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 04/06/2026 Corpus Christi
- **Fundamento:** Ato 05/2025 do Órgão Especial do TJRS (lido em 10/10/2026); CPC, arts. 219 e 224 (asterisco: feriado municipal)
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 80. `tjsc-2026-copa-29-junho-conservador`

**TJSC: 29/06/2026 (jogo às 14h, sem aviso do tribunal) ignorado no modo conservador**

- **Entrada:** publicação em **26/06/2026 (sexta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **TJSC** · modo conservador
- **Publicação / dia do começo:** 26/06/2026 (sexta-feira) · **início da contagem:** 29/06/2026 (segunda-feira)
- **Vencimento esperado:** **30/06/2026 (terça-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 01/07/2026 (quarta-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Resolução GP TJSC 31/2026, arts. 1º, I, e 2º; horário do jogo de avisos do TJDFT e do TJBA; CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 81. `tjsc-2026-copa-29-junho-completo`

**TJSC: 29/06/2026 considerado no modo completo (começo do prazo postergado)**

- **Entrada:** publicação em **26/06/2026 (sexta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **TJSC** · modo completo
- **Publicação / dia do começo:** 26/06/2026 (sexta-feira) · **início da contagem:** 30/06/2026 (terça-feira)
- **Vencimento esperado:** **01/07/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 29/06/2026 TJSC: jogo da Seleção às 14h (Res. GP 31/2026; pendente: sem aviso do tribunal): protrai o dia do começo
- **Fundamento:** Resolução GP TJSC 31/2026, arts. 1º, I, e 2º; horário do jogo de avisos do TJDFT e do TJBA; CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 82. `tjce-2026-fortaleza-13-abril-conservador`

**TJCE: 13/04/2026 (ponto facultativo só na Comarca de Fortaleza) ignorado no modo conservador**

- **Entrada:** publicação em **09/04/2026 (quinta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJCE** · modo conservador
- **Publicação / dia do começo:** 09/04/2026 (quinta-feira) · **início da contagem:** 10/04/2026 (sexta-feira)
- **Vencimento esperado:** **14/04/2026 (terça-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 15/04/2026 (quarta-feira)
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Portaria TJCE 727/2026, art. 1º; depende da comarca; CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 83. `tjce-2026-fortaleza-13-abril-completo`

**TJCE: 13/04/2026 considerado no modo completo**

- **Entrada:** publicação em **09/04/2026 (quinta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJCE** · modo completo
- **Publicação / dia do começo:** 09/04/2026 (quinta-feira) · **início da contagem:** 10/04/2026 (sexta-feira)
- **Vencimento esperado:** **15/04/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 13/04/2026 TJCE: ponto facultativo só na Comarca de Fortaleza (Portaria 727/2026)
- **Fundamento:** Portaria TJCE 727/2026, art. 1º; depende da comarca; CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

## Calendário verificado (tribunais com ato lido)

### 84. `stj-semana-santa-2026`

**STJ: Quarta, Quinta e Sexta Santas de 2026 não contam**

- **Entrada:** publicação em **01/04/2026 (quarta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 01/04/2026 (quarta-feira) · **início da contagem:** 06/04/2026 (segunda-feira)
- **Vencimento esperado:** **08/04/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 02/04/2026 Semana Santa (quinta); 03/04/2026 Sexta-feira Santa
- **Fundamento:** Portaria STJ/GDG 1.010/2025, art. 1º, IV; Lei 5.010/1966, art. 62, II
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 85. `trf3-semana-santa-2026`

**TRF3: Semana Santa é feriado forense pela Lei 5.010 (Justiça Federal)**

- **Entrada:** publicação em **01/04/2026 (quarta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TRF3** · modo conservador
- **Publicação / dia do começo:** 01/04/2026 (quarta-feira) · **início da contagem:** 06/04/2026 (segunda-feira)
- **Vencimento esperado:** **08/04/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 02/04/2026 Semana Santa (quinta); 03/04/2026 Sexta-feira Santa
- **Fundamento:** Lei 5.010/1966, art. 62, II
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 86. `stj-onze-agosto-2026`

**STJ: 10/08 (ponto facultativo) e 11/08 (Lei 5.010, art. 62, IV) não contam**

- **Entrada:** publicação em **07/08/2026 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 07/08/2026 (sexta-feira) · **início da contagem:** 12/08/2026 (quarta-feira)
- **Vencimento esperado:** **14/08/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 10/08/2026 Ponto facultativo (ato do tribunal); 11/08/2026 11 de agosto (Lei 5.010, art. 62, IV)
- **Fundamento:** Portaria STJ/GDG 1.010/2025, art. 1º, X e XI
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 87. `stj-corpus-christi-2026`

**STJ: Corpus Christi e 05/06 sem expediente em 2026**

- **Entrada:** publicação em **02/06/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 02/06/2026 (terça-feira) · **início da contagem:** 03/06/2026 (quarta-feira)
- **Vencimento esperado:** **11/06/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 04/06/2026 Ponto facultativo (ato do tribunal); 05/06/2026 Ponto facultativo (ato do tribunal)
- **Fundamento:** Portaria STJ/GDG 1.010/2025, art. 1º, VIII e IX
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 88. `stf-corpus-christi-2026`

**STF: Corpus Christi e 05/06 sem expediente em 2026**

- **Entrada:** publicação em **02/06/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **STF** · modo conservador
- **Publicação / dia do começo:** 02/06/2026 (terça-feira) · **início da contagem:** 03/06/2026 (quarta-feira)
- **Vencimento esperado:** **11/06/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 04/06/2026 Ponto facultativo (ato do tribunal); 05/06/2026 Ponto facultativo (ato do tribunal)
- **Fundamento:** Calendário oficial do STF 2026 (Portaria GDG/STF 189/2025)
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 89. `stj-cinzas-comeco-2026`

**STJ: Carnaval e Quarta de Cinzas (até 14h) protraem o dia do começo**

- **Entrada:** publicação em **13/02/2026 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 13/02/2026 (sexta-feira) · **início da contagem:** 19/02/2026 (quinta-feira)
- **Vencimento esperado:** **25/02/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 16/02/2026 Carnaval (segunda); 17/02/2026 Carnaval (terça); 18/02/2026 Quarta-feira de Cinzas (ponto facultativo até as 14h): protrai o dia do começo
- **Fundamento:** Portaria STJ/GDG 1.010/2025, art. 1º, II e III; CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 90. `stf-ponto-facultativo-30-out`

**STF: 30/10/2026 (transferência do Dia do Servidor) e Finados não contam**

- **Entrada:** publicação em **28/10/2026 (quarta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **STF** · modo conservador
- **Publicação / dia do começo:** 28/10/2026 (quarta-feira) · **início da contagem:** 29/10/2026 (quinta-feira)
- **Vencimento esperado:** **03/11/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 30/10/2026 Ponto facultativo (ato do tribunal); 02/11/2026 Finados
- **Fundamento:** Calendário oficial do STF 2026 (Portaria GDG/STF 189/2025)
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 91. `stj-ferias-julho-5d`

**STJ: prazos suspensos de 2 a 31 de julho; retoma em 03/08**

- **Entrada:** publicação em **30/06/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 30/06/2026 (terça-feira) · **início da contagem:** 01/07/2026 (quarta-feira)
- **Vencimento esperado:** **06/08/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 10 sábados/domingos; suspensão de 22 dias (02/07/2026 a 31/07/2026)
- **Fundamento:** LC 35/1979, art. 66, § 1º; RISTJ, arts. 81 e 106; Portaria STJ/GP 455/2026
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 92. `stj-ferias-julho-8d`

**STJ: após as férias de julho, 10/08 (PF) e 11/08 não contam**

- **Entrada:** publicação em **30/06/2026 (terça-feira)** · prazo de **8 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 30/06/2026 (terça-feira) · **início da contagem:** 01/07/2026 (quarta-feira)
- **Vencimento esperado:** **13/08/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 12 sábados/domingos; suspensão de 22 dias (02/07/2026 a 31/07/2026); 10/08/2026 Ponto facultativo (ato do tribunal); 11/08/2026 11 de agosto (Lei 5.010, art. 62, IV)
- **Fundamento:** LC 35/1979, art. 66, § 1º; Portaria STJ/GDG 1.010/2025
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 93. `stf-ferias-julho-5d`

**STF: prazos não correm nas férias de julho**

- **Entrada:** publicação em **30/06/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **STF** · modo conservador
- **Publicação / dia do começo:** 30/06/2026 (terça-feira) · **início da contagem:** 01/07/2026 (quarta-feira)
- **Vencimento esperado:** **06/08/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 10 sábados/domingos; suspensão de 22 dias (02/07/2026 a 31/07/2026)
- **Fundamento:** LC 35/1979, art. 66, § 1º; RISTF, arts. 78 e 105
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 94. `tjsp-sem-ferias-julho`

**TJSP não tem férias coletivas em julho (contraste com STJ/STF)**

- **Entrada:** publicação em **30/06/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 30/06/2026 (terça-feira) · **início da contagem:** 01/07/2026 (quarta-feira)
- **Vencimento esperado:** **07/07/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CF, art. 93, XII (vedadas férias coletivas em 2º grau)
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 95. `stj-recesso-ate-31-jan`

**STJ: prazos suspensos de 20/12 a 31/01 (não a 20/01) e Cinzas protrai o vencimento**

- **Entrada:** publicação em **15/12/2025 (segunda-feira)** · prazo de **15 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 15/12/2025 (segunda-feira) · **início da contagem:** 16/12/2025 (terça-feira)
- **Vencimento esperado:** **19/02/2026 (quinta-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 18 sábados/domingos; suspensão de 30 dias (22/12/2025 a 30/01/2026); 16/02/2026 Carnaval (segunda); 17/02/2026 Carnaval (terça); 18/02/2026 Quarta-feira de Cinzas (ponto facultativo até as 14h): protrai o vencimento (CPC, art. 224, § 1º)
- **Fundamento:** LC 35/1979, art. 66, § 1º; RISTJ, arts. 81 e 106; Portaria STJ/GP 941/2025
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 96. `stf-recesso-ate-31-jan`

**STF: prazos não correm de 20/12 a 31/01**

- **Entrada:** publicação em **19/12/2025 (sexta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **STF** · modo conservador
- **Publicação / dia do começo:** 19/12/2025 (sexta-feira) · **início da contagem:** 02/02/2026 (segunda-feira)
- **Vencimento esperado:** **03/02/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 14 sábados/domingos; suspensão de 30 dias (22/12/2025 a 30/01/2026)
- **Fundamento:** RISTF, arts. 78 e 105; LC 35/1979, art. 66, § 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 97. `stf-dje-ferias-janeiro`

**STF: disponibilização em 30/01/2026 (férias); publicação só em 02/02 e contagem a partir de 03/02**

- **Entrada:** disponibilização no DJe em **30/01/2026 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **STF** · modo conservador
- **Publicação / dia do começo:** 02/02/2026 (segunda-feira) · **início da contagem:** 03/02/2026 (terça-feira)
- **Vencimento esperado:** **09/02/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** RISTF, arts. 78 e 105; CPC, art. 224, § 2º; Calendário oficial do STF 2026 (Portaria GDG/STF 189/2025)
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 98. `stj-dje-semana-santa`

**STJ: disponibilização em 31/03/2026; 1 a 3/04 são feriados, publicação na segunda 06/04**

- **Entrada:** disponibilização no DJe em **31/03/2026 (terça-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 06/04/2026 (segunda-feira) · **início da contagem:** 07/04/2026 (terça-feira)
- **Vencimento esperado:** **09/04/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** nenhum além do dia do começo
- **Fundamento:** CPC, art. 224, § 2º; Portaria STJ/GDG 1.010/2025, art. 1º, IV
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 99. `trf3-finados`

**TRF3: 2 de novembro (segunda) não conta**

- **Entrada:** publicação em **30/10/2026 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TRF3** · modo conservador
- **Publicação / dia do começo:** 30/10/2026 (sexta-feira) · **início da contagem:** 03/11/2026 (terça-feira)
- **Vencimento esperado:** **05/11/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 02/11/2026 Finados
- **Fundamento:** Lei 662/1949, art. 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 100. `stj-7-e-8-dezembro`

**STJ: 7/12 (ponto facultativo) e 8/12 (Dia da Justiça) não contam**

- **Entrada:** publicação em **04/12/2026 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **STJ** · modo conservador
- **Publicação / dia do começo:** 04/12/2026 (sexta-feira) · **início da contagem:** 09/12/2026 (quarta-feira)
- **Vencimento esperado:** **11/12/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 07/12/2026 Ponto facultativo (ato do tribunal); 08/12/2026 Dia da Justiça (Lei 5.010, art. 62, IV)
- **Fundamento:** Portaria STJ/GDG 1.010/2025, art. 1º, XVII e XVIII
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 101. `tjsp-cinzas-2026`

**TJSP 2026: Carnaval (16 e 17/02) e Quarta de Cinzas com expediente parcial protraem o dia do começo**

- **Entrada:** publicação em **13/02/2026 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 13/02/2026 (sexta-feira) · **início da contagem:** 19/02/2026 (quinta-feira)
- **Vencimento esperado:** **23/02/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 16/02/2026 TJSP: 02-16; 17/02/2026 TJSP: 02-17; 18/02/2026 Quarta-feira de Cinzas (TJSP: jornada começa 3 horas depois): protrai o dia do começo
- **Fundamento:** Provimento CSM 2.813/2025 (TJSP), arts. 1º e 2º; CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 102. `tjsp-9-julho-2026`

**TJSP 2026: 9 de julho (Data Magna, Lei Estadual 9.497/1997) e 10/07 (suspensão) não contam**

- **Entrada:** publicação em **08/07/2026 (quarta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 08/07/2026 (quarta-feira) · **início da contagem:** 13/07/2026 (segunda-feira)
- **Vencimento esperado:** **15/07/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 09/07/2026 TJSP: 07-09; 10/07/2026 TJSP: 07-10
- **Fundamento:** Provimento CSM 2.813/2025 (TJSP), art. 1º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 103. `tjsp-semana-santa-2026`

**TJSP 2026: Endoenças (02/04) e Sexta-feira da Paixão (03/04) não contam**

- **Entrada:** publicação em **01/04/2026 (quarta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 01/04/2026 (quarta-feira) · **início da contagem:** 06/04/2026 (segunda-feira)
- **Vencimento esperado:** **08/04/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 02/04/2026 TJSP: 04-02; 03/04/2026 TJSP: 04-03
- **Fundamento:** Provimento CSM 2.813/2025 (TJSP), art. 1º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 104. `tjsp-dje-recesso-2026`

**TJSP: disponibilização em 18/12/2026; recesso até 20/01/2027; 2027 ainda sem provimento (sem selo)**

- **Entrada:** disponibilização no DJe em **18/12/2026 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 21/01/2027 (quinta-feira) · **início da contagem:** 22/01/2027 (sexta-feira)
- **Vencimento esperado:** **28/01/2027 (quinta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Provimento CSM 2.813/2025 (TJSP), art. 1º, § 1º; CPC, art. 220
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 105. `tjmg-carnaval-2026`

**TJMG 2026: segunda, terça e quarta-feira de cinzas (16 a 18/02) suspensas por inteiro**

- **Entrada:** publicação em **13/02/2026 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJMG** · modo conservador
- **Publicação / dia do começo:** 13/02/2026 (sexta-feira) · **início da contagem:** 19/02/2026 (quinta-feira)
- **Vencimento esperado:** **23/02/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 16/02/2026 TJMG: Carnaval/Semana Santa (Res. 458/2004); 17/02/2026 TJMG: Carnaval/Semana Santa (Res. 458/2004); 18/02/2026 TJMG: Carnaval/Semana Santa (Res. 458/2004)
- **Fundamento:** Portaria Conjunta 1.764/PR/2026 (TJMG), art. 1º, I; Res. OE 458/2004, art. 1º, III
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 106. `tjmg-semana-santa-2026`

**TJMG 2026: quarta a sexta-feira da Semana Santa (01 a 03/04) suspensas**

- **Entrada:** publicação em **31/03/2026 (terça-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJMG** · modo conservador
- **Publicação / dia do começo:** 31/03/2026 (terça-feira) · **início da contagem:** 06/04/2026 (segunda-feira)
- **Vencimento esperado:** **08/04/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 01/04/2026 TJMG: Carnaval/Semana Santa (Res. 458/2004); 02/04/2026 TJMG: Carnaval/Semana Santa (Res. 458/2004); 03/04/2026 TJMG: Carnaval/Semana Santa (Res. 458/2004)
- **Fundamento:** Portaria Conjunta 1.764/PR/2026 (TJMG), art. 1º, II; Res. OE 458/2004, art. 1º, IV
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 107. `tjmg-permanente-2028`

**TJMG 2028 (sem portaria anual): Carnaval de segunda a quarta (28/02 a 01/03) pela resolução permanente; sem selo**

- **Entrada:** publicação em **25/02/2028 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJMG** · modo conservador
- **Publicação / dia do começo:** 25/02/2028 (sexta-feira) · **início da contagem:** 02/03/2028 (quinta-feira)
- **Vencimento esperado:** **06/03/2028 (segunda-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 28/02/2028 TJMG: Carnaval/Semana Santa (Res. 458/2004); 29/02/2028 TJMG: Carnaval/Semana Santa (Res. 458/2004); 01/03/2028 TJMG: Carnaval/Semana Santa (Res. 458/2004)
- **Fundamento:** Res. OE TJMG 458/2004, art. 1º, III
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 108. `tjal-atos-2026`

**TJAL 2026: 20/04 (Tiradentes, suspensão) e 21/04 não contam**

- **Entrada:** publicação em **16/04/2026 (quinta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJAL** · modo conservador
- **Publicação / dia do começo:** 16/04/2026 (quinta-feira) · **início da contagem:** 17/04/2026 (sexta-feira)
- **Vencimento esperado:** **23/04/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 20/04/2026 TJAL: Ato Normativo 03/2026; 21/04/2026 Tiradentes
- **Fundamento:** Ato Normativo TJAL 03/2026 (notícia oficial do tribunal)
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 109. `tjrj-carnaval-2026`

**TJRJ 2026: ponto facultativo de 13/02 e Carnaval (16 a 18/02) não contam**

- **Entrada:** publicação em **12/02/2026 (quinta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJRJ** · modo conservador
- **Publicação / dia do começo:** 12/02/2026 (quinta-feira) · **início da contagem:** 19/02/2026 (quinta-feira)
- **Vencimento esperado:** **23/02/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 13/02/2026 TJRJ: 02-13; 16/02/2026 TJRJ: 02-16; 17/02/2026 TJRJ: 02-17; 18/02/2026 TJRJ: 02-18
- **Fundamento:** TJRJ, informativo de suspensão de prazos 2026 (cita o ato); Ato Executivo 20/2026; Lei 10.633/2024, art. 83, III
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 110. `tjrj-sao-jorge-2026`

**TJRJ 2026: 23/04 (São Jorge, feriado estadual) e 24/04 (ponto facultativo) não contam**

- **Entrada:** publicação em **22/04/2026 (quarta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJRJ** · modo conservador
- **Publicação / dia do começo:** 22/04/2026 (quarta-feira) · **início da contagem:** 27/04/2026 (segunda-feira)
- **Vencimento esperado:** **29/04/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 23/04/2026 TJRJ: 04-23; 24/04/2026 TJRJ: 04-24
- **Fundamento:** TJRJ, informativo de suspensão de prazos 2026 (cita o ato); Lei estadual 5.198/2008; Ato Executivo 79/2026
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 111. `tjrj-copa-2026`

**TJRJ 2026: jogos da Copa em 24/06 (prazos suspensos) e 29/06 (expediente e prazos) não contam**

- **Entrada:** publicação em **23/06/2026 (terça-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJRJ** · modo conservador
- **Publicação / dia do começo:** 23/06/2026 (terça-feira) · **início da contagem:** 25/06/2026 (quinta-feira)
- **Vencimento esperado:** **30/06/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 24/06/2026 TJRJ: 06-24; 29/06/2026 TJRJ: 06-29
- **Fundamento:** TJRJ, informativo de suspensão de prazos 2026 (cita o ato); Atos Executivos 96 e 103/2026
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 112. `tjpe-data-magna`

**TJPE: 6 de março (Data Magna, Lei estadual PE 16.241/2017, art. 49) não conta em nenhum ano**

- **Entrada:** publicação em **05/03/2026 (quinta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJPE** · modo conservador
- **Publicação / dia do começo:** 05/03/2026 (quinta-feira) · **início da contagem:** 09/03/2026 (segunda-feira)
- **Vencimento esperado:** **11/03/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 06/03/2026 TJPE: Data Magna (Lei estadual PE 16.241/2017, art. 49)
- **Fundamento:** Lei 9.093/1995, art. 1º, II; CPC, art. 216; Lei PE 16.241/2017, art. 49
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 113. `tjrs-20-setembro`

**TJRS: 20 de setembro (data magna, Constituição estadual, art. 6º; Decreto 36.180/1995) não conta**

- **Entrada:** publicação em **17/09/2027 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJRS** · modo conservador
- **Publicação / dia do começo:** 17/09/2027 (sexta-feira) · **início da contagem:** 21/09/2027 (terça-feira)
- **Vencimento esperado:** **23/09/2027 (quinta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 20/09/2027 TJRS: data magna (Constituição estadual, art. 6º; Decreto 36.180/1995)
- **Fundamento:** Lei 9.093/1995, art. 1º, II; CPC, art. 216; Decreto RS 36.180/1995
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 114. `tjgo-24-outubro`

**TJGO: 24 de outubro (pedra fundamental de Goiânia, feriado estadual) não conta**

- **Entrada:** publicação em **23/10/2028 (segunda-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJGO** · modo conservador
- **Publicação / dia do começo:** 23/10/2028 (segunda-feira) · **início da contagem:** 25/10/2028 (quarta-feira)
- **Vencimento esperado:** **27/10/2028 (sexta-feira)**
- **Como foi contado (dias excluídos):** 24/10/2028 TJGO: pedra fundamental de Goiânia (Lei estadual GO 19.850/2017)
- **Fundamento:** Lei 9.093/1995, art. 1º, II; CPC, art. 216; Lei GO 19.850/2017, art. 1º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 115. `tjpr-2026-carnaval`

**TJPR 2026: 16/02 (suspensão) e 17/02 (Carnaval) não contam; vence 23/02**

- **Entrada:** publicação em **12/02/2026 (quinta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJPR** · modo conservador
- **Publicação / dia do começo:** 12/02/2026 (quinta-feira) · **início da contagem:** 13/02/2026 (sexta-feira)
- **Vencimento esperado:** **23/02/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 16/02/2026 TJPR: Decreto Judiciário 621/2025; 17/02/2026 TJPR: Decreto Judiciário 621/2025
- **Fundamento:** Decreto Judiciário TJPR 621/2025 (lido em 10/10/2026); CPC, arts. 219 e 224, arts. 1º e 2º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 116. `tjpr-2026-corpus-christi`

**TJPR 2026: 04/06 (Corpus Christi) e 05/06 (suspensão) não contam**

- **Entrada:** publicação em **02/06/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJPR** · modo conservador
- **Publicação / dia do começo:** 02/06/2026 (terça-feira) · **início da contagem:** 03/06/2026 (quarta-feira)
- **Vencimento esperado:** **11/06/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 04/06/2026 TJPR: Decreto Judiciário 621/2025; 05/06/2026 TJPR: Decreto Judiciário 621/2025
- **Fundamento:** Decreto Judiciário TJPR 621/2025 (lido em 10/10/2026); CPC, arts. 219 e 224, arts. 1º e 2º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 117. `tjpr-2026-dia-servidor`

**TJPR 2026: 30/10 (Dia do Funcionário Público, transferido de 28/10) e Finados (02/11) não contam**

- **Entrada:** publicação em **28/10/2026 (quarta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **TJPR** · modo conservador
- **Publicação / dia do começo:** 28/10/2026 (quarta-feira) · **início da contagem:** 29/10/2026 (quinta-feira)
- **Vencimento esperado:** **03/11/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 30/10/2026 TJPR: Decreto Judiciário 621/2025; 02/11/2026 Finados
- **Fundamento:** Decreto Judiciário TJPR 621/2025 (lido em 10/10/2026); CPC, arts. 219 e 224, art. 1º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 118. `tjrs-2026-carnaval`

**TJRS 2026: 16/02 e 17/02 (Carnaval) não contam; vence 23/02**

- **Entrada:** publicação em **12/02/2026 (quinta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJRS** · modo conservador
- **Publicação / dia do começo:** 12/02/2026 (quinta-feira) · **início da contagem:** 13/02/2026 (sexta-feira)
- **Vencimento esperado:** **23/02/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 16/02/2026 TJRS: ato do Órgão Especial / Ato Conjunto 004/2026; 17/02/2026 TJRS: ato do Órgão Especial / Ato Conjunto 004/2026
- **Fundamento:** Ato 05/2025 do Órgão Especial do TJRS (lido em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 119. `tjrs-2026-dia-da-justica`

**TJRS 2026: 08/12 (Dia da Justiça) não conta**

- **Entrada:** publicação em **04/12/2026 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJRS** · modo conservador
- **Publicação / dia do começo:** 04/12/2026 (sexta-feira) · **início da contagem:** 07/12/2026 (segunda-feira)
- **Vencimento esperado:** **10/12/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 08/12/2026 TJRS: ato do Órgão Especial / Ato Conjunto 004/2026
- **Fundamento:** Ato 05/2025 do Órgão Especial do TJRS (lido em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 120. `tjrs-2026-ato-conjunto-energia`

**TJRS: 02/07/2026 teve os prazos suspensos (falta de energia); não conta**

- **Entrada:** publicação em **01/07/2026 (quarta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **TJRS** · modo conservador
- **Publicação / dia do começo:** 01/07/2026 (quarta-feira) · **início da contagem:** 03/07/2026 (sexta-feira)
- **Vencimento esperado:** **06/07/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 02/07/2026 TJRS: ato do Órgão Especial / Ato Conjunto 004/2026
- **Fundamento:** Ato Conjunto 004/2026 (P e CGJ), art. 1º (lido em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 121. `tjba-2026-carnaval`

**TJBA 2026: 12, 13, 16, 17 e 18/02 (Carnaval e Quarta-feira de Cinzas) não contam; vence 24/02**

- **Entrada:** publicação em **10/02/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJBA** · modo conservador
- **Publicação / dia do começo:** 10/02/2026 (terça-feira) · **início da contagem:** 11/02/2026 (quarta-feira)
- **Vencimento esperado:** **24/02/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 12/02/2026 TJBA: Decreto Judiciário 1050/2025 e 944/2026; 13/02/2026 TJBA: Decreto Judiciário 1050/2025 e 944/2026; 16/02/2026 TJBA: Decreto Judiciário 1050/2025 e 944/2026; 17/02/2026 TJBA: Decreto Judiciário 1050/2025 e 944/2026; 18/02/2026 TJBA: Decreto Judiciário 1050/2025 e 944/2026
- **Fundamento:** Decreto Judiciário TJBA 1050/2025, arts. 5º e 8º (lido em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 122. `tjba-2026-sao-joao`

**TJBA 2026: 22, 23 e 24/06 (São João) e 29/06 (Copa, Decreto 944/2026) não contam; vence 30/06**

- **Entrada:** publicação em **19/06/2026 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJBA** · modo conservador
- **Publicação / dia do começo:** 19/06/2026 (sexta-feira) · **início da contagem:** 25/06/2026 (quinta-feira)
- **Vencimento esperado:** **30/06/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 22/06/2026 TJBA: Decreto Judiciário 1050/2025 e 944/2026; 23/06/2026 TJBA: Decreto Judiciário 1050/2025 e 944/2026; 24/06/2026 TJBA: Decreto Judiciário 1050/2025 e 944/2026; 29/06/2026 TJBA: Decreto Judiciário 1050/2025 e 944/2026
- **Fundamento:** Decreto Judiciário TJBA 1050/2025, arts. 5º e 8º (lido em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 123. `tjba-2026-independencia-da-bahia`

**TJBA 2026: 02 e 03/07 (Independência da Bahia) não contam**

- **Entrada:** publicação em **01/07/2026 (quarta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJBA** · modo conservador
- **Publicação / dia do começo:** 01/07/2026 (quarta-feira) · **início da contagem:** 06/07/2026 (segunda-feira)
- **Vencimento esperado:** **08/07/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 02/07/2026 TJBA: Decreto Judiciário 1050/2025 e 944/2026; 03/07/2026 TJBA: Decreto Judiciário 1050/2025 e 944/2026
- **Fundamento:** Decreto Judiciário TJBA 1050/2025, arts. 5º e 8º (lido em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 124. `tjba-2026-copa-29-junho`

**TJBA: 29/06/2026 teve os prazos suspensos (jogo da Seleção na Copa); não conta**

- **Entrada:** publicação em **26/06/2026 (sexta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **TJBA** · modo conservador
- **Publicação / dia do começo:** 26/06/2026 (sexta-feira) · **início da contagem:** 30/06/2026 (terça-feira)
- **Vencimento esperado:** **01/07/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 29/06/2026 TJBA: Decreto Judiciário 1050/2025 e 944/2026
- **Fundamento:** Decreto Judiciário TJBA 944/2026, art. 3º (lido em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 125. `tjdf-2026-carnaval`

**TJDFT 2026: 16, 17 e 18/02 (Carnaval e Quarta-feira de Cinzas) não contam; vence 24/02**

- **Entrada:** publicação em **12/02/2026 (quinta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJDF** · modo conservador
- **Publicação / dia do começo:** 12/02/2026 (quinta-feira) · **início da contagem:** 13/02/2026 (sexta-feira)
- **Vencimento esperado:** **24/02/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 16/02/2026 TJDFT: Portaria Conjunta 105/2025 e 48/2026; 17/02/2026 TJDFT: Portaria Conjunta 105/2025 e 48/2026; 18/02/2026 TJDFT: Portaria Conjunta 105/2025 e 48/2026
- **Fundamento:** Portaria Conjunta TJDFT 105/2025, arts. 2º, 4º e 5º (lida em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 126. `tjdf-2026-semana-santa`

**TJDFT 2026: 01 a 03/04 (Semana Santa) não contam**

- **Entrada:** publicação em **31/03/2026 (terça-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **TJDF** · modo conservador
- **Publicação / dia do começo:** 31/03/2026 (terça-feira) · **início da contagem:** 06/04/2026 (segunda-feira)
- **Vencimento esperado:** **07/04/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 01/04/2026 TJDFT: Portaria Conjunta 105/2025 e 48/2026; 02/04/2026 TJDFT: Portaria Conjunta 105/2025 e 48/2026; 03/04/2026 TJDFT: Portaria Conjunta 105/2025 e 48/2026
- **Fundamento:** Portaria Conjunta TJDFT 105/2025, arts. 2º, 4º e 5º (lida em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 127. `tjdf-2026-ponto-facultativo-20-abril`

**TJDFT 2026: 20/04 (ponto facultativo) e 21/04 (Tiradentes) não contam**

- **Entrada:** publicação em **16/04/2026 (quinta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJDF** · modo conservador
- **Publicação / dia do começo:** 16/04/2026 (quinta-feira) · **início da contagem:** 17/04/2026 (sexta-feira)
- **Vencimento esperado:** **23/04/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 20/04/2026 TJDFT: Portaria Conjunta 105/2025 e 48/2026; 21/04/2026 Tiradentes
- **Fundamento:** Portaria Conjunta TJDFT 105/2025, arts. 2º, 4º e 5º (lida em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 128. `tjdf-2026-copa-24-junho`

**TJDFT: prazo que termina em 24/06/2026 (jogo da Seleção, expediente das 9h às 16h) é prorrogado para o primeiro dia útil**

- **Entrada:** publicação em **17/06/2026 (quarta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJDF** · modo conservador
- **Publicação / dia do começo:** 17/06/2026 (quarta-feira) · **início da contagem:** 18/06/2026 (quinta-feira)
- **Vencimento esperado:** **25/06/2026 (quinta-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 24/06/2026 TJDFT: jogo da Seleção, expediente das 9h às 16h (Portaria Conjunta 48/2026): protrai o vencimento (CPC, art. 224, § 1º)
- **Fundamento:** Portaria Conjunta TJDFT 48/2026, arts. 1º, IV, e 2º (lida em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 129. `tjdf-2026-copa-29-junho`

**TJDFT: 29/06/2026 (ponto facultativo no jogo das 14h) não conta**

- **Entrada:** publicação em **26/06/2026 (sexta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **TJDF** · modo conservador
- **Publicação / dia do começo:** 26/06/2026 (sexta-feira) · **início da contagem:** 30/06/2026 (terça-feira)
- **Vencimento esperado:** **01/07/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 29/06/2026 TJDFT: Portaria Conjunta 105/2025 e 48/2026
- **Fundamento:** Portaria Conjunta TJDFT 48/2026, art. 1º, I (redação da Portaria Conjunta 53/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 130. `tjsc-2026-carnaval`

**TJSC 2026: 16 e 17/02 (Carnaval) não contam; a Quarta-feira de Cinzas conta no meio do prazo**

- **Entrada:** publicação em **12/02/2026 (quinta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSC** · modo conservador
- **Publicação / dia do começo:** 12/02/2026 (quinta-feira) · **início da contagem:** 13/02/2026 (sexta-feira)
- **Vencimento esperado:** **23/02/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 16/02/2026 TJSC: Resolução GP 1/2026; 17/02/2026 TJSC: Resolução GP 1/2026
- **Fundamento:** Resolução GP TJSC 1/2026, Anexo Único (lida em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 131. `tjsc-2026-cinzas-vencimento`

**TJSC 2026: prazo que termina na Quarta-feira de Cinzas (expediente a partir das 12h) é protraído para o dia seguinte**

- **Entrada:** publicação em **12/02/2026 (quinta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **TJSC** · modo conservador
- **Publicação / dia do começo:** 12/02/2026 (quinta-feira) · **início da contagem:** 13/02/2026 (sexta-feira)
- **Vencimento esperado:** **19/02/2026 (quinta-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 16/02/2026 TJSC: Resolução GP 1/2026; 17/02/2026 TJSC: Resolução GP 1/2026; 18/02/2026 TJSC: expediente parcial (Cinzas às 12h; jogo da Seleção, Res. GP 31/2026): protrai o vencimento (CPC, art. 224, § 1º)
- **Fundamento:** Resolução GP TJSC 1/2026, Anexo Único (lida em 10/10/2026); CPC, arts. 219 e 224; Resolução GP 13/2022 (citada na notícia oficial de 13/02/2026)
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 132. `tjsc-2026-corpus-christi`

**TJSC 2026: 04/06 (Corpus Christi) não conta; 05/06 conta (não há emenda)**

- **Entrada:** publicação em **02/06/2026 (terça-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSC** · modo conservador
- **Publicação / dia do começo:** 02/06/2026 (terça-feira) · **início da contagem:** 03/06/2026 (quarta-feira)
- **Vencimento esperado:** **10/06/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 04/06/2026 TJSC: Resolução GP 1/2026
- **Fundamento:** Resolução GP TJSC 1/2026, Anexo Único (lida em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 133. `tjsc-2026-copa-24-junho`

**TJSC: prazo que termina em 24/06/2026 (jogo às 19h, expediente das 10h às 17h) é postergado para o primeiro dia útil**

- **Entrada:** publicação em **17/06/2026 (quarta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSC** · modo conservador
- **Publicação / dia do começo:** 17/06/2026 (quarta-feira) · **início da contagem:** 18/06/2026 (quinta-feira)
- **Vencimento esperado:** **25/06/2026 (quinta-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 24/06/2026 TJSC: expediente parcial (Cinzas às 12h; jogo da Seleção, Res. GP 31/2026): protrai o vencimento (CPC, art. 224, § 1º)
- **Fundamento:** Resolução GP TJSC 31/2026, arts. 1º, VI, e 2º (lida em 10/10/2026); CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 134. `tjsc-2026-dia-funcionario-publico`

**TJSC 2026: 28/10 (Dia do Funcionário Público, sem transferência para 30/10) não conta**

- **Entrada:** publicação em **26/10/2026 (segunda-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJSC** · modo conservador
- **Publicação / dia do começo:** 26/10/2026 (segunda-feira) · **início da contagem:** 27/10/2026 (terça-feira)
- **Vencimento esperado:** **30/10/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 28/10/2026 TJSC: Resolução GP 1/2026
- **Fundamento:** Resolução GP TJSC 1/2026, Anexo Único (lida em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 135. `tjsc-2026-dia-da-justica`

**TJSC 2026: 08/12 (Dia da Justiça, efeitos forenses) não conta**

- **Entrada:** publicação em **04/12/2026 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJSC** · modo conservador
- **Publicação / dia do começo:** 04/12/2026 (sexta-feira) · **início da contagem:** 07/12/2026 (segunda-feira)
- **Vencimento esperado:** **10/12/2026 (quinta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 08/12/2026 TJSC: Resolução GP 1/2026
- **Fundamento:** Resolução GP TJSC 1/2026, Anexo Único (lida em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 136. `tjpe-2026-carnaval`

**TJPE 2026: 16, 17 e 18/02 (Carnaval e Cinzas) não contam; vence 24/02**

- **Entrada:** publicação em **12/02/2026 (quinta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJPE** · modo conservador
- **Publicação / dia do começo:** 12/02/2026 (quinta-feira) · **início da contagem:** 13/02/2026 (sexta-feira)
- **Vencimento esperado:** **24/02/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 16/02/2026 TJPE: Ato Conjunto 43/2025 e Atos 966 e 977/2026; 17/02/2026 TJPE: Ato Conjunto 43/2025 e Atos 966 e 977/2026; 18/02/2026 TJPE: Ato Conjunto 43/2025 e Atos 966 e 977/2026
- **Fundamento:** Ato Conjunto TJPE 43/2025, art. 1º e parágrafo único (lido em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 137. `tjpe-2026-corpus-christi-transferido`

**TJPE 2026: Corpus Christi foi transferido para 22/06; 04/06 conta como dia útil**

- **Entrada:** publicação em **02/06/2026 (terça-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJPE** · modo conservador
- **Publicação / dia do começo:** 02/06/2026 (terça-feira) · **início da contagem:** 03/06/2026 (quarta-feira)
- **Vencimento esperado:** **05/06/2026 (sexta-feira)**
- **Alternativa (se os dias pendentes forem confirmados):** 08/06/2026 (segunda-feira)
- **Como foi contado (dias excluídos):** nenhum além do dia do começo
- **Fundamento:** Ato Conjunto TJPE 43/2025, art. 1º e parágrafo único (lido em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 138. `tjpe-2026-sao-joao`

**TJPE 2026: 22 a 26/06 e 29 e 30/06 (Corpus Christi, São João e feriados forenses de junho) não contam**

- **Entrada:** publicação em **19/06/2026 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJPE** · modo conservador
- **Publicação / dia do começo:** 19/06/2026 (sexta-feira) · **início da contagem:** 01/07/2026 (quarta-feira)
- **Vencimento esperado:** **03/07/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 22/06/2026 TJPE: Ato Conjunto 43/2025 e Atos 966 e 977/2026; 23/06/2026 TJPE: Ato Conjunto 43/2025 e Atos 966 e 977/2026; 24/06/2026 TJPE: Ato Conjunto 43/2025 e Atos 966 e 977/2026; 25/06/2026 TJPE: Ato Conjunto 43/2025 e Atos 966 e 977/2026; 26/06/2026 TJPE: Ato Conjunto 43/2025 e Atos 966 e 977/2026; 29/06/2026 TJPE: Ato Conjunto 43/2025 e Atos 966 e 977/2026; 30/06/2026 TJPE: Ato Conjunto 43/2025 e Atos 966 e 977/2026
- **Fundamento:** Ato Conjunto TJPE 43/2025, art. 1º e parágrafo único (lido em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 139. `tjpe-2026-dez-de-agosto`

**TJPE 2026: 10/08 (Dia dos Cursos Jurídicos, antecipado de 11/08) não conta; 11/08 conta**

- **Entrada:** publicação em **07/08/2026 (sexta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **TJPE** · modo conservador
- **Publicação / dia do começo:** 07/08/2026 (sexta-feira) · **início da contagem:** 11/08/2026 (terça-feira)
- **Vencimento esperado:** **12/08/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 10/08/2026 TJPE: Ato Conjunto 43/2025 e Atos 966 e 977/2026
- **Fundamento:** Ato Conjunto TJPE 43/2025, art. 1º e parágrafo único (lido em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 140. `tjpe-2026-dia-servidor`

**TJPE 2026: 30/10 (Dia do Servidor, transferido de 28/10) e Finados (02/11) não contam**

- **Entrada:** publicação em **28/10/2026 (quarta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **TJPE** · modo conservador
- **Publicação / dia do começo:** 28/10/2026 (quarta-feira) · **início da contagem:** 29/10/2026 (quinta-feira)
- **Vencimento esperado:** **03/11/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 30/10/2026 TJPE: Ato Conjunto 43/2025 e Atos 966 e 977/2026; 02/11/2026 Finados
- **Fundamento:** Ato Conjunto TJPE 43/2025, art. 1º e parágrafo único (lido em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 141. `tjpe-2026-pje-maio`

**TJPE: prazos suspensos de 11 a 15/05/2026 por instabilidade do PJe**

- **Entrada:** publicação em **08/05/2026 (sexta-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJPE** · modo conservador
- **Publicação / dia do começo:** 08/05/2026 (sexta-feira) · **início da contagem:** 18/05/2026 (segunda-feira)
- **Vencimento esperado:** **20/05/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 11/05/2026 TJPE: Ato Conjunto 43/2025 e Atos 966 e 977/2026; 12/05/2026 TJPE: Ato Conjunto 43/2025 e Atos 966 e 977/2026; 13/05/2026 TJPE: Ato Conjunto 43/2025 e Atos 966 e 977/2026; 14/05/2026 TJPE: Ato Conjunto 43/2025 e Atos 966 e 977/2026; 15/05/2026 TJPE: Ato Conjunto 43/2025 e Atos 966 e 977/2026
- **Fundamento:** Atos TJPE 966/2026 e 977/2026, art. 1º (lidos em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 142. `tjce-2026-carnaval`

**TJCE 2026: 16 e 17/02 (Carnaval, ponto facultativo) não contam; Cinzas conta no meio do prazo**

- **Entrada:** publicação em **12/02/2026 (quinta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJCE** · modo conservador
- **Publicação / dia do começo:** 12/02/2026 (quinta-feira) · **início da contagem:** 13/02/2026 (sexta-feira)
- **Vencimento esperado:** **23/02/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 16/02/2026 TJCE: Portaria 2924/2025 e 1169/2026; 17/02/2026 TJCE: Portaria 2924/2025 e 1169/2026
- **Fundamento:** Portaria TJCE 2924/2025, art. 1º e Anexo Único (lida em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 143. `tjce-2026-cinzas-vencimento`

**TJCE 2026: prazo que termina na Quarta-feira de Cinzas (ponto facultativo até as 14h) é protraído para o dia seguinte**

- **Entrada:** publicação em **12/02/2026 (quinta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **TJCE** · modo conservador
- **Publicação / dia do começo:** 12/02/2026 (quinta-feira) · **início da contagem:** 13/02/2026 (sexta-feira)
- **Vencimento esperado:** **19/02/2026 (quinta-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 16/02/2026 TJCE: Portaria 2924/2025 e 1169/2026; 17/02/2026 TJCE: Portaria 2924/2025 e 1169/2026; 18/02/2026 TJCE: expediente reduzido (Cinzas, Portarias 1401 e 1440/2026): protrai o vencimento (CPC, art. 224, § 1º)
- **Fundamento:** Portaria TJCE 2924/2025, art. 1º e Anexo Único (lida em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 144. `tjce-2026-sao-jose-data-magna`

**TJCE 2026: 19/03 (São José, ponto facultativo) e 25/03 (Data Magna do Ceará) não contam**

- **Entrada:** publicação em **17/03/2026 (terça-feira)** · prazo de **6 dias** (CPC, dias úteis) · tribunal **TJCE** · modo conservador
- **Publicação / dia do começo:** 17/03/2026 (terça-feira) · **início da contagem:** 18/03/2026 (quarta-feira)
- **Vencimento esperado:** **27/03/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 19/03/2026 TJCE: Portaria 2924/2025 e 1169/2026; 25/03/2026 TJCE: Portaria 2924/2025 e 1169/2026
- **Fundamento:** Portaria TJCE 2924/2025, art. 1º e Anexo Único (lida em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 145. `tjce-2026-corpus-christi`

**TJCE 2026: 04/06 (Corpus Christi) e 05/06 (Portaria 1169/2026, ponto facultativo) não contam**

- **Entrada:** publicação em **02/06/2026 (terça-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJCE** · modo conservador
- **Publicação / dia do começo:** 02/06/2026 (terça-feira) · **início da contagem:** 03/06/2026 (quarta-feira)
- **Vencimento esperado:** **09/06/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 04/06/2026 TJCE: Portaria 2924/2025 e 1169/2026; 05/06/2026 TJCE: Portaria 2924/2025 e 1169/2026
- **Fundamento:** Portaria TJCE 2924/2025, art. 1º e Anexo Único (lida em 10/10/2026); CPC, arts. 219 e 224; Portaria TJCE 1169/2026, art. 1º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 146. `tjce-2026-copa-24-junho`

**TJCE: prazo que termina em 24/06/2026 (expediente único das 8h às 15h) é prorrogado para o primeiro dia útil**

- **Entrada:** publicação em **17/06/2026 (quarta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJCE** · modo conservador
- **Publicação / dia do começo:** 17/06/2026 (quarta-feira) · **início da contagem:** 18/06/2026 (quinta-feira)
- **Vencimento esperado:** **25/06/2026 (quinta-feira)** · prorrogado
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 24/06/2026 TJCE: expediente reduzido (Cinzas, Portarias 1401 e 1440/2026): protrai o vencimento (CPC, art. 224, § 1º)
- **Fundamento:** Portaria TJCE 1401/2026, art. 1º (lida em 10/10/2026); CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 147. `tjce-2026-copa-29-junho`

**TJCE: o começo do prazo em 29/06/2026 (expediente único das 8h às 12h) é postergado**

- **Entrada:** publicação em **26/06/2026 (sexta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **TJCE** · modo conservador
- **Publicação / dia do começo:** 26/06/2026 (sexta-feira) · **início da contagem:** 30/06/2026 (terça-feira)
- **Vencimento esperado:** **01/07/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos; 29/06/2026 TJCE: expediente reduzido (Cinzas, Portarias 1401 e 1440/2026): protrai o dia do começo
- **Fundamento:** Portaria TJCE 1440/2026, art. 1º (lida em 10/10/2026); CPC, art. 224, § 1º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 148. `tjce-2026-dia-servidor`

**TJCE 2026: 28/10 (Dia do Servidor Público Estadual, sem transferência) não conta**

- **Entrada:** publicação em **26/10/2026 (segunda-feira)** · prazo de **3 dias** (CPC, dias úteis) · tribunal **TJCE** · modo conservador
- **Publicação / dia do começo:** 26/10/2026 (segunda-feira) · **início da contagem:** 27/10/2026 (terça-feira)
- **Vencimento esperado:** **30/10/2026 (sexta-feira)**
- **Como foi contado (dias excluídos):** 28/10/2026 TJCE: Portaria 2924/2025 e 1169/2026
- **Fundamento:** Portaria TJCE 2924/2025, art. 1º e Anexo Único (lida em 10/10/2026); CPC, arts. 219 e 224
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____

### 149. `tjpr-19-dezembro-nao-feriado`

**TJPR: 19 de dezembro não é feriado civil (Lei estadual PR 18.384/2014, art. 1º); sem decreto lido, conta como dia útil**

- **Entrada:** publicação em **18/12/2025 (quinta-feira)** · prazo de **1 dias** (CPC, dias úteis) · tribunal **TJPR** · modo conservador
- **Publicação / dia do começo:** 18/12/2025 (quinta-feira) · **início da contagem:** 19/12/2025 (sexta-feira)
- **Vencimento esperado:** **19/12/2025 (sexta-feira)**
- **Como foi contado (dias excluídos):** nenhum além do dia do começo
- **Fundamento:** Lei PR 18.384/2014, art. 1º; Decreto Judiciário TJPR 759/2018
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 150. `tjdf-dia-evangelico-util`

**TJDF: 30 de novembro (Dia do Evangélico, lei distrital) conta como dia útil: o TJDFT é órgão federal**

- **Entrada:** publicação em **27/11/2026 (sexta-feira)** · prazo de **2 dias** (CPC, dias úteis) · tribunal **TJDF** · modo conservador
- **Publicação / dia do começo:** 27/11/2026 (sexta-feira) · **início da contagem:** 30/11/2026 (segunda-feira)
- **Vencimento esperado:** **01/12/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Lei 9.093/1995, art. 1º; aviso do TJDFT de 26/11/2020
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

## Intimação eletrônica

### 151. `portal-segunda`

**Intimação eletrônica: consulta na segunda; dia do começo na terça; contagem a partir de quarta**

- **Entrada:** consulta à intimação eletrônica em **09/03/2026 (segunda-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 10/03/2026 (terça-feira) · **início da contagem:** 11/03/2026 (quarta-feira)
- **Vencimento esperado:** **17/03/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, arts. 224, caput, e 231, V; Lei 11.419/2006, art. 5º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 152. `portal-sexta`

**Intimação eletrônica: consulta na sexta; dia do começo na segunda**

- **Entrada:** consulta à intimação eletrônica em **13/03/2026 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 16/03/2026 (segunda-feira) · **início da contagem:** 17/03/2026 (terça-feira)
- **Vencimento esperado:** **23/03/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, arts. 224, caput, e 231, V; Lei 11.419/2006, art. 5º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 153. `portal-sabado`

**Intimação eletrônica: consulta no sábado; a intimação se realiza na segunda (dia do começo) e a contagem começa na terça (leitura A, validada)**

- **Entrada:** consulta à intimação eletrônica em **14/03/2026 (sábado)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 16/03/2026 (segunda-feira) · **início da contagem:** 17/03/2026 (terça-feira)
- **Vencimento esperado:** **23/03/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, art. 231, V; Lei 11.419/2006, art. 5º, § 2º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 154. `portal-feriado`

**Intimação eletrônica: consulta na véspera de Tiradentes; dia do começo é o dia útil seguinte**

- **Entrada:** consulta à intimação eletrônica em **20/04/2026 (segunda-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 22/04/2026 (quarta-feira) · **início da contagem:** 23/04/2026 (quinta-feira)
- **Vencimento esperado:** **29/04/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, art. 231, V; Lei 662/1949, art. 1º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 155. `portal-recesso`

**Intimação eletrônica consultada em 19/12/2025: o dia do começo é 21/01/2026, depois do recesso**

- **Entrada:** consulta à intimação eletrônica em **19/12/2025 (sexta-feira)** · prazo de **5 dias** (CPC, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 21/01/2026 (quarta-feira) · **início da contagem:** 22/01/2026 (quinta-feira)
- **Vencimento esperado:** **28/01/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** CPC, arts. 220 e 231, V; Lei 11.419/2006, art. 5º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

## Juizados Especiais

### 156. `jef-5d-embargos`

**JEF: embargos de declaração em 5 dias úteis (Lei 9.099, art. 49)**

- **Entrada:** publicação em **10/03/2026 (terça-feira)** · prazo de **5 dias** (JEF, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 10/03/2026 (terça-feira) · **início da contagem:** 11/03/2026 (quarta-feira)
- **Vencimento esperado:** **17/03/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 2 sábados/domingos
- **Fundamento:** Lei 9.099/1995, art. 12-A (dias úteis); art. 49
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 157. `jef-10d-recurso`

**JEF: recurso inominado em 10 dias úteis (Lei 9.099, arts. 42 e 12-A)**

- **Entrada:** publicação em **10/03/2026 (terça-feira)** · prazo de **10 dias** (JEF, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 10/03/2026 (terça-feira) · **início da contagem:** 11/03/2026 (quarta-feira)
- **Vencimento esperado:** **24/03/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos
- **Fundamento:** Lei 9.099/1995, art. 12-A (dias úteis); art. 42
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 158. `jef-dobro-ignorado`

**JEF: o prazo em dobro não é aplicado a ente público (Lei 10.259, art. 9º; Lei 12.153, art. 7º)**

- **Entrada:** publicação em **10/03/2026 (terça-feira)** · prazo de **10 dias** (JEF, dias úteis) · tribunal **TJSP** · modo conservador · prazo em dobro
- **Publicação / dia do começo:** 10/03/2026 (terça-feira) · **início da contagem:** 11/03/2026 (quarta-feira)
- **Vencimento esperado:** **24/03/2026 (terça-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos
- **Fundamento:** Lei 9.099/1995, art. 12-A (dias úteis); Lei 10.259/2001, art. 9º; Lei 12.153/2009, art. 7º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 159. `jef-recesso`

**JEF: a suspensão de 20/12 a 20/01 vale nos Juizados (Res. CNJ 244/2016, art. 3º)**

- **Entrada:** publicação em **15/12/2025 (segunda-feira)** · prazo de **10 dias** (JEF, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 15/12/2025 (segunda-feira) · **início da contagem:** 16/12/2025 (terça-feira)
- **Vencimento esperado:** **28/01/2026 (quarta-feira)**
- **Como foi contado (dias excluídos):** 12 sábados/domingos; suspensão de 22 dias (22/12/2025 a 20/01/2026)
- **Fundamento:** Res. CNJ 244/2016, art. 3º; CPC, art. 220; Lei 9.099/1995, art. 12-A
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 160. `jef-recesso-desligado`

**JEF: suspensão desligada pelo usuário conta o recesso (resultado de quem opta por não suspender)**

- **Entrada:** publicação em **15/12/2025 (segunda-feira)** · prazo de **10 dias** (JEF, dias úteis) · tribunal **TJSP** · modo conservador · suspensão desligada pelo usuário
- **Publicação / dia do começo:** 15/12/2025 (segunda-feira) · **início da contagem:** 16/12/2025 (terça-feira)
- **Vencimento esperado:** **30/12/2025 (terça-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos; 25/12/2025 Natal
- **Fundamento:** Opção do usuário; ver Res. CNJ 244/2016, art. 3º
- **Calendário do tribunal verificado:** não
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

### 161. `jef-dje-sexta`

**JEF: disponibilização na sexta 13/03, publicação na segunda, recurso inominado de 10 dias úteis**

- **Entrada:** disponibilização no DJe em **13/03/2026 (sexta-feira)** · prazo de **10 dias** (JEF, dias úteis) · tribunal **TJSP** · modo conservador
- **Publicação / dia do começo:** 16/03/2026 (segunda-feira) · **início da contagem:** 17/03/2026 (terça-feira)
- **Vencimento esperado:** **30/03/2026 (segunda-feira)**
- **Como foi contado (dias excluídos):** 4 sábados/domingos
- **Fundamento:** Lei 9.099/1995, arts. 42 e 12-A; CPC, art. 224, § 2º
- **Calendário do tribunal verificado:** sim
- **Validação jurídica:** ☑ validado por Junior Aguiar (revisor jurídico) em 2026-10-07

