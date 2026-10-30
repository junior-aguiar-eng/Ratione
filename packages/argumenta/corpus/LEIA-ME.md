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

1. **Escolher a decisão.** Pública, sem segredo de justiça, de preferência sem dado pessoal além do que a pseudonimização cobre. Anote a fonte (URL) e a data de acesso. **Processo sensível** (violência doméstica, vítima ou réu identificáveis, peça enviada pelo responsável a partir dos autos): o repositório é público, então troque todos os dados pessoais por marcadores (`[ACUSADO]`, `[VÍTIMA]`…), tire o número do processo, telefones e endereços, e confira que não sobrou nenhum nome antes de criar o caso; não publique peças acima do limite de tamanho que o pipeline recusa. Varie tipo, ramo e tamanho (o limite é cerca de 21.000 caracteres) e inclua algumas copiadas de PDF do PJe.
2. **Criar o caso** (salve o texto da decisão num `.txt`):

   ```bash
   pnpm --filter web avaliacao novo caso-001 --texto decisao.txt --fonte "Acórdão do STJ, REsp 1.234.567" --url https://www.stj.jus.br/... --tipo acordao
   ```

   Gera `casos/caso-001.json` (sem gabarito) e a folha `folhas/caso-001.md`, com os parágrafos numerados **como o modelo os recebe**.
3. **Preencher o gabarito.** Leia a folha e edite o campo `gabarito` do JSON:
   - `dispositivo`: primeiro e último parágrafo da parte que decide. O acórdão costuma ter **dois blocos que decidem** (o bloco "Acórdão", com o resultado do julgamento, e o fim do voto): ponha um em `dispositivo` e o outro em `dispositivoAlternativo` (lista de intervalos); qualquer um vale na métrica. Decisão do revisor de 30/10/2026. Em **peça de parte ou do MP** (denúncia, embargos, razões, contrarrazões), que pede e não decide, o dispositivo é o **requerimento final** e as questões são as **teses ou pedidos que a peça defende**, com o pedido como conclusão (convenção de 30/10/2026, para medir o que o Argumenta faz com texto que não é decisão). **Convenção do intervalo:** inclui o parágrafo-título ("Dispositivo", "ACÓRDÃO") quando houver e termina na última linha que decide; não inclui a fórmula de encerramento ("É como voto") nem cabeçalho ou rodapé de página;
   - `questoes`: cada questão que a decisão **resolve** (preliminar, prejudicial, mérito, e custas, honorários ou juros quando decididos), com a conclusão e **todos** os parágrafos onde é discutida e decidida. Não é questão o fato solto, o argumento solto, nem a consequência automática de outra questão;
   - `citacoes`: as normas e os precedentes que a decisão cita, como estão no texto. O que ela só transcreve de outro julgado não conta, e **o rito do recurso repetitivo** (art. 543-C do CPC/1973, art. 1.040 do CPC/2015, Resolução STJ 8/2008) **também não**: descreve o procedimento, não é fundamento de conclusão, e a etapa 4 só lista fundamentos (decisão do revisor, 30/10/2026).
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
| Dispositivo | a seção "dispositivo" achada tem sobreposição de parágrafos ≥ 80% com o intervalo do gabarito ou com qualquer `dispositivoAlternativo` |
| Questões | cada questão do gabarito tem uma questão achada que **cobre** ≥ 50% dos parágrafos dela **e** em que **ao menos um parágrafo da conclusão** cai dentro deles (a conclusão costuma aparecer também na ementa e no bloco "Acórdão"); cada achada vale uma só. Precedentes transcritos no meio não penalizam, mas uma questão larga não vale por várias |
| Citações | a citação do gabarito aparece entre os fundamentos, mesmo escrita de outro jeito: "CDC, art. 14" = "art. 14 do CDC"; norma fora da base vale pelas palavras em qualquer ordem ("art. 535 do CPC/1973" = "CPC/1973, art. 535"); precedente vale pela classe, número e UF, sem turma, relator nem data ("REsp 927.216/RS" = "REsp 927.216/RS, 2ª Turma, Rel. …"); artigo de norma da base vale com parágrafo escrito de outro jeito ("§ 11" = "§11") e com mais ou menos detalhe ("art. 43 do CTN" vale para "CTN, art. 43, I e II", mas "§ 3º" não vale para "§ 11"); súmula de outro tribunal vale por tribunal e número ("Súmula 331, IV, do TST" = "Súmula 331 do C. TST"); sigla por extenso (LC, EC, MP, DL); a citação achada pode ser mais específica que a esperada, não o contrário |
| Descartadas | a etapa chegou ao modelo e a saída foi recusada pelo código (formato ou conferência), sobre as que chegaram |

Os limiares ficam em `apps/web/src/lib/avaliacao/metricas.ts` (`LIMIAR_DISPOSITIVO`, `LIMIAR_QUESTAO`); são decisão do revisor, e mudá-los muda o que "acertar" quer dizer.

**Histórico da régua.** Em 30/10/2026, com a primeira rodada (3 casos do STJ), a métrica de questões passou de Jaccard dos parágrafos para cobertura + âncora da conclusão, e a de citações passou a igualar precedentes e normas fora da base por forma canônica. Os limiares não mudaram. Sobre as mesmas saídas do modelo, questões foram de 1 para 4 de 6 e citações de 2 para 8 de 17; a mudança é de régua, não de modelo. Rodadas feitas antes disso não são comparáveis com as seguintes sem refazer o relatório (`avaliacao relatorio <rodada>`).

Em 30/10/2026, com a rodada de 14 decisões, a comparação de citações ficou mais flexível (detalhe de parágrafo e inciso, siglas, súmulas de outros tribunais): sobre as mesmas saídas, de 41 para 57 de 81. Os limiares não mudaram.

Também em 30/10/2026, a âncora da conclusão nas questões passou de "metade dos parágrafos da conclusão dentro da questão esperada" para "ao menos um": o modelo repete a conclusão na ementa, que fica fora. Sobre as saídas da rodada das 14, questões de 21 para 23 de 29 e extras de 9 para 7.
