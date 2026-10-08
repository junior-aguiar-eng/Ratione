# Ratione

> **Plataforma de Inteligência e Rigor Jurídico**  
> *Quatro ferramentas especializadas para a prática forense, com cálculo determinístico onde há regra e fonte à vista onde há dado.*

[![CI](https://github.com/junior-aguiar-eng/Ratione/actions/workflows/ci.yml/badge.svg)](https://github.com/junior-aguiar-eng/Ratione/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)

---

## 🏛️ Os Quatro Pilares do Ratione

O Ratione rejeita o modelo de "assistente genérico de chat" e entrega quatro ferramentas com identidade, responsabilidade e rigor próprios:

| Módulo | Missão | Natureza | Fundamento Legal / Técnico |
|---|---|---|---|
| **[PrazoZero](apps/web/src/app/prazozero)** | Cálculo de prazos com memória auditável | **100% Determinístico** (Sem IA) | CPC (arts. 219, 220, 224, 231, 975), CLT, CPP, Lei 9.099/95, Res. CNJ 244/2016 e 455/2022, feriados nacionais e calendário de cada tribunal lido no ato oficial |
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
│   ├── PLANO.md                # Plano único: produto, decisões, roteiro e estado
│   ├── produto/                # Método do calendário, fontes, verificação, IA e precificação
│   ├── juridico/               # Minutas (termos, privacidade, cookies, IA) para revisão por advogado
│   └── arquivo/                # Planos anteriores (origem do conteúdo; não são seguidos)
├── .github/workflows/ci.yml    # Tipos, testes, gabarito dos cenários e build
└── package.json
```

---

## 📍 Onde estamos

O produto, as decisões, o roteiro e o estado de cada item estão em um só lugar: [`docs/PLANO.md`](docs/PLANO.md).

---

## 🚀 Como Executar

```bash
# Instalar dependências
pnpm install

# Testes (motor, oráculo, propriedades) e checagem de tipos
pnpm test
pnpm typecheck

# Regenerar o gabarito do oráculo (Python 3), depois de mudar regra ou calendário
python packages/prazozero/cenarios/oraculo.py

# Iniciar ambiente de desenvolvimento
pnpm dev
```

---

## ⚖️ Filosofia de Engenharia: "Sem Mock"

- **Prazos:** conferidos por um oráculo independente (Python, sem código em comum com o motor) em 121 cenários fixos e 600 entradas aleatórias, mais testes de propriedades. **113 dos 121 cenários foram validados por revisão jurídica** em 07/10/2026 (mais 2 prazos materiais); os outros 8 (CLT e Juizados) seguem pendentes (ver `docs/produto/REVISAO_CENARIOS.md`).
- **Calendário:** cada dia não útil aponta o ato de onde foi lido (ato, URL e data). Só STF, STJ, TJSP, TJMG e TJAL (2026) têm o calendário conferido; o resto fica `pendente` e aparece só como data alternativa. Registro em `docs/produto/VERIFICACAO_FONTES.md`.
- **Auditoria:** o usuário recebe a memória de cálculo dia a dia, com o fundamento de cada dia excluído (art. 1.003, § 6º do CPC, para feriado local).
- **Dados de exemplo:** NormaViva, TeseMap e Argumenta usam um conjunto pequeno de dados digitados à mão e conferidos, rotulados como prévia ou demonstração na tela.
