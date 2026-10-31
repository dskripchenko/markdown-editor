# Markdown

`UidMarkdown` renders a markdown document with no dependencies: headings with anchors, emphasis, links, images, lists (nested), tables with alignment, block quotes, callouts and code. Top-level fenced code is drawn by `UidCode` (highlighting, copy button).

```vue
<UidMarkdown :source="text" toc link-base="/docs/en/" />
```

| Prop | Type | Default | |
|---|---|---|---|
| `source` | `string` | `''` | The markdown text |
| `toc` | `boolean` | `false` | Table of contents from the headings (sticky on the right, on top on narrow screens) |
| `tocDepth` | `2`–`6` | `3` | Deepest heading level in the table of contents |
| `linkBase` | `string` | — | Relative links resolve against it |
| `tocLabel` | `string` | locale | Title of the table of contents |
| `stripMdExtension` | `boolean` | `true` with `linkBase` | Drop a trailing `.md` from relative links |
| `imageBase` | `string` | — | Relative image paths resolve against it |
| `internalLinksInPlace` | `boolean` | `true` | Relative links open in the same tab; off — in a new one (e.g. a preview beside a form) |
| `calloutTitles` | `Partial<Record<kind, string>>` | locale | Callout titles (`note`, `tip`, `important`, `warning`, `caution`) |
| `blockRenderers` | `Record<string, UidMarkdownBlockRenderer>` | — | Renderers for fenced blocks by language |

## Safety

The source is HTML-escaped **before** any markup is produced: raw HTML is shown as text, never executed. Links and images accept only `http(s)`, `mailto`, relative and anchor targets — `javascript:`, `data:` and other schemes stay plain text.

## Callouts

```md
> [!NOTE]
> GitHub style: the marker line becomes a title from the locale.

> **Warning** Bold style: the text stays as written.
```

Kinds: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`. Titles and the table of contents caption come from the locale bag (`markdown.*`, see [i18n](./i18n.md)).

## Block renderers

A fenced block whose language has a renderer is drawn by it instead of `UidCode` — this is how diagrams, charts or formulas plug in without the kit knowing about them.

```ts
import { provideMarkdownBlockRenderers, type UidMarkdownBlockRenderer } from '@dskripchenko/ui'
import { render } from '@dskripchenko/diagrams'

const mermaid: UidMarkdownBlockRenderer = (code) => {
  try {
    return { html: render(code).svg }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

// In the root component's setup — every UidMarkdown below uses it:
provideMarkdownBlockRenderers({ mermaid })
```

- The renderer receives the code and `{ language, index }` (index among the document's code blocks).
- It returns `{ html }` or `{ error }`, synchronously or as a promise. While a promise is pending the block shows a placeholder; results of an outdated render (the source changed meanwhile) are ignored.
- On `error`, a thrown exception or a rejected promise the block is shown as code with a notice (`role="alert"`).
- **`html` is inserted as is.** The renderer is responsible for its safety: return only markup you built with every piece of user text escaped.
- The `blockRenderers` prop takes precedence over provided renderers, language by language. App-wide: `app.provide(markdownBlockRenderersKey, renderers)`.

### Live blocks

Instead of `html` a renderer may return `mount` — a widget is mounted into the block's element (an API console, a chart with controls):

```ts
const api: UidMarkdownBlockRenderer = () => ({
  mount: (el, { code }) => {
    const widget = createWidget(el, code)
    return { update: (next) => widget.setSource(next), destroy: () => widget.unmount() }
  },
})
```

- `mount(el, { code, language, editable, setCode })` returns a handle `{ update?, destroy? }` or a cleanup function. Rendered markdown is read-only: `editable` is `false` and `setCode` does nothing.
- When the source changes and the block stays in place, the widget keeps living and gets the new source through `update`; without `update` it is mounted again. `destroy` runs when the block goes away or UidMarkdown unmounts.
- The contract is the one of the WYSIWYG editor's live blocks (`@dskripchenko/wysiwyg`), so a renderer registered once serves both.

## The renderer as a function

`renderMarkdown(source, options)` and `splitMarkdown(source)` are exported too — for a preview outside a component or for server-side use. Options: `slugger`, `onHeading`, `linkBase`, `stripMdExtension`, `imageBase`, `internalLinksInPlace`, `calloutTitles`.

## Theming

`--uid-markdown-color`, `--uid-markdown-muted`, `--uid-markdown-link`, `--uid-markdown-border`, `--uid-markdown-sunken`, `--uid-markdown-font-size`, `--uid-markdown-line-height`, `--uid-markdown-toc-width` — all mapped to theme tokens, so the dark theme needs nothing extra.
