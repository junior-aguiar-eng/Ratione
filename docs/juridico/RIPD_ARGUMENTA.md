# RELATÓRIO DE IMPACTO À PROTEÇÃO DE DADOS PESSOAIS (RIPD): ARGUMENTA

**Versão:** 0.1 (minuta) · **Elaborado em:** 04/11/2026 · **Vigência:** [DATA_VIGENCIA]

> RASCUNHO PARA REVISÃO DO RESPONSÁVEL E DO ADVOGADO DE DIREITO DIGITAL. Não publicar nem tratar como definitivo sem essa revisão.
> **Como foi feito:** a descrição do tratamento e das salvaguardas vem do código e dos documentos do produto (`docs/produto/ARGUMENTA.md`, `IA_TAREFAS.md`, `PLANOS_E_COBRANCA.md`, `docs/juridico/POLITICA_DE_USO_DE_IA.md` e `POLITICA_DE_PRIVACIDADE.md`). O texto da lei foi lido na versão compilada do Planalto (Lei 13.709/2018, em 04/11/2026). Itens marcados **[CONFIRMAR]** dependem de decisão ou conferência do responsável; **[FUTURO]** descreve o que ainda não existe.

---

## 1. Para que serve e o que a lei exige

O RIPD é a documentação do controlador que descreve os processos de tratamento que podem gerar riscos às liberdades civis e aos direitos fundamentais, com as medidas, salvaguardas e mecanismos de mitigação (LGPD, art. 5º, XVII). A ANPD pode determinar sua elaboração (art. 38, *caput*). O conteúdo mínimo é: **(1)** a descrição dos tipos de dados coletados, **(2)** a metodologia usada para a coleta e para a garantia da segurança das informações e **(3)** a análise do controlador sobre as medidas, salvaguardas e mecanismos de mitigação de risco adotados (art. 38, parágrafo único). As seções 4, 5 e 6 abaixo seguem essa ordem.

O PLANO (§8) exige este relatório **antes do Argumenta com upload de arquivos** (F5-01). Ele cobre também o que já existe: a análise de decisão **colada** como texto.

## 2. Identificação e escopo

| Item | Situação |
|---|---|
| Controlador (conta, cobrança, uso) | [NOME_RESPONSAVEL], [CPF_OU_CNPJ]. Ainda não há pessoa jurídica (PLANO §8): o fornecedor é pessoa física **[CONFIRMAR]** |
| Papel quanto ao conteúdo das decisões | **Operador**, em nome do usuário (que é o controlador do que cola). Política de Privacidade e minutas partem dessa premissa **[CONFIRMAR com o advogado: operador ou controlador conjunto, já que o Ratione decide meios e finalidade da análise]** |
| Suboperadores | Anthropic (modelo de IA, API); Google Cloud (hospedagem, Cloud Run em São Paulo); Supabase (banco e autenticação) **[CONFIRMAR a região e o contrato de cada um]** |
| Encarregado (art. 41) | [NOME] · [EMAIL_PRIVACIDADE] **[CONFIRMAR enquadramento como agente de pequeno porte, Res. CD/ANPD nº 2/2022, e se a dispensa vale aqui]** |
| Tratamento coberto | **Hoje:** análise de decisão colada, sob demanda, três etapas de IA, sem guarda do texto. **[FUTURO]:** envio de arquivos com armazenamento privado e extração (F5-01 e F5-02), só depois da revisão deste relatório (seção 7) |
| Fora do escopo | PrazoZero, NormaViva e TeseMap, que não tratam dado pessoal de terceiros (só o do usuário, na conta) |

## 3. Descrição do tratamento

**Finalidade.** Ajudar profissionais e estudantes de Direito a localizar, numa decisão judicial que eles mesmos colam, a estrutura, as questões, as conclusões e os fundamentos, com o parágrafo de origem. É ferramenta de apoio: não decide nada sobre pessoa alguma e não gera perfil de titular.

**Fluxo** (`ARGUMENTA.md` §2):

1. A pessoa logada cola o texto e clica em "Analisar decisão" (nunca automático).
2. **No navegador**, o texto é segmentado em parágrafos e **pseudonimizado**: CPF, CNPJ, RG, OAB, número CNJ, e-mail, telefone, CEP, endereço com número e nomes de partes e advogados **rotulados** viram marcadores (`[PARTE_1]`, `[CPF_1]`…). A tabela de troca fica só na tela. A tela mostra o texto exatamente como será enviado e aceita outros nomes a ocultar.
3. O servidor recebe o texto já pseudonimizado, **confere de novo** com a mesma detecção e **recusa** (400) se ainda achar dado pessoal.
4. O servidor envia o texto à Anthropic (Claude Haiku 5.5), em três chamadas fechadas (estrutura, questões, fundamentos), **sem ferramentas e sem busca**.
5. A resposta volta com marcadores; os dados reais são restaurados **só na tela**.
6. O texto e a resposta **não ficam guardados**. Ficam só o registro de uso e os metadados da análise (seção 4).

