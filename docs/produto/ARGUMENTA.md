# Argumenta: análise de decisão colada (F5, primeira fatia)

> **Decisões do responsável (22/10/2026):** a F5 começa pelo **texto colado**, sem upload nem armazenamento (que esperam o RIPD, F5-07), e pelas **etapas 1 a 4** do pipeline do PLANO §6.4; a **pseudonimização é sempre ligada**; o modelo é o **Claude Haiku 5.5**, e o corpus de avaliação (F5-05) é que vai dizer se alguma etapa precisa de modelo maior. Qualquer mudança nessas regras precisa de nova decisão do responsável.
>
> As três etapas de IA são tarefas do **catálogo de tarefas de IA** ([`IA_TAREFAS.md`](IA_TAREFAS.md)) e seguem o contrato, o executor único e as travas descritos lá.

## 1. O que é

No `/argumenta`, a pessoa logada cola o texto de uma sentença, acórdão ou decisão e clica em **"Analisar decisão"**. A tela mostra:

- **Visão geral:** tipo de decisão, resultado, resumo e pedidos;
- **Estrutura:** as partes da decisão (cabeçalho, ementa, relatório, preliminares, fundamentação, dispositivo) com acesso aos trechos correspondentes;
- **Mapa** (F5-03, 05/11/2026): por questão, o raciocínio na ordem em que se lê (fatos e provas → normas → doutrina → precedentes → raciocínio da decisão → conclusão) e a lista de normas e precedentes citados na decisão inteira, com a quantidade de questões em que cada um aparece e o selo de conferência. É **montado por código**, só com o que as etapas de questões e de fundamentos já extraíram: **não chama o modelo, não custa nada a mais e não avalia se a decisão está certa**. A lógica é `lib/argumenta/mapa.ts` (com testes) e a tela é `MapaView.tsx`;
- **Questões e fundamentos:** cada questão resolvida (preliminar, prejudicial, mérito ou acessória), a conclusão, como a alegação foi tratada (acolhida, rejeitada…) e os fundamentos dela (fato, prova, norma, precedente, doutrina, argumento), com a citação como aparece no texto.

Cada item permite localizar e destacar os **trechos originais** correspondentes, sem exibir a numeração técnica. O texto integral fica recolhido durante a leitura dos resultados e abre quando a pessoa escolhe “Consultar texto da decisão” ou “Ver no texto”; os trechos destacados aparecem em fluxo de leitura, sem cartões ou rótulos por fragmento. O modelo nunca escreve o trecho mostrado: só indica posições internas no texto preparado.

## 2. Fluxo

```text
navegador                                       servidor (/api/ia/<tarefa>)            modelo
─────────                                       ───────────────────────────            ──────
texto colado
 → segmentar em parágrafos (§1, §2…)
 → pseudonimizar (tabela fica no navegador)
 → argumenta-estrutura  { paragrafos } ───────→ confere formato e dado pessoal ──────→ estrutura
 → argumenta-questoes   { paragrafos } ───────→ idem ────────────────────────────────→ questões e conclusões
 → argumenta-fundamentos { paragrafos, questoes } → idem ────────────────────────────→ fundamentos
 ← respostas com marcadores → restaurar os dados reais só na tela
```

O código encadeia as etapas; se uma falha, "Tentar de novo" retoma dela, sem refazer as anteriores.

| Etapa do PLANO §6.4 | Onde |
|---|---|
| 1. segmentar a decisão | `segmentar` (código) e `argumenta-estrutura` (partes da decisão) |
| 2. identificar questões jurídicas · 3. identificar conclusões | `argumenta-questoes` |
| 4. identificar o fundamento de cada conclusão (e já separar fatos, normas e precedentes, parte da etapa 5) | `argumenta-fundamentos` |
| 5 a 9 (relações, verificação de citações, vulnerabilidades, mapa) | ainda não |

## 3. Regras fixas

