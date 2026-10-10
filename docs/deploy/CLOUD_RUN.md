# Publicação no Google Cloud Run

O site (`apps/web`) roda no **Cloud Run em São Paulo** (`southamerica-east1`), a mesma região do banco no Supabase, num projeto do Google Cloud só do Ratione. O endereço é **https://ratione.nexojuris.ia.br** (subdomínio; o domínio principal e o site que já existe nele não mudam).

| Peça | Onde fica |
|---|---|
| Imagem | `Dockerfile` na raiz (Next `output: 'standalone'`, Node 24, usuário sem privilégio, porta 8080) |
| Publicação | `.github/workflows/deploy.yml`: roda depois do CI verde na `main` (ou à mão, em *Actions*) |
| Registro de imagens | Artifact Registry `ratione` em `southamerica-east1` |
| Chave de serviço do Supabase | Secret Manager `supabase-service-role-key`, lida só pelo Cloud Run ao rodar |
| Login do GitHub no Google | Workload Identity Federation, sem chave JSON guardada no GitHub |

As variáveis `NEXT_PUBLIC_*` são públicas (vão para o navegador) e entram no build como variáveis do repositório. A chave de serviço nunca entra na imagem nem no GitHub.

## Testar a imagem no computador

Com o Docker Desktop aberto, na raiz do repositório:

```bash
docker build -t ratione-web:local --build-arg NEXT_PUBLIC_SUPABASE_URL=<url> --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<chave publicável> .
docker run --rm -p 8090:8080 ratione-web:local
```

O site abre em `http://localhost:8090`. Sem `SUPABASE_SERVICE_ROLE_KEY`, "Excluir conta" responde 503 (esperado).

## Configuração única no Google Cloud

Feita uma vez, com o `gcloud` logado na conta dona do projeto. `PROJETO` é o ID do projeto novo; `REPO_GH` é `junior-aguiar-eng/Ratione`.

```bash
PROJETO=ratione-nexojuris
REGIAO=southamerica-east1
REPO_GH=junior-aguiar-eng/Ratione

# 1. Projeto e faturamento (a conta de faturamento é escolhida no console, em Faturamento)
gcloud projects create $PROJETO --name="Ratione"
gcloud config set project $PROJETO
gcloud services enable run.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com iamcredentials.googleapis.com sts.googleapis.com

# 2. Registro de imagens
gcloud artifacts repositories create ratione --repository-format=docker --location=$REGIAO

# 3. Contas de serviço: uma para rodar o site, outra para o GitHub publicar
gcloud iam service-accounts create ratione-web --display-name="Ratione: site no Cloud Run"
gcloud iam service-accounts create github-deploy --display-name="Ratione: publicação pelo GitHub"
RUNTIME_SA=ratione-web@$PROJETO.iam.gserviceaccount.com
DEPLOY_SA=github-deploy@$PROJETO.iam.gserviceaccount.com
gcloud projects add-iam-policy-binding $PROJETO --member=serviceAccount:$DEPLOY_SA --role=roles/run.admin
gcloud artifacts repositories add-iam-policy-binding ratione --location=$REGIAO --member=serviceAccount:$DEPLOY_SA --role=roles/artifactregistry.writer
gcloud iam service-accounts add-iam-policy-binding $RUNTIME_SA --member=serviceAccount:$DEPLOY_SA --role=roles/iam.serviceAccountUser

# 4. Segredo: o valor é digitado no terminal (não fica no histórico nem no repositório)
printf 'Chave secreta do Supabase: '; read -rs CHAVE; echo
printf '%s' "$CHAVE" | gcloud secrets create supabase-service-role-key --data-file=- --replication-policy=user-managed --locations=$REGIAO
unset CHAVE
gcloud secrets add-iam-policy-binding supabase-service-role-key --member=serviceAccount:$RUNTIME_SA --role=roles/secretmanager.secretAccessor

# 5. Workload Identity Federation: só este repositório do GitHub pode assumir a conta de publicação
gcloud iam workload-identity-pools create github --location=global --display-name="GitHub"
gcloud iam workload-identity-pools providers create-oidc ratione --location=global --workload-identity-pool=github \
  --issuer-uri=https://token.actions.githubusercontent.com \
  --attribute-mapping=google.subject=assertion.sub,attribute.repository=assertion.repository \
  --attribute-condition="assertion.repository=='$REPO_GH'"
NUMERO=$(gcloud projects describe $PROJETO --format='value(projectNumber)')
gcloud iam service-accounts add-iam-policy-binding $DEPLOY_SA --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$NUMERO/locations/global/workloadIdentityPools/github/attribute.repository/$REPO_GH"
echo "GCP_WIF_PROVIDER=projects/$NUMERO/locations/global/workloadIdentityPools/github/providers/ratione"
```

