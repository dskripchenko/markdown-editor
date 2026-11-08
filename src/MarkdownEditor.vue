<script setup lang="ts">
import { computed, h, nextTick, onBeforeUnmount, ref, watch, type VNode } from 'vue'
import { tokenize, UidMarkdown, useLocale } from '@dskripchenko/ui'
import { DskWysiwyg } from '@dskripchenko/wysiwyg'
import { fromMarkdown, toMarkdown } from './convert'
import { labelsFor, type MarkdownEditorLabels, type MarkdownEditorLocale } from './locale'
import { useLinkSuggest, type LinkSuggest } from './linkSuggest'
import { carriesFiles, imageFiles, imageMarkdown, type SaveImage } from './images'
import './style.css'

export type MarkdownEditorMode = 'visual' | 'source' | 'split'

type BlockRenderers = InstanceType<typeof DskWysiwyg>['$props']['blockRenderers']
type ToolbarItems = InstanceType<typeof DskWysiwyg>['$props']['toolbarItems']
type SlashCommands = InstanceType<typeof DskWysiwyg>['$props']['slashCommands']
type ToolbarItem = NonNullable<ToolbarItems>[number]

const props = withDefaults(defineProps<{
  modelValue?: string
  modes?: MarkdownEditorMode[]
  placeholder?: string
  readonly?: boolean
  minHeight?: string
  maxHeight?: string
  blockRenderers?: BlockRenderers
  toolbarItems?: ToolbarItems
  /** Where the visual mode's toolbar is shown instead of above the text (an element or a CSS selector): the host's own bar. */
  toolbarTarget?: string | HTMLElement
  /** The mode buttons above the editor; off when the host switches modes itself (`v-model:mode`). */
  modeSwitch?: boolean
  /** The visual mode's toolbar above the text; off when formatting comes from the bubble or the host. */
  toolbar?: boolean
  /**
   * The visual mode's small toolbar floating above a selection: `true` for
   * the default set, or the items to show (`@dskripchenko/wysiwyg` 0.15+).
   */
  bubble?: ToolbarItem[] | boolean
  /**
   * No frame: the visual editor, the mode buttons and the source drop their
   * borders and backgrounds, so the page around shows through
   * (`@dskripchenko/wysiwyg` 0.15+ for the visual editor).
   */
  frameless?: boolean
  slashCommands?: SlashCommands
  locale?: MarkdownEditorLocale
  labels?: Partial<MarkdownEditorLabels>
  /** The folder relative pictures resolve against (a URL ending in `/`); saved back relative. */
  imageBase?: string
  /** The base of relative links in the preview. */
  linkBase?: string
  /** What `[[` offers to link to, as it is typed (internal links); none: no list. */
  linkSuggest?: LinkSuggest
  /** Saves a picture pasted, dropped or chosen with the image button; gives its path for the Markdown. None: pictures are not taken. */
  saveImage?: SaveImage
}>(), {
  modelValue: '',
  modes: () => ['visual', 'source', 'split'],
  placeholder: undefined,
  readonly: false,
  minHeight: '240px',
  maxHeight: undefined,
  blockRenderers: undefined,
  toolbarItems: undefined,
  toolbarTarget: undefined,
  modeSwitch: true,
  toolbar: true,
  bubble: false,
  frameless: false,
  slashCommands: undefined,
  locale: undefined,
  labels: undefined,
  imageBase: undefined,
  linkBase: undefined,
  linkSuggest: undefined,
  saveImage: undefined,
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
/** Only what is switched on goes to the visual editor: an older one would show the rest as attributes. */
const inPlace = computed<Record<string, unknown>>(() => ({
  ...(props.bubble !== false ? { bubble: props.bubble } : {}),
  ...(props.frameless ? { frameless: true } : {}),
}))
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
  void links.check(event.target as HTMLTextAreaElement)
}

// Internal links: `[[` and a few letters offer the host's documents.
const links = useLinkSuggest(() => props.linkSuggest, (field) => commit(field.value))

function onVisualInput(): void {
  if (props.linkSuggest) void links.check(null)
}

// The source highlighted: a copy of the text in colour over the field, the field's own
// text transparent — its caret, selection and undo stay the browser's. The copy takes the
// field's look as it is drawn, so a host that styles the field keeps its style.
/** Past this size the source is plain: tokenizing it on every key would lag. */
const HIGHLIGHT_LIMIT = 300_000
const shade = ref<HTMLElement | null>(null)
const highlighted = computed(() => markdown.value.length <= HIGHLIGHT_LIMIT)
const Highlighted = (): (VNode | string)[] =>
  tokenize(markdown.value + '\n', 'markdown').map((t) => (t.type === 'plain' ? t.text : h('span', { class: `uid-code__tok--${t.type}` }, t.text)))
let observer: ResizeObserver | null = null

function placeShade(): void {
  const ta = area.value
  const pre = shade.value
  if (!ta || !pre) return
  const s = getComputedStyle(ta)
  for (const p of ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'wordSpacing', 'tabSize', 'textIndent', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'] as const) pre.style[p] = s[p]
  // The copy is as wide as the field's text area: its scrollbar takes width the copy must not use.
  pre.style.left = `${ta.offsetLeft}px`
  pre.style.top = `${ta.offsetTop}px`
  pre.style.width = `${ta.clientWidth + parseFloat(s.borderLeftWidth) + parseFloat(s.borderRightWidth)}px`
  pre.style.height = `${ta.clientHeight + parseFloat(s.borderTopWidth) + parseFloat(s.borderBottomWidth)}px`
  pre.scrollTop = ta.scrollTop
}

function syncShade(): void {
  if (shade.value && area.value) shade.value.scrollTop = area.value.scrollTop
}

watch([area, shade], ([ta]) => {
  observer?.disconnect()
  observer = null
  if (!ta) return
  // Where there is no layout (a test's DOM, server rendering), there is nothing to follow.
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => placeShade())
    observer.observe(ta)
  }
  void nextTick(placeShade)
})
watch(markdown, () => void nextTick(syncShade))
onBeforeUnmount(() => observer?.disconnect())

