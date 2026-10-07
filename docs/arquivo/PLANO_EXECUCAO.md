# RATIONE — PLANO DE EXECUÇÃO (do protótipo ao produto no ar)

> **ARQUIVADO. Substituído por [`docs/PLANO.md`](../PLANO.md), o plano único.** Mantido só como origem do conteúdo; não é seguido.

> Estimativas de prazo são para **1 desenvolvedor com assistência de IA** e são hipóteses a recalibrar ao fim da Fase 0.
>
> **Documentos complementares (07/10/2026):**
> `docs/produto/IA_E_PRECIFICACAO.md` · `docs/produto/METODO_CALENDARIO_FORENSE.md` · `docs/produto/FONTES_E_PIPELINES.md` · `docs/juridico/` (minutas para revisão)

---

## 0. Diagnóstico honesto (estado real em 07/10/2026)

| Área | Existe | Não existe |
|---|---|---|
| Motores | PrazoZero: cálculo CPC/CLT/CPP com 5 testes; feriados em tabela fixa no código | Calendário forense por tribunal, validação jurídica, regras especiais (art. 229, JEF, etc.) |
| NormaViva | 4 dispositivos do CPC digitados à mão | Ingestão de legislação, parser LC 95/98, versionamento real, atualização |
| TeseMap | 2 grafos digitados à mão | Ingestão de precedentes, curadoria, relações validadas |
| Argumenta | Schemas Zod + 1 decisão fictícia | Upload, extração, IA, verificação de citações |
| Plataforma | Interface estática (Next.js) | Backend, banco, login, perfil, planos, cobrança, e-mail, observabilidade, CI/CD |
| Jurídico | Páginas-rascunho (metodologia, termos, privacidade) | Termos/contratos/DPA revisados por advogado, CNPJ, marca registrada, LGPD operacional |
| Qualidade | `next build` + 5 testes | Testes E2E, CI, ambientes, monitoramento, backups |

**Conclusão:** hoje existe um **protótipo de interface**. Um produto exige: dados próprios com procedência, contas, cobrança, documentos legais e operação. Este plano trata disso, nessa ordem.

---

## 1. Decisões estratégicas (com recomendação)

### 1.1 Ordem de construção: por **risco e viabilidade de dados**, não por vontade

| Ordem | Módulo | Por quê |
|---|---|---|
| 1 | **PrazoZero** | Determinístico, sem IA, valor imediato. **Mas é o de maior responsabilidade** (prazo errado = dano ao usuário). Exige calendário curado. |
| 2 | **NormaViva** | Legislação é aberta e estruturada (Planalto, LexML, Câmara, Senado). Alimenta citações dos demais. |
| 3 | **TeseMap** | Depende de dados de STJ/STF, que são limitados (ver §2). Começa com corpus pequeno e curado. |
| 4 | **Argumenta** | Mais caro e mais arriscado: IA, documentos sigilosos, LGPD. Só depois que NormaViva e TeseMap existirem para **verificar citações**. |

**Marco de lançamento (beta fechado):** Fase 0 + PrazoZero + conta + cobrança + documentos legais. O resto entra incrementalmente.

### 1.2 PrazoZero é o produto de maior risco jurídico
Regras obrigatórias antes de abrir ao público:
- Todo dia excluído do cálculo cita **o ato que o instituiu** (já é o desenho atual; passa a ser **dado versionado**, não texto no código).
- **Modo conservador:** havendo ambiguidade (ex.: expediente parcial), o sistema mostra a data **mais cedo** e explica a alternativa.
- Aviso permanente de conferência do calendário do tribunal; feriado local exige comprovação (CPC, art. 1.003, § 6º).
- Validação jurídica documentada: **≥ 100 cenários** conferidos por jurista (você é o validador natural; registrar autoria e data).

### 1.3 Público-alvo (decidido)
**Profissionais do Direito, incluindo concurseiros**, em um meio-termo: linguagem técnica e precisa, sem jargão de software. Há dois planos pagos, **Pro** e **Pro Estudo** (ver `docs/produto/IA_E_PRECIFICACAO.md`). **Tribunais prioritários: STF e STJ**; depois TRFs e TJs.

