> **ARQUIVADO. Substituído por [`docs/PLANO.md`](../PLANO.md), o plano único.** Mantido só como origem do conteúdo; não é seguido.

# PLANO MESTRE DA PLATAFORMA JURÍDICA

## 1. Conceito do produto

O website será uma plataforma jurídica composta por quatro ferramentas autônomas:

| Ferramenta | Função principal | Entrada típica | Resultado principal |
|---|---|---|---|
| **Argumenta** | Destrinchar e testar argumentação jurídica | Sentença, decisão, acórdão ou texto | Mapa de argumentos, teses, premissas e vulnerabilidades |
| **NormaViva** | Mostrar a norma juridicamente contextualizada e no tempo | Lei, artigo ou termo | Texto vigente, histórico, alterações, relações e jurisprudência |
| **TeseMap** | Navegar por teses e relações jurisprudenciais | Tema, precedente ou dispositivo | Grafo de teses, precedentes, distinções e evolução |
| **PrazoZero** | Calcular prazos jurídicos com transparência | Data, ato, tribunal e situação | Data final, memória de cálculo e eventos que alteraram o prazo |

Esses quatro módulos terão identidade própria e não serão transformados em uma única interface genérica de IA.

O erro a evitar é:

> “Digite qualquer coisa e pergunte ao nosso assistente jurídico.”

O objetivo é o oposto:

> “O que você quer fazer?”

E quatro caminhos claros.

---

# 2. Arquitetura visual do website

A navegação principal deve ser pequena:

**Início | Argumenta | NormaViva | TeseMap | PrazoZero | Meu espaço**

Nada de menus técnicos, agentes, modelos, provedores, bases vetoriais, pipelines ou configurações de IA.

## Página inicial

A home apresenta quatro grandes ações:

### Argumenta
**Entenda como uma decisão foi construída.**

Botão:

> Analisar decisão

### NormaViva
**Veja a lei como ela realmente vigora.**

Botão:

> Consultar norma

### TeseMap
**Explore como uma tese se conecta à jurisprudência.**

Botão:

> Explorar tese

### PrazoZero
**Calcule um prazo e veja exatamente como ele foi contado.**

Botão:

> Calcular prazo

Abaixo disso pode existir apenas:

**Recentes**
- última análise;
- última norma consultada;
- última tese salva;
- último cálculo.

---

# 3. Regra central de experiência

Cada ferramenta terá sua própria interface e seu próprio fluxo.

Não haverá uma tela com vinte recursos misturados.

As integrações aparecem somente quando fazem sentido.

Exemplo no Argumenta:

> Fundamento identificado: art. 489, §1º, CPC  
> **Ver no NormaViva**

Outro:

> Precedente citado: Tema 1.076/STJ  
> **Explorar no TeseMap**

Outro:

> Prazo recursal identificado: 15 dias  
> **Calcular no PrazoZero**

Isso cria integração sem criar bagunça.

---

# 4. Estrutura técnica geral

Internamente, recomendo um único projeto principal organizado como monorepositório.

Estrutura conceitual:

```text
plataforma-juridica/

  aplicações/
    website
    api
    processamento

  módulos/
    argumenta
    normaviva
    tesemap
    prazozero

  núcleo/
    usuários
    documentos
    fontes-jurídicas
    inteligência-artificial
    busca
    auditoria
    citações
    segurança

  integrações/
    forgelex
    lexml
    legislação
    calendários
    tribunais
```

A regra arquitetural será:

> um módulo pode usar o núcleo comum, mas não deve precisar de outro módulo para funcionar.

Assim:

- Argumenta funciona sem TeseMap;
- NormaViva funciona sem ForgeLex;
- TeseMap funciona mesmo que uma fonte jurisprudencial esteja temporariamente indisponível;
- PrazoZero funciona sem IA.

Isso reduz drasticamente bloqueios.

---

# 5. Stack recomendada

## Website

**Next.js + React + TypeScript**

Next.js atualmente é apresentado oficialmente como framework React full-stack e permite concentrar boa parte da aplicação web em uma arquitetura única.

Usaria:

- Next.js;
- React;
- TypeScript;
- Tailwind CSS;
- shadcn/ui;
- Lucide Icons.

Nada disso aparece para o usuário.

## Banco, autenticação e arquivos

**PostgreSQL + Supabase**

