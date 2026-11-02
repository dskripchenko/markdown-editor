/**
 * Suggesting internal links as `[[` is typed: in the Markdown source (a text
 * field) or in the visual editor (contenteditable). The host says what there
 * is to link to (`linkSuggest`); a choice is written as `[[name]]`.
 */
import { reactive } from 'vue'

export interface LinkSuggestion {
  /** What the list shows. */
  label: string
  /** What goes between the brackets. */
  insert: string
  /** A second line: the folder, say. */
  detail?: string
}

export type LinkSuggest = (query: string) => LinkSuggestion[] | Promise<LinkSuggestion[]>

/** `[[` and what was typed after it, right before the caret. */
const OPEN = /\[\[([^\]\n|#]*)$/

interface Context {
  /** Where the `[[` starts, and where the caret is. */
  start: number
  end: number
  field: HTMLTextAreaElement | null
  node: Text | null
}

/** Where a position of a text field is on the screen: a copy of the field laid out the same way. */
function caretRect(area: HTMLTextAreaElement, pos: number): DOMRect {
  const style = getComputedStyle(area)
  const mirror = document.createElement('div')
  for (const p of ['font', 'letterSpacing', 'lineHeight', 'padding', 'border', 'boxSizing', 'tabSize', 'textIndent', 'wordSpacing'] as const) mirror.style[p] = style[p]
  const box = area.getBoundingClientRect()
  Object.assign(mirror.style, { position: 'fixed', left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px`, overflow: 'hidden', whiteSpace: 'pre-wrap', overflowWrap: 'break-word', visibility: 'hidden' })
  const mark = document.createElement('span')
  mark.textContent = '​'
  mirror.append(area.value.slice(0, pos), mark)
  document.body.append(mirror)
  mirror.scrollTop = area.scrollTop
  const rect = mark.getBoundingClientRect()
  mirror.remove()
  return rect
}

export function useLinkSuggest(source: () => LinkSuggest | undefined, write: (field: HTMLTextAreaElement) => void) {
  const state = reactive({ open: false, items: [] as LinkSuggestion[], index: 0, left: 0, top: 0 })
  let context: Context | null = null
  let ask = 0

  const close = (): void => {
    state.open = false
    context = null
  }

  /** After typing or moving the caret: what is before it opens, updates or closes the list. */
  async function check(field: HTMLTextAreaElement | null): Promise<void> {
    const suggest = source()
    if (!suggest) return close()
    let before: string
    let rect: DOMRect
    let ctx: Context
    if (field) {
      if (field.selectionStart !== field.selectionEnd) return close()
      before = field.value.slice(0, field.selectionStart)
      const m = OPEN.exec(before)
      if (!m) return close()
      ctx = { start: field.selectionStart - m[1]!.length - 2, end: field.selectionStart, field, node: null }
      rect = caretRect(field, field.selectionStart)
    } else {
      const sel = getSelection()
      if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return close()
      const range = sel.getRangeAt(0)
      const node = range.startContainer
      if (node.nodeType !== Node.TEXT_NODE) return close()
      before = (node as Text).data.slice(0, range.startOffset)
      const m = OPEN.exec(before)
      if (!m) return close()
      ctx = { start: range.startOffset - m[1]!.length - 2, end: range.startOffset, field: null, node: node as Text }
      rect = range.getClientRects()[0] ?? range.getBoundingClientRect()
    }
    const query = OPEN.exec(before)![1]!
    const asked = ++ask
    const items = (await suggest(query)).slice(0, 12)
    if (asked !== ask) return
    context = ctx
    state.items = items
    state.index = 0
    state.left = Math.min(rect.left, window.innerWidth - 320)
    state.top = rect.bottom + 4
    state.open = items.length > 0
  }

  /** Written as `[[name]]` in place of `[[` and what was typed (a closing `]]` already there is reused). */
  function choose(index: number): void {
    const item = state.items[index]
    const ctx = context
    close()
    if (!item || !ctx) return
    const text = `[[${item.insert}]]`
    if (ctx.field) {
      const f = ctx.field
      const end = f.value.startsWith(']]', ctx.end) ? ctx.end + 2 : ctx.end
      f.focus()
      f.setRangeText(text, ctx.start, end, 'end')
      write(f)
    } else if (ctx.node) {
      const range = document.createRange()
      const end = ctx.node.data.startsWith(']]', ctx.end) ? ctx.end + 2 : ctx.end
      range.setStart(ctx.node, ctx.start)
      range.setEnd(ctx.node, Math.min(end, ctx.node.length))
      const sel = getSelection()!
      sel.removeAllRanges()
      sel.addRange(range)
      document.execCommand('insertText', false, text)
    }
  }

  /** Keys while the list is open: arrows choose, Enter or Tab take it, Escape closes. True when the key was the list's. */
  function key(e: KeyboardEvent): boolean {
    if (!state.open) return false
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      state.index = (state.index + (e.key === 'ArrowDown' ? 1 : state.items.length - 1)) % state.items.length
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      choose(state.index)
    } else if (e.key === 'Escape') {
      close()
    } else return false
    e.preventDefault()
    e.stopPropagation()
    return true
  }

  return { state, check, choose, key, close }
}
