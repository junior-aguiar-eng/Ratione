# RATIONE — PLANO DE CORREÇÕES VISUAIS E DE PRODUTO

## Objetivo

Reformular a camada visual e de experiência do Ratione para que a plataforma deixe de parecer um protótipo técnico, painel administrativo ou dashboard jurídico e passe a transmitir percepção de produto comercial maduro, confiável e voltado ao trabalho jurídico profissional.

O redesenho deve preservar a arquitetura funcional já construída — Argumenta, NormaViva, TeseMap, PrazoZero e Meu Espaço —, mas substituir a linguagem visual atual por uma identidade editorial e profissional, com maior clareza, confiança, legibilidade e diferenciação entre os módulos.

A premissa central é:

> **Ratione não deve parecer um dashboard jurídico mais bonito. Deve parecer uma suíte profissional de instrumentos jurídicos.**

---

# 1. Problemas atuais a corrigir

A interface atual apresenta boa organização estrutural, mas a linguagem visual ainda é típica de protótipo:

- excesso de caixas retangulares com bordas;
- uso dominante de preto + dourado como “tema jurídico”;
- tipografia com aparência de template;
- excesso de fonte monoespaçada;
- repetição da mesma estrutura visual em todas as ferramentas;
- navegação com aparência de painel administrativo;
- uso excessivo de badges, labels e textos técnicos;
- controles de formulário muito expostos;
- pouca diferenciação visual entre contexto, conteúdo, resultado e ação;
- rodapé com linguagem de desenvolvimento e homologação;
- termos técnicos como “Point-in-Time”, “Motor Determinístico”, “Grafo Topológico” e “Arquitetura Forense” expostos ao usuário;
- uso decorativo do dourado sem função semântica;
- identidade visual excessivamente associada a escritório de advocacia tradicional;
- pouca sensação de produto jurídico vivo, rastreável e conectado a fontes.

---

# 2. Nova direção visual

## 2.1 Princípios

A nova identidade deve transmitir:

- sobriedade;
- precisão;
- confiança;
- legibilidade;
- modernidade;
- densidade informacional controlada;
- aparência editorial;
- diferenciação funcional entre as ferramentas;
- baixa ornamentação;
- forte foco no conteúdo jurídico.

Evitar:

- estética “luxo jurídico”;
- excesso de sombras;
- glassmorphism;
- gradientes dourados;
- bordas em todos os componentes;
- cards aninhados;
- ícones decorativos em excesso;
- aparência de painel SaaS genérico;
- estética de terminal, código ou dashboard técnico.

---

# 3. Nova paleta de cores

A identidade atual deve abandonar o uso dominante de preto + dourado.

## 3.1 Base — modo escuro

### Fundo principal
`#0B0F14`

Uso:
- fundo da aplicação;
- superfícies externas;
- áreas de leitura.

### Superfície primária
`#11161D`

Uso:
- painéis principais;
- áreas de trabalho;
- caixas de conteúdo.

### Superfície secundária
`#161C24`

Uso:
- elementos selecionados;
- sidebars;
- cards interativos.

### Bordas neutras
`#232B35`

Uso:
- divisores;
- contornos discretos;
- separações estruturais.

### Texto principal
`#F2F4F7`

### Texto secundário
`#A8B0BB`

### Texto terciário
`#737E8C`

---

## 3.2 Cor institucional

### Azul-petróleo
`#2B6F6A`

Uso:
- marca;
- foco;
- links;
- controles ativos;
- elementos institucionais.

### Azul-petróleo claro
`#4A918B`

Uso:
- hover;
- realces;
- pequenos indicadores.

O azul-petróleo deve ser a principal cor institucional da plataforma.

---

## 3.3 Dourado

O dourado deixa de ser a cor dominante.

### Dourado institucional
`#B18A3B`

Uso estritamente limitado:
- pequenos detalhes da marca;
- assinatura visual;
- estados excepcionais;
- elementos premium muito pontuais.

Nunca usar dourado como padrão de botão, borda, ícone ou navegação ativa.

---

## 3.4 Cores semânticas

### Informação / norma
`#4F7FC8`

### Confirmação / vigente
`#3E8F70`

### Atenção
`#C8903D`

### Fragilidade / risco
`#B95D5D`

### Relação / distinguishing
`#8069B0`

Essas cores devem possuir função semântica real, não decorativa.

---

# 4. Tipografia

A tipografia atual precisa ser substituída.

## 4.1 Fonte principal

### Interface e leitura
**Inter**

