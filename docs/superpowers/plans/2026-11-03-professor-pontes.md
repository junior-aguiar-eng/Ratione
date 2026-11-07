# Plano de implementação do Professor Pontes

> Para a execução, usar `superpowers:executing-plans` ou, se escolhido pelo responsável, `superpowers:subagent-driven-development`. Cada tarefa tem seu próprio critério de aceite.

**Objetivo.** Entregar um tutor de Direito Administrativo que mantenha uma conversa, ensine com fontes selecionadas e encaminhe o estudante às ferramentas do Ratione com contexto.

**Arquitetura.** O NexoJuris produz lotes locais, e o CP IURIS fornece material doutrinário mediante autorização e conferência. O Ratione importa uma projeção aprovada e consulta essa projeção a cada turno. O servidor reúne as evidências, chama a IA pelo executor existente, verifica a saída e monta as referências. O histórico recente dá continuidade ao diálogo. A integração com os módulos usa referências tipadas e resolvidas pelo servidor.

**Tecnologias.** Next.js App Router, TypeScript, Zod, PostgreSQL/Supabase com busca textual em português, pnpm, `tsx --test` e PGlite. Reutilizar o cliente de modelo, o executor e a contabilidade de uso do Ratione.

**Requisitos de referência.** Conversa deste chat de 2 e 3 de novembro de 2026, [plano do Ratione](../../PLANO.md) e [política atual de IA](../../produto/IA_TAREFAS.md). Os caminhos novos e os limites abaixo são propostas deste plano.

## Escopo e decisões de produto

- Piloto interno em Direito Administrativo, com responsabilidade civil do Estado como primeiro recorte. Ampliar para outros institutos após medir a qualidade desse recorte.
- A exceção à política atual abrange texto livre e contexto de diálogo exclusivamente no Pontes. Cada turno tem esquema fechado e o servidor controla a pesquisa, as fontes, a chamada e a publicação. A IA relaciona as evidências, explica divergências e gera exemplos rotulados como didáticos.
- Consulta por turno a um acervo versionado. Treinamento do modelo, serviço de vetores, coleta ao vivo e ferramentas de escrita ficam fora do piloto.
- Sessão autenticada, histórico em memória na página e até três pares recentes enviados ao servidor. Pergunta de até 1.500 caracteres, até oito evidências e até 16.000 caracteres na mensagem total. Reduzir o contexto por blocos inteiros e informar quando for preciso refazer uma pergunta dependente de histórico descartado.
- Até 1.600 tokens de saída, 10 turnos com geração por dia e 100 por mês por usuário, dentro do teto global existente. Uma chamada por turno elegível, respeitando a política de repetição transitória do cliente. Cache compartilhado desabilitado para o Pontes. Registrar IDs opacos, uso e custo, com exclusão de perguntas, respostas e trechos dos registros operacionais.
- `PONTES_LIGADO` separado da chave geral. Começar desligado, com acesso de piloto autorizado no servidor. Habilitação remota, ingestão de material restrito e inferência paga dependem das autorizações correspondentes.

## 1. Conferir a origem e preparar a ingestão local

**Arquivos propostos.** `apps/web/scripts/pontes/importar.ts`, `apps/web/src/lib/pontes/acervo/importacao.ts` e `importacao.test.ts`.

