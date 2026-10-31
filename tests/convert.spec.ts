import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '@dskripchenko/ui'
import { fromMarkdown, normalize, splitBlocks, toMarkdown } from '../src/convert'

const textOf = (md: string): string => {
  const div = document.createElement('div')
  div.innerHTML = renderMarkdown(md)
  return (div.textContent ?? '').replace(/\s+/g, ' ').trim()
}

describe('blocks', () => {
  it('keeps what the editor cannot hold as source', () => {
    const md = [
      '# Title', '', 'Text with **bold**.', '', '#### Small heading', '',
      '- [ ] a task', '- [x] done', '', '> [!NOTE]', '> A callout', '',
      '<details>', '<summary>More</summary>', '</details>', '',
      'A [reference][ref] link.', '', '[ref]: https://example.com', '',
      'A footnote[^1].', '', '[^1]: The note.', '', '- plain', '- list',
    ].join('\n')
    expect(splitBlocks(md).map((b) => `${b.kind}:${b.text.split('\n')[0]}`)).toEqual([
      'markdown:# Title', 'markdown:Text with **bold**.', 'source:#### Small heading', 'source:- [ ] a task',
      'source:> [!NOTE]', 'source:<details>', 'source:A [reference][ref] link.', 'source:[ref]: https://example.com',
      'source:A footnote[^1].', 'source:[^1]: The note.', 'markdown:- plain',
    ])
  })

  it('a fence holds its blank lines and markup', () => {
    expect(splitBlocks('```md\n# not a heading\n\n- [ ] not a task\n```\n\nafter')).toEqual([
      { kind: 'markdown', text: '```md\n# not a heading\n\n- [ ] not a task\n```' },
      { kind: 'markdown', text: 'after' },
    ])
  })
})

describe('round trip', () => {
  it('source blocks come back byte for byte, edited ones in canonical form', () => {
    const md = '# Plan\n\n* one\n* two\n\n__bold__ text\n\n- [ ] keep **this** as is\n- [x] done\n\n> [!WARNING]\n> Careful *here*'
    expect(normalize(md)).toBe('# Plan\n\n- one\n- two\n\n**bold** text\n\n- [ ] keep **this** as is\n- [x] done\n\n> [!WARNING]\n> Careful *here*\n')
  })

  it('an empty document', () => {
    expect(normalize('')).toBe('')
    expect(toMarkdown('')).toBe('')
  })

  it('source blocks reach the editor as code of their own language', () => {
    expect(fromMarkdown('#### h4')).toBe('<pre><code class="language-x-markdown">#### h4</code></pre>')
  })
})

describe('corpus: real documents', () => {
  const dir = join(import.meta.dirname, 'corpus')
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
    it(file, () => {
      const source = readFileSync(join(dir, file), 'utf8')
      const once = normalize(source)
      expect(normalize(once)).toBe(once)
      expect(textOf(once)).toBe(textOf(source))
    })
  }
})
