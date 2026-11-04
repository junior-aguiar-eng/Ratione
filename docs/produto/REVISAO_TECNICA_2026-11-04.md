# Revisão técnica de código e segurança: 04/11/2026

Registro datado. Escopo: dependências, segredos, rotas da API, banco (RLS e funções), imagem Docker, CI e a base de armazenamento de documentos (F5-01). **Não é uma auditoria independente nem um teste de intrusão**: é uma revisão do código e da configuração, feita por leitura e por verificações automáticas. Método: `pnpm audit` e `pnpm outdated`, busca de segredos na árvore e em todo o histórico do Git, leitura de cada rota de `apps/web/src/app/api`, varredura das migrações em `supabase/migrations`, leitura do `Dockerfile` e dos workflows, e consulta à configuração de segurança do repositório no GitHub.

## O que foi corrigido neste PR

| # | O que | Detalhe |
|---|---|---|
| 1 | Dependências atualizadas dentro do mesmo major | Next 16.4.2 → 16.4.5, React e React DOM 19.3.0 → 19.3.1, Supabase JS 2.117.3 → 2.118.0, React Flow 12.12.0 → 12.12.1, Tailwind e PostCSS. Antes e depois, `pnpm audit`: nenhuma vulnerabilidade conhecida. Tipos, 1.100+ testes e o build passam |
| 2 | `SECURITY.md` | Política de segurança do repositório público: como relatar (relato privado do GitHub, que já está ligado), prazos, escopo e o que não vale testar |
| 3 | `.github/dependabot.yml` | Atualização de versões agrupada, uma rodada por semana para npm e uma por mês para as Actions e para a imagem Docker, sem um PR por pacote. As atualizações de segurança já vinham ligadas |

## O que foi verificado e está certo

- **Segredos:** nenhum padrão de chave (Anthropic, Supabase secreta, JWT, Mercado Pago, chave privada) na árvore atual **nem em todo o histórico**; o único `.env` versionado é o `.env.example`, sem valores; a chave de serviço não aparece em código de navegador. No GitHub estão ligados a varredura de segredos, a **proteção contra push** com segredo e o relato privado de vulnerabilidade.
- **Banco:** todas as tabelas do esquema `public` têm RLS ligada; as 27 funções `security definer` fixam `search_path` e têm `revoke` de `public`; o teste `rls.test.ts` confere os privilégios mínimos de `anon` e `authenticated` (conteúdo público só de leitura).
- **Rotas da API:** cada rota exige sessão, segredo ou assinatura conforme o caso. O painel administrativo decide só no servidor, por lista de IDs em variável de ambiente, e exige `Origin` igual ao do site nas ações que alteram. O webhook do Mercado Pago valida a assinatura HMAC com comparação em tempo constante, descarta repetidos pelo `x-request-id` e **relê o recurso na API do Mercado Pago** em vez de confiar no corpo do aviso. Rotas de agendador (lembretes e limpeza de documentos) exigem segredo com 32 caracteres ou mais, também em tempo constante, e ficam inertes sem ele.
- **Entrada e saída:** a única `dangerouslySetInnerHTML` insere um script de tema **constante**; não há `eval`, `new Function` nem `innerHTML`. O retorno do login só segue para caminho interno (testado).
- **Imagem e CI:** imagem de execução sem o código-fonte de build, rodando como usuário `node`; workflows com `permissions: contents: read` (o deploy acrescenta só o token de identidade para o Google Cloud).
- **Documentos enviados (F5-01):** cifra AES-256-GCM com o caminho como dado autenticado, tipo pelo conteúdo, limites de tamanho e quantidade, exclusão pelo usuário e antes da exclusão da conta, faxina por agendador, tudo desligado por padrão.

## Achados que ficam como recomendação (nenhum é crítico)

| Gravidade | Achado | Por que importa | Recomendação |
|---|---|---|---|
| Média-baixa | A política de segurança de conteúdo (CSP) usa `script-src 'self' 'unsafe-inline'` | Reduz a defesa em profundidade contra XSS. O risco real é baixo hoje: não há ponto de injeção de HTML | CSP com *nonce* (o Next.js suporta via `proxy.ts`); exige testar a página inicial, o grafo e o tema |
| Baixa | A conferência de origem das rotas de usuário é `se houver Origin, deve ser igual` (aceita pedido sem `Origin`); a do painel administrativo é estrita | Navegadores sempre enviam `Origin` em POST e DELETE, e o cookie de sessão do Supabase é `SameSite` por padrão, então o risco de CSRF é baixo; o painel já é estrito | Unificar: nas rotas que alteram dados, recusar quando faltar `Origin` |
| Baixa | O webhook não confere a **idade** do `ts` da assinatura | Um aviso legítimo reenviado muito depois passaria na assinatura; o `x-request-id` repetido é descartado por 90 dias e o recurso é relido na API, então o impacto é pequeno | Tolerância de alguns minutos, **depois** de confirmar no sandbox como o Mercado Pago reenvia (F8-05) |
| Baixa | Sem limite de taxa na aplicação | A cota por plano, o teto de gasto de IA e os limites do login do Supabase cobrem o custo e o abuso das rotas de IA | Limite na borda (Cloud Armor ou balanceador) antes de ligar o envio de arquivos |
| Baixa | Corpo JSON lido por inteiro antes de validar o tamanho | Exige estar logado; o Cloud Run limita o pedido a 32 MB | Ler com limite de bytes nas rotas de IA |
| Baixa | Actions por tag de versão (`@v7`) e imagem `node:24-slim` sem *digest* | Tags podem ser movidas por quem controla a Action ou a imagem | O Dependabot novo propõe atualizações; considerar fixar por SHA e por *digest* |
| Informativa | Sem ESLint; o rigor vem do TypeScript estrito e dos testes | Regras de segurança do ESLint pegariam alguns padrões cedo | Avaliar ESLint com um conjunto enxuto de regras |

## Limites desta revisão

- Não testei o site em produção com ferramentas de ataque, não revisei o código de terceiros além do `pnpm audit` e não li o código de todas as telas.
- A configuração do Google Cloud (permissões, rede, balanceador) foi lida só no que é versionado e no que pude consultar em modo leitura; uma revisão de IAM do projeto fica com o responsável.
- Os achados de gravidade baixa foram classificados por julgamento; vale reavaliar quando o envio de arquivos e a cobrança forem ligados, porque aumentam a superfície.
