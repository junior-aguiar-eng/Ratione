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
3. **Carregar.** No mesmo terminal, **só nele**, defina as duas variáveis e rode (PowerShell):

   ```powershell
   $env:SUPABASE_URL = "https://<ref>.supabase.co"          # Project Settings → API → Project URL
   $env:SUPABASE_SERVICE_ROLE_KEY = "<chave secret/service_role>"   # Project Settings → API Keys
   pnpm carregar
   ```

   Ao final o script confere a contagem do banco contra o corpus e avisa se algo não bate. Pode repetir quando quiser: a recarga apaga as 4 tabelas e insere tudo de novo. Feche o terminal depois (a chave some da memória do terminal).
4. **Testar a busca.** No SQL Editor: `select * from buscar_dispositivos('honorários advocatícios', 'LEI-13105-2015', 5);` deve devolver artigos do art. 85 do CPC.

A chave **service_role** nunca vai para o Git, para o `.env.local` do site nem para esta conversa.

## NormaViva: busca sem acento (22/10/2026)

A pesquisa por assunto passa a achar o que se digita sem acento ("honorarios advocaticios", "prisao preventiva"). Depois de aplicar a `20261022000004_busca_sem_acento.sql` (a mesma do passo do TeseMap abaixo: crie a extensão `unaccent` e a configuração de busca), aplique `supabase/migrations/20261022000006_normaviva_busca_sem_acento.sql` no *SQL Editor → New query* → *Run*. Ela recria uma coluna de busca nas 29 mil linhas de `dispositivos` (alguns segundos). Teste: `select count(*) from buscar_dispositivos('honorarios advocaticios', 'LEI-13105-2015', 100);` deve devolver 18 ou mais; com acento o resultado é o mesmo de antes.

## TeseMap: aplicar a migração e carregar os precedentes do STJ (F4-03)

O grafo do TeseMap fica em `tesemap_nos` e `tesemap_arestas` (leitura pública filtrada pela RLS: só nó curado ou validado por pessoa; aresta só validada).

