# Avaliação do Argumenta: rodada 2026-11-03T1502

Modelo: **claude-haiku-5-5** · casos avaliados: **30** de 30 validados

## Resultado

| Métrica | Resultado |
|---|---|
| Intervalo do dispositivo certo (sobreposição ≥ 80%) | 15 de 30 (50,0%) |
| Questões esperadas encontradas (cobertura dos parágrafos ≥ 50%) | 86 de 101 (85,1%) |
| Citações esperadas encontradas | 157 de 192 (81,8%) |
| Saídas descartadas pelo código | 0 de 90 (0,0%) |
| Questões achadas que o gabarito não tem | 22 |

## Custo

Total da rodada: **US$ 0,1699** · médio por decisão avaliada: **US$ 0,0057** (três etapas, preço do `politica.ts`).

## Tempo por etapa

| Etapa | Chamadas | Média | Máximo (caso) |
|---|---|---|---|
| estrutura | 30 | 8,6 s | 18,9 s (stj-resp-1090898-trib) |
| questões | 30 | 5,8 s | 14,2 s (tjal-juri-razoes-apelacao) |
| fundamentos | 30 | 9,4 s | 21,0 s (tjal-juri-sentenca) |

## Por decisão

| Caso | Parágrafos | Dispositivo | Questões | Citações | Etapas | Custo |
|---|---|---|---|---|---|---|
| stj-resp-1090898-trib | 129 | certo | 2/2 | 3/3 | ok / ok / ok | US$ 0,0065 |
| stj-resp-1104900-trib | 85 | certo | 2/2 | 1/1 | ok / ok / ok | US$ 0,0053 |
| stj-resp-1123306-certidao-fazenda-municipal | 97 | errado (40,0%) | 2/2 | 2/2 | ok / ok / ok | US$ 0,0061 |
| stj-resp-1144810-adm | 60 | errado (40,0%) | 3/3 | 4/4 | ok / ok / ok | US$ 0,0046 |
| stj-resp-1151364-civil | 70 | errado (25,0%) | 1/1 | 1/2 | ok / ok / ok | US$ 0,0042 |
| stj-resp-1192556-trib | 81 | errado (60,0%) | 1/1 (+1) | 9/9 | ok / ok / ok | US$ 0,0049 |
| stj-resp-1267995-desistencia-acao | 80 | errado (50,0%) | 2/2 | 2/2 | ok / ok / ok | US$ 0,0049 |
| stj-resp-1349059-adm | 114 | errado (28,6%) | 1/1 | 6/6 | ok / ok / ok | US$ 0,0056 |
| stj-resp-1362524-penal | 129 | errado (33,3%) | 3/3 (+1) | 5/5 | ok / ok / ok | US$ 0,0064 |
| stj-resp-1388030-civil | 149 | errado (75,0%) | 2/2 (+1) | 2/2 | ok / ok / ok | US$ 0,0061 |
| stj-resp-1452840-embargos-terceiro-honorarios | 118 | errado (50,0%) | 2/2 | 4/6 | ok / ok / ok | US$ 0,0063 |
| tjal-apelacao-saude-uniao | 148 | certo | 3/3 | 2/6 | ok / ok / ok | US$ 0,0101 |
| tjal-juri-acordao-desaforamento | 49 | certo | 0/2 (+2) | 4/6 | ok / ok / ok | US$ 0,0058 |
| tjal-juri-contrarrazoes-mp | 39 | certo | 4/4 | 4/4 | ok / ok / ok | US$ 0,0036 |
| tjal-juri-decisao-1grau | 29 | errado (50,0%) | 2/2 | 3/3 | ok / ok / ok | US$ 0,0026 |
| tjal-juri-denuncia-mp | 44 | certo | 2/3 (+2) | 5/5 | ok / ok / ok | US$ 0,0039 |
| tjal-juri-embargos-defesa | 62 | certo | 4/4 | 5/5 | ok / ok / ok | US$ 0,0049 |
| tjal-juri-razoes-apelacao | 348 | certo | 1/6 (+5) | 10/13 | ok / ok / ok | US$ 0,0130 |
| tjal-juri-resp | 171 | certo | 4/4 | 7/9 | ok / ok / ok | US$ 0,0066 |
| tjal-juri-sentenca | 111 | errado (0,0%) | 5/10 (+4) | 18/24 | ok / ok / ok | US$ 0,0082 |
| tjal-sentenca-saude-revelia | 36 | certo | 4/6 (+1) | 6/8 | ok / ok / ok | US$ 0,0039 |
| tjpa-apc-0003808-civil | 180 | certo | 2/2 (+2) | 4/4 | ok / ok / ok | US$ 0,0043 |
| trf4-ac-5007789-prev | 74 | certo | 3/3 | 6/7 | ok / ok / ok | US$ 0,0042 |
| trf4-ac-5009245-prev | 49 | certo | 2/2 | 4/5 | ok / ok / ok | US$ 0,0038 |
| trt4-ro-0000501-trab | 47 | certo | 4/4 | 3/3 | ok / ok / ok | US$ 0,0042 |
| trt4-rot-0020476-trab | 86 | errado (33,3%) | 3/3 | 6/7 | ok / ok / ok | US$ 0,0051 |
| trt4-rot-0020592-trab | 117 | errado (33,3%) | 9/9 | 6/14 | ok / ok / ok | US$ 0,0070 |
| trt4-rot-0021425-trab | 107 | errado (33,3%) | 3/3 (+1) | 10/11 | ok / ok / ok | US$ 0,0053 |
| trt4-rot-0022282-trab | 91 | errado (60,0%) | 6/6 (+1) | 8/8 | ok / ok / ok | US$ 0,0061 |
| tst-airr-1001572-trab | 116 | certo | 4/4 (+1) | 7/8 | ok / ok / ok | US$ 0,0066 |

## Como ler

Avalia a **extração estrutural**, não a concordância com o texto da IA. Com 30 decisões, a amostra é pequena: use os números para decidir o que olhar, não para fixar um limite fino. O gabarito é do revisor (José Bonifácio de Aguiar Santos Júnior).