- [ ] Ler o JSON v2 do CP IURIS e verificar o hash do PDF e do Markdown segundo o método do produtor. O inventário anterior encontrou correspondência do PDF e divergência do Markdown. Reconciliar o par JSON/Markdown em cópia de trabalho ou regenerá-lo com o produtor. Registrar os hashes e a revisão utilizados. Conferir visualmente as páginas da amostra contra o PDF e remover marcas pessoais. Confirmar o escopo permitido para leitura, armazenamento, envio ao provedor e exibição antes de usar a obra real.
- [ ] Ler envelopes v1 do `output/.integration-outbox` do NexoJuris. Reproduzir a canonicalização do exportador e verificar o hash do envelope e de cada registro antes de projetar campos permitidos. Usar DoD para descoberta de referências, com confirmação nos tribunais ou por fonte oficial já integrada. Excluir `raw`, questões do QConcursos e dados de autenticação da projeção do piloto. Ler o Planalto pelo corpus já mantido no NormaViva.
- [ ] Implementar `prepararLote(entrada: LoteOrigem): ResultadoImportacao`, união discriminada por `cp_iuris` e `nexojuris`. Produzir `EvidenciaCandidata` com `id`, `tipo`, `idOrigem`, `versao`, `hash`, `localizador`, `trecho`, `permissao` e `revisao`. Localizador de doutrina inclui página e bloco. Jurisprudência inclui tribunal, identificador e referência oficial quando confirmada. O lote começa pendente e o relatório aponta itens recusados ou sem cobertura.
- [ ] Rodar `pnpm --filter web exec tsx --test src/lib/pontes/acervo/importacao.test.ts` com fixtures sintéticas. Verificar rejeição de hash divergente, OCR sem conferência, versão desconhecida e registro que tenta importar conteúdo fora da projeção. Reprocessar o mesmo lote deve produzir os mesmos IDs e hashes.

## 2. Publicar a projeção aprovada e recuperar evidências

**Arquivos propostos.** Migração `supabase/migrations/20261103000001_pontes_acervo.sql`, `packages/db/src/pontes.test.ts` e `apps/web/src/lib/pontes/acervo/consulta.ts`.

- [ ] Criar acervo versionado com identidade estável, hash e estados `pendente`, `aprovado` e `retirado`. Usar chave única de origem e versão. Aprovar ou retirar lotes em transação, com data e responsável. Restringir leitura bruta e escrita a operações internas do servidor. Aplicar ao texto as permissões de processamento e exposição da origem.
- [ ] Implementar `buscarEvidencias(consulta: ConsultaPontes): Promise<ResultadoBusca>` com consulta parametrizada, índice textual em português e prioridade para referência exata. `ConsultaPontes` carrega pergunta e contexto tipado. `ResultadoBusca` traz `versaoAcervo`, `evidencias` e cobertura por tipo. Cada evidência devolvida tem ID, trecho, versão e localizador. Usar `resultado vazio` para ausência de cobertura e erro separado para fonte indisponível.
- [ ] Integrar a leitura de dispositivos pelo adaptador do NormaViva, respeitando as versões publicáveis e a data de referência. Preparar o adaptador jurisprudencial para o corpus curado do piloto. Quando faltar cobertura no TeseMap, uma referência confirmada pode apontar para o tribunal. O candidato editorial permanece pendente até a conferência.
- [ ] Rodar `pnpm --filter @ratione/db test` e testes da busca no web. Verificar que um lote reimportado não duplica dados, retirada deixa de aparecer na busca, publicação parcial falha de forma atômica e papéis públicos não conseguem ler trechos restritos. Conferir busca por sinônimos do recorte e por referência canônica, registrando as lacunas antes de alterar a estratégia de busca.

## 3. Executar um turno com evidência e limites

**Arquivos propostos.** `apps/web/src/lib/ia/tarefas/responderPontes.ts`, `apps/web/src/lib/pontes/contrato.ts` e `responderPontes.test.ts`. Adaptar `contrato.ts`, `catalogo.ts`, `executar.ts` e a composição de dependências de `app/api/ia/[tarefa]/route.ts` na infraestrutura existente de IA.

- [ ] Registrar `responder-pontes` como exceção específica nos testes do catálogo e na política de produto quando aprovada. Validar `EntradaPontes = { pergunta, historico, origem? }` em schema fechado. `origem` aceita `{ modulo, referencia }` com módulo conhecido e ID resolvido no servidor. Tratar perguntas, histórico e trechos como dados. Validar acesso e limites antes da recuperação. Isolar habilitação e cache por política da tarefa, mantendo o fluxo já utilizado por `explicar-dispositivo`.
- [ ] Montar a busca pelo assunto da pergunta e pelo contexto recente. Se a pergunta for ambígua ou o recorte estiver sem cobertura, devolver `esclarecer` ou `lacuna` sem chamada paga. Caso elegível, reservar cota e orçamento e executar com o cliente existente. O histórico orienta a conversa. A evidência jurídica vem da busca do turno.
- [ ] Validar `SaidaPontes = { estado, blocos, perguntaSeguinte? }`. Em `estado: explicado`, cada bloco jurídico contém `tipo`, `texto` e IDs de evidências recuperadas. Os tipos distinguem doutrina, legislação, jurisprudência e síntese. Exemplos são rotulados e identificados à parte. O servidor resolve fontes e destinos dos links a partir dos IDs aceitos. Rejeitar referência inventada e saída fora do esquema. A avaliação jurídica do passo 5 mede se os trechos sustentam as afirmações.
- [ ] Rodar `pnpm --filter web test` com modelo simulado. Cobrir seguimento dependente de contexto, histórico contendo citações inventadas, instruções maliciosas na pergunta ou na fonte, lacuna sem geração, cota, concorrência, falha de provedor e ausência de cache compartilhado. Verificar que a regra original permanece aplicada às demais tarefas do catálogo.

