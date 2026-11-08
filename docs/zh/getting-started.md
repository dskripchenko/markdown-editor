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
| `modeSwitch` | `boolean` | 编辑器上方的模式按钮；宿主自行切换模式时设为 `false`（`v-model:mode`）。默认 `true`。 |
| `toolbarTarget` | `string \| HTMLElement` | 可视模式工具栏的显示位置，代替文本上方：宿主自己的栏（元素或 CSS 选择器）。 |
| `toolbar` | `boolean` | 可视模式下文本上方的工具栏；格式由浮动工具栏或宿主提供时设为 `false`。默认 `true`。 |
| `bubble` | `boolean \| string[]` | 可视模式下浮在选区上方的小型深色工具栏：`true` 为粗体、斜体、下划线、删除线、行内代码、链接、二级标题和无序列表，或指定要显示的项。需要 `@dskripchenko/wysiwyg` 0.15。 |
| `frameless` | `boolean` | 无边框：可视编辑器、模式按钮、源码和预览都去掉边框和背景，透出周围的页面。可视编辑器需要 `@dskripchenko/wysiwyg` 0.15。 |
| `placeholder` | `string` | 文档为空时显示。 |
| `readonly` | `boolean` | 所有模式下只读。 |
| `min-height`、`max-height` | `string` | 编辑区高度。 |
| `block-renderers` | `object` | 实时块：`{ mermaid: renderer }`——组件库 `UidMarkdown` 的约定；编辑器和预览中相同。 |
| `toolbar-items`、`slash-commands` | | 传给所见即所得编辑器。 |
| `locale` | `'en' \| 'ru'` | 语言；默认使用组件库的语言。 |
| `labels` | `object` | 覆盖语言中的单个文本。 |
| `image-base` | `string` | 相对图片解析所依据的文件夹（以 `/` 结尾的 URL）：`img/a.png` 从那里显示，并按 `img/a.png` 保存回去，`../a.png` 亦然。 |
| `link-base` | `string` | 预览中相对链接的基准。 |
| `linkSuggest` | `(query) => items` | 输入 `[[` 时提供的候选（内部链接）：`{ label, insert, detail? }[]` 或返回它们的 Promise；选中后写入 `[[insert]]`。未设置则不显示列表。 |
| `saveImage` | `(file) => path` | 粘贴、拖放或通过工具栏图片按钮选择的图片：由宿主保存该 `File` 并返回 Markdown 中使用的路径（或其 Promise；`null` 表示跳过）；在光标处写入 `![名称](路径)`。未设置则不接受图片。 |

TeX 公式（`$…$`、`$$…$$`）和 `==高亮==` 在可视模式下以渲染后的形式显示（需要 `@dskripchenko/ui` 1.26 和 `@dskripchenko/wysiwyg` 0.10 或更高版本）：公式是一个整体——双击可编辑其 TeX，斜杠菜单中的**公式**可插入新公式——Markdown 按原样保存；源码中的 TeX 会被高亮。

文档开头的 YAML front matter（文档属性）按原样保存；`#标签` 在可视模式下显示为标签（需要 `@dskripchenko/ui` 1.27 和 `@dskripchenko/wysiwyg` 0.11）。

事件：`update:modelValue` 和 `change`，参数为 Markdown——仅在编辑文档时触发，加载时不会。`update:mode`。

对外提供：`focus()`、`insert(markdown)`（插入到光标处；可视模式下已格式化）、`value`。

## 原地编辑

在页面原处编辑——文本看起来就是页面，格式由选区上方的工具条提供：

```vue
<MarkdownEditor v-model="text" frameless bubble :toolbar="false" :mode-switch="false" />
```

工具条的外观通过编辑器的 `--dsk-wysiwyg-bubble-*` 变量设置。

## 往返转换

Markdown 被渲染为编辑器的 HTML，再从中写回。第一次往返会把文档变为规范形式——无序列表用 `-`，强调用 `**` 和 `*`，标题用 `#`，列表项重新编号——之后的每次往返都保持不变。只有在字符会被当作标记时才转义：`1.5`、`a-b`、`(净额)` 保持原样。

任务列表 `- [ ]` / `- [x]` 以带复选框的列表形式编辑：点击复选框即可勾选，在条目开头输入 `[ ] ` 或 `[x] ` 会把它变为任务，在任务后按回车会新建一个未勾选的任务（需要 `@dskripchenko/wysiwyg` 0.13 及以上；较旧版本会按原样保留）。

可视编辑器无法表示的内容会**按原样**保留：

- 标题 `####`、`#####`、`######`；
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

`toMarkdown` 需要 DOM（浏览器或 jsdom）。两者都接受 `{ imageBase }`：相对图片在显示时被解析，输出时再还原为相对路径。
