# Validação visual local do painel administrativo — F8-04

Data: 24/10/2026. Branch: `codex/f8-04-historico-cobrancas`, sobre `3186b4a`, com as implementações locais ainda sem commit.

## Resultado

**Concluída com dados e autenticação simulados localmente.** O painel foi exercitado em Chromium, com o código real da página, proxy e API. As respostas de autenticação e da RPC vieram de um servidor HTTP de teste em `127.0.0.1:4027`. A cobrança permaneceu desligada.

O servidor de desenvolvimento anterior, com Turbopack, emitia `reloadPage: HMR hash mismatch`. A alternativa oficial, confirmada no `next dev --help` da versão instalada, foi:

```text
pnpm --filter web exec next dev --webpack --hostname 127.0.0.1 --port 3027
```

Esse comando foi permitido pelo ambiente. Nesta execução houve **zero eventos `HMR hash mismatch` e zero erros de página**. Não foi necessário iniciar `next start`, alterar dependências ou mudar a configuração do projeto. O resultado valida a alternativa com Webpack; não demonstra uma correção interna do Turbopack.

## Conferências realizadas

| Área | Resultado observado |
|---|---|
| Acesso | API responde 404 para visitante, conta comum e cookie que declara administrador com token de outra conta; página responde 404 para a conta comum. Nenhum desses casos consulta o resumo |
| Sessão | Administrador autorizado vê o painel; limpar a sessão e recarregar leva ao login e retira os dados |
| Dados | Receita de teste separada da produção; reservas separadas do custo real; alertas de 80% e 100%; aviso de registros sem atribuição histórica |
| Cotação | Sem cotação não calcula margem; `5` produz saldo de R$ 90 e margem de 90% para receita de R$ 100 e IA de US$ 2; `-1` mostra erro e retira a margem |
| Paginação | Primeira página com 20 contas; segunda com 3; próxima página desabilitada ao final; atualização volta à primeira |
| Falhas | Erro da RPC retira os totais anteriores e oferece atualização; nova tentativa recupera a leitura; lista de contas vazia tem mensagem própria |
| Visual | Capturas desktop de 1.440 px nos temas claro e escuro, e móvel de 375 px; sem transbordamento horizontal da página; tabela permite rolagem horizontal por teclado |

As capturas foram inspecionadas: cabeçalhos, cartões, avisos, tabela, identificação das contas e controles mantêm a identidade existente. O indicador “N” nas imagens pertence ao servidor de desenvolvimento.

## Evidências locais

Na pasta ignorada pelo Git `temp/validacao-painel-admin/`:

- `validar.cjs`: fixture e verificações do navegador;
- `resultado.json`: resultado, cenários, consultas e contadores de HMR/erros;
- `fontes.sha256`: hashes dos arquivos administrativos verificados;
- `desktop.png`, `desktop-escuro.png`, `mobile.png` e `mobile-topo.png`;
- `erro.png` e `vazio.png`.

O navegador isolado usou `bypassCSP` exclusivamente para alcançar o backend HTTP simulado. Os cabeçalhos CSP do produto não foram alterados; esta rodada não certifica a integração da CSP com o Supabase real.

Não houve deploy, migração remota, configuração de administrador real, ativação de cobrança ou chamada à Anthropic/Mercado Pago. Os 904 testes, tipos e build registrados na etapa anterior não foram reexecutados: esta rodada alterou apenas documentação e a fixture local de validação.