Supabase fornece PostgreSQL real, autenticação integrada e controle de acesso por linha, o que é especialmente útil porque documentos jurídicos de um usuário jamais devem ser acessíveis por outro.

Usar para:

- contas;
- preferências;
- histórico;
- documentos;
- teses;
- normas;
- calendários;
- análises;
- armazenamento privado.

## API jurídica

Recomendo **Fastify + TypeScript**.

Há uma razão adicional neste caso: o ForgeLex já possui backend Fastify, estrutura em monorepo, PostgreSQL, normalização jurídica, provenance, workflows e componentes reutilizáveis.

Isso reduz incompatibilidades futuras.

## Processamento pesado

Somente onde necessário, adicionar um worker Python isolado.

Especialmente para:

- PDFs complexos;
- OCR;
- reconhecimento de layout;
- documentos escaneados.

Não criar esse serviço antes de precisar dele.

---

# 6. Motor de documentos

Este será compartilhado principalmente pelo Argumenta.

Pipeline interno:

```text
arquivo
   ↓
identificação do formato
   ↓
extração de texto
   ↓
OCR se necessário
   ↓
reconstrução de páginas
   ↓
identificação de parágrafos
   ↓
âncoras
   ↓
estrutura jurídica
```

Cada parágrafo deverá preservar:

- página;
- posição;
- texto original;
- identificador interno.

Isso permitirá que uma tese diga:

> Fundamentação encontrada na página 13, §§ 42–45.

## Repositório aproveitável: Docling

O Docling já trata PDF, DOCX, imagens e vários outros formatos, reconhece estrutura de página e exporta representação estruturada. É MIT.

### Decisão

**Reaproveitar.**

Não construir parser de PDF do zero.

O nosso código deve ficar responsável por transformar o documento estruturado em estrutura **jurídica**, e não por reinventar leitura de PDF.

---

# 7. Motor de IA comum

Deve existir uma camada única chamada internamente, por exemplo:

`Legal Intelligence Engine`

Ela será usada pelos módulos que precisarem de IA.

Mas o usuário nunca verá:

- GPT;
- modelo;
- temperatura;
- tokens;
- embeddings;
- prompt;
- agente.

O sistema decide isso internamente.

## Regra importante

Resultados importantes devem ser estruturados e não texto livre.

Por exemplo, Argumenta não deveria pedir:

> “Analise esta sentença.”

Deve solicitar internamente uma estrutura como:

```text
questões
teses
premissas_fáticas
premissas_normativas
precedentes
inferências
conclusões
vulnerabilidades
```

APIs modernas já permitem impor schemas estruturados à saída do modelo, reduzindo respostas malformadas e simplificando validação.

---

# 8. ARGUMENTA

## Missão

Transformar decisões e peças jurídicas em estruturas argumentativas compreensíveis e auditáveis.

## Tela inicial

Extremamente simples:

> **Envie uma decisão para analisar**

Arrastar PDF/DOCX.

Ou:

> Colar texto

Depois:

**Analisar**

Nenhuma configuração adicional obrigatória.

---

# 9. Argumenta — resultado principal

A página da análise terá seis abas:

### Visão geral

- decisão;
- resultado;
- partes;
- pedidos;
- questões discutidas.

### Estrutura

Separa:

- relatório;
- preliminares;
- mérito;
- fundamentos;
- dispositivo.

### Teses

Cada tese vira um cartão.

Exemplo:

**Responsabilidade objetiva da instituição financeira**

Base:
- art. 14 CDC;
- Súmula 479/STJ.

Premissa:
- fraude relacionada ao risco da atividade.

Conclusão:
- banco responde objetivamente.

### Mapa

Representação gráfica:

```text
fato
 ↓
norma
 ↓
interpretação
 ↓
precedente
 ↓
inferência
 ↓
conclusão
```

### Fragilidades

Identifica:

- premissa não demonstrada;
- salto lógico;
- fundamento incompleto;
- precedente aparentemente inadequado;
- fundamento autônomo não atacado;
- contradição;
- argumento circular.

### Estratégias

Botões:

**Atacar tese**

**Defender tese**

**Criar contratese**

**Comparar com recurso**

---

# 10. Motor específico do Argumenta

Não criar um “agente mágico”.

Criar etapas previsíveis:

```text
1. segmentar decisão

2. identificar questões jurídicas

3. identificar conclusões

4. identificar fundamentos de cada conclusão

5. separar fatos, normas e precedentes

6. reconstruir relações

7. verificar citações

8. detectar vulnerabilidades

9. gerar mapa
```

