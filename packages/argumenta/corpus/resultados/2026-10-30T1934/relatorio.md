# Avaliação do Argumenta: rodada 2026-10-30T1934

Modelo: **claude-haiku-5-5** · casos avaliados: **4** de 28 validados

## Resultado

| Métrica | Resultado |
|---|---|
| Intervalo do dispositivo certo (sobreposição ≥ 80%) | 1 de 4 (25,0%) |
| Questões esperadas encontradas (cobertura dos parágrafos ≥ 50%) | 10 de 22 (45,5%) |
| Citações esperadas encontradas | 32 de 52 (61,5%) |
| Saídas descartadas pelo código | 1 de 11 (9,1%) |
| Questões achadas que o gabarito não tem | 7 |

## Custo

Total da rodada: **US$ 0,0297** · médio por decisão avaliada: **US$ 0,0074** (três etapas, preço do `politica.ts`).

## Tempo por etapa

| Etapa | Chamadas | Média | Máximo (caso) |
|---|---|---|---|
| estrutura | 4 | 8,8 s | 9,6 s (tjal-juri-acordao-desaforamento) |
| questões | 4 | 7,7 s | 13,9 s (tjal-juri-sentenca) |
| fundamentos | 3 | 11,7 s | 15,2 s (tjal-juri-sentenca) |

## Por decisão

| Caso | Parágrafos | Dispositivo | Questões | Citações | Etapas | Custo |
|---|---|---|---|---|---|---|
| tjal-juri-acordao-desaforamento | 49 | errado (50,0%) | 1/2 (+1) | 5/6 | ok / ok / ok | US$ 0,0065 |
| tjal-juri-razoes-apelacao | 348 | não achou | 0/6 | 0/13 | ok / descartada / nao_rodou | US$ 0,0074 |
| tjal-juri-resp | 171 | certo | 3/4 (+2) | 7/9 | ok / ok / ok | US$ 0,0069 |
| tjal-juri-sentenca | 111 | errado (0,0%) | 6/10 (+4) | 20/24 | ok / ok / ok | US$ 0,0090 |

## Saídas que não deram resultado

- tjal-juri-razoes-apelacao: descartada, fora do formato (questoes.1.paragrafos: Too big: expected array to have <=80 items)

## Como ler

Avalia a **extração estrutural**, não a concordância com o texto da IA. Com 4 decisões, a amostra é pequena: use os números para decidir o que olhar, não para fixar um limite fino. O gabarito é do revisor (José Bonifácio de Aguiar Santos Júnior).
