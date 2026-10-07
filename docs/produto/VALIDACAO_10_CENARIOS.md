# Validação dos 10 cenários mais importantes

> Para quem é: o revisor jurídico (você). Tempo estimado: 15 a 20 minutos.
> O que fazer: em cada caso abaixo, confira a **regra**, refaça a contagem olhando o calendário, e diga se a data do sistema está **certa** ou **errada**. Se errada, diga a data certa e o motivo.
> O que NÃO é preciso: ler código, nem conferir o calendário de feriados do tribunal (isso já foi lido nos atos oficiais, ver `VERIFICACAO_FONTES.md`). Aqui se valida a **regra de contagem**.

Convenções usadas em todos os casos:

- O **dia do começo não conta**; o dia do vencimento conta (CPC, art. 224, caput).
- Em **dias úteis**, sábados, domingos, feriados e dias sem expediente não contam (CPC, arts. 216 e 219).
- Quando a intimação é pelo Diário, a **publicação** é o primeiro dia útil depois da disponibilização, e a contagem começa no dia útil seguinte à publicação (CPC, art. 224, §§ 2º e 3º).
- Os dados de calendário usados (TJSP, STJ etc.) são os de 2026 já conferidos nos atos oficiais.

Cada resposta sua vale para os outros cenários parecidos do arquivo `packages/prazozero/cenarios/cenarios.json` (121 no total): se a regra está certa aqui, a mesma regra está certa lá.

---

## 1. Apelação no TJSP, intimação pelo Diário

**Dados:** Disponibilização no Diário de Justiça eletrônico em 10/03/2026; apelação, 15 dias úteis; TJSP.

**Regra a conferir:** CPC, art. 224, §§ 2º e 3º (publicação no 1º dia útil seguinte à disponibilização; contagem começa no dia útil seguinte à publicação) e art. 219 (só dias úteis).

**O sistema diz:** o prazo final é **01/04/2026 (quarta-feira)**.

Como o sistema contou:

| Data | Dia | O que aconteceu |
|---|---|---|
| 10/03 | terça | Disponibilização da intimação no Diário de Justiça eletrônico (não conta) |
| 11/03 | quarta | Data considerada de publicação oficial do ato (não conta) |
| 12/03 | quinta | **1º dia contado** |
| 13/03 | sexta | **2º dia contado** |
| 14/03 | sábado | Sábado (não conta) |
| 15/03 | domingo | Domingo (não conta) |
| 16/03 | segunda | **3º dia contado** |
| 17/03 | terça | **4º dia contado** |
| 18/03 | quarta | **5º dia contado** |
| 19/03 | quinta | **6º dia contado** |
| 20/03 | sexta | **7º dia contado** |
| 21/03 | sábado | Sábado (não conta) |
| 22/03 | domingo | Domingo (não conta) |
| 23/03 | segunda | **8º dia contado** |
| 24/03 | terça | **9º dia contado** |
| 25/03 | quarta | **10º dia contado** |
| 26/03 | quinta | **11º dia contado** |
| 27/03 | sexta | **12º dia contado** |
| 28/03 | sábado | Sábado (não conta) |
| 29/03 | domingo | Domingo (não conta) |
| 30/03 | segunda | **13º dia contado** |
| 31/03 | terça | **14º dia contado** |
| 01/04 | quarta | **15º dia contado** (último dia do prazo) |

**Sua resposta:** ( ) certo   ( ) errado. Se errado, qual seria a data e por quê?

---

## 2. Prazo que atravessa um feriado nacional

**Dados:** Publicação em 14/04/2026; 5 dias úteis; TJSP. Terça, 21/04, é Tiradentes; e o TJSP suspendeu o expediente na segunda, 20/04 (Provimento CSM 2.813/2025).

**Regra a conferir:** CPC, art. 219 e art. 216 (feriado não conta); Lei 662/1949 (Tiradentes).

**O sistema diz:** o prazo final é **23/04/2026 (quinta-feira)**.

Como o sistema contou:

| Data | Dia | O que aconteceu |
|---|---|---|
| 14/04 | terça | Dia do começo do prazo (não conta) |
| 15/04 | quarta | **1º dia contado** |
| 16/04 | quinta | **2º dia contado** |
| 17/04 | sexta | **3º dia contado** |
| 18/04 | sábado | Sábado (não conta) |
| 19/04 | domingo | Domingo (não conta) |
| 20/04 | segunda | Suspensão do expediente (não conta) |
| 21/04 | terça | Tiradentes (Lei Federal nº 662/1949, art. 1º (redação da Lei nº 10.607/2002)) (não conta) |
| 22/04 | quarta | **4º dia contado** |
| 23/04 | quinta | **5º dia contado** (último dia do prazo) |

**Sua resposta:** ( ) certo   ( ) errado. Se errado, qual seria a data e por quê?

---

## 3. Prazo que atravessa o recesso de fim de ano

**Dados:** Publicação em 15/12/2025; 15 dias úteis; TJSP.

