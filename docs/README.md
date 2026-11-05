# Documentação do Ratione

Este é o mapa da pasta `docs/`. O **estado do projeto** mora em um lugar só, o [`PLANO.md`](PLANO.md); os demais documentos explicam o método, o produto, a operação e o jurídico, e o plano aponta para eles.

## Como ler e como manter

- **Comece pelo plano.** [`PLANO.md`](PLANO.md) é o plano único: produto, decisões, arquitetura, roteiro e o estado de cada item (§10). Se um documento contradiz o plano, vale o plano, e o outro deve ser corrigido.
- **Uma regra por documento.** Cada arquivo tem uma função (tabelas abaixo). Detalhe longo de um item do plano (histórico de rodadas, registro tribunal a tribunal) vai para o documento do assunto, e a linha do plano guarda só o estado e o link.
- **Documentos gerados não se editam à mão.** `REVISAO_CENARIOS.md`, `VALIDACAO_PENDENTES.md` (gerados por `packages/prazozero/cenarios/oraculo.py`) e `NORMAS_DE_TESTE.md` (gerado por `pnpm historico`, em `packages/normaviva`) são reescritos pelos comandos; a validação fica nos arquivos de dados.
- **Dado jurídico só com fonte.** Lei, ato de tribunal e precedente entram com a fonte lida e a data de leitura, e a lei só pela versão compilada ([`produto/VERIFICACAO_FONTES.md`](produto/VERIFICACAO_FONTES.md)).
- **Mudança no banco acompanha uma linha** na tabela de [`../supabase/LEIA-ME.md`](../supabase/LEIA-ME.md).
- **O repositório é público.** Nada de dado pessoal, chave ou segredo em documento; nos casos do corpus do Argumenta, os dados pessoais são trocados por marcadores.

## Plano

| Documento | Função |
|---|---|
| [`PLANO.md`](PLANO.md) | Plano único: produto, decisões, roteiro e estado de cada item |
| [`arquivo/`](arquivo) | Planos anteriores, **arquivados** (`PLANO_MESTRE`, `PLANO_EXECUCAO`, `PLANO_CORRECOES_VISUAIS`). Só histórico; não são seguidos |

## Produto e método (`produto/`)

| Documento | Função |
|---|---|
| [`ARGUMENTA.md`](produto/ARGUMENTA.md) | Análise de decisão: fluxo, regras fixas, limites, selo das citações e a base do envio de documentos |
| [`ARGUMENTA_AVALIACAO.md`](produto/ARGUMENTA_AVALIACAO.md) | Avaliação do Argumenta com o corpus de 30 decisões: método, resultado final, decisão do modelo e diário das rodadas |
| [`IA_TAREFAS.md`](produto/IA_TAREFAS.md) | Catálogo de tarefas fechadas de IA: contrato, executor único e travas |
| [`IA_E_PRECIFICACAO.md`](produto/IA_E_PRECIFICACAO.md) | Custos, cotas e preços da IA |
| [`EXPLICACAO_IA.md`](produto/EXPLICACAO_IA.md) | A tarefa "explicar dispositivo" do NormaViva |
| [`PLANOS_E_COBRANCA.md`](produto/PLANOS_E_COBRANCA.md) | Planos, cota por análise, preços propostos, cobrança (desligada) e impostos |
| [`METODO_CALENDARIO_FORENSE.md`](produto/METODO_CALENDARIO_FORENSE.md) | Método do calendário forense e checklist por tribunal |
| [`CALENDARIOS_POR_TRIBUNAL.md`](produto/CALENDARIOS_POR_TRIBUNAL.md) | Registro tribunal a tribunal: ato lido, data, regra de ponto facultativo e pendências |
| [`VERIFICACAO_FONTES.md`](produto/VERIFICACAO_FONTES.md) | Fontes lidas e o que ainda falta conferir (calendários, normas, precedentes) |
| [`FONTES_E_PIPELINES.md`](produto/FONTES_E_PIPELINES.md) | Fontes de dados e pipelines de carga |
| [`DESIGN_SYSTEM.md`](produto/DESIGN_SYSTEM.md) | Sistema visual: tokens, componentes, névoa de fundo e elevação |