**Base legal.** Para os dados da conta e do uso: execução de contrato (art. 7º, V) **[CONFIRMAR]**. Para o conteúdo das decisões, o controlador é o usuário, que declara base legal própria (os Termos transferem a declaração ao usuário). Decisões judiciais públicas e dados tornados manifestamente públicos têm tratamento próprio (art. 7º, §§ 3º e 4º) **[CONFIRMAR com o advogado]**.

**Princípios do art. 6º** (resumo da análise; a necessidade e a segurança estão detalhadas nas seções 4 e 5):

| Princípio | Como é atendido |
|---|---|
| Finalidade, adequação | Uso só para a análise pedida; tarefas fechadas, sem conversa nem uso posterior |
| Necessidade | Pseudonimização antes do envio; sem guarda do conteúdo; só o hash fica |
| Transparência | Política de Uso de IA e de Privacidade; a tela mostra o que será enviado e o que foi trocado; resultado marcado como gerado por IA |
| Livre acesso | O usuário exporta e exclui os próprios dados (registro de uso, análises) |
| Qualidade dos dados | Cada resultado traz o parágrafo de origem; selo das citações (F5-04); avaliação com 30 decisões (F5-05) |
| Segurança, prevenção | Seção 4 |
| Não discriminação | A ferramenta não classifica pessoas nem decide sobre elas; analisa a estrutura de textos |
| Responsabilização | Registro de uso por chamada; este relatório; catálogo de tarefas versionado |

## 4. Tipos de dados e metodologia (art. 38, parágrafo único, itens 1 e 2)

### 4.1 Dados tratados

| Categoria | Dados | Titulares | Onde ficam | Retenção |
|---|---|---|---|---|
| Conta | E-mail, identificador, plano, aceites | Usuário | Supabase | Até a exclusão da conta |
| Registro de uso de IA (`ia_uso`) | Tarefa, data, resultado, tokens, custo, **hash** do texto (`decisao:<16 hex>`) e da mensagem | Usuário | Supabase | **13 meses** (limpeza diária) |
| Análises (`analises`) | Tipo, situação, rótulo opcional dado pelo usuário, quantidade de parágrafos; **nunca o texto** | Usuário | Supabase | **13 meses** |
| Texto pseudonimizado da decisão | Parágrafos da decisão, com marcadores no lugar dos dados pessoais rotulados | Partes, advogados, juízes, testemunhas, vítimas, terceiros citados | Em trânsito: navegador → servidor → Anthropic. **Não é guardado** pelo Ratione | Não retido pelo Ratione; retenção na Anthropic: ver risco R4 |
| Resposta do modelo | Estrutura, questões, fundamentos e citações, com marcadores | Idem | Só na tela do usuário | Não retida pelo Ratione |
| Logs técnicos | Tarefa, referência (hash) e motivo; **sem conteúdo** | Usuário | Google Cloud | 30 dias, localização global (Política de Privacidade §3) |

**Dados sensíveis possíveis (art. 5º, II).** O Ratione não pede nem busca dado sensível, mas decisões judiciais frequentemente os trazem: **saúde** (ações de saúde, previdenciárias, acidentárias), **vida sexual** (crimes sexuais, violência doméstica), **origem racial ou étnica**, **opinião política**, **filiação sindical** (trabalhista). Também podem vir **dados de crianças e adolescentes**, de **vítimas** e de **processos em segredo de justiça**. O corpus de avaliação já tem casos de violência doméstica e de saúde (os do júri do TJAL tiveram os dados pessoais trocados à mão por marcadores antes de entrar no repositório, que é público).

### 4.2 Metodologia de coleta

- A coleta é **ativa e pelo próprio usuário**: o Ratione não busca decisões nem dados de terceiros. Só trata o que é colado.
- **Sem upload e sem armazenamento do texto** hoje. Não há cache compartilhado do conteúdo (`guardaResultado: false`).
- Limite por análise: 70.000 caracteres e 1.500 parágrafos; acima disso, recusa em vez de cortar.

