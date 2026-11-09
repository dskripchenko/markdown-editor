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
| `toolbar` | `boolean` | Die Toolbar des visuellen Modus über dem Text; `false`, wenn die Formatierung aus der schwebenden Toolbar oder von der Anwendung kommt. Standard `true`. |
| `bubble` | `boolean \| string[]` | Eine kleine dunkle Toolbar über einer Auswahl im visuellen Modus: `true` für Fett, Kursiv, Unterstrichen, Durchgestrichen, Inline-Code, Link, Überschrift 2 und Aufzählung, oder die gewünschten Elemente. Braucht `@dskripchenko/wysiwyg` 0.15. |
| `frameless` | `boolean` | Ohne Rahmen: visueller Editor, Modusknöpfe, Quelltext und Vorschau ohne Rahmen und Hintergrund, sodass die Seite durchscheint. Für den visuellen Editor braucht es `@dskripchenko/wysiwyg` 0.15. |
| `bubbleActions` | `BubbleAction[]` | Eigene Schaltflächen am Ende der schwebenden Toolbar des visuellen Modus — je ein Symbol und eine Beschriftung; `run({ text, block })` erhält den markierten Text und den Index des Blocks, in dem er beginnt. Braucht `@dskripchenko/wysiwyg` 0.16. |
| `blockHandles` | `boolean` | Ein «+» und ein Griff «⋮⋮» neben den Blöcken des visuellen Modus: einen Block einfügen, einen verschieben oder ihn über ein Menü verschieben, duplizieren und löschen. Braucht `@dskripchenko/wysiwyg` 0.16. |
| `remoteCarets` | `RemoteCaret[]` | Die Cursor anderer Personen über dem visuellen Modus (`{ id, name, color?, block, offset? }`); die Markdown-Modi ignorieren sie. Braucht `@dskripchenko/wysiwyg` 0.16. |
| `placeholder` | `string` | Wird im leeren Dokument gezeigt. |
| `readonly` | `boolean` | In allen Modi schreibgeschützt. |
| `min-height`, `max-height` | `string` | Die Höhe des Bearbeitungsbereichs. |
| `block-renderers` | `object` | Live-Blöcke: `{ mermaid: renderer }` — der Vertrag von `UidMarkdown` aus dem Kit; dieselben in Editor und Vorschau. |
| `toolbar-items`, `slash-commands` | | Gehen an den WYSIWYG-Editor. |
| `locale` | `'en' \| 'ru'` | Die Sprache; standardmäßig die Locale des Kits. |
| `labels` | `object` | Einzelne Texte über denen der Sprache. |
| `image-base` | `string` | Der Ordner (eine URL mit `/` am Ende), gegen den relative Bilder aufgelöst werden: `img/a.png` wird von dort gezeigt und wieder als `img/a.png` gespeichert, `../a.png` ebenso. |
| `link-base` | `string` | Die Basis relativer Links in der Vorschau. |
| `linkSuggest` | `(query) => items` | Was `[[` beim Tippen anbietet (interne Links): `{ label, insert, detail? }[]` oder ein Promise davon; die Auswahl schreibt `[[insert]]`. Ohne: keine Liste. |
| `saveImage` | `(file) => path` | Eingefügte, abgelegte oder mit der Bild-Schaltfläche gewählte Bilder: der Host speichert die `File` und gibt den Pfad für das Markdown zurück (oder ein Promise davon; `null` überspringt sie); an der Einfügemarke wird `![Name](Pfad)` geschrieben. Ohne: Bilder werden nicht angenommen. |

TeX-Formeln (`$…$`, `$$…$$`) und `==Hervorhebungen==` erscheinen im visuellen Modus gezeichnet (mit `@dskripchenko/ui` 1.26 und `@dskripchenko/wysiwyg` 0.10 oder neuer): eine Formel ist ein Stück — ein Doppelklick bearbeitet ihr TeX, **Formel** im Slash-Menü fügt eine ein — und das Markdown behält sie wie geschrieben; in der Quelle wird ihr TeX hervorgehoben.