Cada etapa produz dados estruturados.

Isso permite corrigir uma etapa sem destruir o restante.

---

# 11. Repositório reaproveitável para Argumenta

Existe pesquisa open source específica sobre **mineração de argumentos em decisões judiciais**, com corpus anotado, classificação de argumentos e código sob Apache 2.0.

Projeto:

`trusthlt/mining-legal-arguments`

### Decisão

**Não copiar cegamente o modelo.**

Usar para:

- taxonomia;
- pesquisa;
- conceitos;
- benchmark;
- desenho das relações premissa/conclusão.

O corpus é europeu e não representa a técnica decisória brasileira.

O nosso esquema deve ser brasileiro e processualmente orientado.

---

# 12. Argumenta e ForgeLex

Aqui existe oportunidade de reaproveitamento forte.

O ForgeLex atual já possui:

- documentos ancorados;
- fatos;
- provas;
- questões jurídicas;
- autoridades;
- mapa de teses;
- análise documental;
- proveniência;
- workflow de revisão.

Não recomendo fundir Argumenta dentro do ForgeLex.

Recomendo:

```text
Argumenta
     ↓
interface interna de pesquisa
     ↓
ForgeLex
```

Quando Argumenta encontrar:

> REsp 1.234.567/SP

poderá pedir ao ForgeLex:

> localizar autoridade  
> verificar autoridade  
> obter metadados

Mas a análise do documento continua pertencendo ao Argumenta.

---

# 13. NORMAVIVA

## Missão

Responder:

> “Qual é o estado jurídico deste dispositivo?”

e não apenas:

> “Qual é o texto da lei?”

---

# 14. NormaViva — interface

Barra principal:

> Pesquisar lei, artigo ou assunto

Exemplos:

> art. 489 CPC

> Lei 14.133

> desconsideração da personalidade jurídica

Resultado:

### Texto vigente

O texto atual.

### Em outra data

Controle:

> Ver em: 06/10/2026

Possibilidade de escolher qualquer data.

### O que mudou

Exibição visual:

```text
redação anterior
       ↓
alteração legislativa
       ↓
redação atual
```

### Linha do tempo

Exemplo:

```text
2015 ─ CPC publicado
2016 ─ vigência
2021 ─ Lei X altera dispositivo
2024 ─ STF interpreta expressão
2026 ─ situação atual
```

### Jurisprudência

Precedentes associados.

### Dispositivos relacionados

Normas que complementam, excepcionam ou remetem ao dispositivo.

---

# 15. Repositório decisivo para NormaViva

`danalec/legalize-br`

O repositório possui aproximadamente **198 mil normas federais entre 1988 e 2026**, provenientes de fontes públicas via LexML, armazenadas em Markdown e organizadas cronologicamente. A estrutura é BSD-3-Clause e o conteúdo legislativo é indicado como domínio público.

### Decisão

**Reaproveitamento prioritário.**

Isso elimina a necessidade de começar o projeto coletando centenas de milhares de normas.

Porém não assumir que ele resolve o NormaViva.

Ele será:

> matéria-prima.

Precisaremos construir por cima:

- identidade normativa;
- artigos;
- redações;
- revogações;
- alterações;
- vigências;
- relações entre dispositivos;
- consolidação temporal.

---

# 16. Motor temporal do NormaViva

Este é o coração do produto.

Modelo:

```text
NORMA
 └── dispositivo
      ├── versão A
      │    início: 2015
      │    fim: 2021
      │
      ├── versão B
      │    início: 2021
      │    fim: 2024
      │
      └── versão C
           início: 2024
           atual
```

Isso permite consultar:

> Como era o art. X em maio de 2019?

Esse resultado deve ser determinístico, não gerado por IA.

---

# 17. NormaViva — fases

### NV1

Pesquisa e texto atual.

### NV2

Fragmentação em artigos, parágrafos, incisos e alíneas.

### NV3

Histórico de alterações.

### NV4

Consulta temporal.

### NV5

Diff visual.

### NV6

Relações normativas.

### NV7

Jurisprudência associada.

### NV8

Explicação do dispositivo por IA.

A IA entra por último.

A base jurídica vem primeiro.

---

# 18. TESEMAP

## Missão

Transformar jurisprudência de lista de julgados em uma rede de conhecimento.

---

# 19. TeseMap — interface

