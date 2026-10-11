# Auditoria das páginas jurídicas do beta (F1-02)

Texto em vigor no site: `/termos`, `/privacidade` (inclui cookies) e `/metodologia`. Versão **1.0**, vigência **10/10/2026** (`apps/web/src/lib/legal.ts`). Estas páginas descrevem o produto **como ele é hoje**: beta gratuito, com conta, sem cobrança, sem IA e sem envio de documentos. As minutas desta pasta (`TERMOS_DE_USO.md`, `POLITICA_DE_PRIVACIDADE.md` etc.) continuam como **versão-alvo** para quando houver cobrança, créditos de IA e upload; não foram publicadas e ainda têm campos `[ ]`.

## 1. O que cada afirmação da página tem por trás

| Afirmação | Comprovação no sistema |
|---|---|
| Os cálculos do PrazoZero rodam no navegador | `apps/web/src/app/prazozero/page.tsx` é componente de cliente e chama o motor direto; não há rota de cálculo no servidor |
| Guardamos e-mail e senha em hash; não vemos a senha | Supabase Auth (`auth.users`); o app nunca lê nem grava a senha em tabela própria |
| Perfil: nome, atuação, OAB, tribunal e UF | `supabase/migrations/20261007000001_perfis_e_itens_salvos.sql`, tabela `perfis` (campos com limite de tamanho) |
| Registros em Meu espaço: título, descrição curta, ferramenta, link interno, data | tabela `itens_salvos` (`titulo`, `detalhe`, `modulo`, `url`, `criado_em`); o campo `dados` (jsonb) existe mas **nenhuma tela o preenche** |
| Avisos: nome, tribunal, vencimento, 3 dias e 1 dia, quando enviados | tabela `lembretes_prazo` (`20261011000001_lembretes_prazo.sql`) |
| Cada conta só acessa os próprios dados | RLS nas três tabelas; 24 testes em `packages/db` (PGlite) |
| Excluir a conta remove cadastro, perfil, registros e avisos | `ON DELETE CASCADE` das três tabelas para `auth.users` + rota `POST /api/conta/excluir` (`lib/excluir-conta.ts`, 5 testes) |
| Baixar dados, apagar registros e avisos, corrigir perfil, trocar senha | `/conta` (`exportar`, `apagarItens`, `salvarPerfil`, `trocarSenha`) |
| Nossos logs não têm corpo, cookies, e-mail, senha, token nem texto digitado | `apps/web/src/lib/log.ts` (regras no cabeçalho; caminho sem query) e testes em `lib/log.test.ts` |
| Registros técnicos do Google Cloud ficam 30 dias, em localização global | `gcloud logging buckets list`: `_Default`, local `global`, retenção 30 dias (conferido em 11/10/2026) |
| Os registros de acesso trazem IP, navegador, data e hora | Entradas `run.googleapis.com/requests` têm `remoteIp`, `userAgent` e `requestUrl` |
| Hospedagem em São Paulo; banco em São Paulo | `docs/deploy/CLOUD_RUN.md` (`southamerica-east1`) e `supabase/LEIA-ME.md` (`sa-east-1`) |
| Resend recebe endereço, assunto e texto | `api/lembretes/enviar/route.ts` (POST a `api.resend.com/emails`) e SMTP do Supabase Auth (`supabase/LEIA-ME.md`) |
| Sem estatística de uso, publicidade ou rastreadores de terceiros | Nenhum SDK de analytics no `package.json`; fontes via `next/font` (servidas pelo próprio site) |
| Cookies e armazenamento local | Sessão do Supabase (`sb-…`); `localStorage`: `ratione_tema` e `ratione_historico_recente` (`ThemeToggle.tsx`, `lib/historico.ts`) |
| Nenhuma ferramenta usa IA | Argumenta é demonstração com decisão fixa (`lib/decisaoDemo.ts`); não há chamada a modelo no código |
| Guardamos a versão dos Termos aceita | `entrar/page.tsx` envia `dadosDeAceite()` em `signUp(... options.data)` (`user_metadata.termos_versao`) |
| Cenários validados e calendário conferido (Metodologia) | Lidos do código: `CENARIOS_VALIDADOS` (teste compara com `cenarios.json`) e `CALENDARIO_VERIFICADO` |

## 2. O que depende de você (responsável) antes de publicar

**Obrigatório**
1. **Criar e monitorar a caixa `contato@nexojuris.ia.br`.** Ela é o canal do titular de dados (LGPD, art. 9º) e o contato dos Termos. O remetente atual (`nao-responda@`) só envia, não recebe. Sem a caixa, publicar as páginas é prometer um canal que não existe.
2. **Confirmar o nome do responsável** (as páginas usam José Bonifácio de Aguiar Santos Júnior, pessoa física, sem CPF nem endereço) e se isso basta para o beta. A LGPD (art. 9º, I e II) exige identidade e contato do controlador; CPF e endereço só se tornam necessários com cobrança.

**Decisões jurídicas que escrevi como proposta e você deve aprovar ou trocar**
3. **Foro (Termos, item 13):** domicílio do usuário, sem comarca fixa.
4. **Responsabilidade (Termos, item 10):** exclui perda de prazo sem a conferência do item 3 e ressalva dolo, culpa grave e direito do consumidor. Sem limite em valor (o beta é gratuito), diferente da minuta-alvo.
5. **Prazo de resposta de 15 dias** (Privacidade, item 5): é compromisso público (LGPD, art. 19, II).
6. **Sem banner de cookies:** a tese é que só há cookie essencial (login) e preferência funcional, sem medição nem publicidade. Se um dia entrar analytics, o banner e a base de consentimento passam a ser obrigatórios.
7. **Idade de 18 anos:** declarada, sem verificação técnica.
8. **Cláusula de aviso por e-mail** (Termos, item 8): deixa claro que não garante entrega nem substitui a agenda do profissional. É onde está o maior risco prático do produto.

**Lacunas que as páginas não resolvem (e dizem só o que é verdade hoje)**
9. **Transferência internacional (LGPD, art. 33).** Resend pode processar fora do Brasil, e o bucket de logs do Google Cloud é `global`. A página diz "com as garantias contratuais oferecidas por esses prestadores": confirme o aceite do DPA/cláusulas-padrão de cada um (item "DPA" do §8 do plano) e, no Resend, a região do domínio `nexojuris.ia.br`.
10. **Backups do Supabase:** a página diz que podem manter os dados "por um período limitado". Se você souber o prazo do plano contratado, informe o número.
11. **Prova do aceite.** Gravamos `termos_versao` em `user_metadata` (valor enviado pelo navegador) e o `created_at` do cadastro é do servidor. Serve para saber qual texto estava em vigor, mas é prova fraca. Para prova forte seria preciso uma tabela própria preenchida no servidor.
12. **Marco Civil, art. 15:** a guarda de registros de acesso por 6 meses vale para provedor **pessoa jurídica**. Como pessoa física, os 30 dias do Google Cloud não conflitam; ao abrir CNPJ, reavaliar.

## 3. Fora do que as páginas dizem
Cobrança, planos, créditos de IA, upload de documentos, segredo de justiça e sigilo profissional em peças enviadas, RIPD e encarregado: pertencem às minutas desta pasta e ao §8 do plano. A Política de privacidade já avisa que será atualizada **antes** de qualquer um deles.