**Regra a conferir:** CPC, art. 220 (prazo suspenso de 20/12 a 20/01, inclusive) e art. 219.

**O sistema diz:** o prazo final é **04/02/2026 (quarta-feira)**.

Como o sistema contou:

| Data | Dia | O que aconteceu |
|---|---|---|
| 15/12 | segunda | Dia do começo do prazo (não conta) |
| 16/12 | terça | **1º dia contado** |
| 17/12 | quarta | **2º dia contado** |
| 18/12 | quinta | **3º dia contado** |
| 19/12 | sexta | **4º dia contado** |
| 20/12 | sábado | Sábado (não conta) |
| 21/12 | domingo | Domingo (não conta) |
| 22/12 a 20/01 | | Prazo **suspenso** (CPC, art. 220); não conta nenhum dia, nem fim de semana |
| 21/01 | quarta | **5º dia contado** |
| 22/01 | quinta | **6º dia contado** |
| 23/01 | sexta | **7º dia contado** |
| 24/01 | sábado | Sábado (não conta) |
| 25/01 | domingo | Domingo (não conta) |
| 26/01 | segunda | **8º dia contado** |
| 27/01 | terça | **9º dia contado** |
| 28/01 | quarta | **10º dia contado** |
| 29/01 | quinta | **11º dia contado** |
| 30/01 | sexta | **12º dia contado** |
| 31/01 | sábado | Sábado (não conta) |
| 01/02 | domingo | Domingo (não conta) |
| 02/02 | segunda | **13º dia contado** |
| 03/02 | terça | **14º dia contado** |
| 04/02 | quarta | **15º dia contado** (último dia do prazo) |

**Sua resposta:** ( ) certo   ( ) errado. Se errado, qual seria a data e por quê?

---

## 4. Defensoria Pública: embargos de declaração em dobro

**Dados:** Intimação pessoal, por carga, em 10/03/2026; embargos de declaração (5 dias úteis, dobrados para 10); TJSP.

**Regra a conferir:** CPC, art. 1.023 (5 dias), art. 186 (Defensoria: prazo em dobro, contado da intimação pessoal) e art. 219.

**O sistema diz:** o prazo final é **24/03/2026 (terça-feira)**.

Como o sistema contou:

| Data | Dia | O que aconteceu |
|---|---|---|
| 10/03 | terça | Dia do começo do prazo (não conta) |
| 11/03 | quarta | **1º dia contado** |
| 12/03 | quinta | **2º dia contado** |
| 13/03 | sexta | **3º dia contado** |
| 14/03 | sábado | Sábado (não conta) |
| 15/03 | domingo | Domingo (não conta) |
| 16/03 | segunda | **4º dia contado** |
| 17/03 | terça | **5º dia contado** |
| 18/03 | quarta | **6º dia contado** |
| 19/03 | quinta | **7º dia contado** |
| 20/03 | sexta | **8º dia contado** |
| 21/03 | sábado | Sábado (não conta) |
| 22/03 | domingo | Domingo (não conta) |
| 23/03 | segunda | **9º dia contado** |
| 24/03 | terça | **10º dia contado** (último dia do prazo) |

**Sua resposta:** ( ) certo   ( ) errado. Se errado, qual seria a data e por quê?

---

## 5. Trabalhista: recurso ordinário

**Dados:** Publicação em 04/03/2026; recurso ordinário, 8 dias úteis; regime CLT; TST.

**Regra a conferir:** CLT, art. 895 (recurso ordinário, 8 dias) e art. 775 (prazos em dias úteis).

**O sistema diz:** o prazo final é **16/03/2026 (segunda-feira)**.

Como o sistema contou:

| Data | Dia | O que aconteceu |
|---|---|---|
| 04/03 | quarta | Dia do começo do prazo (não conta) |
| 05/03 | quinta | **1º dia contado** |
| 06/03 | sexta | **2º dia contado** |
| 07/03 | sábado | Sábado (não conta) |
| 08/03 | domingo | Domingo (não conta) |
| 09/03 | segunda | **3º dia contado** |
| 10/03 | terça | **4º dia contado** |
| 11/03 | quarta | **5º dia contado** |
| 12/03 | quinta | **6º dia contado** |
| 13/03 | sexta | **7º dia contado** |
| 14/03 | sábado | Sábado (não conta) |
| 15/03 | domingo | Domingo (não conta) |
| 16/03 | segunda | **8º dia contado** (último dia do prazo) |

**Sua resposta:** ( ) certo   ( ) errado. Se errado, qual seria a data e por quê?

---

## 6. Criminal: prazo de 5 dias corridos que vence no domingo

**Dados:** Publicação em 10/03/2026; 5 dias corridos (apelação criminal); TJSP.

**Regra a conferir:** CPP, art. 798, caput (dias corridos) e § 3º (se o prazo vence em dia não útil, vai ao primeiro dia útil seguinte).

**O sistema diz:** o prazo final é **16/03/2026 (segunda-feira)**.

Como o sistema contou:

