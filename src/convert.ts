/**
 * Markdown ↔ the editor's HTML.
 *
 * `fromMarkdown` renders Markdown with the kit's renderer into the HTML the
 * WYSIWYG editor edits; `toMarkdown` writes the editor's HTML back with the
 * editor's own converter. What the editor cannot hold — headings below h3,
 * task lists, callouts, HTML blocks, footnotes, reference-style links — is
 * kept as a source block: a code block of the language {@link SOURCE_LANG}
 * that shows the Markdown as written and comes back out byte for byte.
 *
 * The first round normalises the document (list markers, emphasis markers,
 * spacing); every later round changes nothing.
 */
import { renderMarkdown } from '@dskripchenko/ui'
import { htmlToMarkdown } from '@dskripchenko/wysiwyg'

/** The code-block language of Markdown kept as written. */
export const SOURCE_LANG = 'x-markdown'

export interface MarkdownBlock {
  /** `source` — kept as written; `markdown` — edited in the editor. */
  kind: 'markdown' | 'source'
  text: string
}

const FENCE = /^\s{0,3}(`{3,}|~{3,})/
const LIST_ITEM = /^(\s*)([-*+]|\d+[.)])\s+/
const TASK_ITEM = /^\s*([-*+]|\d+[.)])\s+\[[ xX]\]\s/
const HTML_BLOCK = /^\s{0,3}<(?:[A-Za-z][\w-]*[\s/>]|[A-Za-z][\w-]*$|\/[A-Za-z]|!--)/
const FOOTNOTE = /^\s{0,3}\[\^[^\]]+\]:/
const LINK_DEFINITION = /^\s{0,3}\[[^\]^][^\]]*\]:\s*\S/
const REFERENCE = /\]\[[^\]]*\]|\[[^\]]+\]\[\]/

/**
 * The document in top-level blocks, each marked as edited in the editor or
 * kept as written. Blank lines between blocks belong to no block.
 */
export function splitBlocks(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n')
  const blocks: { lines: string[]; source: boolean }[] = []
  let i = 0
  const take = (from: number, to: number, source: boolean): void => {
    blocks.push({ lines: lines.slice(from, to), source })
  }
  while (i < lines.length) {
    const line = lines[i] ?? ''
    if (line.trim() === '') {
      i++
      continue
    }
    const start = i
    const fence = FENCE.exec(line)
    if (fence) {
      const marker = fence[1] ?? '```'
      const indent = line.length - line.trimStart().length
      i++
      while (i < lines.length) {
        const l = lines[i] ?? ''
        const t = l.trim()
        i++
        // The same character, at least as long, at most three spaces deeper than the opening fence.
        if (l.length - l.trimStart().length <= indent + 3 && t.length >= marker.length && t[0] === marker[0] && /^(`+|~+)$/.test(t)) break
      }
      take(start, i, false)
      continue
    }
    if (LIST_ITEM.test(line)) {
      // A list runs over its items, their indented lines and blank lines inside it.
      i++
      while (i < lines.length) {
        const l = lines[i] ?? ''
        if (l.trim() === '') {
          const next = lines[i + 1] ?? ''
          if (next.trim() !== '' && (LIST_ITEM.test(next) || /^\s{2,}\S/.test(next))) {
            i++
            continue
          }
          break
        }
        if (LIST_ITEM.test(l) || /^\s{2,}\S/.test(l)) {
          i++
          continue
        }
        break
      }
      const block = lines.slice(start, i)
      take(start, i, block.some((l) => TASK_ITEM.test(l)) || block.some((l) => REFERENCE.test(l)))
      continue
    }
    if (/^\s{0,3}>/.test(line)) {
      i++
      while (i < lines.length && /^\s{0,3}>/.test(lines[i] ?? '')) i++
      const block = lines.slice(start, i)
      take(start, i, /^\s{0,3}>\s*\[![A-Za-z]+\]/.test(line) || block.some((l) => REFERENCE.test(l)))
      continue
    }
    if (/^\s{0,3}#{4,6}(\s|$)/.test(line)) {
      take(start, ++i, true)
      continue
    }
    if (FOOTNOTE.test(line) || LINK_DEFINITION.test(line)) {
      i++
      while (i < lines.length && (/^\s{2,}\S/.test(lines[i] ?? '') || FOOTNOTE.test(lines[i] ?? '') || LINK_DEFINITION.test(lines[i] ?? ''))) i++
      take(start, i, true)
      continue
    }
    if (HTML_BLOCK.test(line)) {
      i++
      while (i < lines.length && (lines[i] ?? '').trim() !== '') i++
      take(start, i, true)
      continue
    }
    // A paragraph (or a heading, a table, a rule): up to a blank line or the start of another block.
    i++
    if (!/^\s{0,3}#{1,3}\s/.test(line)) {
      while (i < lines.length) {
        const l = lines[i] ?? ''
        if (l.trim() === '' || FENCE.test(l) || /^\s{0,3}(#{1,6}\s|>)/.test(l) || (LIST_ITEM.test(l) && !/^\s*\d+[.)]/.test(l)) || HTML_BLOCK.test(l)) break
        i++
      }
    }
    const block = lines.slice(start, i)
    take(start, i, block.some((l) => REFERENCE.test(l)) || block.some((l) => /\[\^[^\]]+\]/.test(l)))
  }
  return blocks.map((b) => ({ kind: b.source ? 'source' : 'markdown', text: b.lines.join('\n') }))
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Where the document's relative pictures resolve while it is edited. */
export interface ConvertOptions {
  /** A folder URL (ending in `/`): `img/a.png` shows as `<imageBase>img/a.png` and is saved back as `img/a.png`. */
  imageBase?: string | null
}

/**
 * A URL back to a path relative to `base`, when both share the origin:
 * `<base>img/a.png` → `img/a.png`, `<base's parent>up.png` → `../up.png`.
 * Anything else stays as it is.
 */
export function relativeTo(url: string, base: string): string {
  // A base without a scheme (`/media/`, `docs/`) is resolved on a placeholder origin, the URL against it.
  const PLACEHOLDER = 'http://base.invalid/'
  let u: URL
  let b: URL
  try {
    b = new URL(base, PLACEHOLDER)
    u = new URL(url, b)
  } catch {
    return url
  }
  // By scheme and host: `origin` is "null" for schemes of an app's own (folio:, app:).
  if (u.protocol !== b.protocol || u.host !== b.host) return url
  const from = b.pathname.split('/').slice(0, -1)
  const to = u.pathname.split('/')
  let i = 0
  while (i < from.length && i < to.length - 1 && from[i] === to[i]) i++
  if (i === 0 && from.length > 1) return url
  const rel = [...Array(from.length - i).fill('..'), ...to.slice(i)].join('/')
  return decodeURI(rel) + u.search + u.hash
}

/** Markdown → the HTML the editor edits; source blocks become code blocks of {@link SOURCE_LANG}. */
export function fromMarkdown(markdown: string, options: ConvertOptions = {}): string {
  const out: string[] = []
  let pending: string[] = []
  const flush = (): void => {
    if (pending.length) out.push(renderMarkdown(pending.join('\n\n'), options.imageBase ? { imageBase: options.imageBase } : {}))
    pending = []
  }
  for (const block of splitBlocks(markdown)) {
    if (block.kind === 'markdown') {
      pending.push(block.text)
      continue
    }
    flush()
    out.push(`<pre><code class="language-${SOURCE_LANG}">${escapeHtml(block.text)}</code></pre>`)
  }
  flush()
  return out.join('\n')
}

const SOURCE_FENCE = new RegExp(`^(\`{3,})${SOURCE_LANG}\\n([\\s\\S]*?)\\n\\1$`, 'gm')

/** The editor's HTML → Markdown; source blocks come back as written, pictures by their relative paths. */
export function toMarkdown(html: string, options: ConvertOptions = {}): string {
  const base = options.imageBase
  const relative = base
    ? html.replace(/(<img\b[^>]*?\ssrc=")([^"]*)(")/gi, (_m, head: string, src: string, tail: string) => {
        const url = src.replace(/&amp;/g, '&')
        return head + relativeTo(url, base).replace(/&/g, '&amp;') + tail
      })
    : html
  const md = htmlToMarkdown(relative).replace(SOURCE_FENCE, (_m, _fence: string, text: string) => text)
  return md === '' ? '' : `${md}\n`
}

/** One round: what saving a document unchanged in the editor gives. */
export function normalize(markdown: string, options: ConvertOptions = {}): string {
  return toMarkdown(fromMarkdown(markdown, options), options)
}
