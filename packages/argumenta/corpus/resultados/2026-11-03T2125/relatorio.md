# Avaliação do Argumenta: rodada 2026-11-03T2125

Modelo: **claude-haiku-5-5** · casos avaliados: **30** de 30 validados

## Resultado

| Métrica | Resultado |
|---|---|
| Intervalo do dispositivo certo (sobreposição ≥ 80%) | 20 de 30 (66,7%) |
| Questões esperadas encontradas (cobertura dos parágrafos ≥ 50%) | 86 de 101 (85,1%) |
| Citações esperadas encontradas | 143 de 192 (74,5%) |
| Saídas descartadas pelo código | 1 de 89 (1,1%) |
| Questões achadas que o gabarito não tem | 18 |

## Custo

Total da rodada: **US$ 0,1601** · médio por decisão avaliada: **US$ 0,0053** (três etapas, preço do `politica.ts`).

## Tempo por etapa

| Etapa | Chamadas | Média | Máximo (caso) |
|---|---|---|---|
| estrutura | 30 | 6,8 s | 10,3 s (stj-resp-1192556-trib) |
| questões | 30 | 5,3 s | 8,9 s (trt4-rot-0021425-trab) |
| fundamentos | 29 | 8,2 s | 16,7 s (tjal-juri-razoes-apelacao) |

## Por decisão

| Caso | Parágrafos | Dispositivo | Questões | Citações | Etapas | Custo |
|---|---|---|---|---|---|---|
| stj-resp-1090898-trib | 129 | certo | 2/2 | 3/3 | ok / ok / ok | US$ 0,0064 |
| stj-resp-1104900-trib | 85 | certo | 2/2 | 1/1 | ok / ok / ok | US$ 0,0051 |
| stj-resp-1123306-certidao-fazenda-municipal | 97 | certo | 2/2 | 2/2 | ok / ok / ok | US$ 0,0059 |
| stj-resp-1144810-adm | 60 | certo | 3/3 | 4/4 | ok / ok / ok | US$ 0,0038 |
| stj-resp-1151364-civil | 70 | certo | 1/1 | 1/2 | ok / ok / ok | US$ 0,0036 |
| stj-resp-1192556-trib | 81 | certo | 1/1 (+1) | 9/9 | ok / ok / ok | US$ 0,0046 |
| stj-resp-1267995-desistencia-acao | 80 | errado (50,0%) | 2/2 | 2/2 | ok / ok / ok | US$ 0,0049 |
| stj-resp-1349059-adm | 114 | errado (57,1%) | 1/1 (+1) | 6/6 | ok / ok / ok | US$ 0,0050 |
| stj-resp-1362524-penal | 129 | errado (33,3%) | 3/3 (+1) | 5/5 | ok / ok / ok | US$ 0,0060 |
| stj-resp-1388030-civil | 149 | certo | 2/2 (+1) | 2/2 | ok / ok / ok | US$ 0,0063 |
| stj-resp-1452840-embargos-terceiro-honorarios | 118 | certo | 2/2 | 5/6 | ok / ok / ok | US$ 0,0056 |
| tjal-apelacao-saude-uniao | 148 | não achou | 3/3 | 2/6 | ok / ok / ok | US$ 0,0096 |
| tjal-juri-acordao-desaforamento | 49 | certo | 2/2 (+1) | 4/6 | ok / ok / ok | US$ 0,0065 |
| tjal-juri-contrarrazoes-mp | 39 | errado (50,0%) | 4/4 | 4/4 | ok / ok / ok | US$ 0,0034 |
| tjal-juri-decisao-1grau | 29 | errado (50,0%) | 2/2 | 3/3 | ok / ok / ok | US$ 0,0029 |
| tjal-juri-denuncia-mp | 44 | certo | 2/3 (+1) | 5/5 | ok / ok / ok | US$ 0,0033 |
| tjal-juri-embargos-defesa | 62 | não achou | 4/4 | 5/5 | ok / ok / ok | US$ 0,0042 |
| tjal-juri-razoes-apelacao | 348 | certo | 5/6 (+2) | 7/13 | ok / ok / ok | US$ 0,0124 |
| tjal-juri-resp | 171 | certo | 4/4 (+1) | 7/9 | ok / ok / ok | US$ 0,0065 |
| tjal-juri-sentenca | 111 | errado (0,0%) | 0/10 | 0/24 | ok / descartada / nao_rodou | US$ 0,0039 |
| tjal-sentenca-saude-revelia | 36 | certo | 5/6 (+2) | 6/8 | ok / ok / ok | US$ 0,0041 |
| tjpa-apc-0003808-civil | 180 | errado (33,3%) | 2/2 (+1) | 4/4 | ok / ok / ok | US$ 0,0041 |
| trf4-ac-5007789-prev | 74 | certo | 3/3 (+2) | 7/7 | ok / ok / ok | US$ 0,0048 |
| trf4-ac-5009245-prev | 49 | certo | 2/2 | 4/5 | ok / ok / ok | US$ 0,0037 |
| trt4-ro-0000501-trab | 47 | certo | 3/4 | 3/3 | ok / ok / ok | US$ 0,0038 |
| trt4-rot-0020476-trab | 86 | certo | 3/3 | 6/7 | ok / ok / ok | US$ 0,0049 |
| trt4-rot-0020592-trab | 117 | certo | 9/9 | 10/14 | ok / ok / ok | US$ 0,0064 |
| trt4-rot-0021425-trab | 107 | certo | 3/3 (+2) | 10/11 | ok / ok / ok | US$ 0,0061 |
| trt4-rot-0022282-trab | 91 | errado (66,7%) | 6/6 (+1) | 8/8 | ok / ok / ok | US$ 0,0064 |
| tst-airr-1001572-trab | 116 | certo | 3/4 (+1) | 8/8 | ok / ok / ok | US$ 0,0060 |

## Saídas que não deram resultado

- tjal-juri-sentenca: descartada, fora do formato (questoes.3.id: Invalid string: must match pattern /^Q(?:[1-9]|10)$/)

## Como ler

Avalia a **extração estrutural**, não a concordância com o texto da IA. Com 30 decisões, a amostra é pequena: use os números para decidir o que olhar, não para fixar um limite fino. O gabarito é do revisor (José Bonifácio de Aguiar Santos Júnior).