1. **Aplicar as migrações.** *SQL Editor → New query*: cole **todo** o conteúdo de `supabase/migrations/20261022000003_tesemap.sql` → *Run* ("Success"); depois o de `supabase/migrations/20261022000004_busca_sem_acento.sql` (extensão `unaccent` e configuração de busca sem acento) e o de `supabase/migrations/20261022000005_tesemap_busca.sql` (pesquisa por assunto da tela: todas as palavras, sem acento; se você já aplicou a primeira versão, `20261022000004_tesemap_busca.sql`, esta a substitui sem erro). Em *Table Editor* confira as 2 tabelas com o cadeado de RLS ligado.
2. **Conferir sem tocar no banco.** Em `packages/tesemap`: `pnpm carregar:tesemap --simular` (deve mostrar 1.150 nós, 210 deles com atalho para o NormaViva).
3. **Carregar.** No mesmo terminal, **só nele**, defina `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (como na carga do NormaViva) e rode `pnpm carregar:tesemap`. A carga **não apaga nada**: atualiza por `id` os nós do STJ e deixa o que foi curado à mão.
4. **Testar.** No SQL Editor: `select * from tesemap_cobertura();` deve mostrar `STJ | precedente | 1150` e a data da leitura; `select id from tesemap_buscar('honorarios apreciacao equitativa') limit 3;` deve trazer `STJ-TEMA-1076`.

A chave **service_role** nunca vai para o Git, para o `.env.local` do site nem para esta conversa.

## Teto de itens salvos (20/10/2026)

`supabase/migrations/20261020000002_limite_itens_salvos.sql` limita a 1.000 os itens salvos por conta (gatilho `limitar_itens_salvos`, mesmo padrão do teto de lembretes). **Aplique no projeto real:** *SQL Editor → New query*, cole o conteúdo do arquivo → *Run*. Enquanto não for aplicada, o site funciona, só sem o teto; o botão "Salvar em Meu espaço" passa a mostrar "Limite de itens atingido" quando a conta estiver cheia.

## Explicação por IA (F3-08, 22/10/2026)

`supabase/migrations/20261022000001_explicacao_ia.sql` cria o cache das explicações (`ia_explicacoes`), o registro de uso com o custo (`ia_uso`) e as funções que conferem cota e orçamento de forma atômica (`ia_reservar`, `ia_finalizar`, `ia_registrar_cache`), executáveis só pela chave de serviço. **Aplique no projeto real** pelo *SQL Editor* antes de ligar a funcionalidade; enquanto ela estiver desligada, a migração não muda nada no site. Como ligar e desligar: `docs/produto/EXPLICACAO_IA.md`, §5.

`supabase/migrations/20261022000002_ia_tarefas.sql` (mesmo dia) generaliza essas tabelas para o **catálogo de tarefas de IA** (`docs/produto/IA_TAREFAS.md`): o cache vira `ia_respostas`, o uso ganha a coluna `tarefa` e a cota passa a ser por tarefa, com o orçamento do mês e "uma chamada de cada vez" valendo para todas. Aplique **depois** da anterior (podem ir juntas, nesta ordem); preserva o que já houver nelas.

## Correções de dados do NormaViva (`supabase/correcoes/`)

Arquivos SQL que corrigem o texto já carregado sem recarregar o corpus inteiro. Cada um é gerado do corpus, idempotente e termina com uma consulta de conferência. Aplicar no *SQL Editor*, depois do merge do código que muda o parser. Aplicadas: `20261020_producao_de_efeito.sql` em 20/10/2026 (conferido no banco: 0 dispositivos com a anotação no texto, 12 revogados corrigidos, 737 revogados no total, hash das versões confere).

- `20261021_atos_com_data_por_extenso.sql` (F3-05 e F3-03): corrige 249 remissões cuja norma de destino tinha o ano errado, 2 relações e 2 versões do CPC (art. 63, §§ 1º e 5º) com o ato errado, e liga as remissões ao artigo de destino (`resolver_destinos_relacoes`). Gerada da diferença entre o corpus antes e depois da correção do reconhecedor de atos e ensaiada contra uma carga com o reconhecedor corrigido (idêntica; 2.851 → 2.967 remissões ligadas). Independe da ordem dos outros arquivos. Conferência no fim: `2967`, `0` e `0`. Aplicada em 21/10/2026 no projeto `ratione`: `2966`, `0` e `0` (a produção tinha uma remissão ligada a menos que o ensaio antes da correção, 2.850 contra 2.851; a diferença é anterior a este arquivo).
- `20261021_atos_sem_de_antes_do_mes.sql` (F3-05, complemento do anterior): quando o Planalto omite o "de" antes do mês ("de 24 julho de 1991"), o reconhecedor ainda lia o dia como ano. Corrige 3 remissões (duas para o CPC de 1973, uma para a Lei nº 8.212/1991); achado pela conferência feita depois de aplicar o anterior. Independe da ordem. Conferência no fim: `0` remissões com destino errado. Aplicada em 21/10/2026 no projeto `ratione`: `0` e `2966` remissões ligadas (as três apontam para normas fora da base, por isso o total ligado não muda).
- `20261021_versoes_anteriores.sql` (F3-04, gerado por `pnpm historico:sql`): *(regenerado em 21/10/2026 com os casos atualizados pela correção do sufixo falso; a versão aplicada em produção está no histórico do git)* grava no banco as redações anteriores dos casos do F3-07 como segunda versão de cada dispositivo e marca a vigente com `texto_anterior_disponivel`. **Ordem obrigatória:** (1) publicar o código novo da página (ele lê com ou sem as colunas novas, então não quebra no meio do caminho; o código antigo, sim, mostraria a redação errada se as linhas entrassem antes); (2) aplicar a migração `supabase/migrations/20261021000001_versoes_anteriores.sql`; (3) aplicar este arquivo. Conferência no fim: `57` e `57`. **Aplicados em 21/10/2026** (migração e dados, depois do deploy; conferido no banco: 29.504 versões, uma vigente por dispositivo, nenhuma conferida). Quando o revisor validar casos (`pnpm historico`), rodar de novo `pnpm historico:sql` e aplicar: a conferência passa a constar da tela. O arquivo só insere onde ainda não há redação anterior; para atualizar a conferência de uma já inserida, use a recarga (`pnpm carregar`) ou um `update` em `conferida_por` e `conferida_em`.
- `20261020_producao_de_efeito.sql`: tira "Produção de efeito(s)" do texto de 81 dispositivos (CF, CLT, Código Civil, Lei 11.101, CTN, ECA, Lei 8.213 e CTB) e marca como revogados 12 que apareciam como vigentes. Funciona por regras sobre os dados do banco (não carrega texto de lei no script), ensaiado contra uma recarga com o parser novo. Conferência esperada no fim: `0` e `12`.

### Recarga depois da correção do sufixo falso (21/10/2026) e dos resíduos do parser (22/10/2026)

O parser lia "Art. 3º - A lei…" como art. 3º-A (CP, CLT, CTN, LEF, LEP, LINDB e parte da CF). Corrigido, 980 dispositivos mudam de id, e as relações e versões que apontam para eles mudam junto: por isso a correção em produção é a **recarga completa**, não um arquivo de `correcoes/`.

1. Esperar o deploy do código com a correção (o site lê pelo id; a ordem evita que a página nova procure ids antigos ou o contrário por muito tempo).
2. `pnpm carregar --simular` em `packages/normaviva`: 28 normas, 29.294 dispositivos, 29.351 versões e 13.256 relações (contagem depois dos resíduos do parser, 22/10/2026; antes eram 29.447, 29.504 e 13.371).
3. `pnpm carregar` com as duas variáveis do passo 3 da seção do NormaViva acima. A recarga já inclui as redações anteriores do F3-04 (não é preciso aplicar `20261021_versoes_anteriores.sql` de novo) e repõe as correções de `correcoes/` (elas já estão no corpus).
4. Conferir no *SQL Editor*: `select count(*) from relacoes where tipo = 'remete' and destino_id is not null;` deve dar cerca de `3008` (o corpus dá 3.008), e `select texto from dispositivos where id = 'DL-2848-1940|corpo|art. 3º';` deve começar com "A lei excepcional".

A mesma recarga leva os resíduos do parser corrigidos em 22/10/2026 (tachado por estilo, aspas retas, medida provisória rejeitada, incisos revogados com ";" e os artigos do decreto da CLT; ver F3-02 no PLANO). Itens salvos em Meu espaço que apontavam para um dos ids antigos (ex.: "art. 3º-A" do CP) deixam de abrir o dispositivo; o resto não muda.

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

## Migrações posteriores

Cada arquivo de `migrations/` novo é aplicado do mesmo jeito (SQL Editor → colar o arquivo inteiro → *Run*), em ordem de nome. O último é `20261011000003_aceites_termos.sql` (aceite dos Termos gravado pelo servidor, F1-02); depois de rodar, conferir em *Table Editor* que existe `aceites_termos` e que cada conta já criada tem uma linha.

## Depois

Avise quando terminar o passo 5. O próximo passo (login na tela, salvar cálculos na conta e migrar o histórico que hoje fica só no navegador) é código meu.