Ein YAML-Front-Matter am Anfang (die Eigenschaften des Dokuments) bleibt genau wie geschrieben; `#Tags` erscheinen im visuellen Modus als Tags (mit `@dskripchenko/ui` 1.27 und `@dskripchenko/wysiwyg` 0.11).

Ereignisse: `update:modelValue` und `change` mit dem Markdown — nur, wenn das
Dokument bearbeitet wird, nie beim Laden. `update:mode`.

`caret` mit `{ block, offset }` — wo der Cursor des visuellen Modus steht (ein Block der obersten Ebene und der Zeichenversatz in seinem Text), höchstens alle 100 ms — oder `null` in den Markdown-Modi und ohne Fokus (`@dskripchenko/wysiwyg` 0.16).

Nach außen: `focus()`, `insert(markdown)` (an der Einfügemarke; im visuellen
Modus formatiert), `value`.

## Bearbeiten an Ort und Stelle

Um eine Seite dort zu bearbeiten, wo sie steht — der Text sieht aus wie die
Seite, die Formatierung kommt aus einer Leiste über der Auswahl:

```vue
<MarkdownEditor v-model="text" frameless bubble :toolbar="false" :mode-switch="false" />
```

Das Aussehen der Leiste steuern die Variablen `--dsk-wysiwyg-bubble-*` des Editors.

## Gemeinsames Bearbeiten

Für gemeinsames Bearbeiten in Echtzeit senden Sie das Ereignis `caret` an die
anderen und geben deren Cursor als `remoteCarets` zurück; ein neuer
`v-model`-Wert von jemand anderem wird übernommen, ohne den Cursor zu
verlieren:

```vue
<MarkdownEditor
  v-model="text"
  :remote-carets="others"
  @caret="(pos) => channel.send({ caret: pos })"
/>
```

- Im visuellen Modus wird der neue Wert eingepatcht: Nur die geänderten
  Blöcke werden ersetzt, ein Cursor in einem anderen Block bleibt, wo er ist,
  einer in einem geänderten Block wird über Block und Versatz zurückgesetzt.
  Der Rückgängig-Verlauf beginnt beim neuen Wert neu, sodass Rückgängig nie
  die Änderung eines anderen zurücknimmt.
- In den Markdown-Modi behält das Textfeld seine Auswahl: Eine Auswahl vor
  dem geänderten Abschnitt bleibt, eine danach verschiebt sich mit ihm.
- Fremde Cursor werden nur im visuellen Modus gezeichnet.

Das braucht `@dskripchenko/wysiwyg` 0.16; mit einer älteren Version bewirken
die Props nichts und werden nicht weitergegeben.

## Der Rundweg

Markdown wird in das HTML des Editors gerendert und daraus zurückgeschrieben.
Der erste Durchgang bringt das Dokument in die kanonische Form — `-` für
Aufzählungen, `**` und `*` für Hervorhebungen, ATX-Überschriften, neu
nummerierte Punkte —, jeder weitere lässt es, wie es ist. Text wird nur dort
maskiert, wo ein Zeichen sonst Markup bedeuten würde: `1.5`, `a-b`, `(netto)`
bleiben, wie sie sind.

Aufgabenlisten `- [ ]` / `- [x]` werden als Listen mit Kästchen bearbeitet: ein
Klick auf ein Kästchen hakt es ab, `[ ] ` oder `[x] ` am Anfang eines Eintrags
macht ihn zur Aufgabe, Enter nach einer Aufgabe beginnt eine nicht abgehakte
(`@dskripchenko/wysiwyg` 0.13 oder neuer; mit einem älteren bleiben sie wie
geschrieben).

Was der visuelle Editor nicht abbilden kann, bleibt **wie geschrieben**:

- Überschriften `####`, `#####`, `######`;
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