## Variáveis do repositório no GitHub

Em *Settings → Secrets and variables → Actions → Variables* (são **variáveis**, não segredos: nenhum valor aqui é secreto):

| Variável | Valor |
|---|---|
| `GCP_PROJECT_ID` | o ID do projeto (sem ela, o workflow de publicação não roda) |
| `GCP_WIF_PROVIDER` | o valor impresso no fim do passo 5 |
| `GCP_DEPLOY_SA` | `github-deploy@<projeto>.iam.gserviceaccount.com` |
| `GCP_RUNTIME_SA` | `ratione-web@<projeto>.iam.gserviceaccount.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | a URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | a chave publicável do Supabase |

Depois, *Actions → Publicar (Cloud Run) → Run workflow* faz a primeira publicação.

## Domínio (balanceador de carga)

O mapeamento direto de domínio do Cloud Run **não existe em `southamerica-east1`** (a API responde "Creating domain mappings is not allowed in southamerica-east1"). O Firebase Hosting na frente também não serve: ele só repassa ao Cloud Run o cookie `__session`, e o login do Supabase depende dos cookies `sb-…-auth-token` (o `proxy.ts`, a exclusão de conta e o retorno dos e-mails leem a sessão no servidor). Por isso o domínio passa por um **balanceador de carga HTTPS global** (cerca de US$ 18/mês, fixo), com o site ainda em São Paulo.

```bash
gcloud services enable compute.googleapis.com
gcloud compute addresses create ratione-ip --global --ip-version=IPV4
gcloud compute network-endpoint-groups create ratione-neg --region=$REGIAO --network-endpoint-type=serverless --cloud-run-service=ratione-web
gcloud compute backend-services create ratione-backend --global --load-balancing-scheme=EXTERNAL_MANAGED
gcloud compute backend-services add-backend ratione-backend --global --network-endpoint-group=ratione-neg --network-endpoint-group-region=$REGIAO
gcloud compute url-maps create ratione-urlmap --default-service=ratione-backend --global
gcloud compute ssl-certificates create ratione-cert --domains=ratione.nexojuris.ia.br --global
gcloud compute target-https-proxies create ratione-https-proxy --url-map=ratione-urlmap --ssl-certificates=ratione-cert --global
gcloud compute forwarding-rules create ratione-https --global --load-balancing-scheme=EXTERNAL_MANAGED --address=ratione-ip --target-https-proxy=ratione-https-proxy --ports=443
# http -> https: url-map só com redirecionamento (importado de um YAML com defaultUrlRedirect.httpsRedirect: true)
gcloud compute url-maps import ratione-http-redirect --source=redir.yaml --global
gcloud compute target-http-proxies create ratione-http-proxy --url-map=ratione-http-redirect --global
gcloud compute forwarding-rules create ratione-http --global --load-balancing-scheme=EXTERNAL_MANAGED --address=ratione-ip --target-http-proxy=ratione-http-proxy --ports=80
```

1. **DNS no Registro.br** (*Configurar zona DNS* de `nexojuris.ia.br`, modo avançado): registro **A** `ratione` → `34.120.34.54` (o IP `ratione-ip`). Os demais registros da zona (site principal, `hml`, Resend) não mudam. O Registro.br leva alguns minutos para publicar.
2. **Certificado**: o Google só o emite depois que o DNS aponta para o IP; acompanhar com `gcloud compute ssl-certificates describe ratione-cert --global --format="value(managed.status)"` até `ACTIVE` (15 a 60 minutos). O redirecionamento http→https do Google devolve `https://…:443/`; é o comportamento padrão e funciona.
3. **Supabase**, *URL Configuration*: **Site URL** `https://ratione.nexojuris.ia.br` e acrescentar `https://ratione.nexojuris.ia.br/auth/callback` em *Redirect URLs* (manter as de `localhost`). Os modelos de e-mail usam `{{ .SiteURL }}`: depois da troca, os links dos e-mails levam ao site publicado, também nos testes locais.

