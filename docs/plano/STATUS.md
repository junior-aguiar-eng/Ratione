# RATIONE — STATUS (fonte única do estado do projeto)

> Atualizado em **07/10/2026**. Este é o único lugar que diz o que está feito, o que está em curso e o que falta.
> Os planos dizem *para onde ir*; este arquivo diz *onde estamos*.

## Como trabalhamos

1. **Nada é implementado fora desta lista.** Ideia nova entra aqui como item, com "pronto quando", antes de virar código.
2. **Um item por branch** (`feat/<id>-resumo`). A `main` só recebe com o CI verde.
3. **Dado jurídico só entra com fonte** (ato, URL e data), registrada em [`docs/produto/VERIFICACAO_FONTES.md`](../produto/VERIFICACAO_FONTES.md). O que não tem fonte fica `pendente` e o resultado avisa.
4. **Mudou regra ou calendário? Rodou a suíte.** O CI reexecuta tudo a cada push.
5. **Este arquivo é atualizado no mesmo commit** que muda o estado de um item.

## Documentos

| Documento | Papel |
|---|---|
| [`PLANO_MESTRE.md`](PLANO_MESTRE.md) | Visão do produto e regras arquiteturais. |
| [`PLANO_EXECUCAO.md`](PLANO_EXECUCAO.md) | Caminho até o produto no ar (dados, plataforma, jurídico). Seu §0 é o diagnóstico da manhã de 07/10/2026 e está superado por este arquivo. |
| [`../produto/METODO_CALENDARIO_FORENSE.md`](../produto/METODO_CALENDARIO_FORENSE.md) | Método do calendário forense e catálogo de prazos. |
| [`../produto/VERIFICACAO_FONTES.md`](../produto/VERIFICACAO_FONTES.md) | Registro das fontes lidas e dúvidas para o revisor jurídico. |
| [`../arquivo/PLANO_CORRECOES_VISUAIS.md`](../arquivo/PLANO_CORRECOES_VISUAIS.md) | Concluído. Mantido só como histórico. |

## Numeração das fases

Os dois planos numeram diferente. Neste arquivo, **E = Plano de Execução** (usado nos IDs) e **M = Plano Mestre**.

| Execução | Mestre (aprox.) | Conteúdo |
|---|---|---|
| E0 | M0 Fundação | Repositório, CI, banco, login, deploy, observabilidade, design system |
| E1 | M3 PrazoZero MVP | PrazoZero em produção |
| E2 | M5 NormaViva MVP | NormaViva |
| E3 | M6 TeseMap MVP | TeseMap |
| E4 | M4 Argumenta MVP | Argumenta |
| E5 | M8 a M10 | Integrações entre módulos, ForgeLex, refinamento, escala comercial |

**Ordem dos módulos: em aberto.** O Mestre põe o Argumenta antes de NormaViva e TeseMap; o Plano de Execução (§1.1) inverte, para que o Argumenta possa verificar citações contra os outros dois. O Plano de Execução apresenta isso como recomendação, não como decisão registrada. **Precisa de confirmação do responsável.**

## Estado

Legenda: **feito** · **em curso** · **parcial** · **não iniciado**.

### E0 — Fundação

| ID | Item | Estado | Pronto quando |
|---|---|---|---|
| E0-01 | Monorepo pnpm (web + 5 pacotes) | feito | `pnpm install && pnpm build` passam |
| E0-02 | CI no GitHub (tipos, testes, gabarito, build) | feito | Verde na `main` (execução 37657804387, 07/10/2026). A primeira execução falhou por falta de `@types/node` no pacote e foi corrigida |
| E0-03 | Banco, login e armazenamento (Supabase, região São Paulo, RLS) | não iniciado | Login funciona; usuário A não lê dado do usuário B (teste automatizado) |
| E0-04 | Design system com shadcn/ui | não iniciado | Hoje há tokens e componentes caseiros |
| E0-05 | Deploy em staging e produção | não iniciado | Merge na `main` publica em staging |
| E0-06 | Observabilidade (erros, logs, uptime) | não iniciado | Erro de produção chega ao painel |
| E0-07 | Núcleo de datas civis puras no motor | não iniciado | Motor sem `Date`/UTC; suíte inalterada |
| E0-08 | Alertas de dependências (GitHub informou 6: 3 altos, 3 moderados, ao receber a `main`) | não iniciado | Alertas analisados e resolvidos ou justificados; não foram examinados |
| E0-09 | Manutenção do workflow | não iniciado | O GitHub avisa que `ubuntu-latest` migra para Ubuntu 26 em 19/10/2026 e que as actions v4 usam Node 20 (obsoleto); confirmar que o CI segue verde e subir as versões |

