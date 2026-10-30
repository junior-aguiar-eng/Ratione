# Avaliação do Argumenta: rodada 2026-10-30T1725

Modelo: **claude-haiku-5-5** · casos avaliados: **24** de 24 validados

## Resultado

| Métrica | Resultado |
|---|---|
| Intervalo do dispositivo certo (sobreposição ≥ 80%) | 13 de 24 (54,2%) |
| Questões esperadas encontradas (cobertura dos parágrafos ≥ 50%) | 68 de 69 (98,6%) |
| Citações esperadas encontradas | 105 de 126 (83,3%) |
| Saídas descartadas pelo código | 0 de 72 (0,0%) |
| Questões achadas que o gabarito não tem | 12 |

## Custo

Total da rodada: **US$ 0,1195** · médio por decisão avaliada: **US$ 0,0050** (três etapas, preço do `politica.ts`).

## Tempo por etapa

| Etapa | Chamadas | Média | Máximo (caso) |
|---|---|---|---|
| estrutura | 24 | 7,5 s | 13,4 s (stj-resp-1123306-certidao-fazenda-municipal) |
| questões | 24 | 5,4 s | 12,5 s (trt4-rot-0021425-trab) |
| fundamentos | 24 | 7,6 s | 12,0 s (trt4-rot-0022282-trab) |

## Por decisão

| Caso | Parágrafos | Dispositivo | Questões | Citações | Etapas | Custo |
|---|---|---|---|---|---|---|
| stj-resp-1090898-trib | 129 | certo | 2/2 | 1/3 | ok / ok / ok | US$ 0,0062 |
| stj-resp-1104900-trib | 85 | certo | 2/2 (+1) | 1/1 | ok / ok / ok | US$ 0,0052 |
| stj-resp-1123306-certidao-fazenda-municipal | 97 | certo | 2/2 | 2/2 | ok / ok / ok | US$ 0,0060 |
| stj-resp-1144810-adm | 60 | certo | 3/3 | 4/4 | ok / ok / ok | US$ 0,0043 |
| stj-resp-1151364-civil | 70 | certo | 1/1 (+1) | 1/2 | ok / ok / ok | US$ 0,0041 |
| stj-resp-1192556-trib | 81 | certo | 1/1 (+1) | 9/9 | ok / ok / ok | US$ 0,0037 |
| stj-resp-1267995-desistencia-acao | 80 | errado (50,0%) | 2/2 | 2/2 | ok / ok / ok | US$ 0,0059 |
| stj-resp-1349059-adm | 114 | errado (75,0%) | 1/1 | 6/6 | ok / ok / ok | US$ 0,0055 |
| stj-resp-1362524-penal | 129 | certo | 3/3 | 5/5 | ok / ok / ok | US$ 0,0051 |
| stj-resp-1388030-civil | 149 | errado (25,0%) | 2/2 (+1) | 2/2 | ok / ok / ok | US$ 0,0067 |
| stj-resp-1452840-embargos-terceiro-honorarios | 118 | errado (75,0%) | 2/2 | 5/6 | ok / ok / ok | US$ 0,0061 |
| tjal-juri-contrarrazoes-mp | 39 | errado (50,0%) | 4/4 | 4/4 | ok / ok / ok | US$ 0,0037 |
| tjal-juri-decisao-1grau | 29 | errado (50,0%) | 2/2 | 2/3 | ok / ok / ok | US$ 0,0028 |
| tjal-juri-denuncia-mp | 44 | não achou | 3/3 (+1) | 3/5 | ok / ok / ok | US$ 0,0036 |
| tjal-juri-embargos-defesa | 62 | não achou | 4/4 | 5/5 | ok / ok / ok | US$ 0,0039 |
| tjpa-apc-0003808-civil | 180 | certo | 2/2 | 4/4 | ok / ok / ok | US$ 0,0052 |
| trf4-ac-5007789-prev | 74 | certo | 3/3 (+1) | 6/7 | ok / ok / ok | US$ 0,0047 |
| trf4-ac-5009245-prev | 49 | certo | 2/2 (+1) | 3/5 | ok / ok / ok | US$ 0,0035 |
| trt4-ro-0000501-trab | 47 | certo | 3/4 (+2) | 3/3 | ok / ok / ok | US$ 0,0042 |
| trt4-rot-0020476-trab | 86 | errado (60,0%) | 3/3 | 6/7 | ok / ok / ok | US$ 0,0049 |
| trt4-rot-0020592-trab | 117 | certo | 9/9 | 9/14 | ok / ok / ok | US$ 0,0064 |
| trt4-rot-0021425-trab | 107 | errado (60,0%) | 3/3 (+2) | 9/11 | ok / ok / ok | US$ 0,0061 |
| trt4-rot-0022282-trab | 91 | errado (60,0%) | 6/6 (+1) | 6/8 | ok / ok / ok | US$ 0,0061 |
| tst-airr-1001572-trab | 116 | certo | 3/3 | 7/8 | ok / ok / ok | US$ 0,0057 |

## Como ler

Avalia a **extração estrutural**, não a concordância com o texto da IA. Com 24 decisões, a amostra é pequena: use os números para decidir o que olhar, não para fixar um limite fino. O gabarito é do revisor (José Bonifácio de Aguiar Santos Júnior).