### 1.4 IA como recurso, não como produto (decidido)
O site **não é exclusivamente de IA**. Ferramentas **sem IA** (PrazoZero, NormaViva, TeseMap) formam a base; a IA entra de forma **opcional e medida** (Argumenta é o único módulo centrado nela). API multiprovedor (**Gemini, Claude, ChatGPT**) atrás de uma camada única, com limites e créditos.

---

## 2. Fontes de dados: o que realmente existe

Verificado em pesquisa em 07/10/2026. **Reconfirmar termos de uso antes de integrar cada fonte.**

| Fonte | O que oferece | Acesso | Limitações / risco | Uso no Ratione |
|---|---|---|---|---|
| **DataJud (CNJ)** | Metadados e movimentos processuais por tribunal | API pública com **chave pública**; `POST` em endpoint por tribunal (`api-publica.datajud.cnj.jus.br/api_publica_<tribunal>/_search`); [Wiki](https://datajud-wiki.cnj.jus.br/) | Metadados, **não inteiro teor**; sem garantia de tempo real; sujeito a mudança de chave e cotas | **Chave de ligação** (processo, órgão, classe, movimentos). **Não traz ementa**: a ementa vem de outra fonte (STJ: espelhos dos dados abertos). Ver `FONTES_E_PIPELINES.md` |
| **Comunica API / DJEN (CNJ)** | Comunicações e intimações publicadas | [Swagger](https://comunicaapi.pje.jus.br/swagger/index.html); **exige credenciais** do sistema corporativo CNJ | Acesso restrito; requer habilitação formal | Fase tardia: importar intimações por OAB. Iniciar contato com o CNJ cedo |
| **Câmara dos Deputados** | Proposições, tramitação, votações | REST aberta (`dadosabertos.camara.leg.br/api/v2`), JSON/XML, sem autenticação | Trata de **projetos**, não do texto vigente | Alertas de mudanças legislativas **em andamento** |
| **Senado Federal** | Matérias, votações; resolvedor LexML de normas | REST aberta (`legis.senado.leg.br/dadosabertos`), XML/JSON, [docs](https://legis.senado.leg.br/dadosabertos/docs/) | XML por padrão; cobertura de histórico de alterações a confirmar | API de **Legislação** indicada pelo usuário: testar se traz **texto** ou só metadados/histórico (**não verificado**: rede bloqueada) |
| **LexML Brasil** | Identificador padronizado (URN:LEX), metadados, OAI-PMH/SRU | Resolvedor `lexml.gov.br/urn`; protocolos OAI-PMH e SRU | Foco em metadados/identificação; texto vem das fontes originárias | Identidade canônica das normas |
| **Planalto** | **Texto oficial e consolidado**, com anotações "Redação dada pela Lei…" | HTML público | Sem API; exige parser próprio e vigilância de mudanças de layout | **Fonte primária do texto** e das versões no NormaViva |
| **STJ — Dados Abertos** | 13 conjuntos (espelhos de acórdãos, precedentes qualificados, decisões, movimentação) | **Download de arquivos** ([portal](https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/20052022-Novo-Portal-de-Dados-Abertos-amplia-transparencia-de-acoes-realizadas-no-STJ.aspx)); há Termo de Uso | Sem API em tempo real; atualização defasada; inteiro teor limitado (confirmar) | Temas repetitivos, súmulas, precedentes qualificados no TeseMap |
| **STF — Corte Aberta** | Painéis e CSVs (temas de repercussão geral, estatísticas) | Download CSV | **Sem API pública de jurisprudência**; raspar o portal é frágil e juridicamente arriscado | Temas de repercussão geral e súmulas vinculantes **curados**; evitar scraping |
| **Calendário forense** | — | **Não há API ou padrão nacional.** Cada tribunal publica portarias/atos (ex.: CNJ, Port. 446/2025: suspensão de prazos 20/12/2025–31/01/2026) | É o ponto mais caro e crítico do PrazoZero | **Base própria curada**, com fonte, ato, URL e data de verificação |
| **ForgeLex** (infra própria) | Índice STJ com procedência (segundo o Plano Mestre) | Conector precisa de autorização; **não consegui acessar nesta sessão** | Dependência de projeto próprio | Adapter opcional (Fase 3+) |

**Direito autoral:** leis, decretos e decisões judiciais são de livre uso (Lei 9.610/1998, art. 8º, IV). **Doutrina, anotações e resumos de terceiros não podem ser ingeridos** sem licença.

---

## 3. Arquitetura-alvo

### 3.1 Princípios
1. **Dado jurídico é dado versionado com procedência**, nunca constante no código.
2. Motores são **funções puras e testáveis**, sem I/O (já é a direção de `packages/*`).
3. Cada fato exibido tem: fonte (URL), data de coleta, versão do parser, e status de verificação.
4. IA **nunca** calcula prazo nem decide vigência. IA só extrai e sugere, **sempre marcada como sugestão** e verificável.

### 3.2 Stack recomendada (decisões)

| Camada | Escolha | Justificativa |
|---|---|---|
| Monorepo | **pnpm workspaces** (mantém) | Já existe |
| Web | **Next.js (App Router) + TypeScript** | Já existe; SSR/SEO para páginas públicas |
| UI | **shadcn/ui + Radix + Tailwind** | Acessibilidade pronta; substitui componentes caseiros |
| Banco | **PostgreSQL (Supabase, região São Paulo)** | Auth, RLS, storage; evita escrever login |
| ORM/migrações | **Drizzle** (SQL explícito) | Controle de esquema bitemporal |
| Jobs de ingestão | **`apps/worker` (Node) + fila no Postgres (pg-boss)** | Ingestão agendada sem infraestrutura extra |
| API pública própria | **Fastify** — somente quando houver cliente externo | Evita camada prematura; Server Actions/route handlers bastam no início |
| Documentos (Argumenta) | **Docling** em worker Python isolado | Só na Fase 4 |
| IA | Provedor via **camada única** com saída estruturada (Zod) | Trocável; custo e logs controlados |
| Datas | `date-fns` com datas **civis puras** (sem fuso) ou Temporal | Elimina a gambiarra de UTC do motor atual |
| Testes | **Vitest** (unidade, *property-based* com fast-check), **Playwright** (E2E) | Motor de datas exige testes de propriedade |
| Observabilidade | **Sentry** + logs estruturados + uptime | Operação mínima profissional |
| E-mail | Resend (ou equivalente) | Transacional e alertas |
| Hospedagem | Vercel (web) + Supabase + worker (Fly.io/Railway) | Baixo custo inicial |

> **LGPD:** usar provedores sediados no exterior caracteriza transferência internacional (LGPD, art. 33). Exige cláusulas/DPA e registro. Ver §7.

### 3.3 Modelo de dados (rascunho)
```text
tribunais(id, sigla, nome, esfera, uf)
calendario_eventos(id, tribunal_id|null, abrangencia[nacional|uf|comarca|tribunal],
                   tipo[feriado_civil|feriado_local|suspensao|recesso|indisponibilidade|expediente_parcial],
                   inicio, fim, fonte_ato, fonte_url, verificado_em, verificado_por, versao)
regras_prazo(id, regime, ato, dias, base_legal, vigencia_inicio, vigencia_fim)

normas(id, urn_lex, tipo, numero, ano, ementa, fonte_url)
dispositivos(id, norma_id, caminho[art/§/inc/alínea], rotulo)
versoes_dispositivo(id, dispositivo_id, texto, vigente_de, vigente_ate,   -- vigência (tempo do direito)
                    conhecido_em, ato_modificador, tipo_alteracao, fonte_url, hash)  -- tempo do sistema

precedentes(id, tribunal, tipo, numero, enunciado, situacao, publicado_em, fonte_url)
relacoes(id, origem, destino, tipo, origem_dado[curado|sugerido_ia], validado_por)

usuarios(id, ...)  perfis(...)  assinaturas(...)  itens_salvos(...)
auditoria(id, quem, o_que, quando)   -- imutável
```

---

## 4. Plataforma (trilha transversal)

### 4.1 Conta e perfil
- Cadastro: e-mail + senha, Google, link mágico; verificação de e-mail; **2FA** opcional.
- Perfil: nome, profissão, OAB nº/UF (**opcional, declaratório**), tribunal e UF padrão, preferências.
- Direitos LGPD no produto: **exportar dados, excluir conta, revogar consentimento** (LGPD, art. 18).
- Fase posterior: **escritório (multiusuário)** com papéis.

### 4.2 Planos e cobrança (hipóteses a validar)
| Plano | Conteúdo (hipótese; detalhes em `IA_E_PRECIFICACAO.md`) |
|---|---|
| Gratuito | Ferramentas sem IA com uso razoável; bônus pequeno de IA |
| Pro | Uso ampliado, alertas por e-mail, `.ics`/PDF, histórico, créditos de IA mensais, pacotes avulsos |
| Pro Estudo | Para concurseiros: mesmas ferramentas, pacote menor de créditos, preço menor |
| ~~Escritório/empresarial~~ | **Fora do escopo agora** (decidido) |
- **IA medida em créditos**; teto global de gasto com IA; limites técnicos por plano.
- **Preços:** definir após preencher a planilha de custo por provedor e medir o beta.
- **Beta gratuito** enquanto não houver meio regular de cobrança e emissão fiscal.
- **Cobrança:** gateway com **Pix Automático + cartão + boleto + NFS-e** (ex.: Asaas; Stripe resolve cartão, mas o Pix e a nota fiscal pesam no Brasil). **Confirmar taxas e emissão de NFS-e** antes de decidir.
- Regras de consumo: informações claras e canal de cancelamento (Decreto 7.962/2013); **direito de arrependimento de 7 dias** em contratação à distância (CDC, art. 49).

### 4.3 Operação
Ambientes `dev` → `staging` → `prod`; deploy automático por PR; migrações versionadas; backups com restauração testada; painel de saúde das ingestões; central de suporte (formulário + e-mail); página de status.

---

## 5. Fases de execução

### FASE 0 — Fundação (≈ 2–3 semanas)
**Entregáveis**
1. CNPJ, domínio e verificação de marca no INPI (ver §7).
2. Repositório: CI (lint, typecheck, testes, build, E2E), dependabot, convenção de commits, ADRs.
3. Supabase: projeto, esquema inicial, RLS, auth, e-mail transacional.
4. Design system com **shadcn/ui** (substituir componentes caseiros), tokens já criados.
5. Sentry, uptime, logs.
6. Reescrita do núcleo de datas do motor (datas civis puras).

**Pronto quando:** PR com testes verdes publica automaticamente em `staging`; login funciona; erro de produção chega ao Sentry.

### FASE 1 — PrazoZero em produção (≈ 6–8 semanas)
**Entregáveis**
1. **Calendário forense como dado** (`calendario_eventos`), com painel interno de curadoria (CRUD + fonte + verificação).
2. Cobertura inicial: **STF e STJ** (prioridade decidida), com método em `docs/produto/METODO_CALENDARIO_FORENSE.md`; depois TRFs e TJs (ordem a definir).
3. Regras: CPC (arts. 219–224, 183, 180, 186, 229), CLT, CPP, JEF/Lei 9.099; **catálogo de prazos com base legal** (recursos, defesas, manifestações).
4. Correção dos defeitos conhecidos: feriados por esfera (Carnaval/Quarta de Cinzas/Corpus Christi), tabela estadual verificada ato a ato, intimação por portal (Lei 11.419, art. 5º), validação de entrada.
5. **Suíte de ≥ 100 cenários** validados + testes de propriedade (ex.: o vencimento nunca cai em dia não útil; monotonicidade).
6. Salvar cálculos, **exportar PDF e .ics**, alertas por e-mail (D-3, D-1).
7. Modo conservador e relatório "o que pode alterar este prazo".

**Pronto quando:** 100 cenários verdes; cada data de calendário tem fonte e data de verificação; revisão jurídica registrada; beta fechado com 10 usuários sem erro de cálculo reportado.

### FASE 2 — NormaViva (≈ 8–10 semanas)
1. Coletor do **Planalto** (CF, CC, CPC, CP, CPP, CLT, CDC + 20 leis de maior uso) com cache e *diff* de mudança de página.
2. **Parser LC 95/98** → artigos, parágrafos, incisos, alíneas.
3. Extração das anotações "Redação dada…/Incluído…/Revogado…" → `versoes_dispositivo`.
4. Consulta temporal ("redação em D"), diff visual, linha do tempo real.
5. Atualização: rotina diária (Planalto + feeds Câmara/Senado/LexML) com **fila de revisão** para mudanças.
6. Busca textual (Postgres FTS).
7. **30 normas de teste** com histórico conhecido (`data A → redação A`).

**Pronto quando:** cada texto exibido tem link para a fonte oficial e hash; mudança no Planalto gera alerta de revisão em < 24 h.

### FASE 3 — TeseMap (≈ 6–8 semanas)
1. Ingestão de **STJ (dados abertos)**: temas repetitivos, súmulas, precedentes qualificados.
2. STF: **temas de repercussão geral e súmulas vinculantes** a partir da Corte Aberta + curadoria; **sem scraping**.
3. Relações em `relacoes`, com origem `curado` ou `sugerido_ia` e validação humana.
4. Navegação por tema, ligação com dispositivos do NormaViva.
5. Adapter ForgeLex (opcional).

**Pronto quando:** cobertura declarada (ex.: "N temas do STJ e M do STF"), data da última atualização visível, toda relação com procedência.

### FASE 4 — Argumenta (≈ 10–12 semanas)
1. Upload seguro (PDF/DOCX/texto), armazenamento privado criptografado, **exclusão pelo usuário**.
2. Worker Docling; segmentação em parágrafos com âncoras (página/§).
3. Pipeline em etapas com saída estruturada (Plano Mestre §10) e **verificação de citações** contra NormaViva/TeseMap.
4. Corpus de **30 decisões públicas** para avaliar extração; métricas de revisão.
5. Controle de custo por análise e limite por plano.
6. **Relatório de impacto (RIPD)** antes do lançamento.

**Pronto quando:** logs não contêm texto integral; retenção configurável; usuário exclui e confirma remoção.

### FASE 5 — Escala comercial (contínua após o beta)
Escritório/multiusuário, API pública do Ratione (Fastify), integração Comunica/DJEN (se habilitado), relatórios, SEO e conteúdo, programa de indicação.

---

## 6. Qualidade e segurança (padrão profissional)

- **Testes:** unidade + propriedade (motores), integração (ingestão com *fixtures* reais), E2E dos fluxos críticos, regressão visual nas telas-chave.
- **Dados:** toda ingestão é idempotente, com `hash`, e **falha de forma visível** (nunca silenciosa).
- **Segurança:** OWASP ASVS nível 1, CSP, rate limit, segredos fora do repositório, RLS com testes automatizados, revisão de dependências, backups com PITR.
- **Acessibilidade:** WCAG 2.2 AA (contraste e foco já tratados na base atual).
- **Desempenho:** orçamento por página; cache de normas e calendário.
- **Política de erro jurídico:** botão "reportar erro nesta informação", fila de triagem, correção versionada e **registro público de correções**.

---

## 7. Jurídico e conformidade

| Item | Ação |
|---|---|
| Pessoa jurídica | **Ainda não há.** Decidir com contador antes da cobrança (CNAE de software, NFS-e). Até lá, **beta gratuito** |
| Marca | **Busca exata "RATIONE" no INPI em 07/10/2026 01:31: nenhum resultado** (base atualizada até 06/10/2026). Isso **não garante registrabilidade**. Próximos passos: busca por **radical e fonética** (RATIO, RACION, RAZION…), classes a confirmar (**9, 41, 42, 45**), e **depósito pelo e-INPI** (definir titular PF ou PJ com o contador); checar domínio e redes |
| Termos de Uso | Redigir e **revisar por advogado de direito digital** |
| Contrato de assinatura | Planos, cobrança, cancelamento, SLA, limitação de responsabilidade, foro |
| Política de Privacidade (LGPD) | Bases legais por finalidade, direitos do titular, retenção, canal do titular |
| Política de Cookies/Analytics | Consentimento; ferramenta de analytics respeitosa à privacidade |
| DPA / transferência internacional | Contratos com provedores (nuvem, e-mail, IA, pagamento); LGPD, art. 33 |
| ROPA e RIPD | Registro de operações; relatório de impacto para o Argumenta |
| Encarregado (DPO) | Verificar enquadramento como agente de pequeno porte (Res. CD/ANPD nº 2/2022); manter canal de contato |
| Política de uso de IA | Transparência de que há sugestões automáticas e limites; **seguir as recomendações da OAB** sobre IA generativa (verificar versão vigente) |
| Aviso legal | Ferramenta de apoio; não é aconselhamento jurídico; **conferência obrigatória** da tempestividade |
| Licenças de dados | Respeitar termos de cada fonte (ex.: Termo de Uso dos Dados Abertos do STJ) |
| Seguro | Avaliar seguro de responsabilidade civil profissional/tecnologia (E&O) antes de cobrar pelo PrazoZero |

> Eu posso **redigir as minutas**, mas termos, contratos e políticas precisam ser **validados por advogado habilitado** antes de publicados.

---

## 8. Documentação e manuais

1. **Central de ajuda** (site de documentação): guia por módulo, FAQ, glossário.
2. **Metodologia pública**: regras jurídicas aplicadas, versões, limitações, registro de correções.
3. **Manual do PrazoZero** com os casos clássicos e como ler a memória de cálculo.
4. **Changelog** público e página de status.
5. Documentação interna: ADRs, runbook de ingestão, procedimento de curadoria do calendário, resposta a incidentes.

---

## 9. Riscos principais

| Risco | Probabilidade/Impacto | Mitigação |
|---|---|---|
| Prazo calculado errado causa dano | Média / **Muito alto** | Calendário curado, modo conservador, validação jurídica, avisos, seguro |
| Calendário forense desatualizado | Alta / Alto | Painel de curadoria, verificação periódica, "verificado em" visível |
| STF/STJ sem API utilizável | Alta / Médio | Corpus curado e declarado; evitar scraping; ForgeLex |
| Mudança de layout do Planalto | Média / Médio | Parser com testes, alerta de diff, fila de revisão |
| Vazamento de documentos (Argumenta) | Baixa / Muito alto | Criptografia, RLS, retenção curta, RIPD, só após Fases 0–3 |
| Custo de IA fora de controle | Média / Médio | Limites por plano, cache, medição por análise |
| Escopo excessivo / 1 pessoa | Alta / Alto | Beta só com PrazoZero; módulos entram por fase |
| Concorrentes estabelecidos | Média / Médio | Diferencial: memória de cálculo auditável e integração; **validar com entrevistas** |

---

## 10. Backlog imediato (primeiros 10 passos)

1. Responder às **decisões em aberto** (§11).
2. **Registrar domínio** (checar `ratione.com.br`/`.app.br`) e **depositar a marca** após a busca por radical/fonética.
3. Configurar CI no GitHub e ambientes `staging`/`prod`.
4. Criar o projeto Supabase (São Paulo) com RLS e autenticação.
5. Migrar a UI para componentes **shadcn/ui** (mantendo os tokens atuais).
6. Reescrever o motor de datas (datas civis puras) e adicionar testes de propriedade.
7. Modelar `calendario_eventos` e construir o painel de curadoria.
8. Levantar, com fonte, o calendário de **STF e STJ** (checklist em `METODO_CALENDARIO_FORENSE.md`).
9. Escrever os **100 cenários** de prazo (você valida; eu implemento os testes).
10. **Revisar as minutas** de `docs/juridico/` (você é o advogado revisor) e fechar os campos `[ ]`.
11. Rodar os **testes de bancada T1–T7** (`FONTES_E_PIPELINES.md`) assim que a rede liberar os hosts.
12. Preencher a **planilha de custo de IA** e definir o teto mensal.

---

## 11. Decisões registradas (07/10/2026) e pendências

### Decididas
| # | Decisão |
|---|---|
| 1 | **Público:** profissionais do Direito, incluindo concurseiros (meio-termo) |
| 2 | **Tribunais prioritários:** STF e STJ |
| 3 | **Calendário forense:** parte dos prazos dos grandes códigos, cruza com feriados nacionais e levanta o calendário de cada tribunal |
| 4 | **Sem plano empresarial** no momento |
| 5 | **IA via API multiprovedor** (Gemini, Claude, ChatGPT); site **não** exclusivamente de IA; precisa de política de preços e limites (feita em `IA_E_PRECIFICACAO.md`) |
| 6 | **Marca:** busca exata no INPI sem resultados; **sem registro prévio** |
| 7 | **Documentos jurídicos:** eu redijo; **você, advogado, revisa** |
| 8 | **Integrações:** DataJud (metadados) e API de Legislação do Senado |

### Ajustes técnicos decorrentes (importante)
- **DataJud não fornece ementa.** Ele identifica o processo; a ementa vem de outra fonte (STJ: espelhos dos dados abertos). STF não tem API de jurisprudência. Ver `FONTES_E_PIPELINES.md`.
- **Senado:** não consegui abrir o swagger (host bloqueado). Entra nos testes de bancada.

### Pendentes
| # | Pendência | Recomendação |
|---|---|---|
| 1 | **Pessoa jurídica ou autônomo** para cobrar | Definir com contador; beta gratuito até lá |
| 2 | **Preços** do Pro e Pro Estudo | Após planilha de custo e beta |
| 3 | **Teto mensal de IA** no beta | Definir valor em reais |
| 4 | **Liberar hosts** para os testes de bancada | Ver `FONTES_E_PIPELINES.md` §5 |
| 5 | Horas semanais para **validação do calendário e dos 100 cenários** | Reservar horário fixo |
| 6 | Busca de marca **por radical/fonética** e escolha das classes | Antes de investir mais em identidade |
| 7 | Acesso ao **ForgeLex** | Conectar quando for útil ao TeseMap |

---

## 12. O que fica **pausado** (não é prioridade)

- Novas telas, temas, animações e ajustes visuais.
- Argumenta com IA e upload de documentos.
- App mobile, extensão de navegador, editor de peças, CRM, acompanhamento processual completo.
- Banco de grafos e busca vetorial (Postgres atende no início).

---

### Fontes consultadas (07/10/2026)
- DataJud: [Wiki CNJ](https://datajud-wiki.cnj.jus.br/) · endpoints por tribunal em `api-publica.datajud.cnj.jus.br`
- Comunica API/DJEN: [Swagger](https://comunicaapi.pje.jus.br/swagger/index.html) · [CNJ — Comunicações Processuais](https://www.cnj.jus.br/programas-e-acoes/processo-judicial-eletronico-pje/comunicacoes-processuais/)
- Câmara: `https://dadosabertos.camara.leg.br/api/v2`
- Senado: [docs](https://legis.senado.leg.br/dadosabertos/docs/)
- LexML: `lexml.gov.br` (URN:LEX, OAI-PMH, SRU)
- STJ: [Portal de Dados Abertos](https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/20052022-Novo-Portal-de-Dados-Abertos-amplia-transparencia-de-acoes-realizadas-no-STJ.aspx)
- STF: programa Corte Aberta (CSV)
- Calendário forense: [CNJ — Portaria 446/2025](https://www.cnj.jus.br/portaria-determina-suspensao-dos-prazos-no-cnj/) e Lei 5.010/1966, art. 62
- Cobrança: [Asaas — assinaturas](https://docs.asaas.com/docs/assinaturas-recorrência), Pix Automático (BCB, jun/2025)