## Validação e registros datados (`produto/`)

| Documento | Função |
|---|---|
| [`REVISAO_CENARIOS.md`](produto/REVISAO_CENARIOS.md) | **Gerado.** Cenários do PrazoZero com a contagem completa de cada um e a validação do revisor |
| [`VALIDACAO_PENDENTES.md`](produto/VALIDACAO_PENDENTES.md) | **Gerado.** Cenários ainda não validados (hoje, nenhum) |
| [`VALIDACAO_10_CENARIOS.md`](produto/VALIDACAO_10_CENARIOS.md) | Registro (07/10/2026): os 10 cenários mais importantes, validados pelo revisor |
| [`NORMAS_DE_TESTE.md`](produto/NORMAS_DE_TESTE.md) | **Gerado.** Normas com histórico conhecido, usadas para testar o NormaViva (57 casos validados) |
| [`REVISAO_TECNICA_2026-11-04.md`](produto/REVISAO_TECNICA_2026-11-04.md) | Registro datado da revisão técnica de código e segurança: o que foi corrigido, o que foi verificado e as recomendações |
| [`DEBUG_E2E_2026-10-24.md`](produto/DEBUG_E2E_2026-10-24.md) | Registro datado do teste de ponta a ponta de 24/10/2026 |
| [`VALIDACAO_PAINEL_ADMIN.md`](produto/VALIDACAO_PAINEL_ADMIN.md) | Registro datado da validação visual do painel administrativo (24/10/2026) |

## Operação (`deploy/`)

| Documento | Função |
|---|---|
| [`CLOUD_RUN.md`](deploy/CLOUD_RUN.md) | Deploy no Cloud Run, segredos, agendadores, alertas e monitoramento |
| [`EMAIL_CONTATO.md`](deploy/EMAIL_CONTATO.md) | Desenho do e-mail de contato e do envio |
| [`balanceador-forgelex/`](deploy/balanceador-forgelex) | Registro do redirecionamento `nexojuris.ia.br/ratione` (26/10/2026), no balanceador do domínio raiz |

## Jurídico (`juridico/`)

Minutas **para revisão do advogado responsável**; o que está no ar hoje é o texto do beta, conferido na auditoria.

| Documento | Função |
|---|---|
| [`README.md`](juridico/README.md) | Índice das minutas, campos a preencher e pontos para decisão |
| [`TERMOS_DE_USO.md`](juridico/TERMOS_DE_USO.md) · [`POLITICA_DE_PRIVACIDADE.md`](juridico/POLITICA_DE_PRIVACIDADE.md) · [`POLITICA_DE_COOKIES.md`](juridico/POLITICA_DE_COOKIES.md) · [`POLITICA_DE_USO_DE_IA.md`](juridico/POLITICA_DE_USO_DE_IA.md) · [`AVISO_LEGAL.md`](juridico/AVISO_LEGAL.md) | Minutas dos textos públicos |
| [`RIPD_ARGUMENTA.md`](juridico/RIPD_ARGUMENTA.md) | Relatório de impacto à proteção de dados do Argumenta (LGPD, art. 38): riscos, salvaguardas e condições para liberar o envio de documentos |
| [`AUDITORIA_BETA.md`](juridico/AUDITORIA_BETA.md) | Liga cada afirmação das páginas públicas à sua comprovação no código |

## Fora de `docs/`

| Lugar | O que tem |
|---|---|
| [`../README.md`](../README.md) | Apresentação pública do projeto |
| [`../supabase/LEIA-ME.md`](../supabase/LEIA-ME.md) | Banco: projeto, índice das migrações, cargas de dados e limpeza por prazo |
| [`../packages/argumenta/corpus/LEIA-ME.md`](../packages/argumenta/corpus/LEIA-ME.md) | Corpus de avaliação do Argumenta: formato do caso, fluxo de comandos e régua das métricas |
