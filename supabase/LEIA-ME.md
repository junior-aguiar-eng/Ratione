# Supabase do Ratione: passo a passo

Este diretório guarda o esquema do banco (`migrations/`). O projeto real: `ratione`, região São Paulo (`sa-east-1`), criado em 08/10/2026 com a Data API ligada, "expor tabelas novas" desligado e RLS automática ligada. A migração foi aplicada e conferida no catálogo do banco. Os testes de segurança (um usuário não acessa dado de outro) ficam em `packages/db` e rodam sem internet: `pnpm --filter @ratione/db test`.

## O que você faz no painel do Supabase (uma vez, uns 10 minutos)

1. **Criar o projeto.** Em https://supabase.com/dashboard, *New project*:
   - Nome: `ratione`.
   - **Região: South America (São Paulo)** (os dados ficam no Brasil; LGPD).
   - Senha do banco: crie uma forte e **guarde só no seu gerenciador de senhas**. Não a envie a ninguém, nem a mim.
2. **Criar as tabelas.** Menu *SQL Editor* → *New query* → cole **todo** o conteúdo de `supabase/migrations/20261007000001_perfis_e_itens_salvos.sql` → *Run*. Deve aparecer "Success". Depois, em *Table Editor*, confira que existem `perfis` e `itens_salvos` com o cadeado de RLS ligado.
3. **Ligar o login por e-mail.** *Authentication* → *Providers* → *Email* ligado, com *Confirm email* ligado. Em *URL Configuration*, *Site URL* = `http://localhost:3000` (depois trocamos pelo endereço de produção).
4. **Copiar duas informações públicas.** *Project Settings* → *API*:
   - **Project URL** (algo como `https://xxxx.supabase.co`);
   - a chave **publicável** (`sb_publishable_...`, em *API Keys*). A chave *secret* nunca vai para o `.env.local`.
5. **Colocar no seu computador, não no GitHub.** Copie `apps/web/.env.example` para `apps/web/.env.local` e preencha as duas linhas. O `.env.local` já é ignorado pelo Git.

## NormaViva: aplicar a migração e carregar o corpus das leis (F3-05)

O texto das 28 normas (CF, códigos e leis de maior uso) fica em 4 tabelas públicas de leitura: `normas`, `dispositivos`, `versoes_dispositivo` e `relacoes`. Ninguém além da chave de serviço escreve nelas.

1. **Aplicar as duas migrações.** *SQL Editor → New query*: cole **todo** o conteúdo de `supabase/migrations/20261019000001_normaviva.sql` → *Run* ("Success"). Depois a mesma coisa com `supabase/migrations/20261019000002_resolver_destinos.sql` e com `supabase/migrations/20261020000001_busca_por_proximidade.sql` (esta troca a função de busca por assunto por uma versão com proximidade; o projeto `ratione` já a tem aplicada desde 20/10/2026). Em *Table Editor* confira as 4 tabelas com o cadeado de RLS ligado.
2. **Conferir a carga sem tocar no banco.** No terminal, em `packages/normaviva`: `pnpm carregar --simular`. Deve mostrar 28 normas, 29.447 dispositivos, 29.447 versões e 13.371 relações.
3. **Carregar.** No mesmo terminal, **só nele**, defina as duas variáveis e rode (PowerShell). A chave é a **secreta** (`sb_secret_…`); com a publicável (`sb_publishable_…`) o banco responde "permission denied" e nada muda:

   ```powershell
   $env:SUPABASE_URL = "https://<ref>.supabase.co"          # Project Settings → API → Project URL
   $env:SUPABASE_SERVICE_ROLE_KEY = "<chave secret/service_role>"   # Project Settings → API Keys
   pnpm carregar
   ```

   Ao final o script confere a contagem do banco contra o corpus e avisa se algo não bate. Pode repetir quando quiser: a recarga apaga as 4 tabelas e insere tudo de novo. Feche o terminal depois (a chave some da memória do terminal).
4. **Testar a busca.** No SQL Editor: `select * from buscar_dispositivos('honorários advocatícios', 'LEI-13105-2015', 5);` deve devolver artigos do art. 85 do CPC.

A chave **service_role** nunca vai para o Git, para o `.env.local` do site nem para esta conversa.

## NormaViva: busca sem acento (22/10/2026)