### 4.3 Garantia de segurança das informações (art. 46)

| Medida | Estado |
|---|---|
| Pseudonimização no navegador, antes de qualquer envio, com a tabela de troca só na tela | Feita (`prepararDecisao`, `@ratione/argumenta`) |
| Segunda detecção no servidor, que recusa o texto com dado pessoal detectável | Feita (`validarEntrada`, `temDadoPessoal`) |
| Chave da IA só no servidor; modelo sem ferramentas, sem busca e sem acesso a outra base | Feita (`ferramentas: []`) |
| Só sob demanda e só logado; rota exige sessão (401 sem ela) | Feita |
| Cota por plano e teto de gasto; uma chamada de cada vez | Feita (`ia_reservar`) |
| Sem conteúdo integral em logs, nem no banco: só hashes e metadados | Feita |
| Controle de acesso por linha (RLS) no banco: cada usuário lê o que é seu | Feita **[CONFIRMAR em revisão das políticas RLS de `ia_uso` e `analises`]** |
| Retenção mínima: limpeza diária de 13 meses para uso e análises | Decidida em 25/10/2026; **[CONFIRMAR que o `pg_cron` está agendado em produção]** |
| Criptografia em trânsito (HTTPS) | Padrão do Cloud Run e do Supabase **[CONFIRMAR]** |
| Acesso administrativo registrado | Existe painel administrativo com registro de ações (12 meses) **[CONFIRMAR o escopo do acesso a `ia_uso`]** |
| Resposta só cita parágrafos que existem; saída fora do formato é descartada | Feita (`conferirSaida`); 0 saídas descartadas em 90 chamadas na avaliação de 04/11/2026 |

## 5. Análise de riscos e mitigação (art. 38, parágrafo único, item 3)

Escala: **probabilidade** (B baixa, M média, A alta) e **gravidade** (B, M, A) para o titular. O risco residual é a avaliação do controlador depois das medidas, e precisa de confirmação do responsável.

| # | Risco | Prob. | Grav. | Medidas atuais | Residual |
|---|---|---|---|---|---|
| R1 | **Nome sem rótulo passa pela pseudonimização** e chega à Anthropic (a detecção é por padrões e rótulos; "não pega todo nome no meio do texto") | M | M | Tela mostra o texto como será enviado; usuário acrescenta nomes a ocultar; segunda detecção no servidor; aviso nas Políticas | **Médio.** Medir a cobertura do detector (ver seção 7) |
| R2 | **Dado sensível, de criança ou processo em segredo de justiça** enviado pelo usuário | M | A | Aviso de que não se envia segredo de justiça; Termos transferem a base legal ao usuário; pseudonimização; sem guarda | **Médio.** Reforçar o aviso na tela antes do envio e, no upload, bloquear por padrão (seção 7) |
| R3 | **Reidentificação por contexto**: pseudonimização não é anonimização, o contexto (fatos, datas, cidade, cargo) pode identificar a pessoa | M | M | Não guardamos o texto; o provedor recebe o texto sem tabela de troca; sem perfil de titular | **Médio.** Tratar o texto enviado como dado pessoal em todo o relatório |
| R4 | **Retenção e uso pelo provedor**: a Anthropic pode reter o conteúdo (monitoramento de política de uso, exigência legal; 30 dias conforme o artigo consultado) | M | M | Commercial Terms: sem treino por padrão; o Haiku 5.5 não está entre os modelos de retenção obrigatória (conferido em 25/10/2026) | **Médio, pendente.** **[CONFIRMAR no console e nos termos da conta]** e registrar aqui |
| R5 | **Transferência internacional** (art. 33): o tratamento ocorre fora do Brasil, sem região brasileira | A | M | DPA com Cláusulas Contratuais Padrão incorporado aos Commercial Terms (art. 33, II, "b", **na forma informada pela Anthropic**); pseudonimização antes do envio | **Médio, pendente.** **[CONFIRMAR]** aceitação pela conta e o mecanismo aceito para a LGPD e para o regulamento da ANPD |
| R6 | **Exposição de metadados** (`ia_uso`, `analises`, `rotulo` livre digitado pelo usuário, que pode conter nome) | B | M | RLS; sem texto; hash de 16 hex; limite de 80 caracteres no rótulo; retenção de 13 meses | **Baixo.** Avisar no campo do rótulo para não pôr nome de parte |
| R7 | **Resultado errado** (a IA pode errar, omitir ou inventar, inclusive citações) leva o usuário a erro que prejudica um terceiro | M | M | Aviso de IA em todo resultado; parágrafo de origem; selo das citações; avaliação com 30 decisões (dispositivo 26 a 29 de 30, questões 91 de 101, citações com número ausente em 0,3%) | **Médio.** A ferramenta não decide sobre o titular (não é decisão automatizada, art. 20) |
| R8 | **Acesso indevido** à conta do usuário ou ao painel administrativo | B | M | Sessão obrigatória; acesso administrativo restrito e registrado | **Baixo**, a confirmar |
| R9 | **Incidente de segurança** com dados de usuários | B | M | Metadados mínimos; sem conteúdo guardado; retenção curta | **Baixo.** Falta procedimento escrito de resposta a incidente e de comunicação à ANPD e ao titular (art. 48) **[FUTURO]** |
| R10 | **[FUTURO] Upload de arquivos**: guarda do documento integral, com dados pessoais e sensíveis de terceiros, fora do alcance da pseudonimização do navegador | A | A | Nenhuma ainda | **Alto até que as condições da seção 7 estejam cumpridas** |