## 4. Entregar a conversa e os vínculos do Ratione

**Arquivos propostos.** `apps/web/src/app/professor-pontes/page.tsx`, `ConversaPontes.tsx`, `apps/web/src/lib/pontes/vinculos.ts` e `vinculos.test.ts`. Ajustar o registro em `apps/web/src/lib/modulos.ts` e as telas dos módulos conforme cada vínculo abaixo.

- [ ] Criar a página do tutor com uma pergunta inicial sugerida, histórico da sessão e referências expandidas sob demanda. Exibir espera, falta de cobertura, falha de fonte e cota com mensagens distintas. Permitir começar nova conversa e preservar a pergunta em erro recuperável.
- [ ] NormaViva abre Pontes com a identidade do dispositivo e, quando aplicável, a versão consultada. Pontes devolve um vínculo para a referência efetivamente resolvida. Para evitar dois convites concorrentes, usar Pontes como ação de aprofundamento e preservar a explicação breve de dispositivo como recurso específico.
- [ ] TeseMap abre Pontes com o ID canônico do precedente. Pontes liga de volta ao nó quando ele existir ou à fonte oficial conferida quando a cobertura do grafo for insuficiente.
- [ ] Argumenta encaminha inicialmente o ID de uma questão em demonstração pública. Para decisões privadas, ativar somente quando o Argumenta oferecer uma referência autorizada por usuário, com trecho mínimo e controle de acesso testado. PrazoZero recebe uma navegação para o fluxo de cálculo com confirmação manual dos dados.
- [ ] Rodar `pnpm --filter web test` e `pnpm dev`. Percorrer o piloto no navegador com teclado, de uma dúvida inicial a uma pergunta de acompanhamento e à abertura de uma fonte. Exercitar referência inválida ou retirada, precedente fora do grafo, versão histórica ausente e link para análise privada de outro usuário.

## 5. Avaliar e decidir a abertura do piloto

**Arquivo proposto.** `docs/produto/PONTES_AVALIACAO.md`, com critérios, resultados, falhas e recorte testado. Guardar material protegido e respostas que o reproduzam em ambiente autorizado.

- [ ] Preparar 30 perguntas com revisão humana antes do ensaio, incluindo 8 turnos de acompanhamento, 5 perguntas sem cobertura e casos de divergência, temporalidade, citação inexistente e instruções para sair do acervo. Para cada pergunta, registrar fontes esperadas, afirmações aceitas e condição de lacuna.
- [ ] Verificar `pnpm test`, `pnpm typecheck`, `pnpm build` e `git diff --check`. Rodar o conjunto de avaliações com dados autorizados. Separar os resultados de busca, fidelidade às fontes e qualidade pedagógica. Se houver autorização para inferência paga, medir custo e latência por turno antes de definir os limites definitivos.
- [ ] Gate proposto para liberar o piloto: zero vazamento entre usuários, zero referência inventada apresentada, zero erro jurídico material na amostra, 5 de 5 lacunas reconhecidas e pelo menos 90% das perguntas com cobertura avaliadas como corretas e didaticamente adequadas. Registrar a contagem e os casos reprovados. Reexecutar os casos afetados após corrigir falhas.
- [ ] Demonstrar um turno completo e a desativação pela flag, incluindo revogação de fonte. Submeter a decisão de habilitação com as permissões do acervo, os resultados e os custos observados.