Alternativas aceitáveis:
- Geist Sans;
- Source Sans 3.

Uso:
- menus;
- botões;
- textos;
- formulários;
- labels;
- tabelas;
- metadados;
- navegação.

Recomendação principal: **Inter**.

---

## 4.2 Fonte editorial

### Títulos principais
**Source Serif 4**

Alternativas:
- Literata;
- Lora.

Uso:
- títulos de páginas;
- títulos de documentos;
- títulos de normas;
- títulos de teses;
- citações jurídicas.

Recomendação principal: **Source Serif 4**.

---

## 4.3 Fonte monoespaçada

Usar apenas quando houver função objetiva.

### Fonte
**JetBrains Mono**

Uso exclusivo para:
- número de processo;
- IDs;
- datas técnicas;
- códigos;
- números de versão;
- campos estritamente tabulares.

Não utilizar para:
- títulos;
- labels;
- cabeçalhos;
- badges;
- categorias;
- textos explicativos.

---

# 5. Marca Ratione

## 5.1 Identidade textual

Usar:

**RATIONE**

Slogan recomendado:

> **Direito, estruturado.**

Remover da interface principal:

- “Inteligência & Rigor Jurídico”;
- “Arquitetura Forense”;
- “Sem mocks”;
- “Determinístico · CPC/15”.

---

## 5.2 Símbolo

A balança deve ser descontinuada como símbolo principal.

Motivo:
- excessivamente genérica;
- remete a escritório de advocacia tradicional;
- não diferencia o produto.

Criar símbolo abstrato inspirado em:

- estrutura;
- raciocínio;
- conexão;
- ramificação;
- relações;
- construção lógica.

Direções possíveis:
- monograma “R” geométrico;
- três pontos conectados;
- estrutura em árvore;
- marca baseada em nós e relações.

Evitar:
- balança;
- martelo;
- coluna;
- Themis;
- livro jurídico clássico.

---

# 6. Shell global

## 6.1 Cabeçalho

Substituir o cabeçalho atual por uma estrutura mais simples.

### Estrutura proposta

**Esquerda**
- Ratione

**Centro**
- Argumenta
- NormaViva
- TeseMap
- PrazoZero

**Direita**
- Pesquisa
- Meu espaço
- Perfil

Remover:
- “Início” quando não necessário;
- badge “Determinístico · CPC/15”;
- slogan sob a marca;
- ícones em todos os itens da navegação.

---

## 6.2 Navegação ativa

Evitar botão retangular dourado.

Usar:
- texto com maior contraste;
- sublinhado fino;
- pequeno indicador;
- mudança discreta de cor.

---

## 6.3 Largura

Adotar largura útil entre:

`1200px` e `1320px`

Para páginas densas:

`1440px` máximo.

Não centralizar blocos excessivamente estreitos quando houver espaço útil.

---

# 7. Home

A home deve deixar de ser uma grade de quatro cards semelhantes.

## 7.1 Hero

### Título
**Direito, estruturado.**

### Subtítulo
Ferramentas especializadas para analisar decisões, compreender normas, explorar jurisprudência e calcular prazos.

Nada de badges técnicos acima do título.

---

## 7.2 Ferramentas

Cada ferramenta deve ter uma representação própria.

### Argumenta
Mostrar visualmente:
- decisão;
- tese;
- fundamento;
- conclusão.

### NormaViva
Mostrar:
- artigo;
- linha do tempo;
- versões.

### TeseMap
Mostrar:
- nós;
- relações;
- precedente;
- distinguishing.

### PrazoZero
Mostrar:
- calendário;
- contagem;
- vencimento.

Não usar quatro cards idênticos.

---

## 7.3 Recentes

Exibir apenas quando houver dados reais do usuário.

Se vazio:
- ocultar a seção.

Nunca mostrar exemplos simulados na home final.

---

# 8. Argumenta

## 8.1 Nova lógica de interface

Argumenta deve parecer uma bancada de análise documental.

### Layout recomendado

Coluna esquerda:
- documento;
- páginas;
- navegação interna.

Coluna principal:
- análise;
- teses;
- fundamentos;
- conclusões;
- fragilidades.

Painel lateral opcional:
- fonte;
- trecho;
- norma;
- precedente.

---

## 8.2 Abas

Reduzir a quantidade visível.

Sugestão:

- Visão geral
- Teses
- Estrutura
- Fragilidades
- Estratégia

“Mapa lógico” pode ser visualização dentro de Teses.

---

