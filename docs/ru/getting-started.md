# Начало работы

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

const text = ref('# Заметки к релизу\n\nВерсия **3.1**.')
const mode = ref('visual')
</script>

<template>
  <MarkdownEditor v-model="text" v-model:mode="mode" min-height="320px" />
</template>
```

## Режимы

| Режим | |
|---|---|
| `visual` | Визивиг-редактор: тулбар, slash-меню (`/`), markdown-сокращения (`#`, `-`, `1.`, `>`, ```` ``` ````), таблицы, живые блоки. |
| `source` | Сам Markdown в моноширинном поле (Tab делает отступ). |
| `split` | Markdown и живой просмотр рядом (на узком экране — друг под другом). |

Переключатель показывает режимы из `modes`; при одном режиме его нет.

## Свойства

| Свойство | | |
|---|---|---|
| `v-model` | `string` | Markdown. |
| `v-model:mode` | `'visual' \| 'source' \| 'split'` | Режим; по умолчанию `visual`. |
| `modes` | `string[]` | Доступные режимы; по умолчанию все три. |
| `placeholder` | `string` | Подсказка в пустом документе. |
| `readonly` | `boolean` | Только чтение во всех режимах. |
| `min-height`, `max-height` | `string` | Высота области правки. |
| `block-renderers` | `object` | Живые блоки: `{ mermaid: renderer }` — контракт `UidMarkdown` из кита; одни и те же в редакторе и просмотре. |
| `toolbar-items`, `slash-commands` | | Передаются визивиг-редактору. |
| `locale` | `'en' \| 'ru'` | Язык; по умолчанию — локаль кита. |
| `labels` | `object` | Отдельные строки поверх языка. |

События: `update:modelValue` и `change` с Markdown — только когда документ
правят, а не при загрузке. `update:mode`.

Наружу: `focus()`, `insert(markdown)` (в позицию курсора; в визуальном режиме —
уже форматированным), `value`.

## Круговой обход

Markdown отрисовывается в HTML редактора и пишется обратно из него. Первый
проход приводит документ к каноничному виду — `-` для маркированных списков,
`**` и `*` для выделения, заголовки через `#`, нумерация пунктов заново, — а
каждый следующий оставляет его как есть. Текст экранируется только там, где
символ иначе означал бы разметку: `1.5`, `a-b`, `(нетто)` остаются как
написаны.

То, чего визуальный редактор не умеет, сохраняется **как написано**:

- заголовки `####`, `#####`, `######`;
- списки задач `- [ ]` / `- [x]`;
- выноски `> [!NOTE]`, `> [!WARNING]`…;
- HTML-блоки (`<details>`, `<div>`…);
- сноски `[^1]` и их определения;
- ссылки по ссылке `[текст][id]` и их определения.

В визуальном режиме такой блок показывает свой Markdown (с полосой слева);
правится он в режиме Markdown и сохраняется байт в байт.

## Без компонента

```ts
import { fromMarkdown, toMarkdown, normalize } from '@dskripchenko/markdown-editor'

fromMarkdown('# Привет\n\n- a')   // HTML редактора
toMarkdown('<h1>Привет</h1>')      // '# Привет\n'
normalize('* a\n* b')              // '- a\n- b\n' — один проход, как при сохранении
```

`toMarkdown` нужен DOM (браузер или jsdom).