| Regra | Como é garantida |
|---|---|
| Só sob demanda e só logado | Clique em "Analisar decisão"; a rota confere a sessão (401 sem ela) |
| Dados pessoais não saem do navegador | `prepararDecisao` (`@ratione/argumenta`) troca nomes rotulados de partes e advogados, nomes ligados por "ajuizada por… em face de…", CPF, CNPJ, RG, OAB, número CNJ do processo, e-mail, telefone, CEP e endereço com número por marcadores (`[PARTE_1]`, `[CPF_1]`…). A tela mostra a lista do que foi trocado, o texto exatamente como será enviado e aceita outros nomes a ocultar |
| O servidor não aceita texto com dado pessoal detectável | `validarEntrada` roda a mesma detecção (`temDadoPessoal`) e recusa (400) se ainda achar algo |
| Pessoas jurídicas de direito público rotuladas (União, Estado, Município, INSS, Ministério Público…) ficam no texto | Não são dado pessoal e ajudam a análise; o usuário pode ocultá-las pela lista de nomes |
| Texto e resposta não ficam guardados | `guardaResultado: false`: o executor não lê nem grava o cache; o registro de uso (`ia_uso`) leva só o hash da decisão (`decisao:<16 hex>`) e o hash da mensagem; os logs só levam tarefa, referência e motivo. `analises` guarda metadados de uso, incluindo nome opcional e, nas novas análises, quantidade de parágrafos, sem conteúdo |
| Resposta só cita parágrafos que existem | `conferirSaida` descarta a resposta inteira se citar parágrafo fora da decisão, questão repetida ou fundamento de questão que não veio |
| Texto longo não é cortado em silêncio | Acima de 70.000 caracteres (cerca de 20 páginas; eram 21.000 até 30/10/2026) ou 1.500 parágrafos (eram 800 até 30/10/2026), a tela avisa e o servidor recusa (400). O de parágrafos está também no banco (`analises.paragrafos`, de 1 a 1.500, migração `20261030000001`): subi-lo de novo exige migração antes do código |
| Sem ferramentas, sem busca, sem dado de outra base | `ferramentas: []`; o contexto é só a decisão enviada |

## 4. Limites

| Limite | Valor |
|---|---|
| Cota | **do plano do usuário**, por análise rápida: Gratuito 3 por semana, Essencial 40 e Profissional 150 por mês ([`PLANOS_E_COBRANCA.md`](PLANOS_E_COBRANCA.md) §2.2). A cota é conferida uma vez, ao iniciar a análise (`POST /api/analises`); as três etapas carregam o mesmo `analiseId`. A análise passa a contar quando a **1ª etapa** é entregue; falha sem solução **estorna**. "Tentar de novo" continua a mesma análise |
| Mensagem | 85.000 caracteres (a decisão até 70.000, mais até 10 questões na etapa de fundamentos) |
| Resposta | 6.000 tokens (estrutura; eram 3.000 até 04/11/2026, quando a sentença do júri foi cortada) e 4.000 (questões) e 7.000 (fundamentos, até 50 itens). O raciocínio do modelo conta dentro desse limite; por isso a etapa de fundamentos roda em esforço **baixo** (30/10/2026: em esforço médio, numa decisão de 97 parágrafos, 2.946 de 4.581 tokens foram só raciocínio e a resposta foi cortada; em baixo, 2.142 tokens, sem raciocínio) |
| Itens | até 15 pedidos, 15 partes, 10 questões e 50 fundamentos (subiu de 30 em 30/10/2026: uma decisão com 6 questões passou de 30; acima de 50 guardam-se os 50 primeiros, sem descartar a etapa) |
| Custo | **US$ 0,0057 por análise** com o Haiku 5.5 (três chamadas; média medida em 04/11/2026 nas 30 decisões do corpus, de US$ 0,0024 a US$ 0,0128 conforme o tamanho); era ~US$ 0,004 pela estimativa de 23/10/2026 |

## 5. Limitações conhecidas

- A pseudonimização acha identificadores formatados e nomes **rotulados**; um nome citado só no meio do texto, sem rótulo, passa, se o usuário não o acrescentar à lista. Por isso a tela mostra o texto como será enviado.
- A segmentação de texto copiado de PDF usa heurística (linha mais curta terminada em ponto encerra o parágrafo; título em caixa alta e linha com rótulo ficam sozinhos). Não há página: a âncora é o parágrafo. Página e posição vêm com o Docling (F5-02).
- A citação é a do texto. O selo da F5-04 (§8) diz se a base do Ratione a tem, mas não se ela está certa nem o que o precedente afirma.
- Sem fragilidades, teses, mapa nem estratégias: a análise de exemplo, abaixo do formulário, mostra aonde o módulo vai chegar.

## 6. Avaliação (F5-05)

O corpus de **30 decisões públicas** (STJ, TRF4, TST, TRT4, TJPA e TJAL, com gabarito conferido por jurista) avalia a **extração estrutural**, não a concordância perfeita com a IA. **Resultado final (04/11/2026, Haiku 5.5):** dispositivo certo em **26 de 30**, **91 de 101** questões e **160 de 192** citações esperadas encontradas, **0 de 90** saídas descartadas, **US$ 0,0057 por decisão** e no máximo 20,9 s por chamada. O dispositivo oscila de 26 a 29 de 30 entre rodadas com a mesma instrução, e a amostra é pequena: serve para decidir o que melhorar, não é garantia de acerto. O modelo é o **Haiku 5.5** por decisão do responsável (o Sonnet 5.5 custou 17 vezes mais e não acertou mais). **Método, régua das métricas, comparação de modelos e diário das rodadas:** [`ARGUMENTA_AVALIACAO.md`](ARGUMENTA_AVALIACAO.md). Comandos (`pnpm --filter web avaliacao`) e formato do caso: [`packages/argumenta/corpus/LEIA-ME.md`](../../packages/argumenta/corpus/LEIA-ME.md).

