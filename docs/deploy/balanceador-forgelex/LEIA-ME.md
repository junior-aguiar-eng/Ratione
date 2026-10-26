# Redirecionamento `nexojuris.ia.br/ratione` → `ratione.nexojuris.ia.br`

Aplicado em **26/10/2026**, a pedido do responsável. O Ratione continua no **subdomínio** `ratione.nexojuris.ia.br`; o endereço `nexojuris.ia.br/ratione` só redireciona para ele.

## Onde está
O domínio raiz `nexojuris.ia.br` **não é do Ratione**: é do ForgeLex/NexoHub, atrás de um balanceador de carga do Google no projeto `project-bbbe1209-c295-4720-867` ("My First Project"), mapa de URLs `forgelex-api-hml-map` (apesar do "hml" no nome, ele também atende a produção: a raiz vai para `forgelex-api-prod` e `/hub` para o NexoHub). O balanceador do Ratione (projeto `ratione-nexojuris`) **não foi tocado**.

## O que foi acrescentado
No `pathMatcher` `nexohub-root` (host `nexojuris.ia.br`), duas regras de caminho, ao lado das de `/hub`:

| Caminho | Resposta |
|---|---|
| `/ratione` | 302 para `https://ratione.nexojuris.ia.br/` |
| `/ratione/*` | 302 para `https://ratione.nexojuris.ia.br/<resto>`, mantendo os parâmetros da URL |

Nenhuma regra existente mudou (a raiz, `/hub` e `hml.nexojuris.ia.br` seguem como eram: conferido na validação da API e por requisições reais). Destino fixo no mapa: não há redirecionamento aberto. Está em **302** (temporário); trocar para 301 (`MOVED_PERMANENTLY_DEFAULT`) só quando houver certeza, porque o 301 fica gravado no navegador e no Google.

Detalhe cosmético: o cabeçalho `Location` sai com `:443` (`https://ratione.nexojuris.ia.br:443/...`); os navegadores normalizam e o resultado é o mesmo. Vem de `httpsRedirect: true`; como a raiz só atende HTTPS (não há regra de encaminhamento na porta 80), dá para tirar essa linha se incomodar.

## Arquivos
- `mapa-antes-20261026.yaml`: o mapa exatamente como estava (exportado antes de mexer).
- `mapa-depois-20261026.yaml`: o mapa aplicado (o mesmo, mais as duas regras).

## Desfazer (1 a 2 minutos para valer)
```bash
gcloud compute url-maps export forgelex-api-hml-map --global --project=project-bbbe1209-c295-4720-867 --destination=mapa-atual.yaml
# copie o fingerprint de mapa-atual.yaml para o topo de mapa-antes-20261026.yaml (ou apague a linha "fingerprint")
gcloud compute url-maps import forgelex-api-hml-map --global --project=project-bbbe1209-c295-4720-867 --source=mapa-antes-20261026.yaml
```

## Conferir
```bash
curl -sI https://nexojuris.ia.br/ratione        # 302 e location para ratione.nexojuris.ia.br
curl -sI https://nexojuris.ia.br/hub            # 301 para /hub/ (como antes)
```
Validar uma mudança no mapa antes de aplicar (não altera nada): `gcloud compute url-maps validate --global --project=project-bbbe1209-c295-4720-867 --source=ARQUIVO.yaml`, com um bloco `tests:` no arquivo.
