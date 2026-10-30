# Avaliação do Argumenta: rodada 2026-10-30T1705

Modelo: **claude-haiku-5-5** · casos avaliados: **24** de 24 validados

## Resultado

| Métrica | Resultado |
|---|---|
| Intervalo do dispositivo certo (sobreposição ≥ 80%) | 14 de 24 (58,3%) |
| Questões esperadas encontradas (cobertura dos parágrafos ≥ 50%) | 61 de 69 (88,4%) |
| Citações esperadas encontradas | 92 de 126 (73,0%) |
| Saídas descartadas pelo código | 3 de 70 (4,3%) |
| Questões achadas que o gabarito não tem | 7 |

## Custo

Total da rodada: **US$ 0,1176** · médio por decisão avaliada: **US$ 0,0049** (três etapas, preço do `politica.ts`).

## Tempo por etapa

Sem medição de tempo nesta rodada (ela é anterior ao registro da duração).

## Por decisão

| Caso | Parágrafos | Dispositivo | Questões | Citações | Etapas | Custo |
|---|---|---|---|---|---|---|
| stj-resp-1090898-trib | 129 | certo | 2/2 | 3/3 | ok / ok / ok | US$ 0,0063 |
| stj-resp-1104900-trib | 85 | certo | 2/2 | 1/1 | ok / ok / ok | US$ 0,0052 |
| stj-resp-1123306-certidao-fazenda-municipal | 97 | certo | 2/2 | 1/2 | ok / ok / ok | US$ 0,0061 |
| stj-resp-1144810-adm | 60 | certo | 3/3 | 4/4 | ok / ok / ok | US$ 0,0042 |
| stj-resp-1151364-civil | 70 | certo | 1/1 | 1/2 | ok / ok / ok | US$ 0,0040 |
| stj-resp-1192556-trib | 81 | certo | 1/1 (+1) | 9/9 | ok / ok / ok | US$ 0,0043 |
| stj-resp-1267995-desistencia-acao | 80 | errado (50,0%) | 2/2 | 2/2 | ok / ok / ok | US$ 0,0049 |
| stj-resp-1349059-adm | 114 | errado (57,1%) | 1/1 | 6/6 | ok / ok / ok | US$ 0,0053 |
| stj-resp-1362524-penal | 129 | certo | 3/3 | 4/5 | ok / ok / ok | US$ 0,0062 |
| stj-resp-1388030-civil | 149 | errado (25,0%) | 2/2 (+1) | 2/2 | ok / ok / ok | US$ 0,0062 |
| stj-resp-1452840-embargos-terceiro-honorarios | 118 | certo | 2/2 | 6/6 | ok / ok / ok | US$ 0,0063 |
| tjal-juri-contrarrazoes-mp | 39 | certo | 3/4 (+1) | 4/4 | ok / ok / ok | US$ 0,0038 |
| tjal-juri-decisao-1grau | 29 | errado (50,0%) | 2/2 | 3/3 | ok / ok / ok | US$ 0,0027 |
| tjal-juri-denuncia-mp | 44 | não achou | 0/3 | 0/5 | ok / descartada / nao_rodou | US$ 0,0019 |
| tjal-juri-embargos-defesa | 62 | errado (42,9%) | 0/4 | 0/5 | ok / descartada / nao_rodou | US$ 0,0019 |
| tjpa-apc-0003808-civil | 180 | errado (66,7%) | 2/2 | 4/4 | ok / ok / ok | US$ 0,0050 |
| trf4-ac-5007789-prev | 74 | certo | 3/3 (+1) | 7/7 | ok / ok / ok | US$ 0,0049 |
| trf4-ac-5009245-prev | 49 | certo | 2/2 | 2/5 | ok / ok / ok | US$ 0,0036 |
| trt4-ro-0000501-trab | 47 | certo | 4/4 | 2/3 | ok / ok / ok | US$ 0,0041 |
| trt4-rot-0020476-trab | 86 | errado (60,0%) | 3/3 | 6/7 | ok / ok / ok | US$ 0,0051 |
| trt4-rot-0020592-trab | 117 | errado (20,0%) | 9/9 | 8/14 | ok / ok / ok | US$ 0,0069 |
| trt4-rot-0021425-trab | 107 | certo | 3/3 (+2) | 10/11 | ok / ok / ok | US$ 0,0059 |
| trt4-rot-0022282-trab | 91 | errado (60,0%) | 6/6 | 0/8 | ok / ok / descartada | US$ 0,0062 |
| tst-airr-1001572-trab | 116 | certo | 3/3 (+1) | 7/8 | ok / ok / ok | US$ 0,0064 |

## Saídas que não deram resultado

- tjal-juri-denuncia-mp: descartada, fora do formato (questoes: Too small: expected array to have >=1 items)
- tjal-juri-embargos-defesa: descartada, fora do formato (questoes: Too small: expected array to have >=1 items)
- trt4-rot-0022282-trab: descartada, fora do formato (fundamentos: Too big: expected array to have <=30 items)

## Como ler

Avalia a **extração estrutural**, não a concordância com o texto da IA. Com 24 decisões, a amostra é pequena: use os números para decidir o que olhar, não para fixar um limite fino. O gabarito é do revisor (José Bonifácio de Aguiar Santos Júnior).
