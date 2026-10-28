# Corpus de avaliação do Argumenta (F5-05)

30 decisões públicas, cada uma com um **gabarito conferido pelo revisor**, para medir o quanto o Argumenta acerta na extração estrutural (dispositivo, questões e citações) e quanto custa. Não mede concordância com o texto da IA.

```text
corpus/
├── casos/        um arquivo por decisão (texto, fonte, gabarito e validação), versionado
├── folhas/       folhas de conferência geradas (não versionadas)
└── resultados/   uma pasta por rodada, com a saída de cada caso e o relatorio.md, versionada
```

## Fluxo

Todos os comandos rodam na raiz do repositório.

1. **Escolher a decisão.** Pública, sem segredo de justiça, de preferência sem dado pessoal além do que a pseudonimização cobre. Anote a fonte (URL) e a data de acesso. Varie tipo, ramo e tamanho (o limite é cerca de 21.000 caracteres) e inclua algumas copiadas de PDF do PJe.
2. **Criar o caso** (salve o texto da decisão num `.txt`):

   ```bash
   pnpm --filter web avaliacao novo caso-001 --texto decisao.txt --fonte "Acórdão do STJ, REsp 1.234.567" --url https://www.stj.jus.br/... --tipo acordao
   ```

   Gera `casos/caso-001.json` (sem gabarito) e a folha `folhas/caso-001.md`, com os parágrafos numerados **como o modelo os recebe**.
3. **Preencher o gabarito.** Leia a folha e edite o campo `gabarito` do JSON:
   - `dispositivo`: primeiro e último parágrafo da parte que decide;
   - `questoes`: cada questão que a decisão **resolve** (preliminar, prejudicial, mérito, e custas, honorários ou juros quando decididos), com a conclusão e **todos** os parágrafos onde é discutida e decidida. Não é questão o fato solto, o argumento solto, nem a consequência automática de outra questão;
   - `citacoes`: as normas e os precedentes que a decisão cita, como estão no texto. O que ela só transcreve de outro julgado não conta.
4. **Validar:**

   ```bash
   pnpm --filter web avaliacao validar caso-001
   ```

   Confere que os parágrafos existem e grava `validacao` com o seu nome completo e a data (`--por "Outro Nome"` para outro revisor). Sem validação, o caso fica de fora das métricas. Mudou o gabarito depois? Valide de novo.
5. **Rodar o pipeline** nos casos validados. **Chama o modelo e gasta dinheiro:** sem `--confirmar` só mostra a estimativa.

   ```bash
   pnpm --filter web avaliacao rodar                              # simulação: custo máximo, nada é enviado
   pnpm --filter web avaliacao rodar --confirmar --max-usd 0.5    # roda e para quando o gasto chegar a US$ 0,50
   ```

   Defina `ANTHROPIC_API_KEY` **só no terminal** onde vai rodar (PowerShell: `$env:ANTHROPIC_API_KEY = "..."`), nunca em arquivo do repositório. Usa as mesmas tarefas do produto (instruções, esquema e conferência), o mesmo modelo e a mesma pseudonimização.
6. **Ler o relatório** em `resultados/<rodada>/relatorio.md` (`pnpm --filter web avaliacao relatorio [rodada]` o refaz).

## O que cada métrica quer dizer

| Métrica | Conta como acerto quando |
|---|---|
| Dispositivo | a seção "dispositivo" achada tem sobreposição de parágrafos ≥ 80% com o intervalo do gabarito |
| Questões | cada questão do gabarito tem uma questão achada com sobreposição ≥ 50% nos parágrafos; cada achada vale uma só |
| Citações | a citação do gabarito aparece entre os fundamentos, mesmo escrita de outro jeito ("CDC, art. 14" = "art. 14 do CDC") |
| Descartadas | a etapa chegou ao modelo e a saída foi recusada pelo código (formato ou conferência), sobre as que chegaram |

Os limiares ficam em `apps/web/src/lib/avaliacao/metricas.ts` (`LIMIAR_DISPOSITIVO`, `LIMIAR_QUESTAO`); são decisão do revisor, e mudá-los muda o que "acertar" quer dizer.