A pesquisa por assunto passa a achar o que se digita sem acento ("honorarios advocaticios", "prisao preventiva"). Depois de aplicar a `20261022000004_busca_sem_acento.sql` (a mesma do passo do TeseMap abaixo: crie a extensão `unaccent` e a configuração de busca), aplique `supabase/migrations/20261022000006_normaviva_busca_sem_acento.sql` no *SQL Editor → New query* → *Run*. Ela recria uma coluna de busca nas 29 mil linhas de `dispositivos` (alguns segundos). Teste: `select count(*) from buscar_dispositivos('honorarios advocaticios', 'LEI-13105-2015', 100);` deve devolver 18 ou mais; com acento o resultado é o mesmo de antes. **Aplicada em produção em 22/10/2026** (18 com e sem acento).

## TeseMap: aplicar a migração e carregar os precedentes do STJ (F4-03)

O grafo do TeseMap fica em `tesemap_nos` e `tesemap_arestas` (leitura pública filtrada pela RLS: só nó curado ou validado por pessoa; aresta só validada).

1. **Aplicar as migrações.** *SQL Editor → New query*: cole **todo** o conteúdo de `supabase/migrations/20261022000003_tesemap.sql` → *Run* ("Success"); depois o de `supabase/migrations/20261022000004_busca_sem_acento.sql` (extensão `unaccent` e configuração de busca sem acento) e o de `supabase/migrations/20261022000005_tesemap_busca.sql` (pesquisa por assunto da tela: todas as palavras, sem acento; se você já aplicou a primeira versão, `20261022000004_tesemap_busca.sql`, esta a substitui sem erro). Em *Table Editor* confira as 2 tabelas com o cadeado de RLS ligado.
2. **Conferir sem tocar no banco.** Em `packages/tesemap`: `pnpm carregar:tesemap --simular` (deve mostrar 7.734 nós: 1.150 precedentes e 646 súmulas do STJ, 1.141 temas de repercussão geral do STF, 785 súmulas do STF, 4.008 processos de controle concentrado e 4 dispositivos do grafo mínimo, e 5 arestas; 399 deles com atalho para o NormaViva).
3. **Carregar.** No mesmo terminal, **só nele**, defina `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (como na carga do NormaViva) e rode `pnpm carregar:tesemap`. A carga **não apaga nada**: atualiza por `id` os nós do STJ e do STF e deixa o que foi curado à mão.
4. **Testar.** No SQL Editor: `select * from tesemap_cobertura();` deve mostrar `STJ | precedente | 1150`, `STF | precedente | 823`, `STF | tema | 318` e `STF | sumula | 785`, com a data da leitura; `select id from tesemap_buscar('honorarios apreciacao equitativa') limit 5;` deve trazer `STJ-TEMA-1076` (4º em 22/10/2026, atrás do Tema 1255 do STF, sobre o mesmo assunto).

**Atualização semanal.** O workflow `Atualizar TeseMap` avisa por issue quando os Dados Abertos do STJ mudam ou quando um arquivo de entrada manual (STF, súmulas do STJ) passa de 90 dias. A carga continua manual: `pnpm coletar:stj` (ou o importador da fonte manual), PR e `pnpm carregar:tesemap`.

**Grafo mínimo (F4-05).** A mesma carga grava os 4 nós de dispositivo do art. 85 do CPC e as 5 relações de `packages/tesemap/corpus/grafo-minimo.json`. As relações só aparecem no site depois de validadas: confira a folha `packages/tesemap/corpus/grafo-minimo.md` (gerada por `pnpm grafo-minimo`), registre a validação no JSON e rode `pnpm carregar:tesemap` de novo. Teste no SQL Editor: `select count(*) from tesemap_arestas;` dá o total gravado (com a chave de serviço ou no editor); a tela só mostra as validadas.

**Feito em produção em 22/10/2026:** migrações `20261022000003` a `...005` aplicadas e conferidas, 3.076 nós carregados e cobertura conferida (STJ 1.150; STF 823 precedentes, 318 temas e 785 súmulas).

A chave **service_role** nunca vai para o Git, para o `.env.local` do site nem para esta conversa.

## Teto de itens salvos (20/10/2026)

`supabase/migrations/20261020000002_limite_itens_salvos.sql` limita a 1.000 os itens salvos por conta (gatilho `limitar_itens_salvos`, mesmo padrão do teto de lembretes). **Aplique no projeto real:** *SQL Editor → New query*, cole o conteúdo do arquivo → *Run*. Enquanto não for aplicada, o site funciona, só sem o teto; o botão "Salvar em Meu espaço" passa a mostrar "Limite de itens atingido" quando a conta estiver cheia.

## Explicação por IA (F3-08, 22/10/2026)

`supabase/migrations/20261022000001_explicacao_ia.sql` cria o cache das explicações (`ia_explicacoes`), o registro de uso com o custo (`ia_uso`) e as funções que conferem cota e orçamento de forma atômica (`ia_reservar`, `ia_finalizar`, `ia_registrar_cache`), executáveis só pela chave de serviço. **Aplique no projeto real** pelo *SQL Editor* antes de ligar a funcionalidade; enquanto ela estiver desligada, a migração não muda nada no site. Como ligar e desligar: `docs/produto/EXPLICACAO_IA.md`, §5.

`supabase/migrations/20261022000002_ia_tarefas.sql` (mesmo dia) generaliza essas tabelas para o **catálogo de tarefas de IA** (`docs/produto/IA_TAREFAS.md`): o cache vira `ia_respostas`, o uso ganha a coluna `tarefa` e a cota passa a ser por tarefa, com o orçamento do mês e "uma chamada de cada vez" valendo para todas. Aplique **depois** da anterior (podem ir juntas, nesta ordem); preserva o que já houver nelas. **Ambas aplicadas em produção em 22/10/2026.**

## Cobrança com o Mercado Pago, em teste e desligada (F8-05, 23/10/2026)

`supabase/migrations/20261023000003_cobranca_mercadopago.sql` acrescenta `planos.preco_mensal_centavos` (vazio: sem preço, ninguém assina), o vínculo com o Mercado Pago em `assinaturas` (`ambiente`, `mp_assinatura_id`, `mp_situacao`, `valor_centavos`), as tabelas `cobrancas` (o cliente lê as próprias) e `mp_eventos` (avisos recebidos, só o servidor) e as funções do servidor. **Não muda nada no site enquanto a cobrança estiver desligada** (variável `COBRANCA` ausente ou diferente de `sim`), e as funções antigas continuam como estão, então **não há ordem rígida de implantação**: pode ser aplicada antes ou depois do código. Aplique depois da `20261023000002`. Como ligar em modo de teste: `docs/produto/PLANOS_E_COBRANCA.md` §7.4.1.

Conferência depois de aplicar: `select count(*) from public.cobrancas;` deve dar 0; `select id, preco_mensal_centavos from public.planos order by ordem;` deve mostrar os três planos com o preço vazio; `select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and proname ~ '^(assinatura_|mp_evento_|cobranca_)' order by 1;` deve listar `assinatura_aplicar`, `assinatura_criar_pendente`, `assinatura_vincular_mp`, `cobranca_registrar`, `mp_evento_concluir`, `mp_evento_descartar` e `mp_evento_registrar`.

## Fundos de gasto de IA (23/10/2026)

`supabase/migrations/20261023000002_fundos_de_gasto.sql` troca o teto único de gasto por **dois fundos** (`ia_fundos`: `gratuito` US$ 15 e `pagantes` US$ 5 por mês), acrescenta `ia_uso.fundo` (e rotula o gasto anterior como do gratuito), faz `analise_iniciar` avisar quando o fundo do usuário acabou e **troca `ia_reservar`** (perde o parâmetro de orçamento, que agora vem da tabela). Aplique depois da `20261023000001`. **Mesma regra de implantação: aplique a migração ANTES de publicar o código**, porque o código novo chama a `ia_reservar` de 6 argumentos e a migração remove a de 7 que o código atual usa; entre uma coisa e outra o Argumenta e o "Explicar com IA" ficam fora do ar uns 3 a 5 minutos.

Conferência depois de aplicar: `select fundo, orcamento_mes_usd from public.ia_fundos order by fundo;` deve dar `gratuito 15.00` e `pagantes 5.00`; `select * from public.ia_fundos_situacao();` mostra o gasto do mês de cada fundo (o do gratuito deve ser uns centavos de dólar, só os testes de hoje); e `select proname, pronargs from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and proname = 'ia_reservar';` deve listar **uma** linha, com **6** argumentos. A variável `IA_ORCAMENTO_MES_USD` deixa de existir. Para mudar um teto: `update public.ia_fundos set orcamento_mes_usd = 20 where fundo = 'gratuito';`.

## Planos e cota por análise (F8-02 e F8-03, 23/10/2026)

`supabase/migrations/20261023000001_planos_e_analises.sql` cria `planos` e `plano_cotas` (Gratuito, Essencial, Profissional, com as cotas de `docs/produto/PLANOS_E_COBRANCA.md` §2.2), `assinaturas`, `analises` e as funções que conferem a cota por análise (`analise_iniciar`, `analise_consumir`, `analise_concluir`, `analise_falha`, `analise_cancelar`, `uso_resumo`, `plano_vigente`). Também **troca a função `ia_reservar`** (passa a exigir uma análise e perde as cotas por dia e por mês) e acrescenta `ia_uso.analise_id`. Não há cobrança: todo usuário está no plano Gratuito até existir uma assinatura, que só o servidor cria.

**Ordem de implantação (importante):** aplique a migração no *SQL Editor* **antes** de publicar o código que a usa. O código novo chama funções que só existem depois dela, e a migração remove a assinatura antiga de `ia_reservar`, de que o código antigo depende. O intervalo entre aplicar a migração e publicar o código (uns 2 minutos) deixa o **Argumenta e o "Explicar com IA" fora do ar**; as demais ferramentas não são afetadas. Conferência depois de aplicar: `select id, periodo from public.planos order by ordem;` deve listar três planos, e `select count(*) from public.plano_cotas;` deve dar 9. Depois de publicar, `IA_LIMITE_DIA` e `IA_LIMITE_MES` deixam de ter efeito. **Aplicada em produção em 23/10/2026**, com as cinco conferências corretas; código publicado no mesmo dia e verificado ao vivo (análise de teste: cota do Gratuito foi de 3 para 2; explicação de dispositivo, de 10 para 9).

## Correções de dados do NormaViva (`supabase/correcoes/`)

Arquivos SQL que corrigem o texto já carregado sem recarregar o corpus inteiro. Cada um é gerado do corpus, idempotente e termina com uma consulta de conferência. Aplicar no *SQL Editor*, depois do merge do código que muda o parser. Aplicadas: `20261020_producao_de_efeito.sql` em 20/10/2026 (conferido no banco: 0 dispositivos com a anotação no texto, 12 revogados corrigidos, 737 revogados no total, hash das versões confere).

- `20261021_atos_com_data_por_extenso.sql` (F3-05 e F3-03): corrige 249 remissões cuja norma de destino tinha o ano errado, 2 relações e 2 versões do CPC (art. 63, §§ 1º e 5º) com o ato errado, e liga as remissões ao artigo de destino (`resolver_destinos_relacoes`). Gerada da diferença entre o corpus antes e depois da correção do reconhecedor de atos e ensaiada contra uma carga com o reconhecedor corrigido (idêntica; 2.851 → 2.967 remissões ligadas). Independe da ordem dos outros arquivos. Conferência no fim: `2967`, `0` e `0`. Aplicada em 21/10/2026 no projeto `ratione`: `2966`, `0` e `0` (a produção tinha uma remissão ligada a menos que o ensaio antes da correção, 2.850 contra 2.851; a diferença é anterior a este arquivo).
- `20261021_atos_sem_de_antes_do_mes.sql` (F3-05, complemento do anterior): quando o Planalto omite o "de" antes do mês ("de 24 julho de 1991"), o reconhecedor ainda lia o dia como ano. Corrige 3 remissões (duas para o CPC de 1973, uma para a Lei nº 8.212/1991); achado pela conferência feita depois de aplicar o anterior. Independe da ordem. Conferência no fim: `0` remissões com destino errado. Aplicada em 21/10/2026 no projeto `ratione`: `0` e `2966` remissões ligadas (as três apontam para normas fora da base, por isso o total ligado não muda).
- `20261021_versoes_anteriores.sql` (F3-04, gerado por `pnpm historico:sql`): *(regenerado em 21/10/2026 com os casos atualizados pela correção do sufixo falso; a versão aplicada em produção está no histórico do git)* grava no banco as redações anteriores dos casos do F3-07 como segunda versão de cada dispositivo e marca a vigente com `texto_anterior_disponivel`. **Ordem obrigatória:** (1) publicar o código novo da página (ele lê com ou sem as colunas novas, então não quebra no meio do caminho; o código antigo, sim, mostraria a redação errada se as linhas entrassem antes); (2) aplicar a migração `supabase/migrations/20261021000001_versoes_anteriores.sql`; (3) aplicar este arquivo. Conferência no fim: `57` e `57`. **Aplicados em 21/10/2026** (migração e dados, depois do deploy; conferido no banco: 29.504 versões, uma vigente por dispositivo, nenhuma conferida). Quando o revisor validar casos (`pnpm historico`), rodar de novo `pnpm historico:sql` e aplicar: a conferência passa a constar da tela. O arquivo só insere onde ainda não há redação anterior; para atualizar a conferência de uma já inserida, use a recarga (`pnpm carregar`) ou um `update` em `conferida_por` e `conferida_em`.
- `20261022_conferencia_f3_07.sql` (F3-07): grava `conferida_por` e `conferida_em` nas 57 redações anteriores validadas pelo revisor jurídico em 22/10/2026, casando dispositivo e hash do texto (redação diferente da validada não é marcada). Idempotente. Conferência no fim: `57` conferidas e `0` sem conferência. Com isso a tela do NormaViva passa a mostrar essas redações anteriores (redação não validada não aparece, decisão de 22/10/2026).
- `20261020_producao_de_efeito.sql`: tira "Produção de efeito(s)" do texto de 81 dispositivos (CF, CLT, Código Civil, Lei 11.101, CTN, ECA, Lei 8.213 e CTB) e marca como revogados 12 que apareciam como vigentes. Funciona por regras sobre os dados do banco (não carrega texto de lei no script), ensaiado contra uma recarga com o parser novo. Conferência esperada no fim: `0` e `12`.

### Recarga depois da correção do sufixo falso (21/10/2026) e dos resíduos do parser (22/10/2026)

O parser lia "Art. 3º - A lei…" como art. 3º-A (CP, CLT, CTN, LEF, LEP, LINDB e parte da CF). Corrigido, 980 dispositivos mudam de id, e as relações e versões que apontam para eles mudam junto: por isso a correção em produção é a **recarga completa**, não um arquivo de `correcoes/`.

1. Esperar o deploy do código com a correção (o site lê pelo id; a ordem evita que a página nova procure ids antigos ou o contrário por muito tempo).
2. `pnpm carregar --simular` em `packages/normaviva`: 28 normas, 29.294 dispositivos, 29.351 versões e 13.256 relações (contagem depois dos resíduos do parser, 22/10/2026; antes eram 29.447, 29.504 e 13.371).
3. `pnpm carregar` com as duas variáveis do passo 3 da seção do NormaViva acima. A recarga já inclui as redações anteriores do F3-04 (não é preciso aplicar `20261021_versoes_anteriores.sql` de novo) e repõe as correções de `correcoes/` (elas já estão no corpus).
4. Conferir no *SQL Editor*: `select count(*) from relacoes where tipo = 'remete' and destino_id is not null;` deve dar cerca de `3008` (o corpus dá 3.008), e `select texto from dispositivos where id = 'DL-2848-1940|corpo|art. 3º';` deve começar com "A lei excepcional".

A mesma recarga leva os resíduos do parser corrigidos em 22/10/2026 (tachado por estilo, aspas retas, medida provisória rejeitada, incisos revogados com ";" e os artigos do decreto da CLT; ver F3-02 no PLANO). **Recarga feita em produção em 22/10/2026**, depois da migração `20261022000006`: o script conferiu 28 normas, 29.294 dispositivos, 29.351 versões e 13.256 relações; no banco, 3.008 remissões ligadas, 57 redações anteriores e o art. 3º do CP começando por "A lei excepcional" (sem o art. 3º-A falso).

Itens salvos em Meu espaço que apontavam para um dos ids antigos (ex.: "art. 3º-A" do CP) deixam de abrir o dispositivo; o resto não muda.

## O que NÃO compartilhar

- A chave **secret** / **`service_role`** (dá acesso total e ignora a RLS).
- A senha do banco.
- Qualquer chave que o painel marque como *secret*.

A chave **publicável** e a URL são feitas para ficar no navegador; a segurança vem das regras de RLS testadas aqui. Mesmo assim, prefira não colá-las em conversas: basta eu saber que o `.env.local` está preenchido.

## Modelos de e-mail (obrigatório para o login funcionar em qualquer navegador)

Os links padrão do Supabase só funcionam no mesmo navegador em que o pedido foi feito, e o Outlook/Hotmail costuma gastá-los ao varrer o e-mail. O Ratione usa a página `/auth/confirm`, que só consome o link quando o usuário clica no botão.

**Antes, o SMTP próprio.** Com o e-mail padrão do Supabase o painel não deixa editar os modelos ("Set up custom SMTP to edit templates"). Ative em *Authentication → Emails → SMTP Settings*. Com o Gmail: host `smtp.gmail.com`, porta `465`, usuário e remetente = o endereço do Gmail, e no campo de senha uma **senha de app** (myaccount.google.com/apppasswords, exige verificação em duas etapas). A senha normal é recusada: o pedido falha com `534 5.7.9 Application-specific password required`, visível em *Logs → Auth* (POST `/recover` com status 500), enquanto a tela só diz que enviou. O SMTP próprio também sobe o limite para 30 e-mails por hora (*Authentication → Rate Limits*).

Depois troque os modelos em *Authentication → Emails → Templates*:

- **Confirm signup**: troque o link do botão por
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup`
- **Reset Password**: troque por
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`

Mantenha o resto do texto do modelo. Confira que *URL Configuration → Site URL* é o endereço onde o site está rodando (`http://localhost:3000` no teste local; o de produção depois). Links de e-mails enviados **antes** da troca continuam no formato antigo: peça um novo.