Pesquisa:

> responsabilidade civil do Estado

Resultado inicial:

**Responsabilidade civil do Estado**

Abaixo aparece o mapa.

```text
Responsabilidade estatal
        │
        ├── ação
        │    └── responsabilidade objetiva
        │
        └── omissão
             ├── omissão específica
             └── omissão genérica
```

Clicando em um nó:

> tese

abre:

- enunciado;
- tribunal;
- precedentes;
- fundamentos;
- normas;
- precedentes anteriores;
- precedentes posteriores;
- exceções;
- distinguishing;
- evolução.

---

# 20. Motor gráfico

Para a visualização recomendo **React Flow / xyflow**.

O projeto é MIT, possui mais de 38 mil estrelas atualmente e é feito justamente para interfaces baseadas em nós, relações e diagramas interativos.

### Decisão

**Reaproveitar integralmente como motor visual.**

Não criar canvas/gráfico próprio.

---

# 21. Estrutura de dados do TeseMap

Nós:

```text
tema
questão jurídica
tese
precedente
súmula
dispositivo
conceito
exceção
distinguishing
superação
```

Relações:

```text
interpreta
aplica
cita
confirma
distingue
supera
restringe
amplia
diverge
fundamenta
relaciona-se
```

---

# 22. Origem da jurisprudência

O TeseMap não deve possuir scraping acoplado à interface.

Criar adaptadores independentes.

Por exemplo:

```text
FonteJurisprudencial
  ├── ForgeLex
  ├── STF
  ├── STJ
  └── futura fonte
```

Hoje o ForgeLex já possui índice persistido e pesquisável do STJ com proveniência, normalização e busca própria.

Assim:

### Primeira versão

STJ via ForgeLex.

### STF

Pode entrar posteriormente por adapter próprio ou pela expansão do ForgeLex.

O TeseMap não ficará bloqueado esperando isso.

---

# 23. Repositórios úteis para TeseMap

Há projetos open source com redes de citações e traversal de grafos jurídicos em escalas muito maiores, que podem servir como referências arquiteturais, como `caselaw-mcp`.

Não recomendo importar bases estrangeiras.

Interessa-nos observar:

- modelagem de arestas;
- ranking por citações;
- traversal;
- importância de precedentes;
- relações entre julgados.

---

# 24. PRAZOZERO

## Missão

Não ser apenas:

> “15 dias depois de X.”

Deve responder:

> Qual é a data final e por quê?

---

# 25. PrazoZero — experiência do usuário

Tela:

> **O que aconteceu?**

Opções simples:

**Fui intimado**

**Foi publicada uma decisão**

**Quero recorrer**

**Quero apresentar defesa**

**Quero informar o prazo manualmente**

Depois:

> Quando?

> Qual tribunal?

Se necessário:

> Qual cidade?

O sistema pergunta apenas o que for necessário.

---

# 26. Resultado do PrazoZero

Exemplo:

# Prazo final

**31 de março de 2026**

15 dias úteis.

Depois:

### Como foi calculado

```text
10/03 — intimação
11/03 — início da contagem
...
19/03 — feriado — não contado
...
31/03 — 15º dia útil
```

### Base utilizada

> CPC, art. 219  
> CPC, art. 224

### Eventos considerados

- fins de semana;
- feriados;
- suspensão;
- recesso;
- indisponibilidade cadastrada.

Botão:

> Adicionar ao calendário

---

# 27. Motor do PrazoZero

Aqui existe uma regra absoluta:

**IA não calcula o prazo.**

O motor é determinístico.

A IA pode interpretar:

> “Recebi uma intimação para apelar.”

E converter isso em:

```text
evento = intimação
ato = apelação
prazo = 15
regime = dias úteis
```

Mas quem soma os dias é código determinístico.

---

# 28. Repositório diretamente reaproveitável

Existe atualmente:

`@guardianlegis/prazos-processuais`

O pacote implementa cálculo brasileiro para CPC, CPP e CLT, dias úteis, prorrogação, feriados customizados e dezenas de tipos de prazo. É MIT.

### Decisão

**Usar como referência e possível bootstrap, mas não confiar juridicamente sem auditoria.**

O repositório tem apenas dois commits atualmente.

Então:

> aproveitar engenharia;

mas criar nossa própria suíte de regras jurídicas.

---

# 29. Feriados

Outro reaproveitamento importante:

`joaopbini/feriados-brasil`

