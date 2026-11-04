---
"@dskripchenko/markdown-editor": minor
---

Task lists (`- [ ]` / `- [x]`) are edited as lists with boxes to tick instead of being kept as a block of Markdown, with `@dskripchenko/wysiwyg` 0.13 or later (an older editor still keeps them as written, so no box's state is lost). `fromMarkdown` hands the editor task items it holds, so `normalize` keeps them too. Checked in Chromium and WebKit: a click ticks a box, Enter after a task starts an unticked one, `[x] ` typed makes a task.