## Estado atual (10/10/2026)

Tudo acima foi feito para o projeto `ratione`. O site publicado é `https://ratione.nexojuris.ia.br`: *Site URL* aponta para ele e a lista de redirecionamentos tem `https://ratione.nexojuris.ia.br/auth/callback` e `http://localhost:3000/auth/callback` (desenvolvimento). Os dois modelos apontam para `/auth/confirm` e usam `{{ .SiteURL }}`, então os links dos e-mails levam ao site publicado, também nos testes locais.

**SMTP: Resend, com domínio próprio.** Host `smtp.resend.com`, porta `465`, usuário `resend`, senha = chave de API do Resend (permissão só de envio, restrita ao domínio `nexojuris.ia.br`), remetente `nao-responda@nexojuris.ia.br` ("Ratione"). Substituiu o Gmail, que o painel desaconselha para produção e limita a 30 e-mails por hora. A chave fica só no painel do Supabase; para trocá-la, crie outra no Resend, cole no campo de senha do SMTP e apague a antiga. Testado em 10/10/2026: cadastro com confirmação e recuperação de senha, com os links abrindo no domínio publicado.

## Painel administrativo da F8-04 (entrega local de 24/10/2026)

`migrations/20261024000001_painel_administrativo.sql`, depois de `20261023000003`, registra `plano_id` em novos usos de IA e cobranças por gatilho; registros antigos ficam sem atribuição. Acrescenta o índice de data das cobranças e a RPC **somente leitura** `admin_financeiro(integer)`, exclusiva de `service_role`, que agrega o mês de Brasília e pagina contas em blocos de 20. Não muda os valores dos fundos, custo já registrado, preços ou situação das assinaturas. Não há tabela nova nem mudança de RLS.

