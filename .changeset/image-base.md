---
'@dskripchenko/markdown-editor': minor
---

`image-base` and `link-base`: a document's relative pictures show from its folder in the visual editor and the preview and are saved back as written (`img/a.png`, `../a.png`); relative links of the preview resolve against `link-base`. `fromMarkdown`, `toMarkdown` and `normalize` take `{ imageBase }`; `relativeTo` is exported.
