# B0 — auditoria do lado Ratione

10 nov 2026 · base: `main` na branch `fix/ler-intimacao-data-do-ato-e-varios-prazos` (5c1ebbc) · insumo do desenho da B2 em `REESTRUTURACAO_RATIONE.md`

Escopo: só o que está neste repositório e no projeto Supabase do Ratione. O lado ForgeLex da B0 (autenticação do ForgeLex e `legislation-catalog.ts`) fica pendente, porque esse código não está aqui.

## 1. Supabase e autenticação

| Projeto | Ref | Região |
| --- | --- | --- |
| ratione | `hpxbjltyoqxretwtgnkp` | sa-east-1 |
| ForgeLex | `mmywgqttfthtwntjkqgh` | sa-east-1 |

São **dois projetos Supabase distintos**, na mesma organização. Usuários, sessões e cookies de login não são compartilhados. Login único (B6) exigiria troca de token entre os projetos ou migração de contas; não é configuração. Conferido com `list_projects` em 10/11/2026. Se o ForgeLex autentica por Supabase Auth ou por outro meio, o que decide a forma da troca, não aparece aqui.

## 2. Rotas e parâmetros aceitos

Todas leem a URL no cliente (`window.location.search`), validam e ignoram o que não reconhecem. Contratos em `apps/web/src/lib/parametrosSalvos.ts` e `lib/caso/ligacao.ts`.

| Ferramenta | Rota | Parâmetros | Observação |
| --- | --- | --- | --- |
| PrazoZero | `/prazozero` | `ato` (id do catálogo ou `outro`), `data` (AAAA-MM-DD), `evento` (`disponibilizacao_dje`, `publicacao`, `intimacao_portal`, `carga_ou_audiencia`), `tribunal` (id de `TRIBUNAIS_BRASIL`), `regime`, `dias`+`nome` (só com `ato=outro`), `dobro=1`, `litis=1`, `excecao=1` | `ato` vem de `CATALOGO_PRAZOS` (ex.: `apelacao`, `agravo-instrumento`). A B1 precisa que o ForgeLex mapeie a movimentação do DataJud para `ato` e `evento`. |
| NormaViva | `/normaviva` | `d` (id do dispositivo, até 200 caracteres), `em` (AAAA-MM-DD, redação na data), `q` (busca) | Id tem o formato `LEI-13105-2015\|corpo\|art. 85` (codificado na URL). |
| TeseMap | `/tesemap` | `n` (id do nó, `^[A-Za-z0-9._-]{1,80}$`, ex.: `STJ-TEMA-1076`), `q` (busca) | O corpus inclui STF; o ForgeLex deve rotular como fonte Ratione. |
| Busca única | `/buscar` | `q` | Sai para as três ferramentas. |
| Argumenta | `/argumenta` | `caso` (`Q1`..`Q10` ou `D`) | Só o identificador da questão; nunca texto da decisão. |

Não existe parâmetro para citação em texto livre ("CPC, art. 85"). O ForgeLex precisa montar o id do dispositivo ou passar por um resolvedor (ver §5).

## 3. Achado que bloqueia a B1: o login descarta a query

`apps/web/src/proxy.ts` exige conta em `/prazozero`, `/normaviva`, `/tesemap`, `/argumenta`, `/meu-espaco` e `/conta`. Quando não há sessão, redireciona para `/entrar?proximo=<só o pathname>`, sem `request.nextUrl.search`. Quem chega de um link do ForgeLex sem sessão faz login e cai na ferramenta **vazia**, sem `d`, `ato`, `data` ou `n`. O link profundo só funciona para quem já está logado.

Correção (pequena, no Ratione): incluir a query no `proximo`. `caminhoInterno` (`lib/link-email.ts`) já aceita caminho com query, desde que comece com `/` e não com `//`. Ainda não conferi se o fluxo de confirmação de e-mail e o `auth/callback` preservam o `proximo` inteiro; isso entra no teste da correção.

## 4. Dados e quem pode lê-los