Possui feriados nacionais, estaduais e municipais, dados normalizados por códigos IBGE e licença MIT.

### Decisão

Incorporar como uma das fontes.

Outro projeto interessante é `feriados-dev-oss`, que já possui API self-hosted e operações de dias úteis.

---

# 30. Calendário forense

Feriado não é calendário forense.

Precisaremos armazenar separadamente:

```text
feriado civil

feriado local

suspensão forense

recesso

indisponibilidade

ato do tribunal

prorrogação excepcional
```

Cada evento deverá possuir:

- tribunal;
- abrangência;
- início;
- fim;
- fonte;
- ato;
- URL;
- data de verificação.

---

# 31. Repositório adicional aproveitável

`DeHor-Labs/mcp-juridico-brasil`

O projeto é MIT e já implementa integração com DataJud, referência a 91 tribunais e cálculo de prazo com calendário nacional/estadual.

### Decisão

Estudar e reaproveitar seletivamente:

- normalização de tribunal;
- códigos;
- tratamento DataJud;
- lógica processual já implementada.

Não incorporar o servidor inteiro.

---

# 32. O núcleo jurídico compartilhado

Os quatro módulos compartilharão apenas conceitos estáveis.

## Entidades comuns

```text
Norma
Dispositivo
Precedente
Tribunal
Tese
Documento
Trecho
Fonte
Citação
Usuário
```

Não compartilhar:

```text
ArgumentAnalysis
DeadlineCalculation
NormVersion
GraphLayout
```

Esses pertencem exclusivamente a seus módulos.

Isso evita que o projeto vire uma grande massa de tabelas dependentes umas das outras.

---

# 33. Meu Espaço

Esta será a única área transversal.

Não chamar de:

> workspace jurídico.

Usar:

# Meu espaço

Seções:

**Análises**

**Normas salvas**

**Teses salvas**

**Prazos**

O usuário consegue retornar ao trabalho anterior sem entender a arquitetura interna.

---

# 34. Pesquisa global

No topo do site pode existir uma pesquisa simples.

Se o usuário escrever:

> Tema 1.076 STJ

o sistema identifica:

> Parece uma tese jurisprudencial.

Mostra:

**Abrir no TeseMap**

Se escrever:

> art. 489 CPC

**Abrir no NormaViva**

Não misturar resultados heterogêneos na mesma tela inicialmente.

---

# 35. Integrações inteligentes entre módulos

São links, não dependências.

### Argumenta → NormaViva

> ver dispositivo citado.

### Argumenta → TeseMap

> explorar precedente.

### Argumenta → PrazoZero

> calcular prazo decorrente da decisão.

### NormaViva → TeseMap

> ver jurisprudência sobre o artigo.

### TeseMap → NormaViva

> abrir dispositivo interpretado.

### PrazoZero → NormaViva

> visualizar fundamento legal da contagem.

---

# 36. Privacidade

O Argumenta lidará potencialmente com processos sigilosos e dados pessoais.

Desde a primeira versão:

- arquivos privados;
- URLs temporárias;
- criptografia;
- isolamento por usuário;
- exclusão pelo usuário;
- logs sem conteúdo integral dos documentos;
- política clara de retenção;
- opção de exclusão automática.

Por padrão, análises privadas nunca entram no corpus geral.

---

# 37. Processo assíncrono sem complicar a interface

Análises grandes podem demorar mais que uma requisição web comum.

Internamente:

```text
arquivo enviado
     ↓
fila
     ↓
processamento
     ↓
resultado
```

Na interface:

> Preparando documento…

> Identificando fundamentos…

> Construindo teses…

> Análise pronta.

FastAPI, por exemplo, já diferencia tarefas simples em segundo plano de computações pesadas que devem ser processadas por workers separados.

O usuário não precisa conhecer nenhuma dessas estruturas.

---

# 38. Estratégia de implementação

## FASE 0 — Fundação

Criar:

- repositório;
- identidade visual;
- design system;
- ambiente local;
- banco;
- autenticação;
- storage;
- deploy;
- logs;
- CI.

Resultado:

website vazio, mas funcionando.

---

# FASE 1 — Casca do produto

Criar as rotas:

```text
/
/argumenta
/normaviva
/tesemap
/prazero
/meu-espaco
```

Cada ferramenta já possui sua home definitiva.

Sem implementar IA.

Isso impede que a arquitetura visual seja improvisada durante o desenvolvimento.

