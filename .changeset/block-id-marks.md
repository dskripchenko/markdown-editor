---
'@dskripchenko/markdown-editor': patch
---

Works with `@dskripchenko/wysiwyg` 0.14, where a block id (` ^id` at the end of a paragraph, heading, list item or table cell) is a quiet mark in the visual mode that cannot be typed into and stays at the end of its block — text typed after it goes before it. With an older editor the id stays text, as before; the Markdown round trip is the same either way. The browser check covers the mark in Chromium and WebKit.