## 7. Ligar

As tarefas usam a mesma chave da IA do resto do site (`IA_EXPLICACAO_LIGADA=sim` e `ANTHROPIC_API_KEY` no servidor; `NEXT_PUBLIC_IA_EXPLICACAO=sim` no build para mostrar o formulário). Exige a migração `20261023000001_planos_e_analises.sql` (planos, análises e a cota por análise), **aplicada antes** de publicar este código (`supabase/LEIA-ME.md`). A contagem de parágrafos das novas análises também exige `20261024000002_tamanho_analise.sql` antes de disponibilizar o frontend novo (§4.2 de `PLANOS_E_COBRANCA.md`); nesta entrega só foi aplicada em teste local. Sem a IA ligada, a tela mostra só a análise de exemplo.

## 8. Verificação de citações (F5-04)

Depois que os fundamentos chegam, a tela confere a **citação** de cada um (`"CDC, art. 14"`, `"Súmula 479 do STJ"`) contra o corpus público e mostra um selo ao lado dela. É **código, sem IA**: `lib/argumenta/citacoes.ts` reconhece o formato e `lib/argumenta/verificarCitacoes.ts` consulta o banco.

| Reconhece | Confere em | Selo |
|---|---|---|
| Artigo de uma das 28 normas (com parágrafo, inciso ou alínea) e lei por número e ano | `dispositivos` e `normas` (NormaViva) | **Encontrada na base**, com link; se só o artigo existe, avisa que o detalhe não foi conferido |
| Súmula do STF ou do STJ, vinculante ou não; tema de repercussão geral (STF) ou repetitivo (STJ) | `tesemap_nos` (TeseMap) | **Encontrada na base**, com link, ou **Não localizada na base** |
| ADI, ADPF, ADC e ADO | `tesemap_nos` | **Encontrada** ou **Fora da base** (a base só tem as de mérito julgado) |
| Norma ou súmula de outro tribunal, lei fora das 28 | não confere | **Fora da base** |

**Regras.** O selo diz se a base do Ratione tem a citação; **não diz que ela esteja certa ou errada**, e não confere o que o precedente afirma. Doutrina, recurso (`REsp 1.234.567`), "art. 14" sem norma e várias súmulas numa citação só ficam **sem selo**, e falha de leitura também: na dúvida, a tela não afirma nada. A leitura é a de qualquer visitante (chave publicável, RLS), feita pelo navegador; **só a string da citação sai da página**, nunca o texto da decisão, e nada é gravado. No máximo 60 citações distintas por análise.

**Conferência com as citações reais do corpus (04/11/2026, banco de produção, visitante anônimo, só leitura; `pnpm --filter web exec tsx scripts/conferir-citacoes.ts <rodada>`, com as variáveis `NEXT_PUBLIC_SUPABASE_*` do site):** 483 citações distintas (as dos gabaritos e as que o Haiku trouxe nas 30 decisões). **165 receberam "Encontrada"** (145 artigos de lei, 13 súmulas, 7 temas), **nenhuma "Não localizada"**, **86 "Fora da base"** (leis e decretos fora das 28 normas, súmulas e temas do TST, o CPC de 1973) e **231 sem selo** (recursos, habeas corpus, doutrina e citações com mais de um artigo, parágrafo ou inciso). Achados e correções do reconhecedor: "CP, art. 61, II, e", "CLT, art. 482, i", "CF/88", "Constituição" sem "Federal", "CC/2002" e "inciso I" caíam em "Fora da base" com a mensagem "Norma que a base ainda não cobre" mesmo sendo normas da base; agora o artigo é conferido e a alínea fica como não conferida (o selo avisa). Citação de norma da base com mais de um artigo, parágrafo ou inciso ("arts. 205 e 206", "§ 6º e § 8º") ficou **sem selo**, e não "Fora da base". "CPC, art. 543-C" (recursos repetitivos do CPC de 1973, que o de 2015 não tem) saía "Não localizada" e agora é "Fora da base".

