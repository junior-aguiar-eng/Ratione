# Avaliação do Argumenta: rodada 2026-11-03T1618

Modelo: **claude-sonnet-5-5** · casos avaliados: **30** de 30 validados

## Resultado

| Métrica | Resultado |
|---|---|
| Intervalo do dispositivo certo (sobreposição ≥ 80%) | 18 de 30 (60,0%) |
| Questões esperadas encontradas (cobertura dos parágrafos ≥ 50%) | 82 de 101 (81,2%) |
| Citações esperadas encontradas | 135 de 192 (70,3%) |
| Saídas descartadas pelo código | 0 de 90 (0,0%) |
| Questões achadas que o gabarito não tem | 30 |

## Custo

Total da rodada: **US$ 2,8812** · médio por decisão avaliada: **US$ 0,0960** (três etapas, preço do `politica.ts`).

## Tempo por etapa

| Etapa | Chamadas | Média | Máximo (caso) |
|---|---|---|---|
| estrutura | 30 | 5,3 s | 9,1 s (tjpa-apc-0003808-civil) |
| questões | 30 | 6,1 s | 10,8 s (tjal-juri-sentenca) |
| fundamentos | 30 | 12,2 s | 25,7 s (tjal-juri-razoes-apelacao) |

## Por decisão

| Caso | Parágrafos | Dispositivo | Questões | Citações | Etapas | Custo |
|---|---|---|---|---|---|---|
| stj-resp-1090898-trib | 129 | certo | 2/2 | 1/3 | ok / ok / ok | US$ 0,1081 |
| stj-resp-1104900-trib | 85 | certo | 2/2 (+1) | 1/1 | ok / ok / ok | US$ 0,1018 |
| stj-resp-1123306-certidao-fazenda-municipal | 97 | errado (40,0%) | 2/2 | 2/2 | ok / ok / ok | US$ 0,1008 |
| stj-resp-1144810-adm | 60 | certo | 3/3 | 2/4 | ok / ok / ok | US$ 0,0658 |
| stj-resp-1151364-civil | 70 | errado (75,0%) | 1/1 | 1/2 | ok / ok / ok | US$ 0,0628 |
| stj-resp-1192556-trib | 81 | errado (40,0%) | 1/1 (+1) | 5/9 | ok / ok / ok | US$ 0,0697 |
| stj-resp-1267995-desistencia-acao | 80 | errado (62,5%) | 2/2 | 2/2 | ok / ok / ok | US$ 0,0898 |
| stj-resp-1349059-adm | 114 | certo | 1/1 (+1) | 3/6 | ok / ok / ok | US$ 0,1013 |
| stj-resp-1362524-penal | 129 | errado (33,3%) | 3/3 | 5/5 | ok / ok / ok | US$ 0,1047 |
| stj-resp-1388030-civil | 149 | errado (37,5%) | 2/2 (+1) | 2/2 | ok / ok / ok | US$ 0,0962 |
| stj-resp-1452840-embargos-terceiro-honorarios | 118 | certo | 2/2 | 6/6 | ok / ok / ok | US$ 0,1002 |
| tjal-apelacao-saude-uniao | 148 | errado (66,7%) | 3/3 | 5/6 | ok / ok / ok | US$ 0,1888 |
| tjal-juri-acordao-desaforamento | 49 | certo | 2/2 | 4/6 | ok / ok / ok | US$ 0,1090 |
| tjal-juri-contrarrazoes-mp | 39 | certo | 4/4 (+1) | 1/4 | ok / ok / ok | US$ 0,0569 |
| tjal-juri-decisao-1grau | 29 | certo | 2/2 | 2/3 | ok / ok / ok | US$ 0,0407 |
| tjal-juri-denuncia-mp | 44 | certo | 3/3 | 4/5 | ok / ok / ok | US$ 0,0564 |
| tjal-juri-embargos-defesa | 62 | errado (60,0%) | 4/4 | 5/5 | ok / ok / ok | US$ 0,0718 |
| tjal-juri-razoes-apelacao | 348 | certo | 0/6 (+7) | 10/13 | ok / ok / ok | US$ 0,2343 |
| tjal-juri-resp | 171 | certo | 1/4 (+4) | 5/9 | ok / ok / ok | US$ 0,1170 |
| tjal-juri-sentenca | 111 | certo | 3/10 (+7) | 19/24 | ok / ok / ok | US$ 0,1540 |
| tjal-sentenca-saude-revelia | 36 | certo | 3/6 (+2) | 5/8 | ok / ok / ok | US$ 0,0662 |
| tjpa-apc-0003808-civil | 180 | certo | 2/2 (+1) | 1/4 | ok / ok / ok | US$ 0,0828 |
| trf4-ac-5007789-prev | 74 | certo | 3/3 | 6/7 | ok / ok / ok | US$ 0,0764 |
| trf4-ac-5009245-prev | 49 | certo | 2/2 | 2/5 | ok / ok / ok | US$ 0,0553 |
| trt4-ro-0000501-trab | 47 | certo | 4/4 | 2/3 | ok / ok / ok | US$ 0,0682 |
| trt4-rot-0020476-trab | 86 | errado (60,0%) | 3/3 | 7/7 | ok / ok / ok | US$ 0,0874 |
| trt4-rot-0020592-trab | 117 | errado (33,3%) | 9/9 | 7/14 | ok / ok / ok | US$ 0,1136 |
| trt4-rot-0021425-trab | 107 | errado (60,0%) | 3/3 (+2) | 9/11 | ok / ok / ok | US$ 0,0999 |
| trt4-rot-0022282-trab | 91 | errado (60,0%) | 6/6 (+1) | 5/8 | ok / ok / ok | US$ 0,1029 |
| tst-airr-1001572-trab | 116 | certo | 4/4 (+1) | 6/8 | ok / ok / ok | US$ 0,0982 |

## Como ler

Avalia a **extração estrutural**, não a concordância com o texto da IA. Com 30 decisões, a amostra é pequena: use os números para decidir o que olhar, não para fixar um limite fino. O gabarito é do revisor (José Bonifácio de Aguiar Santos Júnior).