**Aplicada no projeto remoto Ratione em 24/10/2026**, após autorização de deploy. A RPC respondeu à consulta de leitura; `anon` e `authenticated` não têm EXECUTE e `service_role` tem EXECUTE. Contagens preservadas: 4 análises, 19 usos e nenhuma cobrança; fundos mantidos em US$ 15 e US$ 5. Não foram atribuídos planos históricos. O painel permanece fechado sem `RATIONE_ADMIN_USUARIO_IDS`.

A página `/meu-espaco/administracao` e a API `/api/admin/financeiro` exigem `RATIONE_ADMIN_USUARIO_IDS` no servidor e sessão verificada. Sem configuração válida, negam acesso; ter plano pago ou declarar `admin` em metadados não autoriza. Não usar `NEXT_PUBLIC_` nem levar a chave de serviço ao navegador. A configuração é independente de `COBRANCA_LIGADA`; ver método e limitações em `docs/produto/PLANOS_E_COBRANCA.md` §4.1.

## Tamanho da decisão no histórico (F8-04, entrega local de 24/10/2026)

`migrations/20261024000002_tamanho_analise.sql`, depois de `20261024000001`, acrescenta `analises.paragrafos` (inteiro de 1 a 800; nulo para registros antigos; explicação sem tamanho) e `analise_iniciar_com_tamanho(uuid,text,text,integer)`, exclusiva de `service_role`. Essa função reutiliza a reserva/cota/fundos da função anterior e grava a contagem na mesma transação. `analise_iniciar` permanece intacta e compatível. RLS e privilégios das tabelas não mudam.

