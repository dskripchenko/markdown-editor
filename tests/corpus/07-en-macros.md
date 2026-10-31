# Macros

Twelve macros, each in the **Other macros** list of the page editor. Where a
macro takes its content from more than one place, the first that is set
wins: **an attachment of the page, then a URL, then the macro body**.

A URL is fetched by the reader's browser, so a server on another domain must
allow this Confluence site (CORS). Attachments need nothing of the kind.

The widgets follow Confluence's colour mode (light or dark) and speak the
reader's language (Russian or English).

## Diagram — `dsk-diagram`

A diagram drawn as SVG on the page from Mermaid (flowchart, sequence, state, class, ER, C4, gantt, pie, timeline, xychart, mindmap…), PlantUML, Graphviz DOT, D2, DBML, Structurizr DSL or a Wardley map. The body is the diagram's source.

| Parameter | | |
|---|---|---|
| Title | `label` | The diagram's accessible name, read by screen readers. |
| Syntax | `syntax` | `mermaid`, `plantuml`, `dot`, `d2`, `dbml`, `structurizr` or `wardley`. Empty: recognised from the source (`@startuml`, `digraph`, `Table`, `workspace`…). |

```xml
<ac:structured-macro ac:name="dsk-diagram">
  <ac:parameter ac:name="label">Order review</ac:parameter>
  <ac:plain-text-body><![CDATA[flowchart LR
  A[Request] --> B{Check}
  B -->|ok| C[Done]
  B -->|no| A]]></ac:plain-text-body>
</ac:structured-macro>
```

A Graphviz graph:

```xml
<ac:structured-macro ac:name="dsk-diagram">
  <ac:parameter ac:name="syntax">dot</ac:parameter>
  <ac:plain-text-body><![CDATA[digraph { rankdir=LR; request -> review -> done }]]></ac:plain-text-body>
</ac:structured-macro>
```

A diagram with an error shows the message and the line instead of the picture.

## API reference (OpenAPI) — `dsk-openapi`