| Data | Dia | O que aconteceu |
|---|---|---|
| 10/03 | terça | Dia do começo do prazo (não conta) |
| 11/03 | quarta | **1º dia contado** |
| 12/03 | quinta | **2º dia contado** |
| 13/03 | sexta | **3º dia contado** |
| 14/03 | sábado | **4º dia contado** |
| 15/03 | domingo | **5º dia contado** (último dia do prazo) |
| 16/03 | segunda | **Vencimento prorrogado** para este dia útil (último dia do prazo) |

**Sua resposta:** ( ) certo   ( ) errado. Se errado, qual seria a data e por quê?

---

## 7. Juizado Especial: recurso inominado

**Dados:** Publicação em 10/03/2026; 10 dias úteis; TJSP (Juizado).

**Regra a conferir:** Lei 9.099/1995, art. 42 (10 dias) e art. 12-A (dias úteis).

**O sistema diz:** o prazo final é **24/03/2026 (terça-feira)**.

Como o sistema contou:

| Data | Dia | O que aconteceu |
|---|---|---|
| 10/03 | terça | Dia do começo do prazo (não conta) |
| 11/03 | quarta | **1º dia contado** |
| 12/03 | quinta | **2º dia contado** |
| 13/03 | sexta | **3º dia contado** |
| 14/03 | sábado | Sábado (não conta) |
| 15/03 | domingo | Domingo (não conta) |
| 16/03 | segunda | **4º dia contado** |
| 17/03 | terça | **5º dia contado** |
| 18/03 | quarta | **6º dia contado** |
| 19/03 | quinta | **7º dia contado** |
| 20/03 | sexta | **8º dia contado** |
| 21/03 | sábado | Sábado (não conta) |
| 22/03 | domingo | Domingo (não conta) |
| 23/03 | segunda | **9º dia contado** |
| 24/03 | terça | **10º dia contado** (último dia do prazo) |

**Sua resposta:** ( ) certo   ( ) errado. Se errado, qual seria a data e por quê?

---

## 8. STJ: férias coletivas de julho

**Dados:** Publicação em 30/06/2026; 5 dias úteis; STJ.

**Regra a conferir:** LC 35/1979, art. 66, § 1º; Regimento Interno do STJ, arts. 81 e 106 (prazos suspensos de 2 a 31 de julho no STJ). Nos TJs, em julho os prazos correm.

**O sistema diz:** o prazo final é **06/08/2026 (quinta-feira)**.

Como o sistema contou:

| Data | Dia | O que aconteceu |
|---|---|---|
| 30/06 | terça | Dia do começo do prazo (não conta) |
| 01/07 | quarta | **1º dia contado** |
| 02/07 a 31/07 | | Prazo **suspenso** (LC 35/1979, art. 66, § 1º; RISTJ, arts. 81 e 106 (Portarias STJ/GP 941/2025 e 455/2026)); não conta nenhum dia, nem fim de semana |
| 01/08 | sábado | Sábado (não conta) |
| 02/08 | domingo | Domingo (não conta) |
| 03/08 | segunda | **2º dia contado** |
| 04/08 | terça | **3º dia contado** |
| 05/08 | quarta | **4º dia contado** |
| 06/08 | quinta | **5º dia contado** (último dia do prazo) |

**Sua resposta:** ( ) certo   ( ) errado. Se errado, qual seria a data e por quê?

---

## 9. Mandado de segurança: prazo para impetrar

**Dados:** o impetrante teve ciência do ato impugnado em 02/03/2026 (segunda-feira).

**Regra a conferir:** Lei 12.016/2009, art. 23 (120 dias, contados da ciência); Código Civil, art. 132 (exclui o dia do começo, inclui o do vencimento) e art. 207 (decadência não se suspende nem se interrompe). Dias **corridos**.

**O sistema diz:** o último dia para impetrar é **30/06/2026 (terça-feira)**.

Conferência: 02/03 + 120 dias corridos. Março tem 29 dias restantes, abril 30, maio 31 e junho 30 até o dia 30: 29 + 30 + 31 + 30 = 120.

**Sua resposta:** ( ) certo   ( ) errado. Se errado, qual seria a data e por quê?

---

## 10. Ação rescisória: prazo de 2 anos que vence no recesso

**Dados:** a última decisão transitou em julgado em 20/12/2024 (sexta-feira). Ação a propor em tribunal que segue o recesso do CPC (sem tribunal específico).

**Regra a conferir:** CPC, art. 975 (2 anos do trânsito em julgado) e § 1º (se o prazo expira em férias forenses, recesso, feriado ou dia sem expediente, prorroga-se ao primeiro dia útil seguinte); Código Civil, art. 132, § 3º (anos expiram no dia de igual número).

**O sistema diz:** dois anos depois é 20/12/2026 (domingo, e dentro do recesso de 20/12 a 20/01); o último dia é **21/01/2027 (quinta-feira)**, o primeiro dia útil depois do recesso.

**Sua resposta:** ( ) certo   ( ) errado. Se errado, qual seria a data e por quê?

---

