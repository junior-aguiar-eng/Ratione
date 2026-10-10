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

## Domínio

1. Mapear `ratione.nexojuris.ia.br` para o serviço `ratione-web` (Cloud Run → *Domain mappings*, ou Firebase Hosting na frente se a região não oferecer o mapeamento). O Google indica o registro DNS a criar.
2. No Registro.br, em *Editar zona* de `nexojuris.ia.br`: criar o registro indicado (CNAME `ratione` → `ghs.googlehosted.com.` no mapeamento direto). O certificado HTTPS sai sozinho em alguns minutos a algumas horas.
3. No Supabase, *URL Configuration*: **Site URL** `https://ratione.nexojuris.ia.br` e acrescentar `https://ratione.nexojuris.ia.br/auth/callback` em *Redirect URLs* (manter as de `localhost` para o desenvolvimento).

## Depois

- E-mail com domínio próprio (Resend ou Brevo) em `ratione.nexojuris.ia.br`, substituindo o SMTP do Gmail (`supabase/LEIA-ME.md`).
- Trocar a chave de serviço: `printf '%s' "$NOVA" | gcloud secrets versions add supabase-service-role-key --data-file=-` e publicar de novo.
