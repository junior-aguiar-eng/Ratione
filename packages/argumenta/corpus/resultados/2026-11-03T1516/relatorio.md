# Avaliação do Argumenta: rodada 2026-11-03T1516

Modelo: **claude-haiku-5-5** · casos avaliados: **30** de 30 validados

## Resultado

| Métrica | Resultado |
|---|---|
| Intervalo do dispositivo certo (sobreposição ≥ 80%) | 24 de 30 (80,0%) |
| Questões esperadas encontradas (cobertura dos parágrafos ≥ 50%) | 90 de 101 (89,1%) |
| Citações esperadas encontradas | 154 de 192 (80,2%) |
| Saídas descartadas pelo código | 1 de 90 (1,1%) |
| Questões achadas que o gabarito não tem | 23 |

## Custo

Total da rodada: **US$ 0,1721** · médio por decisão avaliada: **US$ 0,0057** (três etapas, preço do `politica.ts`).

## Tempo por etapa

| Etapa | Chamadas | Média | Máximo (caso) |
|---|---|---|---|
| estrutura | 30 | 9,4 s | 14,5 s (tjal-juri-sentenca) |
| questões | 30 | 5,2 s | 10,2 s (trt4-rot-0021425-trab) |
| fundamentos | 30 | 8,7 s | 18,1 s (tjal-juri-razoes-apelacao) |

## Por decisão

| Caso | Parágrafos | Dispositivo | Questões | Citações | Etapas | Custo |
|---|---|---|---|---|---|---|
| stj-resp-1090898-trib | 129 | certo | 2/2 | 3/3 | ok / ok / ok | US$ 0,0062 |
| stj-resp-1104900-trib | 85 | certo | 2/2 | 1/1 | ok / ok / ok | US$ 0,0061 |
| stj-resp-1123306-certidao-fazenda-municipal | 97 | certo | 2/2 | 1/2 | ok / ok / ok | US$ 0,0060 |
| stj-resp-1144810-adm | 60 | certo | 3/3 | 4/4 | ok / ok / ok | US$ 0,0042 |
| stj-resp-1151364-civil | 70 | certo | 1/1 | 1/2 | ok / ok / ok | US$ 0,0038 |
| stj-resp-1192556-trib | 81 | certo | 1/1 (+1) | 9/9 | ok / ok / ok | US$ 0,0046 |
| stj-resp-1267995-desistencia-acao | 80 | certo | 2/2 | 2/2 | ok / ok / ok | US$ 0,0060 |
| stj-resp-1349059-adm | 114 | certo | 1/1 (+1) | 6/6 | ok / ok / ok | US$ 0,0059 |
| stj-resp-1362524-penal | 129 | errado (33,3%) | 3/3 (+1) | 5/5 | ok / ok / ok | US$ 0,0059 |
| stj-resp-1388030-civil | 149 | certo | 2/2 (+1) | 2/2 | ok / ok / ok | US$ 0,0064 |
| stj-resp-1452840-embargos-terceiro-honorarios | 118 | certo | 2/2 | 4/6 | ok / ok / ok | US$ 0,0063 |
| tjal-apelacao-saude-uniao | 148 | certo | 3/3 | 3/6 | ok / ok / ok | US$ 0,0103 |
| tjal-juri-acordao-desaforamento | 49 | certo | 0/2 (+3) | 5/6 | ok / ok / ok | US$ 0,0057 |
| tjal-juri-contrarrazoes-mp | 39 | certo | 4/4 | 4/4 | ok / ok / ok | US$ 0,0038 |
| tjal-juri-decisao-1grau | 29 | certo | 2/2 | 2/3 | ok / ok / ok | US$ 0,0027 |
| tjal-juri-denuncia-mp | 44 | certo | 3/3 (+1) | 5/5 | ok / ok / ok | US$ 0,0040 |
| tjal-juri-embargos-defesa | 62 | certo | 3/4 | 3/5 | ok / ok / ok | US$ 0,0041 |
| tjal-juri-razoes-apelacao | 348 | certo | 5/6 (+2) | 11/13 | ok / ok / ok | US$ 0,0127 |
| tjal-juri-resp | 171 | certo | 3/4 (+2) | 6/9 | ok / ok / ok | US$ 0,0065 |
| tjal-juri-sentenca | 111 | não achou | 6/10 (+3) | 16/24 | cortada / ok / ok | US$ 0,0089 |
| tjal-sentenca-saude-revelia | 36 | certo | 4/6 (+1) | 5/8 | ok / ok / ok | US$ 0,0039 |
| tjpa-apc-0003808-civil | 180 | certo | 2/2 (+1) | 4/4 | ok / ok / ok | US$ 0,0051 |
| trf4-ac-5007789-prev | 74 | certo | 3/3 | 7/7 | ok / ok / ok | US$ 0,0046 |
| trf4-ac-5009245-prev | 49 | certo | 2/2 | 2/5 | ok / ok / ok | US$ 0,0037 |
| trt4-ro-0000501-trab | 47 | certo | 4/4 | 3/3 | ok / ok / ok | US$ 0,0041 |
| trt4-rot-0020476-trab | 86 | errado (33,3%) | 3/3 (+1) | 6/7 | ok / ok / ok | US$ 0,0055 |
| trt4-rot-0020592-trab | 117 | errado (33,3%) | 9/9 | 8/14 | ok / ok / ok | US$ 0,0070 |
| trt4-rot-0021425-trab | 107 | errado (33,3%) | 3/3 (+3) | 11/11 | ok / ok / ok | US$ 0,0064 |
| trt4-rot-0022282-trab | 91 | errado (33,3%) | 6/6 | 8/8 | ok / ok / ok | US$ 0,0063 |
| tst-airr-1001572-trab | 116 | certo | 4/4 (+2) | 7/8 | ok / ok / ok | US$ 0,0055 |

## Como ler

Avalia a **extração estrutural**, não a concordância com o texto da IA. Com 30 decisões, a amostra é pequena: use os números para decidir o que olhar, não para fixar um limite fino. O gabarito é do revisor (José Bonifácio de Aguiar Santos Júnior).
