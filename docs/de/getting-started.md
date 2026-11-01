# Erste Schritte

```bash
npm i @dskripchenko/markdown-editor @dskripchenko/wysiwyg @dskripchenko/ui vue
```

```vue
<script setup>
import { ref } from 'vue'
import { MarkdownEditor } from '@dskripchenko/markdown-editor'
import '@dskripchenko/ui/styles/all.css'
import '@dskripchenko/wysiwyg/style.css'
import '@dskripchenko/markdown-editor/style.css'

const text = ref('# Release Notes\n\nVersion **3.1**.')
const mode = ref('visual')
</script>

<template>
  <MarkdownEditor v-model="text" v-model:mode="mode" min-height="320px" />
</template>
```

## Modi

| Modus | |
|---|---|
| `visual` | Der WYSIWYG-Editor: Werkzeugleiste, Slash-Menü (`/`), Markdown-Kürzel (`#`, `-`, `1.`, `>`, ```` ``` ````), Tabellen, Live-Blöcke. |
| `source` | Das Markdown selbst in einem Feld mit fester Breite (Tab rückt ein). |
| `split` | Markdown und Live-Vorschau nebeneinander (auf schmalen Bildschirmen untereinander). |

Der Umschalter zeigt die Modi aus `modes`; bei nur einem Modus gibt es keinen.

## Props

| Prop | | |
|---|---|---|
| `v-model` | `string` | Das Markdown. |
| `v-model:mode` | `'visual' \| 'source' \| 'split'` | Der Modus; standardmäßig `visual`. |
| `modes` | `string[]` | Die angebotenen Modi; standardmäßig alle drei. |
| `modeSwitch` | `boolean` | Die Modusknöpfe über dem Editor; `false`, wenn die Anwendung die Modi selbst umschaltet (`v-model:mode`). Standard `true`. |
| `toolbarTarget` | `string \| HTMLElement` | Wo die Toolbar des visuellen Modus statt über dem Text erscheint: die eigene Leiste der Anwendung (ein Element oder ein CSS-Selektor). |
| `placeholder` | `string` | Wird im leeren Dokument gezeigt. |
| `readonly` | `boolean` | In allen Modi schreibgeschützt. |
| `min-height`, `max-height` | `string` | Die Höhe des Bearbeitungsbereichs. |
| `block-renderers` | `object` | Live-Blöcke: `{ mermaid: renderer }` — der Vertrag von `UidMarkdown` aus dem Kit; dieselben in Editor und Vorschau. |
| `toolbar-items`, `slash-commands` | | Gehen an den WYSIWYG-Editor. |
| `locale` | `'en' \| 'ru'` | Die Sprache; standardmäßig die Locale des Kits. |
| `labels` | `object` | Einzelne Texte über denen der Sprache. |
| `image-base` | `string` | Der Ordner (eine URL mit `/` am Ende), gegen den relative Bilder aufgelöst werden: `img/a.png` wird von dort gezeigt und wieder als `img/a.png` gespeichert, `../a.png` ebenso. |
| `link-base` | `string` | Die Basis relativer Links in der Vorschau. |

Ereignisse: `update:modelValue` und `change` mit dem Markdown — nur, wenn das
Dokument bearbeitet wird, nie beim Laden. `update:mode`.

Nach außen: `focus()`, `insert(markdown)` (an der Einfügemarke; im visuellen
Modus formatiert), `value`.

## Der Rundweg

Markdown wird in das HTML des Editors gerendert und daraus zurückgeschrieben.
Der erste Durchgang bringt das Dokument in die kanonische Form — `-` für
Aufzählungen, `**` und `*` für Hervorhebungen, ATX-Überschriften, neu
nummerierte Punkte —, jeder weitere lässt es, wie es ist. Text wird nur dort
maskiert, wo ein Zeichen sonst Markup bedeuten würde: `1.5`, `a-b`, `(netto)`
bleiben, wie sie sind.

Was der visuelle Editor nicht abbilden kann, bleibt **wie geschrieben**:

- Überschriften `####`, `#####`, `######`;
- Aufgabenlisten `- [ ]` / `- [x]`;
- Hinweisboxen `> [!NOTE]`, `> [!WARNING]`…;
- HTML-Blöcke (`<details>`, `<div>`…);
- Fußnoten `[^1]` und ihre Definitionen;
- Referenz-Links `[Text][id]` und ihre Definitionen.

Im visuellen Modus zeigt ein solcher Block sein Markdown (mit einem Streifen
links); bearbeitet wird er im Markdown-Modus und Byte für Byte gespeichert.

## Ohne die Komponente

```ts
import { fromMarkdown, toMarkdown, normalize } from '@dskripchenko/markdown-editor'

fromMarkdown('# Hallo\n\n- a')   // das HTML des Editors
toMarkdown('<h1>Hallo</h1>')      // '# Hallo\n'
normalize('* a\n* b')             // '- a\n- b\n' — ein Durchgang, wie beim Speichern
```

`toMarkdown` braucht ein DOM (Browser oder jsdom). Beide nehmen `{ imageBase }`:
relative Bilder werden für die Anzeige aufgelöst und bei der Ausgabe wieder
relativ.
