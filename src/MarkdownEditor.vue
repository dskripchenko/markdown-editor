<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { UidMarkdown, useLocale } from '@dskripchenko/ui'
import { DskWysiwyg } from '@dskripchenko/wysiwyg'
import { fromMarkdown, toMarkdown } from './convert'
import { labelsFor, type MarkdownEditorLabels, type MarkdownEditorLocale } from './locale'
import './style.css'

export type MarkdownEditorMode = 'visual' | 'source' | 'split'

type BlockRenderers = InstanceType<typeof DskWysiwyg>['$props']['blockRenderers']
type ToolbarItems = InstanceType<typeof DskWysiwyg>['$props']['toolbarItems']
type SlashCommands = InstanceType<typeof DskWysiwyg>['$props']['slashCommands']

const props = withDefaults(defineProps<{
  modelValue?: string
  modes?: MarkdownEditorMode[]
  placeholder?: string
  readonly?: boolean
  minHeight?: string
  maxHeight?: string
  blockRenderers?: BlockRenderers
  toolbarItems?: ToolbarItems
  slashCommands?: SlashCommands
  locale?: MarkdownEditorLocale
  labels?: Partial<MarkdownEditorLabels>
  /** The folder relative pictures resolve against (a URL ending in `/`); saved back relative. */
  imageBase?: string
  /** The base of relative links in the preview. */
  linkBase?: string
}>(), {
  modelValue: '',
  modes: () => ['visual', 'source', 'split'],
  placeholder: undefined,
  readonly: false,
  minHeight: '240px',
  maxHeight: undefined,
  blockRenderers: undefined,
  toolbarItems: undefined,
  slashCommands: undefined,
  locale: undefined,
  labels: undefined,
  imageBase: undefined,
  linkBase: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [markdown: string]
  change: [markdown: string]
}>()

const mode = defineModel<MarkdownEditorMode>('mode', { default: 'visual' })

const kitLocale = useLocale()
const t = computed<MarkdownEditorLabels>(() => ({ ...labelsFor(props.locale ?? kitLocale.value.code), ...props.labels }))

// The Markdown the editor stands on, and the HTML the visual mode edits.
const options = computed(() => ({ imageBase: props.imageBase ?? null }))
const markdown = ref(props.modelValue)
const html = ref(fromMarkdown(props.modelValue, options.value))
const wysiwyg = ref<InstanceType<typeof DskWysiwyg> | null>(null)
const area = ref<HTMLTextAreaElement | null>(null)

watch(() => props.modelValue, (next) => {
  if (next === markdown.value) return
  markdown.value = next
  html.value = fromMarkdown(next, options.value)
})

// A new base (the document moved): draw the pictures from it.
watch(() => props.imageBase, () => {
  html.value = fromMarkdown(markdown.value, options.value)
})

function commit(next: string): void {
  if (next === markdown.value) return
  markdown.value = next
  emit('update:modelValue', next)
  emit('change', next)
}

function onHtml(next: string): void {
  html.value = next
  commit(toMarkdown(next, options.value))
}

function onSource(event: Event): void {
  commit((event.target as HTMLTextAreaElement).value)
}

function setMode(next: MarkdownEditorMode): void {
  if (next === mode.value) return
  // Back to the visual editor: it starts from the Markdown as it is now.
  if (next === 'visual') html.value = fromMarkdown(markdown.value, options.value)
  mode.value = next
}

/** Text that reads as Markdown: pasted into the visual editor, it arrives formatted. */
const MARKDOWN_HINT = /(^|\n)\s{0,3}(#{1,6}\s|[-*+]\s|\d+[.)]\s|>|```|~~~|\|.*\|)|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`/

function onPaste(event: ClipboardEvent): void {
  if (props.readonly || mode.value !== 'visual') return
  const data = event.clipboardData
  if (!data || data.types.includes('text/html')) return
  const text = data.getData('text/plain')
  if (!text || !MARKDOWN_HINT.test(text)) return
  event.preventDefault()
  event.stopPropagation()
  document.execCommand('insertHTML', false, fromMarkdown(text, options.value))
}

function onTab(event: KeyboardEvent): void {
  if (event.key !== 'Tab' || event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return
  event.preventDefault()
  const el = event.target as HTMLTextAreaElement
  el.setRangeText('  ', el.selectionStart, el.selectionEnd, 'end')
  commit(el.value)
}

/** Focus the editor of the current mode. */
function focus(): void {
  if (mode.value === 'visual') wysiwyg.value?.controller?.chain().focus().run()
  else area.value?.focus()
}

/** Insert Markdown at the caret (the source's caret in the Markdown modes). */
function insert(text: string): void {
  if (mode.value === 'visual') {
    focus()
    document.execCommand('insertHTML', false, fromMarkdown(text, options.value))
    return
  }
  const el = area.value
  if (!el) return
  el.focus()
  el.setRangeText(text, el.selectionStart, el.selectionEnd, 'end')
  commit(el.value)
}

defineExpose({ focus, insert, get value() { return markdown.value } })
</script>

<template>
  <div
    class="dsk-md"
    :class="[`dsk-md--${mode}`, { 'dsk-md--readonly': readonly }]"
    :style="{ '--dsk-md-min-h': minHeight, '--dsk-md-max-h': maxHeight }"
  >
    <div
      v-if="modes.length > 1"
      class="dsk-md__modes"
      role="group"
      :aria-label="t.modes"
    >
      <button
        v-for="m in modes"
        :key="m"
        type="button"
        class="dsk-md__mode"
        :class="{ 'dsk-md__mode--on': m === mode }"
        :aria-pressed="m === mode"
        @click="setMode(m)"
      >
        {{ t[m] }}
      </button>
    </div>

    <div
      v-if="mode === 'visual'"
      class="dsk-md__visual"
      :data-source-label="t.sourceBlock"
      @paste.capture="onPaste"
    >
      <DskWysiwyg
        ref="wysiwyg"
        :model-value="html"
        :placeholder="placeholder"
        :readonly="readonly"
        :min-height="minHeight"
        :max-height="maxHeight"
        :block-renderers="blockRenderers"
        :toolbar-items="toolbarItems"
        :slash-commands="slashCommands"
        :locale="locale"
        @update:model-value="onHtml"
      />
    </div>

    <div
      v-else
      class="dsk-md__panes"
    >
      <textarea
        ref="area"
        class="dsk-md__source"
        :value="markdown"
        :placeholder="placeholder"
        :readonly="readonly"
        :aria-label="t.source"
        spellcheck="false"
        @input="onSource"
        @keydown="onTab"
      />
      <div
        v-if="mode === 'split'"
        class="dsk-md__preview"
        :aria-label="t.preview"
      >
        <UidMarkdown
          :source="markdown"
          :block-renderers="blockRenderers"
          :image-base="imageBase"
          :link-base="linkBase"
        />
      </div>
    </div>
  </div>
</template>
