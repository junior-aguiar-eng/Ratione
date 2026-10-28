<div align="center">

# Ratione

**Plataforma de Inteligência e Rigor Jurídico**

Quatro ferramentas para a prática forense: cálculo determinístico onde há regra e fonte à vista onde há dado.

[![CI](https://github.com/junior-aguiar-eng/Ratione/actions/workflows/ci.yml/badge.svg)](https://github.com/junior-aguiar-eng/Ratione/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)

[**Acessar o site**](https://ratione.nexojuris.ia.br) · [Plano do projeto](docs/PLANO.md) · [Metodologia](apps/web/src/app/metodologia)

</div>

---

## O que é

O Ratione não é um assistente genérico de chat. A pergunta do produto é **"o que você quer fazer?"**, e cada resposta é uma ferramenta com escopo, método e responsabilidade próprios. A IA é um recurso opcional e medido, e só entra onde o dado jurídico já está resolvido.

| Ferramenta | Pergunta que responde | Natureza |
|---|---|---|
| [**PrazoZero**](#-prazozero) | Qual é o prazo e como foi calculado? | 100% determinística, **sem IA** |
| [**NormaViva**](#-normaviva) | Qual era o texto desta norma em tal data? | Bitemporal determinística (IA só para explicar) |
| [**TeseMap**](#-tesemap) | Como esta tese se liga a outras autoridades? | Grafo curado, com validação humana |
| [**Argumenta**](#-argumenta) | Como esta decisão argumenta? | Estrutural, com IA |

Na página inicial, uma **janela interativa** demonstra cada ferramenta: o PrazoZero e o NormaViva rodam os motores reais no navegador, o TeseMap mostra as relações validadas do Tema 1.076/STJ e o Argumenta, um exemplo ilustrativo (rotulado como tal).

---

## Funcionalidades

### ⏱️ PrazoZero

Cálculo de prazos processuais com **memória auditável**: o resultado mostra a data final, o dia a dia da contagem e o ato que excluiu cada dia não útil.

- **Regimes:** CPC (dias úteis), CLT (arts. 775 e 775-A), Juizados Especiais (Lei 9.099, art. 12-A) e CPP (dias corridos, arts. 798 e 798-A), além dos prazos próprios de STF e STJ (recesso e férias coletivas).
- **Prazos materiais** (mandado de segurança e ação rescisória) calculados à parte: decadência não se suspende.
- **Calendário forense em camadas:** regras de contagem, prazos diferenciados (Fazenda, MP, Defensoria, litisconsortes), feriados nacionais, suspensões, recesso e eventos locais. Cada dia não útil aponta o ato de origem (ato, URL e data).
- **Modo conservador:** mostra a data mais cedo, com base verificada, e avisa qual dia pendente poderia alterá-la.
- **Calendários conferidos em 2026:** STF, STJ, TJSP, TJMG e TJAL. Os demais ficam `pendente` e aparecem apenas como data alternativa.
- **Feriado municipal:** não é calculado por padrão; o sistema avisa e exige comprovação (CPC, art. 1.003, § 6º).
- Adição do prazo ao calendário e lembretes por conta.

### 📜 NormaViva

A **linha do tempo de cada norma**. "Como era o art. X em maio de 2019?" é um resultado determinístico, nunca gerado por IA.

- **28 normas** (CF, códigos e leis de maior uso), fragmentadas em artigo, parágrafo, inciso e alínea (parser LC 95/1998), com texto lido da versão compilada do Planalto.
- **Pesquisa** por lei, artigo ou assunto (`art. 489 CPC`, `honorários advocatícios`), sem acento e por proximidade.
- **Texto vigente, redações anteriores e o que mudou**, com a alteração legislativa que causou a mudança. As redações anteriores só aparecem depois de conferidas por revisor jurídico (57 casos validados).
- **Relações entre dispositivos** (remissões) com ligação ao artigo de destino.
- **Explicar com IA** o dispositivo, com cota e custo controlados.
- **Atualização diária:** um workflow relê as normas no Planalto e confere os feeds do Senado; se o texto mudou, abre um alerta para o revisor. Nada é alterado sem aprovação humana.
- Todo texto exibido traz o link da fonte oficial e a data de leitura.

### 🕸️ TeseMap

O **grafo de precedentes** com o corpus declarado e a data da última atualização visível.

- **7.734 nós** a partir de fontes oficiais: precedentes qualificados e súmulas do STJ, temas de repercussão geral, súmulas e controle concentrado (ADI, ADPF, ADC e ADO com mérito) do STF.
- **Pesquisa por assunto** (todas as palavras, sem acento) e navegação por um mapa interativo (React Flow).
- **Relações só aparecem depois de validadas por uma pessoa**, cada uma com trecho literal conferido.
- **Atalho para o NormaViva** a partir dos dispositivos citados pelos precedentes.
- **Verificação semanal das fontes:** um workflow avisa quando os dados abertos do STJ mudam ou quando uma entrada manual passa de 90 dias.

### ⚖️ Argumenta

Análise de uma decisão colada em texto, sem upload e sem guardar o documento.

- **Visão geral, estrutura e questões:** tipo e resultado da decisão, as partes (relatório, preliminares, fundamentação, dispositivo) e, para cada questão, a conclusão, o tratamento da alegação e os fundamentos (fato, prova, norma, precedente, doutrina, argumento).
- **Leitura com origem sob demanda:** cada ponto leva ao trecho original, destacado no texto da decisão.
- **Pseudonimização sempre ligada:** os dados pessoais são substituídos no navegador e a tabela de equivalência nunca sai dele.
- **Segmentação de PDF do PJe:** remove rodapés e junta frases cortadas.
- **Selo das citações:** cada norma ou precedente citado é conferido por código contra o NormaViva e o TeseMap e recebe **Encontrada na base** (com link), **Não localizada na base** ou **Fora da base**. O selo diz só se a citação existe na base; não atesta que esteja correta, e só a citação (nunca o texto da decisão) é consultada.
- Em construção: fragilidades da fundamentação (CPC, art. 489, § 1º) e mapa de argumentos.

---

## Sua conta

- **Login por e-mail** com confirmação, recuperação de senha e sessão validada no servidor. Logado, o cabeçalho mostra o seu primeiro nome, com um menu para **Minha conta** e **Sair**.
- **Meu espaço:** normas, teses e cálculos salvos, com limite por conta.
- **Meu uso:** o que foi consumido, em análises e não em tokens; histórico, falhas que não gastam cota e exportação em CSV.
- **Planos e cota por análise** (Gratuito, Essencial e Profissional): análise com falha não consome cota. A **cobrança pelo Mercado Pago está implementada em modo de teste e desligada**, até a ativação comercial.
- **Painel administrativo**, restrito às contas definidas no servidor: estatísticas de uso e custo, margem e gestão de acesso (suspender e reativar), com trilha de auditoria.
- **Privacidade e retenção mínima:** isolamento por usuário com RLS testada automaticamente; o texto das decisões e o resultado das análises **não ficam guardados**; e uma limpeza diária apaga o que passou do prazo (uso de IA e análises em 13 meses, ações administrativas em 12 meses, avisos de prazo 30 dias depois do vencimento). Conta, perfil e registros salvos ficam até o usuário excluir a conta, o que ele faz sozinho. Política de Privacidade v1.2 e minutas de termos, cookies e IA em [`docs/juridico`](docs/juridico).
- **IA que não para sem aviso:** se a conta do provedor ficar sem saldo ou a chave for recusada, o servidor registra erro e o alerta por e-mail dispara ([`docs/deploy/CLOUD_RUN.md`](docs/deploy/CLOUD_RUN.md)).

---

## Por que confiar nos resultados

- **Prazos conferidos por um oráculo independente.** Um programa em Python, sem código em comum com o motor, confere **121 cenários fixos** e **600 entradas aleatórias**, além de testes de propriedades. Os 121 cenários foram validados por revisão jurídica em 07/10/2026 ([`REVISAO_CENARIOS.md`](docs/produto/REVISAO_CENARIOS.md)).
- **Sem mock.** NormaViva e TeseMap leem dados reais; cada registro guarda a fonte oficial e a data de leitura.
- **Validação humana no que é jurídico.** Redação anterior, relação do grafo e calendário só entram depois de conferidos por uma pessoa e registrados em [`VERIFICACAO_FONTES.md`](docs/produto/VERIFICACAO_FONTES.md).
- **Só a versão compilada da lei.** Trecho tachado nunca é fonte de regra.
- **A IA não decide o direito.** Ela converte, explica e resume; quem soma os dias e escolhe a redação vigente é código.
- **A IA é medida, não presumida.** Há ferramentas para avaliar a extração do Argumenta (dispositivo, questões e citações) contra decisões públicas com gabarito conferido por revisor jurídico, com custo por análise ([`packages/argumenta/corpus/LEIA-ME.md`](packages/argumenta/corpus/LEIA-ME.md)). O corpus ainda está em formação, então **não há métrica de acerto publicada**.

---

## Arquitetura

```text
Ratione/
├── apps/
│   └── web/             # Next.js 16 (App Router), React 19, Tailwind 4, xyflow
├── packages/
│   ├── core/            # Entidades compartilhadas (tribunais, normas, dispositivos, precedentes)
│   ├── prazozero/       # Motor determinístico de contagem, calendário e memória de cálculo
│   ├── normaviva/       # Parser LC 95/98, motor temporal e carga do corpus
│   ├── tesemap/         # Grafo de precedentes, coleta e carga
│   ├── argumenta/       # Contratos e pipeline de análise da decisão
│   └── db/              # Testes de segurança por linha (RLS) do esquema Supabase
├── supabase/
│   ├── migrations/      # Esquema do banco, aplicado à mão no SQL Editor
│   └── correcoes/       # Correções de dados do NormaViva
├── docs/                # Plano, método, fontes, IA, cobrança e minutas jurídicas
└── .github/workflows/   # CI, deploy e atualização diária de normas e TeseMap
```

| Camada | Tecnologia |
|---|---|
| Web | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Grafo | React Flow (`@xyflow/react`) |
| Banco e login | PostgreSQL no Supabase (São Paulo), RLS em todas as tabelas |
| IA | Claude (Anthropic SDK), saída estruturada validada com Zod |
| Cobrança | Mercado Pago (assinaturas e webhook assinado), desligada |
| Hospedagem | Google Cloud Run |
| Testes | `node:test` + tsx, PGlite para o banco |

---

## Como executar

Pré-requisitos: Node.js e [pnpm](https://pnpm.io) 11.

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local   # preencha a URL e a chave publicável do Supabase
pnpm dev
```

```bash
pnpm test         # todos os pacotes (motor, oráculo, RLS, web)
pnpm typecheck    # checagem de tipos
pnpm build        # pacotes e aplicação

# Regenerar o gabarito do oráculo (Python 3), depois de mudar regra ou calendário
python packages/prazozero/cenarios/oraculo.py

# Corpus de avaliação do Argumenta (criar caso, validar gabarito, rodar e medir)
pnpm --filter web avaliacao
```

O passo a passo do Supabase (projeto, migrações, e-mail e cargas de dados) está em [`supabase/LEIA-ME.md`](supabase/LEIA-ME.md). O deploy está em [`docs/deploy`](docs/deploy).

---

## Documentação

| Documento | Conteúdo |
|---|---|
| [`docs/PLANO.md`](docs/PLANO.md) | **Plano único:** produto, decisões, roteiro e estado de cada item |
| [`docs/produto/METODO_CALENDARIO_FORENSE.md`](docs/produto/METODO_CALENDARIO_FORENSE.md) | Método do calendário forense e checklist por tribunal |
| [`docs/produto/VERIFICACAO_FONTES.md`](docs/produto/VERIFICACAO_FONTES.md) | Fontes lidas e o que ainda falta conferir |
| [`docs/produto/ARGUMENTA.md`](docs/produto/ARGUMENTA.md) | Análise de decisão: fluxo, etapas e privacidade |
| [`docs/produto/IA_TAREFAS.md`](docs/produto/IA_TAREFAS.md) · [`IA_E_PRECIFICACAO.md`](docs/produto/IA_E_PRECIFICACAO.md) | Catálogo de tarefas de IA, custos e cotas |
| [`docs/produto/PLANOS_E_COBRANCA.md`](docs/produto/PLANOS_E_COBRANCA.md) | Planos, uso transparente e cobrança (F8) |
| [`docs/produto/DESIGN_SYSTEM.md`](docs/produto/DESIGN_SYSTEM.md) | Sistema visual: tokens, componentes, névoa de fundo e elevação |
| [`supabase/LEIA-ME.md`](supabase/LEIA-ME.md) | Banco: índice das migrações, cargas de dados e limpeza por prazo |
| [`docs/deploy`](docs/deploy) | Deploy no Cloud Run, alertas e o que configurar para a IA não parar |
| [`docs/juridico`](docs/juridico) | Minutas de termos, privacidade, cookies e IA, para revisão por advogado, e a [`AUDITORIA_BETA.md`](docs/juridico/AUDITORIA_BETA.md), que liga cada afirmação das páginas públicas à sua comprovação no código |

---

## Estado atual

| Módulo | Estado |
|---|---|
| PrazoZero | Em produção. Fechado no que depende do projeto; faltam os atos de 2027 |
| NormaViva | Em produção, com atualização diária das normas |
| TeseMap | Em produção, com verificação semanal das fontes |
| Argumenta | Em construção: estrutura, questões, fundamentos e selo das citações prontos; fragilidades e mapa a seguir. Corpus de avaliação em formação |
| Planos e cobrança | Planos e cota por análise em produção; **cobrança desligada** até a ativação comercial |
| Dados e privacidade | Limpeza diária por prazo em produção; Política de Privacidade v1.2 no ar |

O roteiro completo, com o estado de cada item, está no [`PLANO.md`](docs/PLANO.md#10-roteiro-e-estado).

---

## Licença

[MIT](LICENSE) © Junior Aguiar