---

# FASE 2 — Núcleo jurídico

Implementar:

- tribunais;
- normas;
- dispositivos;
- precedentes;
- citações;
- fontes;
- provenance;
- identificadores.

Criar adapters.

Nada de interface complexa.

---

# FASE 3 — PrazoZero MVP

Começaria por ele porque é determinístico e independente.

Entregar:

- CPC;
- dias úteis;
- feriados nacionais;
- estaduais;
- municipais;
- memória de cálculo;
- cálculo manual.

Depois:

- CPP;
- CLT;
- JEF;
- Fazenda Pública;
- MP;
- Defensoria;
- contagens especiais.

---

# FASE 4 — Argumenta MVP

Entregar:

- PDF;
- DOCX;
- texto;
- estrutura da decisão;
- questões;
- teses;
- fundamentos;
- dispositivo;
- mapa simples;
- citações para o documento original.

Ainda sem pesquisa jurisprudencial automática.

Isso evita dependência do ForgeLex.

---

# FASE 5 — NormaViva MVP

Importar Legalize-BR.

Entregar:

- pesquisa;
- norma;
- artigo;
- texto atual;
- fonte oficial.

Depois implementar versionamento.

---

# FASE 6 — TeseMap MVP

Começar com corpus pequeno.

Por exemplo:

- precedentes qualificados do STJ;
- temas repetitivos;
- súmulas;
- precedentes do ForgeLex.

Não tentar mapear toda a jurisprudência brasileira.

Entregar:

- busca;
- tese;
- precedente;
- norma;
- grafo.

---

# FASE 7 — Motores avançados

### Argumenta

- ataque;
- defesa;
- contratese;
- comparação recurso × decisão.

### NormaViva

- versões temporais;
- alterações;
- diff.

### TeseMap

- distinguishing;
- precedentes posteriores;
- evolução.

### PrazoZero

- calendários dos tribunais.

---

# FASE 8 — Integrações

Agora ligar os módulos.

Antes disso, cada um já deve funcionar isoladamente.

Criar:

```text
Argumenta → NormaViva
Argumenta → TeseMap
Argumenta → PrazoZero
NormaViva → TeseMap
TeseMap → NormaViva
PrazoZero → NormaViva
```

---

# FASE 9 — ForgeLex

Criar adapter oficial.

Não copiar o ForgeLex para dentro da plataforma.

O ForgeLex continua sendo infraestrutura jurisprudencial independente.

A plataforma pergunta a ele.

```text
TeseMap
   ↓
Jurisdiction Gateway
   ↓
ForgeLex
```

Argumenta poderá usar o mesmo gateway.

---

# FASE 10 — Refinamento

Adicionar:

- favoritos;
- histórico;
- compartilhamento;
- exportação;
- referências;
- atalhos;
- busca global;
- desempenho;
- mobile.

---

# 39. Testes sem transformar desenvolvimento em homologação interminável

Não criar uma cultura em que cada pequena etapa precise de validação externa.

## PrazoZero

Criar aproximadamente 100 cenários conhecidos.

Exemplo:

```text
entrada conhecida
feriados conhecidos
resultado esperado
```

Executados automaticamente.

## NormaViva

Selecionar aproximadamente 30 normas com histórico conhecido.

Validar automaticamente:

```text
data A → redação A
data B → redação B
```

## Argumenta

Criar um corpus interno de aproximadamente 30 decisões públicas.

Para cada uma, registrar:

- dispositivo;
- questão;
- tese principal;
- principais fundamentos.

Não exigir concordância perfeita da IA.

Avaliar extração estrutural.

## TeseMap

Criar um pequeno grafo jurídico conhecido.

Verificar:

```text
A cita B
B interpreta C
D distingue B
```

Não depender de terceiros.

---

# 40. Critério para lançar uma funcionalidade

Não utilizar:

> “100% juridicamente perfeito.”

Usar:

### funcional
Executa a função.

### rastreável
Mostra a origem.

### corrigível
O erro pode ser identificado.

### seguro
Não inventa silenciosamente informações críticas.

### compreensível
Usuário entende o resultado.

---

# 41. O que NÃO construir inicialmente

Não construir:

- aplicativo mobile;
- rede social;
- editor completo de petições;
- sistema de gestão de escritório;
- CRM;
- protocolo judicial;
- acompanhamento processual;
- marketplace;
- dezenas de agentes;
- fine-tuning próprio;
- banco de grafos dedicado;
- modelo próprio;
- extensão de navegador.