The reference of an OpenAPI 3.x or Swagger 2 spec, YAML or JSON: navigation
by tags, search, every operation with its parameters, request body,
responses and types, request samples in 13 languages, **Try it** (the
request is sent from the reader's browser), downloads of the spec. With
*Operation* set, one operation as a card.

| Parameter | | |
|---|---|---|
| Spec attachment | `attachment` | A YAML or JSON file attached to the page. |
| Spec URL | `url` | When no attachment is chosen. |
| Operation | `operation` | One operation as a card: an `operationId` or `METHOD /path`. Empty: the whole reference. |
| Title | `heading` | The reference's header. Empty: the spec's title. |
| Height | `height` | The reference sits in a box with its own scroll: `720`, `900px`, `80vh`. Default `720`. A card takes its own height. |
| Try it | `tryIt` | Lets readers send requests from the page. On by default. |

```xml
<ac:structured-macro ac:name="dsk-openapi">
  <ac:parameter ac:name="attachment"><ri:attachment ri:filename="orders.yaml"/></ac:parameter>
  <ac:parameter ac:name="operation">createOrder</ac:parameter>
  <ac:parameter ac:name="tryIt">false</ac:parameter>
</ac:structured-macro>
```

Several references on a page do not compete for the address bar: links to
operations open in place.

## Markdown with live blocks — `dsk-markdown`

Markdown with tables, callouts (`> [!NOTE]`, `[!TIP]`,
`[!WARNING]`…), highlighted code and an optional table of contents. Fenced
blocks of these languages become live widgets:

| Block | Becomes |
|---|---|
| ```` ```mermaid ```` | a diagram |
| ```` ```plantuml ````, ```` ```dot ````, ```` ```d2 ````, ```` ```dbml ````, ```` ```structurizr ````, ```` ```wardley ```` | a diagram |
| ```` ```bpmn ````, ```` ```dmn ```` | a BPMN process; DMN decisions with their tables |
| ```` ```drawio ```` | a draw.io diagram |
| ```` ```asyncapi ```` | an AsyncAPI reference |
| ```` ```openapi ```` | an API card: one request, several, or a whole spec ([the block format](https://github.com/dskripchenko/openapi/blob/main/docs/en/blocks.md)) |
| ```` ```flow ```` | a process view |
| ```` ```video ````, ```` ```audio ```` | a player |

Relative images (`![Scheme](scheme.png)`) are attachments of the page.

| Parameter | | |
|---|---|---|
| Markdown attachment | `attachment` | A `.md` file attached to the page. |
| Markdown URL | `url` | When no attachment is chosen. |
| Table of contents | `toc` | Show a table of contents of the headings. |
| Contents depth | `tocDepth` | The deepest heading level in it: `2`, `3` (default), `4`. |

## Process flow — `dsk-flow`

A process model as an interactive view: pan and zoom, a minimap, details of
a step on click, sub-processes (double-click a sub-process step to go in),
and live monitoring. The model is flow JSON
([the model](https://github.com/dskripchenko/flow/blob/main/docs/en/model.md))
or Mermaid `stateDiagram-v2` / `flowchart`.

| Parameter | | |
|---|---|---|
| Model attachment | `attachment` | A `.json` or `.mmd` file attached to the page. |
| Model URL | `url` | When no attachment is chosen. |
| Height | `height` | `480` by default; `600`, `900px`, `70vh`. |
| Direction | `direction` | `TB` — top to bottom, `LR` — left to right. Empty: from the model, else by the box's shape. |
| Edges | `edgeStyle` | `orthogonal` or `smooth`. |
| Minimap | `minimap` | On by default. |
| Sub-process address | `subgraphUrl` | Where referenced sub-processes come from; `{ref}` is replaced by the reference. Empty: **the attachments of this page**, so `ref: payment.json` opens the attachment `payment.json`. |
| Monitoring URL | `pollUrl` | A snapshot of the running process (counters, statuses, errors per step), fetched regularly. |
| Polling interval, ms | `pollInterval` | `5000` by default; not less than `1000`. |

## Video player — `dsk-video`

A player for MP4, WebM or HLS (`.m3u8`): chapters, subtitles, quality and
speed, picture-in-picture. Starting a player on the page pauses the others.
The poster, chapters and subtitles each take **the name of an attachment of
the page or an address**.

| Parameter | | |
|---|---|---|
| Video attachment | `attachment` | A video file attached to the page. |
| Video URL | `url` | When no attachment is chosen. |
| Poster | `poster` | An image shown before playing. |
| Chapters (.vtt) | `chapters` | A WebVTT file of chapters. |
| Subtitles (.vtt) | `subtitles` | A WebVTT file of subtitles. |
| Subtitles language | `subtitlesLanguage` | `ru`, `en`, `de`… |
| Name | `label` | The player's accessible name. |
| Aspect ratio | `aspectRatio` | `16:9`, `4:3`: the box before the video loads. |
| Loop | `loop` | Play again from the start. |
| Remember the position | `resume` | Continue where the reader stopped, in that browser. |

## Audio player — `dsk-audio`

One track, or a playlist in the body — a track per line, `file | Title |
Artist`, where *file* is the name of an attachment of the page or an address:

```
intro.mp3 | Introduction | Anna
https://media.example.com/outro.mp3 | Outro | Anna
```

| Parameter | | |
|---|---|---|
| Audio attachment | `attachment` | An audio file attached to the page; a filled body is a playlist instead. |
| Audio URL | `url` | When no attachment is chosen. |
| Title | `title` | The track's title. |
| Artist | `artist` | The track's artist. |
| View | `variant` | `default`, or `mini` — a compact player in a line. |
| Waveform | `waveform` | Draw the waveform as the scrub bar. |

## Board — `dsk-board`

A whiteboard several people edit at once, right on the page — no need to
open the page editor: sticky notes, shapes, frames, connectors, text and
titles, emoji, pen and marker ([`@dskripchenko/board`](https://github.com/dskripchenko/board)).

- **Who edits:** everyone who may edit the page. They see each other's
  changes within a second, and each other's cursors and names.
- **Readers** (view permission only) see the board live, without the tools.
- **Lock:** an editor can lock the board — it becomes view-only for everyone
  until an editor unlocks it. Changes made at that moment are rolled back.
- **Export:** PDF and Word get a picture of the board as it was the last
  time someone who may edit the page opened it.

Inserting the macro needs no dialog: it goes in with a board id of its own.
Each macro is its own board; a copied page gets a copy of the board on first
view.

| Parameter | | |
|---|---|---|
| Board id | `board` | Set on insertion. Another id is another, empty board; leave it as is. |
| Height | `height` | In px (default 560), or with `vh`, `em`, `rem`. |
| Minimap | `minimap` | Show the minimap. |

## Process (BPMN) — `dsk-bpmn`

A BPMN 2.0 process as it was laid out in Camunda Modeler, bpmn.io or another
modeler: pools, lanes, events, gateways, sub-processes; pan and zoom. The
file comes from an attachment of the page, a URL or the body; the macro's
editor is a BPMN editor (palette, properties, undo), and an attachment is
saved as its new version.

| Parameter | | |
|---|---|---|
| File attachment | `attachment` | A `.bpmn` file attached to the page. |
| File URL | `url` | Used when no attachment is chosen. |
| Height | `height` | 480 by default; `600`, `900px`, `70vh`. |
| Diagram | `diagram` | The id of the diagram to show when the file has several. |

```xml
<ac:structured-macro ac:name="dsk-bpmn">
  <ac:parameter ac:name="attachment"><ri:attachment ri:filename="order.bpmn"/></ac:parameter>
  <ac:parameter ac:name="height">600</ac:parameter>
</ac:structured-macro>
```

## Decisions (DMN) — `dsk-dmn`

DMN 1.x decisions: the decision requirements diagram; a double click on a
decision opens its decision table or literal expression. Edited in a DMN
editor (the diagram and the tables). Parameters as for BPMN, with
**Decision** (`decision`) — the id of a decision whose table opens at once.

## draw.io diagram — `dsk-drawio`

A draw.io (diagrams.net) file — compressed or plain pages, or a
`.drawio.svg` — drawn as SVG, with tabs when it has several pages. Shapes of
vendor libraries are drawn as labelled placeholders; pictures from the web
are not loaded. The editor shows the file's source beside a preview: the
diagram itself is drawn in draw.io and attached to the page.

| Parameter | | |
|---|---|---|
| File attachment | `attachment` | A `.drawio`, `.xml` or `.drawio.svg` file. |
| File URL | `url` | Used when no attachment is chosen. |
| Page | `page` | The page shown first: its name or number (from 0). |
| Title | `label` | The picture's accessible name. |

## API reference (AsyncAPI) — `dsk-asyncapi`

An AsyncAPI 2.x / 3.0 document of an event-driven API (Kafka, AMQP, MQTT,
WebSocket…) as a reference: servers, operations, channels, messages with
their headers, payload schemas and examples. From an attachment, a URL or
the body (YAML or JSON); the editor is the source beside a preview. The
export shows the document's source.

| Parameter | | |
|---|---|---|
| Document attachment | `attachment` | A `.yaml` or `.json` file. |
| Document URL | `url` | Used when no attachment is chosen. |
| Height | `height` | A scrolling box of this height; empty — as tall as the document. |

## Kanban — `dsk-kanban`

A kanban board written as markup in the macro body: columns, swimlanes,
cards with tags, priority, assignee and due date.

```
# Release 3.0
lanes: Payments, Refunds

## Backlog
- Instant payments #payments {lane: Payments, who: Anna, due: 2026-11-15}
- Partial refunds #refunds !high {lane: Refunds}
  The card's description, indented.

## In progress {wip: 3}

## Done {done}
- Signed webhooks
```

`## Column {wip: 3, done}` — a column with a work-in-progress limit or the
column of finished cards; `- Title #tag !high {who: …, due: …, lane: …}` — a
card; indented lines — its description. The full syntax is in
[`@dskripchenko/embed`'s documentation](https://github.com/dskripchenko/embed/blob/main/docs/en/elements.md#dsk-kanban).

**On the page**, those who may edit the page drag cards between columns and
lanes, add cards with `+` and change them in the card's panel. Each change
is saved into the page a moment later — several quick ones together — as a
new version without notifications to watchers ("Kanban" in the page
history). The **lock** above the board makes it read-only for everyone until
it is opened again; it is kept in the macro (`locked`). If someone changed the
page meanwhile, the change is not saved and the board asks to reload the
page. Readers who may not edit the page see the board read-only.

| Parameter | | |
|---|---|---|
| Markup attachment | `attachment` | A text file with the markup. Read-only on the page: edited in the macro's dialog. |
| Markup URL | `url` | Used when no attachment is chosen. Read-only on the page. |
| Height | `height` | Empty — as tall as the board; `600`, `900px`, `70vh`. |
| Locked | `locked` | Read-only for everyone (the lock on the page sets it). |

In PDF and Word the board is a table: the columns and their cards with the
assignee, due date and tags.

## Calendar — `dsk-calendar`

Events written as markup in the macro body, one per line, with repeats:
day, week, month, year or agenda.

```
2026-11-03 10:00-11:00 Release demo #release {where: Room 4}
2026-11-10..2026-11-14 Code freeze #release
every mon 11:00-11:30 Sprint planning {from: 2026-11-02, except: 2026-11-30}
every month last fri Release to production
every year 12-31 New year freeze
```

A date or a range, an optional time, the title, `#tags` and `{properties}`;
a repeat starts with `every` (`every day`, `every mon,wed`, `every 2 weeks
fri`, `every month 15`, `every month last fri`, `every year 12-31`) and takes
`from`, `until`, `count` and `except`. The full syntax is in
[`@dskripchenko/embed`'s documentation](https://github.com/dskripchenko/embed/blob/main/docs/en/elements.md#dsk-calendar).

**On the page**, those who may edit it drag events to another day or hour,
stretch them in the day and week views, and add events with **+ Event** or a
click on an empty slot. The **event builder** puts an event together from
choices — date, time, the repeat and its end, skipped dates — and shows the
line it writes. Changing one occurrence of a repeat makes it an event of its
own and the series skips that date. Saving, the lock and a changed page work
as for the kanban ("Calendar" in the page history).

| Parameter | | |
|---|---|---|
| Markup attachment | `attachment` | A text file with the markup. Read-only on the page. |
| Markup URL | `url` | Used when no attachment is chosen. Read-only on the page. |
| View | `view` | The view shown first: month (default), week, day, year, agenda. |
| Date | `date` | The date shown first, `YYYY-MM-DD`; empty — today. |
| Locked | `locked` | Read-only for everyone (the lock on the page sets it). |

In PDF and Word the calendar is a table of its events as written: when
(repeats in words, with their bounds), what and where.

## On the page

- **Full screen:** diagrams, flows, boards and API references have a
  full-screen button (on hover); Escape or the button leaves.
- **Confluence's table of contents** lists the page's headings, the headings
  of markdown macros among them, but not the ones the widgets draw for
  themselves (an API reference's tags and operations).
- **When the app is off**, each macro shows its name, a link to its
  attachment or address and its source instead of an "Unknown macro" badge
  (see [Administration](administration.md#when-the-app-is-off)).
