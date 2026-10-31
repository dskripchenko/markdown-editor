import { createApp, defineComponent, h, ref } from 'vue'
import '@dskripchenko/ui/styles/all.css'
import '@dskripchenko/wysiwyg/style.css'
import { MarkdownEditor, type MarkdownEditorMode } from '../src'

const SAMPLE = `# Release notes

Version **3.1** of the payment platform — see the [changelog](https://example.com/changelog "Changelog").

## What changed

- Instant payments by QR
- Partial refunds over the API
  - up to the remaining amount

| Method | Fee |
| :--- | ---: |
| Card | 1.9% |
| QR | 0.4% |

\`\`\`js
const fee = amount * 0.004
\`\`\`

#### Kept as written

- [x] Release notes
- [ ] Customer email

> [!NOTE]
> Watchers get no notification.
`

const App = defineComponent({
  setup() {
    const value = ref(SAMPLE)
    const mode = ref<MarkdownEditorMode>('visual')
    ;(window as unknown as { __md: () => string }).__md = () => value.value
    return () => h('div', [
      h(MarkdownEditor, { id: 'editor', modelValue: value.value, 'onUpdate:modelValue': (v: string) => (value.value = v), mode: mode.value, 'onUpdate:mode': (m: MarkdownEditorMode) => (mode.value = m), minHeight: '320px' }),
      h('h3', 'Value'),
      h('pre', { id: 'out' }, value.value),
    ])
  },
})

createApp(App).mount('#app')
