---
'@dskripchenko/markdown-editor': minor
---

Edit in place. `bubble` shows a small dark toolbar floating above a selection in the visual mode (`true` for the default set, or the toolbar items to show), `frameless` drops the frame — the visual editor, the mode buttons, the source and the preview lose their borders and backgrounds, so the page around shows through — and `toolbar: false` hides the visual mode's toolbar above the text. `bubble` and `frameless` need `@dskripchenko/wysiwyg` 0.15 (the peer range now takes it); with an older editor they do nothing in the visual mode and are not passed to it.