## 6. Conclusão do controlador (rascunho)

Com o tratamento de **hoje** (texto colado, pseudonimizado no navegador, sem guarda do conteúdo, com retenção de 13 meses só para metadados), o risco residual é **médio** e concentrado em três pontos: R1 (nome sem rótulo), R4 e R5 (provedor e transferência). Nenhum deles impede a operação em beta, **desde que** as pendências **[CONFIRMAR]** da seção 8 sejam resolvidas e que o aviso de segredo de justiça e de dado sensível apareça **antes** do envio.

O **upload de arquivos (R10) não deve ser liberado** enquanto as condições da seção 7 não estiverem cumpridas e este relatório não for revisado para cobri-lo.

## 7. Condições para liberar o upload (F5-01 e F5-02)

1. **Armazenamento privado e criptografado**, com chave sob controle do Ratione, acesso só do dono e da rotina de exclusão.
2. **Exclusão pelo usuário** em um clique e **prazo curto de retenção** padrão (a Política de Privacidade deixa `[X] dias`: o responsável decide o número).
3. **Aviso obrigatório antes do envio**: não enviar segredo de justiça, dado de criança ou dado sensível sem base legal; o usuário confirma.
4. **Pseudonimização antes da extração** quando possível, ou tratamento do documento integral como dado de alto risco, com a Política de Privacidade atualizada **antes** (já prometido nela).
5. **Medição da cobertura do detector** de dados pessoais com decisões reais (taxa de nomes que passam), publicada neste relatório (R1).
6. **DPA e retenção do provedor confirmados** (R4 e R5) e a Anthropic mantida como suboperador listado.
7. **Procedimento de incidente** escrito (R9) e **encarregado** designado (art. 41).
8. **Revisão deste RIPD** (nova versão) cobrindo o upload, e aprovação do responsável.

## 8. Pendências do responsável

| # | O que decidir ou conferir |
|---|---|
| 1 | Titularidade do serviço (pessoa física ou jurídica) e papel na LGPD (operador ou controlador conjunto) |
| 2 | Encarregado: nome, canal e enquadramento como agente de pequeno porte (Res. CD/ANPD nº 2/2022) |
| 3 | Treino e retenção pela Anthropic no console e nos termos da conta (R4) e o mecanismo da transferência internacional (R5) |
| 4 | Revisão das políticas RLS de `ia_uso` e `analises`, agendamento do `pg_cron` e escopo do acesso administrativo |
| 5 | Prazo de retenção padrão dos arquivos (condição 2 da seção 7) |
| 6 | Revisão desta minuta por advogado de direito digital e conferência da redação vigente de cada dispositivo citado antes de publicar |

## 9. Histórico

| Versão | Data | Quem | Mudança |
|---|---|---|---|
| 0.1 | 04/11/2026 | Minuta redigida a partir do código e dos documentos do produto | Primeira versão |
| 0.1 | 04/11/2026 | Responsável | Confirmou o RIPD do Argumenta como está; os itens **[CONFIRMAR]** e a revisão por advogado seguem em aberto (seção 8) |

**Aprovação:** [NOME_RESPONSAVEL] · [DATA]

**Lei lida (versão compilada do Planalto, 04/11/2026):** Lei 13.709/2018, arts. 5º, II, VI, VII e XVII; 6º; 7º, V e §§ 3º e 4º; 20; 33; 38; 41; 46; 48. A redação vigente de cada um deve ser reconferida pelo advogado antes de publicar.
