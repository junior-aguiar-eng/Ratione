# Ratione

> **Plataforma de Inteligência e Rigor Jurídico**  
> *Quatro motores especializados, determinísticos e conectados para a prática forense de alto padrão.*

[![CI](https://github.com/junior-aguiar-eng/Ratione/actions/workflows/ci.yml/badge.svg)](https://github.com/junior-aguiar-eng/Ratione/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![CPC](https://img.shields.io/badge/CPC%2F15-Conforme%20Art.%20219%20e%20489-darkred.svg)](#)

---

## 🏛️ Os Quatro Pilares do Ratione

O Ratione rejeita o modelo de "assistente genérico de chat" e entrega quatro ferramentas com identidade, responsabilidade e rigor próprios:

| Módulo | Missão | Natureza | Fundamento Legal / Técnico |
|---|---|---|---|
| **[PrazoZero](apps/web/src/app/prazozero)** | Cálculo de prazos com memória auditável | **100% Determinístico** (Sem IA) | Arts. 219 e 224 do CPC, Res. CNJ 455/2022, Lei 10.607/02, Feriados Nacionais/Estaduais |
| **[Argumenta](apps/web/src/app/argumenta)** | Destrinchar sentenças e testar teses | **Estrutural & Cognitivo** | Art. 489, § 1º do CPC (Incisos I a VI: omissões, saltos e distinções), Docling Layout |
| **[NormaViva](apps/web/src/app/normaviva)** | O estado da norma no tempo (*Point-in-Time*) | **Bitemporal Determinístico** | LC 95/1998, Corpus LexML / Legalize-BR, Diff legislativo |
| **[TeseMap](apps/web/src/app/tesemap)** | Grafo topológico de precedentes | **Grafo Direcionado** | Art. 927 do CPC, STF Repercussão Geral, STJ Repetitivos, React Flow (`xyflow`) |

---

## 🏗️ Arquitetura do Repositório (Monorepo)

```text
Ratione/
├── apps/
│   └── web/                    # Interface Next.js 15 (App Router, Tailwind CSS, shadcn/ui, xyflow)
├── packages/
│   ├── core/                   # Entidades compartilhadas (Tribunais, Normas, Dispositivos, Precedentes)
│   ├── prazozero/              # Motor determinístico de contagem, feriados legais e memória de cálculo
│   ├── normaviva/              # Parser LC 95/98 e motor temporal de dispositivos legais
│   ├── argumenta/              # Tipologia do Art. 489 CPC e pipeline de reconstrução lógica
│   └── tesemap/                # Modelagem do grafo de precedentes qualificados e arestas semânticas
├── docs/
│   ├── plano/                  # PLANO_MESTRE (visão), PLANO_EXECUCAO (caminho) e STATUS (estado vivo)
│   ├── produto/                # Método do calendário, fontes, verificação, IA e precificação
│   ├── juridico/               # Minutas (termos, privacidade, cookies, IA) para revisão por advogado
│   └── arquivo/                # Planos concluídos
├── .github/workflows/ci.yml    # Tipos, testes, gabarito dos cenários e build
└── package.json
```

---

## 📍 Onde estamos

O estado de cada item e a ordem de trabalho ficam em [`docs/plano/STATUS.md`](docs/plano/STATUS.md). A visão está no [Plano Mestre](docs/plano/PLANO_MESTRE.md) e o caminho no [Plano de Execução](docs/plano/PLANO_EXECUCAO.md).

---

## 🚀 Como Executar

```bash
# Instalar dependências
pnpm install

# Executar suíte de testes de integridade e contagem processual
pnpm test

# Iniciar ambiente de desenvolvimento
pnpm dev
```

---

## ⚖️ Filosofia de Engenharia: "Sem Mock"

- **Prazos:** Testados contra cenários reais de jurisprudência do STJ e tribunais pátrios.
- **Feriados:** Ingestão de leis federais e estaduais com citação expressa do ato normativo instituidor.
- **Auditoria:** O usuário recebe a fundamentação exata para comprovação tempestiva (Art. 1.003, § 6º do CPC).