**Correção vista em produção (05/11/2026):** numa análise real, "Tema Repetitivo nº 1150" e "Tema Repetitivo nº 1.387" saíram **sem selo**, embora os dois temas existam na base (`STJ-TEMA-1150` e `STJ-TEMA-1387`): o reconhecedor só aceitava o número logo depois de "Tema". Agora aceita a natureza do tema entre os dois ("Tema Repetitivo nº…", "Tema de Repercussão Geral nº…", "Tema RG…"); com as citações do corpus, os temas encontrados passaram de 7 para 10.

**Conferência no banco de produção (25/10/2026, como visitante anônimo, só leitura):** `STJ-TEMA-1076`, `STF-RG-660` e `STF-ADI-4675` existem pelo id; `Súmula 479` (STJ), `SV 10` e `Súmula 339` (STF) existem por `tribunal` + `numero_referencia`; `art. 14` do CDC e `art. 85, § 2º` do CPC existem em `dispositivos`; `art. 9999` do CDC não existe. É o formato em que o reconhecedor monta a consulta.

## 9. Documentos enviados (F5-01, fatia 1: guardar, listar e apagar)

> **Decisões do responsável (04/11/2026):** os documentos ficam guardados por **7 dias** e depois são apagados sozinhos; cada arquivo tem no máximo **10 MB** e cada usuário, no máximo **10 arquivos** ao mesmo tempo. Aceita **PDF, DOCX e texto simples (.txt, UTF-8)**.

**Estado:** a base de armazenamento está pronta e **desligada**. Sem `ARGUMENTA_UPLOAD_LIGADO=sim` e `DOCUMENTOS_CHAVE`, as rotas de envio e de listagem respondem 503 e nada é guardado. Ainda **não há tela** de envio, nem leitura do texto do documento (Docling, F5-02), nem análise sobre o arquivo: nada disto vai ao ar antes das condições da seção 7 do RIPD ([`../juridico/RIPD_ARGUMENTA.md`](../juridico/RIPD_ARGUMENTA.md)).

| O que | Como |
|---|---|
| Rotas | `POST /api/documentos` (multipart, campo `arquivo`), `GET /api/documentos` (lista os do usuário), `DELETE /api/documentos/<id>`, `POST /api/documentos/limpar` (agendador, com segredo) |
| Cifra (RIPD, condição 1) | O servidor cifra o arquivo com **AES-256-GCM** antes de gravar; a chave (`DOCUMENTOS_CHAVE`, 32 bytes em base64) fica no Secret Manager, fora do banco e do bucket. O caminho do objeto entra como dado autenticado: um arquivo copiado para outro caminho ou usuário não decifra. Formato: versão (1 byte), IV (12), cifrado, etiqueta (16) |
| Armazenamento | Bucket **privado** `documentos`, sem política: só a chave de serviço lê e escreve. Caminho opaco `<usuário>/<id>`, sem nome nem tipo |
| Banco | Tabela `documentos`: tipo, tamanho, caminho, criado em e expira em. **Nunca o nome do arquivo (pode ser nome de parte) nem o conteúdo.** O usuário só lê a própria linha; inserir e apagar é só do servidor |
| Tipo | Vem do **conteúdo** (`%PDF-`; ZIP com `[Content_Types].xml` e `word/`; UTF-8 válido sem byte nulo), nunca do nome nem do tipo declarado pelo navegador. Executável e ZIP que não é Word são recusados |
| Retenção (RIPD, condição 2) | 7 dias. Vencido sai antes de contar o limite e some da lista; a faxina geral é a rota `limpar`, chamada **a cada hora** pelo agendador. `DOCUMENTOS_RETENCAO_DIAS` só pode **reduzir** o prazo, nunca aumentá-lo |
| Exclusão pelo usuário | `DELETE` apaga o arquivo e a linha. Documento de outro usuário ou inexistente dá o mesmo "não encontrado". **A exclusão da conta apaga antes todos os arquivos do usuário; se não conseguir, a conta não é apagada** |
| Apagar não depende da flag | `DELETE`, a faxina (`limpar`) e a exclusão da conta funcionam mesmo com o envio desligado: o que já foi guardado tem de poder sumir |
| Falhas | Se a linha do banco falha depois de gravar o arquivo, o arquivo é desfeito (nada órfão). O log leva só o motivo técnico, nunca nome nem conteúdo |

**Para ligar (depois do RIPD):** aplicar a migração `20261104000001_documentos.sql`; criar os segredos e o agendador (`docs/deploy/CLOUD_RUN.md`, seção "Documentos enviados"); só então `ARGUMENTA_UPLOAD_LIGADO=sim`. Falta decidir a tela de envio e a pseudonimização do documento (a do navegador só vê texto colado; a extração é a F5-02).