Todos esses itens aumentariam brutalmente o escopo sem melhorar o núcleo dos quatro produtos.

---

# 42. Banco de grafos

Não começaria com Neo4j.

PostgreSQL consegue armazenar inicialmente:

```text
nodes
edges
```

O TeseMap pode consultar relações normalmente.

Somente migrar para banco especializado se volume e traversal demonstrarem necessidade real.

Evita complexidade prematura.

---

# 43. Busca semântica

Mesma lógica.

Começar com:

- pesquisa textual;
- metadados;
- PostgreSQL;
- busca híbrida somente onde trouxer ganho real.

Não transformar todos os dados automaticamente em embeddings.

---

# 44. IA por tarefa

Em vez de um único prompt gigante, cada operação terá instruções próprias.

Exemplos internos:

```text
argumenta.segmentar_decisao

argumenta.extrair_questoes

argumenta.extrair_teses

argumenta.reconstruir_argumentos

argumenta.criticar_tese

normaviva.explicar_dispositivo

tesemap.classificar_relacao
```

Cada uma possui:

- objetivo;
- entradas;
- esquema de saída;
- regras;
- exemplos;
- versão.

Isso torna o sistema muito mais previsível.

---

# 45. Repositórios avaliados

| Projeto | Uso | Decisão |
|---|---|---|
| `danalec/legalize-br` | grande corpus legislativo brasileiro | **reaproveitar** |
| `docling-project/docling` | processamento de documentos | **reaproveitar** |
| `xyflow/xyflow` | mapas interativos | **reaproveitar** |
| `guardianlegis/prazos-processuais` | cálculo processual | **reaproveitar seletivamente** |
| `joaopbini/feriados-brasil` | calendário brasileiro | **reaproveitar** |
| `feriados-dev-oss` | API/dias úteis | **estudar como alternativa** |
| `DeHor-Labs/mcp-juridico-brasil` | tribunais/DataJud/prazos | **reaproveitar seletivamente** |
| `trusthlt/mining-legal-arguments` | argument mining jurídico | **usar como referência científica** |
| `caselaw-mcp` | grafo jurisprudencial | **usar como referência arquitetural** |
| **ForgeLex** | pesquisa e autoridade jurisprudencial | **integrar, não duplicar** |

---

# 46. Distribuição clara de responsabilidades

Este ponto deve ser tratado como regra arquitetural.

## ARGUMENTA

Pergunta:

> Como este documento argumenta?

Não vira sistema de jurisprudência.

---

## NORMAVIVA

Pergunta:

> Qual é o estado desta norma?

Não vira curso de legislação.

---

## TESEMAP

Pergunta:

> Como esta tese se relaciona com outras autoridades?

Não vira mecanismo genérico de busca.

---

## PRAZOZERO

Pergunta:

> Qual é o prazo e como ele foi calculado?

Não vira agenda jurídica.

---

# 47. Ordem que recomendo

A plataforma deve nascer nesta ordem:

```text
FUNDAÇÃO
   │
   ├── PrazoZero
   ├── Argumenta
   ├── NormaViva
   └── TeseMap
```

Os quatro projetos se desenvolvem independentemente.

Depois:

```text
PrazoZero ─────┐
Argumenta ─────┤
NormaViva ─────┼──► integrações contextuais
TeseMap ───────┘
```

Isso evita construir uma infraestrutura gigantesca antes de ter produto.

---

# 48. Visão final

Quando concluído, o website terá uma lógica extremamente simples para o usuário:

> **Tenho uma decisão.**  
> Argumenta.

> **Quero saber como uma lei está hoje ou estava antes.**  
> NormaViva.

> **Quero compreender uma tese e sua jurisprudência.**  
> TeseMap.

> **Quero saber quando vence.**  
> PrazoZero.

E as ferramentas começam a se comunicar naturalmente.

O maior diferencial não será “ter IA”.

Será possuir quatro motores jurídicos especializados e conectados:

```text
DOCUMENTO
   ↓
ARGUMENTA
   ↓
TESE
   ↓
TESEMAP
   ↓
PRECEDENTE
   ↓
NORMAVIVA
   ↓
NORMA

e, quando houver consequência temporal:

PRAZOZERO
```

A tecnologia permanece nos bastidores.

Na frente, o usuário encontra apenas Direito.