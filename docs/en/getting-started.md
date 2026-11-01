# Getting started

```bash
npm i @dskripchenko/markdown-editor @dskripchenko/wysiwyg @dskripchenko/ui vue
```

```vue
<script setup>
import { ref } from 'vue'
import { MarkdownEditor } from '@dskripchenko/markdown-editor'
import '@dskripchenko/ui/styles/all.css'
import '@dskripchenko/wysiwyg/style.css'
import '@dskripchenko/markdown-editor/style.css'

const text = ref('# Release notes\n\nVersion **3.1**.')
const mode = ref('visual')
</script>

<template>
  <MarkdownEditor v-model="text" v-model:mode="mode" min-height="320px" />
</template>
```

## Modes

| Mode | |
|---|---|
| `visual` | The WYSIWYG editor: toolbar, slash menu (`/`), Markdown shortcuts (`#`, `-`, `1.`, `>`, ```` ``` ````), tables, live blocks. |
| `source` | The Markdown itself, in a monospace text area (Tab indents). |
| `split` | The Markdown and a live preview side by side (one above the other on a narrow screen). |

The switch shows the modes in `modes`; with one mode there is no switch.

## Props

| Prop | | |
|---|---|---|
| `v-model` | `string` | The Markdown. |
| `v-model:mode` | `'visual' \| 'source' \| 'split'` | The mode; `visual` by default. |
| `modes` | `string[]` | The modes offered; all three by default. |
| `placeholder` | `string` | Shown while the document is empty. |
| `readonly` | `boolean` | Read-only in every mode. |
| `min-height`, `max-height` | `string` | The editing area's height. |
| `block-renderers` | `object` | Live blocks: `{ mermaid: renderer }` — the contract of the kit's `UidMarkdown`; the same in the editor and the preview. |
| `toolbar-items`, `slash-commands` | | Passed to the WYSIWYG editor. |
| `locale` | `'en' \| 'ru'` | The language; by default the kit's locale. |
| `labels` | `object` | Single strings over the language's own. |
| `image-base` | `string` | The folder (a URL ending in `/`) relative pictures resolve against: `img/a.png` shows from there and is saved back as `img/a.png`, `../a.png` too. |
| `link-base` | `string` | The base of relative links in the preview. |

Events: `update:modelValue` and `change` with the Markdown — only when the
document is edited, never on loading it. `update:mode`.

Exposed: `focus()`, `insert(markdown)` (at the caret; formatted in the visual
mode), `value`.

## The round trip

Markdown is rendered into the editor's HTML and written back from it. The
first round puts the document in canonical form — `-` for bullet lists, `**`
and `*` for emphasis, ATX headings, list items renumbered — and every later
round leaves it as it is. Text is escaped only where a character would
otherwise mean markup: `1.5`, `a-b`, `(net)` stay as written.

What the visual editor cannot hold is kept **as written**:

- headings `####`, `#####`, `######`;
- task lists `- [ ]` / `- [x]`;
- callouts `> [!NOTE]`, `> [!WARNING]`…;
- HTML blocks (`<details>`, `<div>`…);
- footnotes `[^1]` and their definitions;
- reference-style links `[text][id]` and their definitions.

In the visual mode such a block shows its Markdown (marked with a stripe on
the left); it is edited in the Markdown mode and saved byte for byte.

## Without the component

```ts
import { fromMarkdown, toMarkdown, normalize } from '@dskripchenko/markdown-editor'

fromMarkdown('# Hi\n\n- a')   // the editor's HTML
toMarkdown('<h1>Hi</h1>')      // '# Hi\n'
normalize('* a\n* b')          // '- a\n- b\n' — one round, as saving gives
```

`toMarkdown` needs a DOM (a browser or jsdom). Both take `{ imageBase }`: relative
pictures resolved for display, and back to relative paths on the way out.