O endereço `*.run.app` continua respondendo. Para obrigar o tráfego a passar pelo balanceador, o serviço usa `--ingress internal-and-cloud-load-balancing` (no `deploy.yml`); depois disso o `*.run.app` deixa de responder.

## Lembretes por e-mail (F2-10)

O código já está no repositório e **fica inerte** até os passos abaixo: sem `LEMBRETES_SEGREDO` a rota `POST /api/lembretes/enviar` responde 503, e sem `RESEND_API_KEY` ela só simula (conta o que enviaria e não envia nem marca nada). Nada disso exige alterar o site já publicado.

1. **Banco (feito em 11/10/2026):** `supabase/migrations/20261011000001_lembretes_prazo.sql` aplicada no projeto `ratione` pelo SQL Editor e conferida (RLS ligada; `authenticated` só com SELECT, INSERT e DELETE; políticas `lembretes_leitura`, `lembretes_insercao` e `lembretes_exclusao`; gatilho `lembretes_prazo_limite`). Para repetir em outro ambiente: SQL Editor ou `supabase db push`, e conferir a RLS.
2. **Chave do Resend para os lembretes:** em *Resend → API Keys*, criar uma chave **só de envio**, restrita ao domínio `nexojuris.ia.br`, com o nome `ratione-lembretes` (separada da chave do SMTP do Supabase, para poder revogar uma sem afetar a outra). Não colar a chave em chat nem em arquivo do repositório.
3. **Segredos no Google Cloud** (projeto `ratione-nexojuris`; **feito em 11/10/2026**: `resend-api-key-lembretes` criado pelo responsável e `lembretes-segredo` gerado aleatoriamente, ambos legíveis pela conta `ratione-web@…`):
```bash
printf '%s' "$CHAVE_RESEND" | gcloud secrets create resend-api-key-lembretes --data-file=-
openssl rand -hex 32 | tr -d '
' | gcloud secrets create lembretes-segredo --data-file=-
gcloud secrets add-iam-policy-binding resend-api-key-lembretes --member="serviceAccount:$GCP_RUNTIME_SA" --role=roles/secretmanager.secretAccessor
gcloud secrets add-iam-policy-binding lembretes-segredo --member="serviceAccount:$GCP_RUNTIME_SA" --role=roles/secretmanager.secretAccessor
```
4. **`deploy.yml` (feito em 11/10/2026):** o `--set-secrets` do passo "Cloud Run" passou a incluir `RESEND_API_KEY=resend-api-key-lembretes:latest,LEMBRETES_SEGREDO=lembretes-segredo:latest`. Entra em vigor na primeira publicação depois do merge. Não atualizar o serviço à mão com `--update-secrets`: o `--set-secrets` do deploy substitui a lista inteira.
5. **Agendador** (uma vez por dia, de manhã, horário de Brasília):
```bash
gcloud services enable cloudscheduler.googleapis.com
gcloud scheduler jobs create http ratione-lembretes --location=southamerica-east1 --schedule="0 8 * * *" --time-zone="America/Sao_Paulo"   --uri="https://ratione.nexojuris.ia.br/api/lembretes/enviar" --http-method=POST   --headers="Authorization=Bearer $(gcloud secrets versions access latest --secret=lembretes-segredo)"
```
6. **Teste:** criar um aviso para um prazo que vença em 3 dias, rodar o job (`gcloud scheduler jobs run ratione-lembretes --location=southamerica-east1`) e conferir o e-mail. A resposta da rota traz só contagens (`analisados`, `enviados`, `semEmail`, `falhas`); o log traz o mesmo, sem endereços.

