---
'@dskripchenko/markdown-editor': minor
---

Co-editing and block handles. `bubbleActions` (the host's own buttons at the end of the bubble), `blockHandles` (a «+» and a «⋮⋮» grip beside the blocks: add, drag, move, duplicate, delete) and `remoteCarets` (other people's carets over the text) go to the visual mode, and its `caret` event (`{ block, offset }`) comes out of the editor — `null` in the Markdown modes, which ignore `remoteCarets`. A new `v-model` value from outside keeps the caret: the visual mode patches only the blocks that changed, and the Markdown modes keep the text field's selection, shifted past the changed span. The types `BubbleAction`, `RemoteCaret` and `CaretPosition` are exported. These need `@dskripchenko/wysiwyg` 0.16 (the peer range now takes it); with an older editor they do nothing in the visual mode and are not passed to it.