function setMode(next: MarkdownEditorMode): void {
  if (next === mode.value) return
  // Back to the visual editor: it starts from the Markdown as it is now.
  if (next === 'visual') html.value = fromMarkdown(markdown.value, options.value)
  mode.value = next
}

/** Text that reads as Markdown: pasted into the visual editor, it arrives formatted. */
const MARKDOWN_HINT = /(^|\n)\s{0,3}(#{1,6}\s|[-*+]\s|\d+[.)]\s|>|```|~~~|\|.*\|)|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`/

function onPaste(event: ClipboardEvent): void {
  if (takeImages(event, event.clipboardData)) return
  if (props.readonly || mode.value !== 'visual') return
  const data = event.clipboardData
  if (!data || data.types.includes('text/html')) return
  const text = data.getData('text/plain')
  if (!text || !MARKDOWN_HINT.test(text)) return
  event.preventDefault()
  event.stopPropagation()
  document.execCommand('insertHTML', false, fromMarkdown(text, options.value))
}

/** Pictures in a paste or a drop: saved by the host and written where the caret is. True when taken. */
function takeImages(event: Event, data: DataTransfer | null): boolean {
  if (props.readonly || !props.saveImage) return false
  const files = imageFiles(data)
  if (files.length === 0) return false
  event.preventDefault()
  event.stopPropagation()
  void addImages(files)
  return true
}

function onDragOver(event: DragEvent): void {
  if (props.readonly || !props.saveImage || !carriesFiles(event.dataTransfer)) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
}

function onDrop(event: DragEvent): void {
  if (props.readonly || !props.saveImage || imageFiles(event.dataTransfer).length === 0) return
  // The caret where the pictures were dropped (in the source, where the browser can tell).
  if (mode.value === 'visual') {
    const range = document.caretRangeFromPoint?.(event.clientX, event.clientY)
    const sel = window.getSelection()
    if (range && sel) {
      sel.removeAllRanges()
      sel.addRange(range)
    }
  } else if (area.value) {
    const at = document.caretPositionFromPoint?.(event.clientX, event.clientY)
    if (at && at.offsetNode === area.value) area.value.setSelectionRange(at.offset, at.offset)
  }
  takeImages(event, event.dataTransfer)
}

/** The toolbar's image button: the pictures chosen from the disk. */
function pickImages(): void {
  if (props.readonly || !props.saveImage) return
  const sel = window.getSelection()
  const kept = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.addEventListener('change', () => {
    const files = Array.from(input.files ?? [])
    if (files.length === 0) return
    if (kept && sel) {
      sel.removeAllRanges()
      sel.addRange(kept)
    }
    void addImages(files)
  })
  input.click()
}

async function addImages(files: File[]): Promise<void> {
  const written: string[] = []
  for (const file of files) {
    const path = await props.saveImage?.(file)
    if (path) written.push(imageMarkdown(file, path))
  }
  if (written.length === 0) return
  if (mode.value !== 'visual') {
    insert(written.join('\n'))
    return
  }
  // Into the paragraph at the caret, not as a paragraph of its own.
  wysiwyg.value?.controller?.chain().focus().run()
  const html = written.map((md) => fromMarkdown(md, options.value).replace(/^<p>([\s\S]*)<\/p>\s*$/, '$1')).join('<br>')
  document.execCommand('insertHTML', false, html)
}

function onTab(event: KeyboardEvent): void {
  if (links.key(event)) return
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
    :class="[`dsk-md--${mode}`, { 'dsk-md--readonly': readonly, 'dsk-md--frameless': frameless }]"
    :style="{ '--dsk-md-min-h': minHeight, '--dsk-md-max-h': maxHeight }"
  >
    <div
      v-if="modeSwitch && modes.length > 1"
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
      @dragover.capture="onDragOver"
      @drop.capture="onDrop"
      @input="onVisualInput"
      @keydown.capture="links.key"
      @focusout="links.close"
    >
      <DskWysiwyg
        ref="wysiwyg"
        v-bind="inPlace"
        :model-value="html"
        :placeholder="placeholder"
        :readonly="readonly"
        :min-height="minHeight"
        :max-height="maxHeight"
        :block-renderers="blockRenderers"
        :toolbar="toolbar"
        :toolbar-items="toolbarItems"
        :toolbar-target="toolbarTarget"
        :slash-commands="slashCommands"
        :locale="locale"
        @update:model-value="onHtml"
        @image-request="pickImages"
      />
    </div>

    <div
      v-else
      class="dsk-md__panes"
    >
      <pre
        v-if="highlighted"
        ref="shade"
        class="dsk-md__shade"
        aria-hidden="true"
      ><Highlighted /></pre>
      <textarea
        ref="area"
        class="dsk-md__source"
        :class="{ 'dsk-md__source--shaded': highlighted }"
        :value="markdown"
        :placeholder="placeholder"
        :readonly="readonly"
        :aria-label="t.source"
        spellcheck="false"
        @input="onSource"
        @keydown="onTab"
        @scroll="syncShade"
        @blur="links.close"
        @paste="onPaste"
        @dragover="onDragOver"
        @drop="onDrop"
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
    <Teleport to="body">
      <ul
        v-if="links.state.open"
        class="dsk-md__suggest"
        role="listbox"
        :style="{ left: `${links.state.left}px`, top: `${links.state.top}px` }"
      >
        <li
          v-for="(item, i) in links.state.items"
          :key="item.insert"
          role="option"
          :aria-selected="i === links.state.index"
          @mousedown.prevent="links.choose(i)"
        >
          <span class="dsk-md__suggest-label">{{ item.label }}</span>
          <span
            v-if="item.detail"
            class="dsk-md__suggest-detail"
          >{{ item.detail }}</span>
        </li>
      </ul>
    </Teleport>
  </div>
</template>
