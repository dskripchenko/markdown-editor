# Changelog

## 0.9.2

### Patch Changes

- e394cec: Works with `@dskripchenko/wysiwyg` 0.14, where a block id (` ^id` at the end of a paragraph, heading, list item or table cell) is a quiet mark in the visual mode that cannot be typed into and stays at the end of its block — text typed after it goes before it. With an older editor the id stays text, as before; the Markdown round trip is the same either way. The browser check covers the mark in Chromium and WebKit.

## 0.9.1

### Patch Changes

- 3cc75ee: Block ids (` ^id` at the end of a paragraph, a heading, a list item or a quote) come back byte for byte from the visual mode again. Since `@dskripchenko/ui` 1.30 the kit's renderer hides them in attributes the editor does not keep, so a save from the visual mode dropped them and broke every link to the block; the editor now renders its HTML with `blockIds: false`.

## 0.9.0

### Minor Changes

- f89fa2f: Task lists (`- [ ]` / `- [x]`) are edited as lists with boxes to tick instead of being kept as a block of Markdown, with `@dskripchenko/wysiwyg` 0.13 or later (an older editor still keeps them as written, so no box's state is lost). `fromMarkdown` hands the editor task items it holds, so `normalize` keeps them too. Checked in Chromium and WebKit: a click ticks a box, Enter after a task starts an unticked one, `[x] ` typed makes a task.

## 0.8.1

### Patch Changes

- 89c47d3: `@dskripchenko/wysiwyg` 0.12 allowed as a peer: embedded notes (`![[note]]`) kept through the visual mode.

## 0.8.0

### Minor Changes

- 4428953: A YAML front matter at the document's start is kept as written (it used to be read as rules and a paragraph); `#tags` shown as tags with `@dskripchenko/wysiwyg` 0.11 (now allowed as a peer).

## 0.7.0

### Minor Changes

- b660289: TeX math and `==highlights==`: drawn in the visual mode with `@dskripchenko/ui` 1.26 and `@dskripchenko/wysiwyg` 0.10 (now allowed as a peer) — a formula is one piece, edited by a double click — and highlighted in the source.

## 0.6.0

### Minor Changes

- e894e69: `saveImage`: pictures pasted, dropped or chosen with the toolbar's image button are saved by the host and written as `![name](path)` at the caret, in every mode. `linkSuggest` documented.

## 0.5.0

### Minor Changes

- 49e75c9: Internal links: `linkSuggest(query)` — what `[[` offers as it is typed, in the Markdown mode and in the visual one; arrows choose, Enter or Tab writes `[[name]]`, Escape closes. Works with `@dskripchenko/wysiwyg` 0.9, where `[[note]]` links survive the visual mode.

## 0.4.0

### Minor Changes

- 5a81317: The Markdown mode is highlighted: headings, emphasis, links, code, lists and quotes in colour (the kit's tokenizer over `@dskripchenko/syntax`), by a copy of the text over the field — the field's caret, selection and undo stay the browser's, and a host that styles the field keeps its style. Past 300 000 characters the source stays plain.

## 0.3.1

### Patch Changes

- aab3f9b: Works with `@dskripchenko/wysiwyg` 0.8 (code blocks highlighted by `@dskripchenko/syntax`, some 35 languages) as well as 0.7.

## 0.3.0

### Minor Changes

- 9eedfee: `toolbarTarget` shows the visual mode's toolbar in the host's own element (wysiwyg 0.7), and `modeSwitch: false` hides the mode buttons when the host switches modes itself through `v-model:mode`.

## 0.2.1

### Patch Changes

- dc2c5a0: `image-base` without a scheme (`/media/`): pictures shown from it are saved back relative as well.

## 0.2.0

### Minor Changes

- 127c7b2: `image-base` and `link-base`: a document's relative pictures show from its folder in the visual editor and the preview and are saved back as written (`img/a.png`, `../a.png`); relative links of the preview resolve against `link-base`. `fromMarkdown`, `toMarkdown` and `normalize` take `{ imageBase }`; `relativeTo` is exported.

## 0.1.0

### Minor Changes

- 37932ce: The first release: `MarkdownEditor` — Markdown as the value, edited in the `@dskripchenko/wysiwyg` editor, with Markdown and side-by-side modes; a lossless round trip that keeps what the editor cannot hold (headings below h3, task lists, callouts, HTML blocks, footnotes, reference links) as written; Markdown pasted as plain text arrives formatted; `fromMarkdown`, `toMarkdown`, `normalize`.