**Aplicada no projeto remoto Ratione em 24/10/2026**, antes da publicação do frontend. Conferidos os privilégios da nova função (nenhum EXECUTE para `anon`/`authenticated`, EXECUTE para `service_role`); as quatro análises anteriores continuam sem tamanho registrado. O novo início com tamanho exige essa função. Não há texto de decisão nem páginas estimadas nessa coluna.

## Migrações posteriores

Cada arquivo de `migrations/` novo é aplicado do mesmo jeito (SQL Editor → colar o arquivo inteiro → *Run*), em ordem de nome. O deploy **não** aplica migrações. Confira o índice abaixo antes de presumir o que está no banco.

### Índice das migrações

Estado conferido no projeto real (`ratione`, produção) em 24/10/2026, por consulta de leitura ao catálogo (`to_regclass` e `to_regprocedure`): **todas aplicadas, até `20261024000004`**. A `20261025000001_limpeza_por_prazo` foi **aplicada em 25/10/2026** (ver a seção "Limpeza por prazo", abaixo). A conferência prova que as tabelas, colunas e funções existem; não compara o corpo das funções com os arquivos.

| Migração | O que faz |
|---|---|
| `20261007000001_perfis_e_itens_salvos` | Perfis e itens salvos em Meu espaço, com RLS |
| `20261011000001_lembretes_prazo` · `…000002_lembretes_prazo_service_role` | Lembretes de prazo por conta e acesso do servidor |
| `20261011000003_aceites_termos` | Aceite dos Termos gravado pelo servidor (F1-02) |
| `20261019000001_normaviva` · `…000002_resolver_destinos` | Corpus do NormaViva e ligação das remissões ao destino |
| `20261020000001_busca_por_proximidade` | Busca por assunto com proximidade |
| `20261020000002_limite_itens_salvos` | Teto de 1.000 itens salvos por conta |
| `20261021000001_versoes_anteriores` | Redações anteriores dos dispositivos (F3-04) |
| `20261022000001_explicacao_ia` · `…000002_ia_tarefas` | Cache e uso de IA; catálogo de tarefas |
| `20261022000003_tesemap` · `…000005_tesemap_busca` | Grafo do TeseMap e sua pesquisa |
| `20261022000004_busca_sem_acento` · `…000006_normaviva_busca_sem_acento` | Busca sem acento (TeseMap e NormaViva) |
| `20261023000001_planos_e_analises` | Planos, assinaturas, análises e cota por análise (F8-02, F8-03) |
| `20261023000002_fundos_de_gasto` | Dois fundos de gasto de IA: gratuito e pagantes |
| `20261023000003_cobranca_mercadopago` | Cobranças, avisos do Mercado Pago e funções de assinatura (F8-05) |
| `20261024000001_painel_administrativo` | `plano_id` nos registros e `admin_financeiro` (F8-04) |
| `20261024000002_tamanho_analise` | Tamanho da decisão no histórico (`analises.paragrafos`) |
| `20261024000003_estatisticas_administrativas` | `admin_estatisticas` |
| `20261024000004_administracao_contas` | `admin_contas`, `conta_tem_acesso` e trilha `admin_acesso_eventos` |
| `20261025000001_limpeza_por_prazo` | `limpar_dados_vencidos()` e o agendamento diário no `pg_cron` |
| `20261026000002_retencao_fiscal` | `cobrancas` e `assinaturas` deixam de apagar com a conta: `usuario_id` vira nulo e a limpeza diária apaga o registro sem dono depois de 5 anos (provisório). **A aplicar** no SQL Editor; não muda dado existente |
| `20261026000001_tesemap_filtro_por_especie` | `tesemap_buscar` ganha o parâmetro opcional `prefixo` (filtro por espécie: tema repetitivo, IAC, repercussão geral…). **A aplicar** no SQL Editor; até lá o filtro "Espécie" do TeseMap acusa erro, e a pesquisa sem ele segue igual |