## 8.3 Trechos

Sempre que houver tese, vulnerabilidade ou conclusão:

- destacar o trecho do documento;
- permitir clique;
- manter página e localização;
- mostrar fonte original.

---

## 8.4 Linguagem

Substituir:

“Anatomia e auditoria de decisões”

Por:

**Análise da decisão**

Substituir:

“Fragilidades Art. 489”

Por:

**Pontos de atenção**

ou:

**Fragilidades da fundamentação**

---

# 9. NormaViva

NormaViva deve parecer uma edição legislativa inteligente.

## 9.1 Estrutura

Topo:
- nome da norma;
- artigo;
- situação vigente.

Centro:
- texto normativo.

Lateral:
- histórico;
- jurisprudência;
- relações;
- versões.

---

## 9.2 Linha do tempo

A linha do tempo deve ser central à experiência.

Exemplo:

2015 — redação original  
2021 — alteração  
2024 — alteração  
Hoje — vigente

---

## 9.3 Data

Substituir o seletor dominante.

Usar:

**Ver redação em:**  
[ Hoje ] [ escolher data ]

---

## 9.4 Linguagem

Remover:

“Point-in-Time”

Usar:

**Redação em determinada data**

ou:

**Histórico da norma**

---

# 10. TeseMap

TeseMap deve parecer uma ferramenta de exploração jurídica, não software de modelagem de grafos.

## 10.1 Grafo

Manter React Flow.

Melhorar:

- tamanhos;
- tipografia;
- espaçamento;
- zoom inicial;
- relações;
- rótulos;
- diferenciação semântica.

---

## 10.2 Painel lateral

Ao selecionar qualquer nó, o painel lateral deve ser preenchido.

Exibir:

- tese;
- tribunal;
- status;
- texto;
- fundamento;
- normas relacionadas;
- precedentes;
- distinções;
- fonte oficial.

Nunca deixar painel lateral vazio quando houver conteúdo selecionável.

---

## 10.3 Cores dos nós

- precedente vinculante: âmbar;
- dispositivo legal: azul;
- alteração legislativa: verde;
- distinguishing: violeta;
- superação: vermelho.

Usar tonalidades discretas.

---

## 10.4 Linguagem

Remover:

“Grafo topológico de precedentes”

Usar:

**Rede de precedentes**

ou:

**Mapa da tese**

---

# 11. PrazoZero

PrazoZero deve abandonar o formulário técnico permanente.

## 11.1 Fluxo guiado

### Etapa 1
Qual prazo deseja calcular?

- Apelação
- Agravo
- Embargos
- Contestação
- Outro

### Etapa 2
Como ocorreu a intimação?

### Etapa 3
Quando ocorreu?

### Etapa 4
Em qual tribunal?

### Resultado
**Prazo final: 1º de abril de 2026**

---

## 11.2 Opções avançadas

Mover para:

**Opções avançadas**

Itens:
- regime;
- prazo em dobro;
- prazo manual;
- regras especiais.

---

## 11.3 Memória de cálculo

Mostrar resumo primeiro.

Depois:

**Ver cálculo completo**

Expandir:
- data;
- dia;
- contado ou não;
- fundamento.

---

## 11.4 Linguagem

Substituir:

“Termo ad quem”

Por:

**Prazo final**

O termo técnico pode aparecer em texto secundário.

---

# 12. Meu Espaço

Transformar em biblioteca pessoal.

## 12.1 Layout

Cabeçalho:
- Meu espaço;
- pesquisa;
- filtros.

Filtros:
- Todos;
- Decisões;
- Normas;
- Teses;
- Prazos.

---

## 12.2 Itens

Cada item deve aparecer como registro simples:

**Sentença Banco X**  
Argumenta · há 2 horas

**Art. 85 do CPC**  
NormaViva · ontem

**Tema 1.076/STJ**  
TeseMap · salvo em 5 out

---

## 12.3 Remover

- tabs grandes;
- contadores em excesso;
- card único ocupando toda a largura.

---

# 13. Footer

Remover o footer técnico atual.

## Estrutura final

**RATIONE**

Produto  
Fontes jurídicas  
Metodologia  
Privacidade  
Termos  
Contato

© 2026 Ratione

Não exibir:
- artigos do CPC;
- LC 95;
- Resolução CNJ;
- “Sem mocks”;
- “Arquitetura forense”.

---

# 14. Design system

Criar componentes consistentes.

## Componentes básicos

