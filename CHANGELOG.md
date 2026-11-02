# Changelog

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
