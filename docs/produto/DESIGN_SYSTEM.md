# Design system do Ratione

Base: **shadcn/ui** (estilo `new-york`) sobre **Radix** (`radix-ui`) e **Tailwind 4**, com os tokens e o visual do Ratione. Configuração em `apps/web/components.json`; componentes em `apps/web/src/components/ui/`; helper `cn` em `apps/web/src/lib/utils.ts`.

## Regras

1. **Cor só por token.** Nenhum `#hex` nem `rgb()` solto em componente ou tela. Os tokens vêm de `globals.css` (`--canvas`, `--surface`, `--ink`, `--brand`, `--ok`, `--warn`, `--danger`, `--info`, `--rel` e variações `-text`/`-tint`), com tema claro e escuro (`data-theme`). Os nomes semânticos do shadcn (`bg-primary`, `text-muted-foreground`, `border-input`, `ring`…) são **aliases** desses tokens (`@theme inline`), então componente novo do shadcn herda o tema sem ajuste de cor.
2. **Variação por `cva`.** Aparência diferente é uma `variant`/`size` do componente, não uma classe nova no CSS global. Os utilitários caseiros `btn-primary`, `btn-secondary`, `field`, `label`, `card` e `tag-*` foram removidos; restam só `eyebrow` e `num` (tipografia).
3. **Tela não repete classe de componente.** Botão é `Button`, campo é `Input`/`NativeSelect`, rótulo é `Label`/`Legend`, etiqueta é `Badge`, aviso é `Notice` (sobre `Alert`). `className` na tela serve para layout (`w-full`, `self-start`), não para refazer o visual.
4. **Foco:** o anel é o `:focus-visible` global (`globals.css`); campos de texto acrescentam borda e anel da marca ao focar.
5. **Espaço entre irmãos é `flex flex-col gap-N`, nunca `space-y-N`.** No Tailwind 4 o `space-y` é margem: não vale em filho inline, não funciona com `<legend>` e soma com o `mt-*` do filho. Cuidado: num pai `flex-col` o filho inline (`Button`, link, `<button>` de texto) **estica na largura**; dê `self-start` (ou `w-full` de propósito). Um elemento vazio de região `aria-live` também ganha gap, ao contrário da margem que colapsava; compense com `-mt-*` enquanto estiver vazio (ver o aviso do `/entrar`).
6. **Nativo quando basta.** Lista suspensa é `<select>` nativo (`NativeSelect`: teclado, leitor de tela e seletor do celular de graça) e “Opções avançadas” é `<details>`. Não usar o `Select` do Radix, que troca o `<select>` por um menu próprio.

## Fundo, névoa e elevação (25/10/2026)

O canvas não é um cinza chapado: `body::before` (em `globals.css`) pinta, fixa atrás do conteúdo, uma **névoa** de três halos suaves, um em cada canto (petróleo no alto à esquerda, azul no alto à direita, lilás embaixo). Não pesa na rolagem (não usa `background-attachment: fixed`) e some na impressão.

| Token | Para quê | Claro | Escuro |
|---|---|---|---|
| `--mist-1`, `--mist-2`, `--mist-3` | cor de cada halo (petróleo, azul, lilás: as mesmas da marca, de `--info` e de `--rel`) | `43 111 106`, `79 127 200`, `128 105 176` | iguais |
| `--mist-a`, `--mist-b`, `--mist-c` | força de cada halo (opacidade) | 0,26 · 0,22 · 0,17 | 0,38 · 0,28 · 0,24 |
| `--sombra` | cor da sombra dos cartões | `23 32 42` | `0 0 0` |
| `shadow-card` (utilitário) | elevação sutil de cartões e painéis | sombra em duas camadas, de `--sombra` | idem |

Regras: **os cartões continuam opacos ou quase (`bg-surface/85`)**, para o texto manter o contraste sobre a névoa; para mudar a força da névoa, mexa só nos três `--mist-*`; cor nova de halo é um token novo, nunca um valor solto. O painel `Card` (`cardClasses`) já traz `shadow-card`. O cabeçalho é translúcido com desfoque (`bg-canvas/70 backdrop-blur-md`), então a névoa passa por ele. O logo do cabeçalho é `<Logo grande />` (símbolo de 40 px, nome em `text-xl`); o padrão (30 px) serve ao rodapé.

## Cartões por tipo de conteúdo (05/11/2026)

O site deixou de empilhar tudo na mesma coluna e com o mesmo peso. Cada tipo de conteúdo tem o seu cartão (`components/Cartoes.tsx`), para o cliente saber de relance **o que vale** e **o que a IA gerou**, e a tela passa a ter uma coluna de leitura e uma de contexto.

| Cartão | Para quê | Aparência |
|---|---|---|
| `CartaoDeLeitura` | A fonte oficial: texto da lei (e, nas próximas fases, da decisão). **O texto completo fica sempre à vista**, nunca recolhido | Branco, de "papel", `rounded-xl`, `shadow-card`, texto em serifa |
| `CartaoDeIA` | Tudo o que a IA gerou (explicação de dispositivo; depois, as análises do Argumenta) | Tom lilás (`--ia`, o mesmo lilás de `--rel`), borda inferior mais forte, `shadow-float` (um passo acima do cartão comum), recuado no computador para ficar ligado ao texto sem se misturar. Traz o título, a cota restante e o aviso curto de que foi gerado por IA |
| `CartaoDeContexto` | O que acompanha a leitura: histórico da redação, remissões, citado por, ligações com as outras ferramentas, fonte | Pequeno e neutro (`bg-surface/85`), numa coluna lateral fixa (`lg:sticky`) |

