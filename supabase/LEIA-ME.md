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

## Depois

Avise quando terminar o passo 5. O próximo passo (login na tela, salvar cálculos na conta e migrar o histórico que hoje fica só no navegador) é código meu.