- Button
- Input
- Select
- Search
- Tabs
- SidePanel
- Tooltip
- Notice
- EmptyState
- SourceLink
- StatusBadge
- Divider
- Accordion
- Timeline
- DataList
- DocumentViewer
- LegalCitation
- ResultSummary

---

# 15. Hierarquia visual

Aplicar a seguinte ordem:

1. tarefa;
2. resultado;
3. conteúdo jurídico;
4. evidência;
5. ação;
6. detalhe técnico.

Nunca inverter.

Exemplo no PrazoZero:

Errado:
- regra;
- regime;
- termo técnico;
- fundamento;
- resultado.

Correto:
- prazo final;
- resumo;
- memória;
- fundamento.

---

# 16. Linguagem

Todas as telas devem usar linguagem jurídica profissional, mas clara.

## Substituições obrigatórias

“Point-in-Time” → “Redação em determinada data”

“Motor determinístico” → “Cálculo verificável”

“Grafo topológico” → “Mapa de relações”

“Arquitetura forense” → remover

“Sem mocks” → remover

“Taxonomia de nulidades” → usar apenas em documentação interna

“Memória auditável” → “Memória de cálculo”

“Termo ad quem” → “Prazo final”

---

# 17. Microinterações

Adicionar apenas interações úteis:

- hover discreto;
- focus visível;
- expansão suave;
- destaque de trecho;
- transição de painel;
- skeleton;
- carregamento contextual.

Não usar:
- animações decorativas;
- glow;
- pulso;
- sombras excessivas;
- zoom de cards.

---

# 18. Modo claro

Implementar modo claro após estabilizar o redesign.

## Base clara

Fundo:
`#F5F6F8`

Superfície:
`#FFFFFF`

Texto:
`#17202A`

Borda:
`#D9DEE5`

Azul-petróleo:
`#2B6F6A`

---

# 19. Fases de implementação

## Fase 1 — Fundação visual

Alterar:
- fontes;
- cores;
- tokens;
- espaçamentos;
- bordas;
- radius;
- sombras;
- navegação;
- footer.

Não alterar lógica funcional.

---

## Fase 2 — Home

Redesenhar:
- hero;
- representação das ferramentas;
- recentes;
- chamadas.

---

## Fase 3 — Argumenta

Criar:
- layout documental;
- painel de análise;
- navegação entre trechos;
- hierarquia de teses;
- fragilidades.

---

## Fase 4 — NormaViva

Criar:
- visual editorial;
- linha do tempo;
- versões;
- histórico.

---

## Fase 5 — TeseMap

Reorganizar:
- grafo;
- painel lateral;
- informações contextuais;
- legenda;
- nós.

---

## Fase 6 — PrazoZero

Criar:
- fluxo guiado;
- opções avançadas;
- resultado prioritário;
- memória expansível.

---

## Fase 7 — Meu Espaço

Transformar:
- dashboard em biblioteca;
- pesquisa;
- filtros;
- histórico real.

---

## Fase 8 — Polimento

Revisar:
- responsividade;
- acessibilidade;
- contraste;
- focus states;
- estados vazios;
- loading;
- erros;
- mobile.

---

# 20. Critérios de aceite

O redesign estará pronto quando:

- nenhuma tela parecer painel administrativo genérico;
- cada ferramenta tiver identidade visual própria;
- a marca Ratione parecer contemporânea e profissional;
- dourado deixar de ser dominante;
- serifada não dominar a interface;
- fonte mono aparecer apenas em dados técnicos;
- a interface não exponha termos de implementação;
- resultados sejam mais visíveis que configurações;
- fontes jurídicas tenham acesso claro;
- o usuário possa entender a tarefa principal em até 5 segundos;
- a home não pareça uma grade de cards;
- footer e navbar estejam simplificados;
- a plataforma mantenha consistência sem tornar os quatro módulos iguais.

---

# 21. Diretriz final para implementação

> O redesign não deve transformar o Ratione em um “dashboard mais bonito”.
>
> Cada ferramenta deve ser tratada como um instrumento jurídico especializado.
>
> Argumenta deve parecer uma bancada de análise documental.
>
> NormaViva deve parecer uma edição legislativa inteligente.
>
> TeseMap deve parecer uma rede navegável de precedentes.
>
> PrazoZero deve parecer um calculador jurídico guiado e verificável.
>
> Meu Espaço deve parecer uma biblioteca pessoal de trabalho.
>
> A tecnologia deve permanecer invisível.
>
> O conteúdo jurídico deve dominar a experiência.
