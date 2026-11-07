---
'@dskripchenko/markdown-editor': patch
---

Block ids (` ^id` at the end of a paragraph, a heading, a list item or a quote) come back byte for byte from the visual mode again. Since `@dskripchenko/ui` 1.30 the kit's renderer hides them in attributes the editor does not keep, so a save from the visual mode dropped them and broke every link to the block; the editor now renders its HTML with `blockIds: false`.