No Git Bash do Windows, rodar os comandos no PowerShell: o Git Bash reescreve caminhos que começam com `/`.

**Permissão do `service_role` (aplicada em produção em 11/10/2026):** nas tabelas novas do Supabase o `service_role` nasce só com REFERENCES, TRIGGER e TRUNCATE, sem SELECT nem UPDATE, e a RLS ignorada por ele não substitui o privilégio de tabela. Por isso existe a migração `20261011000002_lembretes_prazo_service_role.sql` (SELECT e UPDATE só nas duas colunas de marca de envio). Sem ela o envio diário respondia 500 "falha ao listar lembretes". Toda tabela nova que a rota de servidor ler ou gravar precisa de GRANT explícito para o `service_role`.

**Quebra de linha no segredo:** no PowerShell, enviar um valor por pipe (`$valor | gcloud secrets create ... --data-file=-`) acrescenta uma quebra de linha ao segredo. A rota apara espaços e quebras dos dois segredos (`limparSegredo`), então isso não quebra mais o envio; mesmo assim, prefira `[System.IO.File]::WriteAllText` ou `printf '%s'` para gravar o valor exato. Foi o que fez o primeiro disparo do job responder 401 em 11/10/2026.

## Monitoramento

Projeto `ratione-nexojuris`. O servidor escreve logs em JSON (`apps/web/src/lib/log.ts`); todo erro não tratado vira `severity=ERROR` (`apps/web/src/instrumentation.ts`).

```bash
gcloud services enable monitoring.googleapis.com
gcloud beta monitoring channels create --display-name="Ratione - responsavel" --type=email --channel-labels=email_address=ENDERECO
gcloud monitoring uptime create ratione-saude --resource-type=uptime-url --resource-labels=host=ratione.nexojuris.ia.br,project_id=ratione-nexojuris --protocol=https --path=/api/saude --period=5 --timeout=10 --regions=usa-virginia,europe,south-america
gcloud alpha monitoring policies create --policy-from-file=ARQUIVO.json   # um para o uptime, outro para o log ERROR
```

- **Uptime:** `GET /api/saude` a cada 5 minutos; o alerta dispara se falhar em mais de uma região.
  - **Armadilha no Git Bash (Windows):** ele converte `--path=/api/saude` em `/C:/Program Files/Git/api/saude`. O uptime check passa a testar um caminho inexistente e o alerta "fora do ar" dispara com o site no ar (aconteceu em 10/10/2026). Rode esse comando no PowerShell, ou confira depois com `gcloud monitoring uptime list-configs --format="value(httpCheck.path)"`.
- **Erro no servidor:** alerta por log com o filtro `resource.type="cloud_run_revision" AND resource.labels.service_name="ratione-web" AND severity>=ERROR`, no máximo um e-mail por hora.
- Para investigar: *Logging → Logs Explorer* com o mesmo filtro. O campo `digest` é o código que a tela de erro mostra ao usuário.
- Mudar o destinatário: *Monitoring → Alerting → Edit notification channels*.

## Depois

- E-mail: já sai pelo Resend (`nao-responda@nexojuris.ia.br`); ver `supabase/LEIA-ME.md`.
- Trocar a chave de serviço: `printf '%s' "$NOVA" | gcloud secrets versions add supabase-service-role-key --data-file=-` e publicar de novo.
