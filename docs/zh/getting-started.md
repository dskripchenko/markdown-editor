# 快速开始

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

const text = ref('# 发布说明\n\n版本 **3.1**。')
const mode = ref('visual')
</script>

<template>
  <MarkdownEditor v-model="text" v-model:mode="mode" min-height="320px" />
</template>
```

## 模式

| 模式 | |
|---|---|
| `visual` | 所见即所得编辑器：工具栏、斜杠菜单（`/`）、Markdown 快捷输入（`#`、`-`、`1.`、`>`、```` ``` ````）、表格、实时块。 |
| `source` | Markdown 原文，等宽文本框（Tab 缩进）。 |
| `split` | Markdown 与实时预览并排（窄屏时上下排列）。 |

切换器显示 `modes` 中的模式；只有一种模式时不显示。

## 属性

| 属性 | | |
|---|---|---|
| `v-model` | `string` | Markdown 内容。 |
| `v-model:mode` | `'visual' \| 'source' \| 'split'` | 模式；默认 `visual`。 |
| `modes` | `string[]` | 提供的模式；默认三种全部。 |
| `placeholder` | `string` | 文档为空时显示。 |
| `readonly` | `boolean` | 所有模式下只读。 |
| `min-height`、`max-height` | `string` | 编辑区高度。 |
| `block-renderers` | `object` | 实时块：`{ mermaid: renderer }`——组件库 `UidMarkdown` 的约定；编辑器和预览中相同。 |
| `toolbar-items`、`slash-commands` | | 传给所见即所得编辑器。 |
| `locale` | `'en' \| 'ru'` | 语言；默认使用组件库的语言。 |
| `labels` | `object` | 覆盖语言中的单个文本。 |

事件：`update:modelValue` 和 `change`，参数为 Markdown——仅在编辑文档时触发，加载时不会。`update:mode`。

对外提供：`focus()`、`insert(markdown)`（插入到光标处；可视模式下已格式化）、`value`。

## 往返转换

Markdown 被渲染为编辑器的 HTML，再从中写回。第一次往返会把文档变为规范形式——无序列表用 `-`，强调用 `**` 和 `*`，标题用 `#`，列表项重新编号——之后的每次往返都保持不变。只有在字符会被当作标记时才转义：`1.5`、`a-b`、`(净额)` 保持原样。

可视编辑器无法表示的内容会**按原样**保留：

- 标题 `####`、`#####`、`######`；
- 任务列表 `- [ ]` / `- [x]`；
- 提示框 `> [!NOTE]`、`> [!WARNING]`…；
- HTML 块（`<details>`、`<div>`…）；
- 脚注 `[^1]` 及其定义；
- 引用式链接 `[文本][id]` 及其定义。

在可视模式下，这样的块显示其 Markdown（左侧带竖条）；在 Markdown 模式下编辑，并逐字节保存。

## 不使用组件

```ts
import { fromMarkdown, toMarkdown, normalize } from '@dskripchenko/markdown-editor'

fromMarkdown('# 你好\n\n- a')   // 编辑器的 HTML
toMarkdown('<h1>你好</h1>')      // '# 你好\n'
normalize('* a\n* b')            // '- a\n- b\n'——一次往返，与保存时相同
```

`toMarkdown` 需要 DOM（浏览器或 jsdom）。
