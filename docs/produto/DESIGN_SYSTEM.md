# Design system do Ratione

Base: **shadcn/ui** (estilo `new-york`) sobre **Radix** (`radix-ui`) e **Tailwind 4**, com os tokens e o visual do Ratione. Configuração em `apps/web/components.json`; componentes em `apps/web/src/components/ui/`; helper `cn` em `apps/web/src/lib/utils.ts`.

## Regras

1. **Cor só por token.** Nenhum `#hex` nem `rgb()` solto em componente ou tela. Os tokens vêm de `globals.css` (`--canvas`, `--surface`, `--ink`, `--brand`, `--ok`, `--warn`, `--danger`, `--info`, `--rel` e variações `-text`/`-tint`), com tema claro e escuro (`data-theme`). Os nomes semânticos do shadcn (`bg-primary`, `text-muted-foreground`, `border-input`, `ring`…) são **aliases** desses tokens (`@theme inline`), então componente novo do shadcn herda o tema sem ajuste de cor.
2. **Variação por `cva`.** Aparência diferente é uma `variant`/`size` do componente, não uma classe nova no CSS global. Os utilitários caseiros `btn-primary`, `btn-secondary`, `field`, `label`, `card` e `tag-*` foram removidos; restam só `eyebrow` e `num` (tipografia).
3. **Tela não repete classe de componente.** Botão é `Button`, campo é `Input`/`NativeSelect`, rótulo é `Label`/`Legend`, etiqueta é `Badge`, aviso é `Notice` (sobre `Alert`). `className` na tela serve para layout (`w-full`, `self-start`), não para refazer o visual.
4. **Foco:** o anel é o `:focus-visible` global (`globals.css`); campos de texto acrescentam borda e anel da marca ao focar.
5. **Nativo quando basta.** Lista suspensa é `<select>` nativo (`NativeSelect`: teclado, leitor de tela e seletor do celular de graça) e “Opções avançadas” é `<details>`. Não usar o `Select` do Radix, que troca o `<select>` por um menu próprio.

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
- **Visual.** O componente vem com os valores padrão do shadcn (cantos, sombra, altura de 36 px). Ajuste para o padrão do Ratione: raio `rounded-md`/`rounded-lg`, sem sombra, `px-3 py-2.5` nos campos, cores por token.
- **Tema escuro.** Abrir a tela nos dois temas.

## Verificação feita na adoção (F0-07)

Comparação automática do estilo computado (cor, fundo, borda, raio, fonte, espaçamento, geometria) de todos os elementos de 11 páginas, em 2 larguras (1280 e 390 px) e 2 temas (clara e escura), entre a `main` e o código novo. Resultado: **0 diferença** em Home, Metodologia, NormaViva, Entrar, Meu espaço, Termos e Privacidade. As diferenças restantes são intencionais:

- **`<select>` (PrazoZero, TeseMap):** ganhou a seta do design system e passou a ter a altura dos campos de texto (era 2 px menor).
- **Argumenta:** as abas viraram `Tabs` do Radix (setas do teclado entre abas, painel associado à aba); o visual é o mesmo.
- **Checkbox:** passou do nativo para o do design system, com a cor da marca nos dois temas.

**Não coberto pela comparação:** `/conta` com login e `/auth/confirm` (exigem sessão ou link de e-mail; usam os mesmos `Button`, `Input`, `Label` e `Card`, e o build e os tipos passam). Conferir à mão na primeira publicação.