**Ao criar uma migração nova:** acrescente uma linha a esta tabela no mesmo commit, avise no PR que ela precisa ser aplicada e confira por consulta de leitura depois de rodar.

## Depois

Avise quando terminar o passo 5. O próximo passo (login na tela, salvar cálculos na conta e migrar o histórico que hoje fica só no navegador) é código meu.

**Acesso administrativo (24/10/2026):** atalho em Meu espaço apenas após resposta autorizada de GET /api/admin/acesso (private, no-store, Vary Cookie). Falha, saída ou troca de conta ocultam o atalho. Página e API financeira mantêm autorização independente no servidor. O workflow entrega RATIONE_ADMIN_USUARIO_IDS da variável de repositório ao Cloud Run; UUID real fora do código. Conta escolhida explicitamente pelo responsável; cobrança permanece desligada.

## Administração e suporte de contas — 24/10/2026

Migrações 20261024000003_estatisticas_administrativas e 20261024000004_administracao_contas aplicadas no Supabase Ratione após autorização. RPCs admin_estatisticas e admin_contas conferidas: acesso exclusivo de service_role, sem conceder leitura de auth.users. A busca retorna e-mail mascarado, UUID e situação de cadastro. Trilha admin_acesso_eventos exclusiva do serviço. Política restritiva conta_ativa_restritiva em 20 tabelas com RLS, incluindo a trilha, e guarda em uso_resumo; novas tabelas privadas precisam manter a barreira. Duas contas preservadas, nenhuma suspensa nem alterada como teste. Estatísticas reais conferidas por leitura: 2 contas, 19 execuções de IA no mês; cobrança desligada.