Tokens novos em `globals.css`: `--color-ia`, `--color-ia-text`, `--color-ia-tint` (alias do lilás `--rel`, no tema claro e no escuro) e `--shadow-float`. Regras: o cartão de IA é o **único** elevado acima do `shadow-card`; cor só por token; o aviso de IA continua dentro do cartão, em letra pequena, sem caixa própria.

**NormaViva (fases 1 e 2):** os resultados da pesquisa viraram fichas (`ResultadosDaBusca.tsx`): o mesmo artigo em várias normas vira uma linha de fichas pela sigla da norma (`siglaDaNorma`), e uma pesquisa por assunto vira uma lista compacta, de uma linha por resultado, com rolagem própria. O artigo aberto ocupa a tela, com a coluna de contexto ao lado.

**Argumenta (fase 3):** o texto completo da decisão fica num `CartaoDeLeitura` e a análise (visão geral, estrutura, questões e fundamentos, mapa) num único `CartaoDeIA`, sem recuo, porque os dois ficam lado a lado. No computador o texto abre ao lado da análise (coluna fixa de 5/12 da largura, com rolagem própria); no celular, o texto vem em cima e a análise logo abaixo, e "Ocultar texto" continua recolhendo só a leitura, nunca a análise.

**TeseMap e PrazoZero (fase 4):** no TeseMap, a tese e a questão ficam no `CartaoDeLeitura` e o que as acompanha (ligações registradas pelas fontes, aplicação pelo STF, dispositivos citados, dados do julgamento) vira `CartaoDeContexto`, em duas colunas abaixo da tese em vez de uma lista longa dentro do mesmo cartão. No PrazoZero, o prazo final, as datas e os avisos ficam num `CartaoDeLeitura`, e "Como foi calculado" num cartão próprio (na impressão, sem sombra nem borda). Nenhum conteúdo foi recolhido.

**Página inicial (fase 5):** já funcionava como painel das quatro ferramentas (demonstração, cartões por ferramenta e recentes); só o número de cenários de prazo foi corrigido, de 121 para 415, o total hoje validado.

## Componentes

| Componente | Arquivo | Variações | Substituiu |
|---|---|---|---|
| `Button`, `buttonVariants` | `ui/button.tsx` | `variant`: `default`, `secondary`, `ghost`, `link`; `size`: `default`, `sm`, `icon` | `btn-primary`, `btn-secondary` e o botão do tema |
| `Input` | `ui/input.tsx` | — (`campoClasses` é compartilhado com o `NativeSelect`) | `field` |
| `NativeSelect` | `ui/native-select.tsx` | — | `field` em `<select>` |
| `Label`, `Legend` | `ui/label.tsx` | — | `label` |
| `Checkbox` | `ui/checkbox.tsx` | — (Radix; use `onCheckedChange`) | `<input type="checkbox">` |
| `Card`, `cardClasses` | `ui/card.tsx` | `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | `card` |
| `Badge` | `ui/badge.tsx` | `variant`: `neutral`, `brand`, `info`, `ok`, `warn`, `danger`, `rel` | `tag-*` |
| `Alert` | `ui/alert.tsx` | `variant`: `info`, `warn`, `danger` (`Notice` o usa com `role="note"`) | markup do `Notice` |
| `Tabs` | `ui/tabs.tsx` | `TabsList`, `TabsTrigger`, `TabsContent` | abas feitas à mão no Argumenta |

Composições do produto (não são do shadcn): `PageHeader`, `EmptyState`, `Notice`, `Navbar`, `Footer`, `Logo`, `ThemeToggle`.

Link com cara de botão: `className={buttonVariants({ variant: 'secondary' })}` no `<Link>`. Outra tag com cara de card: `className={cn(cardClasses, 'p-6')}`.

## Acrescentar um componente do shadcn

```bash
cd apps/web
pnpm dlx shadcn@latest add dialog
```

Depois de rodar, **conferir antes de commitar**:

- **Importação do `cn`.** Com o `components.json` atual o CLI chegou a gerar `import { cn } from "cn"` e a instalar o pacote npm `cn` (que **não** é o helper do shadcn). O correto é `import { cn } from '@/lib/utils'`; troque as importações e remova `cn` do `package.json` (`pnpm remove cn`).
- **`class-variance-authority`** precisa estar no `package.json` (`pnpm add class-variance-authority` se faltar).
- **Visual.** O componente vem com os valores padrão do shadcn (cantos, sombra, altura de 36 px). Ajuste para o padrão do Ratione: raio `rounded-md`/`rounded-lg`, elevação só pelo `shadow-card`, `px-3 py-2.5` nos campos, cores por token.
- **Tema escuro.** Abrir a tela nos dois temas.

## Verificação feita na adoção (F0-07)

Comparação automática do estilo computado (cor, fundo, borda, raio, fonte, espaçamento, geometria) de todos os elementos de 11 páginas, em 2 larguras (1280 e 390 px) e 2 temas (clara e escura), entre a `main` e o código novo. Resultado: **0 diferença** em Home, Metodologia, NormaViva, Entrar, Meu espaço, Termos e Privacidade. As diferenças restantes são intencionais:

- **`<select>` (PrazoZero, TeseMap):** ganhou a seta do design system e passou a ter a altura dos campos de texto (era 2 px menor).
- **Argumenta:** as abas viraram `Tabs` do Radix (setas do teclado entre abas, painel associado à aba); o visual é o mesmo.
- **Checkbox:** passou do nativo para o do design system, com a cor da marca nos dois temas.

**Não coberto pela comparação:** `/conta` com login e `/auth/confirm` (exigem sessão ou link de e-mail; usam os mesmos `Button`, `Input`, `Label` e `Card`, e o build e os tipos passam). Conferidas à mão em produção em 10/10/2026, sem ajuste de visual.