### E1 — PrazoZero

| ID | Item | Estado | Pronto quando |
|---|---|---|---|
| E1-01 | Motor CPC, CLT e CPP com memória de cálculo | feito | 83 testes verdes (73 cenários + regras); gabarito de oráculo independente |
| E1-02 | Calendário verificado de STF e STJ | parcial | **Só 2026.** Falta 2027 quando as portarias saírem |
| E1-03 | Calendário como dado (tabela com fonte, vigência, verificação) e painel de curadoria | não iniciado | Hoje são constantes no código; mover para dado versionado |
| E1-04 | Calendário de TRFs e TJs (portarias anuais) | não iniciado | Lei 5.010 já verificada para TRFs; faltam pontos facultativos por tribunal |
| E1-05 | Feriados estaduais e municipais | não iniciado | Tabela atual **não conferida**; feriado municipal exige comprovação (CPC 1.003, § 6º) |
| E1-06 | Aviso de prazo próprio no prazo em dobro (CPC 180 § 2º, 183 § 2º, 186 § 4º) | não iniciado | Tela avisa que o benefício não vale quando a lei fixa prazo próprio |
| E1-07 | Litisconsórcio (art. 229), JEF, MP e Defensoria | não iniciado | Cenários validados para cada regra |
| E1-08 | Catálogo de prazos com base legal | não iniciado | Hoje a tela tem 5 atos; catálogo do método em `METODO_CALENDARIO_FORENSE.md` §2.2 |
| E1-09 | Suíte de 100 cenários **validados por jurista** | parcial | 73 gerados, **0 validados**; faltam 27 e a validação |
| E1-10 | Salvar cálculo, exportar PDF e `.ics`, alerta por e-mail | parcial | `.ics` e salvar local existem; PDF e e-mail não |
| E1-11 | Dúvidas jurídicas abertas | em curso | 4 em `VERIFICACAO_FONTES.md` §7, aguardando o revisor |

### E2 a E4 — NormaViva, TeseMap, Argumenta

| ID | Item | Estado |
|---|---|---|
| E2 | NormaViva: coleta do Planalto, parser LC 95/98, versões, consulta temporal | não iniciado (tela estática com 4 dispositivos digitados à mão) |
| E3 | TeseMap: ingestão STJ/STF, relações com procedência | não iniciado (tela estática com 2 grafos digitados à mão) |
| E4 | Argumenta: upload, extração, verificação de citações | não iniciado (tela estática com 1 decisão fictícia) |

### Fora do código (ver `PLANO_EXECUCAO.md` §7)

CNPJ e forma de cobrança, busca de marca por radical e fonética, revisão das minutas em `docs/juridico/` por advogado, preços e teto de IA. Nenhum está concluído.

## Próximos passos, em ordem

1. **E1-06** aviso de prazo próprio no dobro (pequeno, regra já lida no CPC).
2. **E1-07** litisconsórcio, JEF, MP e Defensoria.
3. **E1-08** catálogo de prazos com base legal.
4. **E1-09** completar os 100 cenários e entregar ao revisor.
5. **E1-03** calendário como dado.

Os itens E0-03 a E0-06 dependem de decisões do responsável (conta no Supabase, domínio, CNPJ). Os alertas E0-08 devem ser vistos antes do primeiro deploy.