O workflow passou a entregar RATIONE_ADMIN_USUARIO_IDS da variável de repositório ao servidor. Somente a conta escolhida expressamente pelo responsável foi configurada; UUID não consta no código. O teste de suspensão/reativação ocorre em banco e Auth simulados locais; não é teste de operação destrutiva em produção.

## Limpeza por prazo (25/10/2026)

`migrations/20261025000001_limpeza_por_prazo.sql` cria `public.limpar_dados_vencidos()` e a agenda no `pg_cron` (todo dia às 06:17 UTC, 03:17 em Brasília). O banco passa a guardar só o estritamente necessário (decisão do responsável, 25/10/2026):

| Tabela | Prazo |
|---|---|
| `ia_uso` e `analises` | 13 meses |
| `lembretes_prazo` | 30 dias depois do vencimento |
| `mp_eventos` | 90 dias |
| `admin_acesso_eventos` | 12 meses |

Não expiram: conta, perfil, registros salvos e aceites dos Termos (saem com a exclusão da conta). `cobrancas` e `assinaturas` seguem a **retenção fiscal** (`20261026000002_retencao_fiscal.sql`, decidida em 26/10/2026): ao excluir a conta, `usuario_id` vira nulo (o registro fica sem identificar a pessoa) e a mesma limpeza o apaga depois de **5 anos** (provisório, o contador confirma; é a constante `v_prazo_fiscal`); o de ambiente `teste` sai na hora. Quem ainda tem conta não expira. A função é exclusiva da `service_role`; nenhum usuário apaga o próprio histórico por aqui, porque a cota é contada a partir dessas linhas.