- `normas`, `dispositivos`, `versoes_dispositivo`, `relacoes`: RLS ligada, `select` para `anon` e `authenticated` (`20261019000001_normaviva.sql`).
- `tesemap_nos`, `tesemap_arestas`: RLS ligada, `select` para `anon` e `authenticated`, filtrada (nó curado ou validado por pessoa; aresta só validada) (`20261022000003_tesemap.sql`).
- RPCs públicas: `buscar_dispositivos(consulta, norma, limite)` e `tesemap_buscar(...)`, com execução para `anon`, `authenticated` e `service_role`.
- Hoje o navegador lê tudo direto no Supabase (`lib/supabase/client`). **Não existe API HTTP do Ratione para norma, precedente ou prazo.**
- O motor do PrazoZero é o pacote `@ratione/prazozero`, TypeScript puro e determinístico, sem IA e sem rede; roda no servidor sem mudança. `motor.calcularPrazo(ParametrosCalculoPrazo)` recebe `dataEvento`, `tipoEvento`, `diasPrazo`, `regime`, `tribunalId`, `prazoEmDobro`, `litisconsortesComAdvogadosDistintos`, `excecaoSuspensaoCriminal`, `nomeAto`.

## 5. O que a B2 precisa

1. **Padrão de autenticação entre servidores já existe**: `api/lembretes/enviar/route.ts` usa `Authorization: Bearer <segredo>`, comparação com `timingSafeEqual`, segredo de no mínimo 32 caracteres e resposta 503 quando não configurado. Reaproveitar o padrão, com segredo próprio (`SERVICO_FORGELEX_SEGREDO`, nome a decidir) e segredo distinto do dos lembretes.
2. **Três leituras, todas sem estado do usuário e sem IA**:
   - prazo: entra o mesmo objeto do motor, sai o resultado e o fundamento (já existe `relatorio`);
   - norma na data: `dispositivoId` + `em`, sai a redação vigente e a versão;
   - precedentes por tema ou dispositivo: sai a lista de nós do TeseMap, com `tribunal` e `especie` explícitos, para o ForgeLex separar STF de STJ.
3. **Resolvedor de citação** ("CPC, art. 85" para id de dispositivo): hoje só o Argumenta faz isso internamente (selos de citação). Sem ele, o selo "conferida no Ratione" da B3 depende de o ForgeLex conhecer os ids. Decidir na B2 se o resolvedor entra na API ou se o ForgeLex usa `buscar_dispositivos`.
4. **Versionamento** no caminho (`/api/servico/v1/...`) e resposta com `versao_do_corpus` e data da última carga, para o selo citar fonte e data.
5. A CSP (`connect-src` só `self` e Supabase, `frame-ancestors 'none'`, `X-Frame-Options: DENY`) não atrapalha chamada servidor a servidor, e confirma que o Ratione não pode ser embutido: o ForgeLex só pode abrir o Ratione em **nova aba**, como a B1 já prevê.

## 6. Pendências da B0

| Item | Lado | Como fechar |
| --- | --- | --- |
| Como o ForgeLex autentica usuários | ForgeLex | Ler o código de auth do ForgeLex (fora deste repositório) |
| `legislation-catalog.ts`: que legislação já existe | ForgeLex | Ler o arquivo e comparar com as 28 normas do NormaViva (CF, códigos e leis de maior uso) |
| `proximo` completo no fluxo de confirmação de e-mail e `auth/callback` | Ratione | Teste junto da correção do §3 |
| Formato do id de dispositivo para escopos que não são `corpo` | Ratione | Conferir em `packages/normaviva/src/nucleo.ts` antes de documentar o contrato |

## 7. Efeito no plano

- **B1** passa a depender da correção do §3; é pequena e independe da Mesa. Pode sair antes.
- **B2** parte do padrão do §5.1 e do motor já puro; o trabalho novo é o contrato versionado e o resolvedor.
- **B6** (login único) é mais caro do que o plano supunha, por serem projetos Supabase separados.
