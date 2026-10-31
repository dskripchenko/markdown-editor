# @dskripchenko/markdown-editor

[![npm](https://img.shields.io/npm/v/@dskripchenko/markdown-editor.svg)](https://www.npmjs.com/package/@dskripchenko/markdown-editor)
[![license](https://img.shields.io/npm/l/@dskripchenko/markdown-editor.svg)](LICENSE)

A Markdown editor for Vue 3 that edits like a word processor. The value is
**Markdown**; the editing is the [`@dskripchenko/wysiwyg`](https://github.com/dskripchenko/wysiwyg)
engine — its toolbar, slash menu, shortcuts and live blocks — with a
**Markdown** mode and a **side-by-side** mode with a live preview.

[**English**](docs/en/getting-started.md) · [Русский](docs/ru/getting-started.md) · [Deutsch](docs/de/getting-started.md) · [中文](docs/zh/getting-started.md)

```vue
<script setup>
import { ref } from 'vue'
import { MarkdownEditor } from '@dskripchenko/markdown-editor'
import '@dskripchenko/ui/styles/all.css'
import '@dskripchenko/wysiwyg/style.css'
import '@dskripchenko/markdown-editor/style.css'

const text = ref('# Release notes\n\nVersion **3.1**.')
</script>

<template>
  <MarkdownEditor v-model="text" />
</template>
```

- **A lossless round trip.** Markdown goes into the editor and comes back as
  Markdown: the first save puts it in canonical form (`-` for lists, `**`
  for bold), every later one changes nothing. Plain text keeps its dots,
  dashes and brackets.
- **Nothing is lost.** What the visual editor cannot hold — headings below
  h3, task lists, callouts, HTML blocks, footnotes, reference-style links —
  stays as written: shown as a block of Markdown and saved byte for byte.
- **Pasting Markdown** as plain text gives formatted text; pasting from a
  page or a document is cleaned by the editor's sanitizer.
- Live blocks (```` ```mermaid ```` and others) through `blockRenderers` —
  the same renderers in the editor and in the preview.
- No runtime dependencies: Vue, [`@dskripchenko/ui`](https://github.com/dskripchenko/ui)
  and `@dskripchenko/wysiwyg` are peer dependencies. Russian and English.

## Install

```bash
npm i @dskripchenko/markdown-editor @dskripchenko/wysiwyg @dskripchenko/ui vue
```

→ [Getting started](docs/en/getting-started.md): props, events, modes,
the round trip, the conversion functions.

## License

MIT