**Aplicada no projeto remoto em 25/10/2026**, antes de publicar a Política de Privacidade v1.2, que descreve esses prazos. Conferido por consulta de leitura: a função existe; `anon` e `authenticated` não a executam e `service_role` sim; o agendamento `limpeza-por-prazo` (`17 6 * * *`) está ativo; e nenhuma linha estava vencida (a primeira execução não apaga nada). Para reaplicar em outro ambiente: *SQL Editor → New query*, colar o arquivo inteiro → *Run*. Confirme o projeto `ratione` e "PRODUCTION" na tela. A migração tenta ativar o `pg_cron`; se o Supabase recusar, ative em *Database → Extensions* e rode só o bloco `do $$ ... $$` do fim do arquivo.

Conferência depois de aplicar (só leitura):

- `select proname from pg_proc where proname = 'limpar_dados_vencidos';` deve listar a função;
- `select jobname, schedule, active from cron.job;` deve mostrar `limpeza-por-prazo`, `17 6 * * *`, `true`;
- `select has_function_privilege('anon', 'public.limpar_dados_vencidos()', 'execute') as anon, has_function_privilege('service_role', 'public.limpar_dados_vencidos()', 'execute') as servidor;` deve dar `false` e `true`.

A primeira execução (a agendada ou `select public.limpar_dados_vencidos();` no editor) devolve quantas linhas apagou de cada tabela. Hoje só há dados de outubro de 2026, então o esperado é zero, exceto avisos de prazo vencidos há mais de 30 dias. Depois, `select jobname, status, start_time from cron.job_run_details order by start_time desc limit 5;` mostra as execuções do agendador.
