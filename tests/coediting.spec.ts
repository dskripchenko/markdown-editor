import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { DskWysiwyg } from '@dskripchenko/wysiwyg'
import { MarkdownEditor } from '../src'
import { shiftPosition } from '../src/coediting'

afterEach(() => {
  document.body.innerHTML = ''
})

function caretIn(node: Node, offset: number): void {
  const range = document.createRange()
  range.setStart(node, offset)
  range.collapse(true)
  const sel = window.getSelection()!
  sel.removeAllRanges()
  sel.addRange(range)
}

describe('shiftPosition', () => {
  it('keeps a position before the change and shifts one after it', () => {
    expect(shiftPosition('hello world', 'hello big world', 3)).toBe(3)
    expect(shiftPosition('hello world', 'hello big world', 8)).toBe(12)
    expect(shiftPosition('hello world', 'world', 8)).toBe(2)
  })

  it('puts a position inside the changed span at the end of what replaced it', () => {
    expect(shiftPosition('abcdef', 'abXYZef', 3)).toBe(5)
    expect(shiftPosition('abc', 'abc', 2)).toBe(2)
    expect(shiftPosition('abc', '', 2)).toBe(0)
  })
})

describe('co-editing', () => {
  it('passes the bubble actions, the block handles and the remote carets to the visual editor', async () => {
    const actions = [{ key: 'comment', label: 'Comment', run: () => undefined }]
    const carets = [{ id: 1, name: 'Anna', block: 0 }]
    const w = mount(MarkdownEditor, { props: { modelValue: 'Hi', bubbleActions: actions, blockHandles: true, remoteCarets: carets } })
    const visual = w.findComponent(DskWysiwyg)
    expect(visual.props('bubbleActions')).toEqual(actions)
    expect(visual.props('blockHandles')).toBe(true)
    expect(visual.props('remoteCarets')).toEqual(carets)
    await flushPromises()
    expect(w.find('.dsk-wysiwyg__caret').text()).toBe('Anna')
  })

  it('passes nothing that is not switched on', () => {
    const w = mount(MarkdownEditor, { props: { modelValue: 'Hi' } })
    const root = w.find('.dsk-wysiwyg')
    for (const name of ['bubbleactions', 'blockhandles', 'remotecarets', 'bubble-actions', 'block-handles', 'remote-carets']) {
      expect(root.attributes(name)).toBeUndefined()
    }
    expect(w.find('.dsk-wysiwyg__carets').exists()).toBe(false)
  })

  it('reports the visual caret, and null when the Markdown modes take over', async () => {
    const w = mount(MarkdownEditor, { props: { modelValue: 'one\n\ntwo words' }, attachTo: document.body })
    await flushPromises()
    w.findComponent(DskWysiwyg).vm.$emit('caret', { block: 1, offset: 3 })
    expect(w.emitted('caret')?.at(-1)).toEqual([{ block: 1, offset: 3 }])
    await w.setProps({ mode: 'source' })
    expect(w.emitted('caret')?.at(-1)).toEqual([null])
    // The source has no caret to report, and other people's carets are not drawn there.
    await w.setProps({ remoteCarets: [{ id: 1, name: 'Anna', block: 0 }] })
    expect(w.find('.dsk-wysiwyg__caret').exists()).toBe(false)
  })

  it('an outside change in the visual mode is patched in: the caret keeps its node', async () => {
    const w = mount(MarkdownEditor, { props: { modelValue: 'first\n\nsecond line' }, attachTo: document.body })
    await flushPromises()
    const host = w.find('[contenteditable]').element as HTMLElement
    host.focus()
    const text = host.children[1]!.firstChild!
    caretIn(text, 4)
    await w.setProps({ modelValue: 'first, from someone else\n\nsecond line' })
    await nextTick()
    expect(host.children[0]!.textContent).toBe('first, from someone else')
    const range = window.getSelection()!.getRangeAt(0)
    expect(range.startContainer).toBe(text)
    expect(range.startOffset).toBe(4)
    // Not reported back as an edit of this editor.
    expect(w.emitted('update:modelValue')).toBeUndefined()
  })

  it('an outside change in the Markdown mode keeps the selection, shifted past the change', async () => {
    const w = mount(MarkdownEditor, { props: { modelValue: 'alpha\n\nomega', mode: 'source' }, attachTo: document.body })
    const area = w.find('textarea').element as HTMLTextAreaElement
    area.focus()
    area.setSelectionRange(8, 10)
    await w.setProps({ modelValue: 'alpha, beta\n\nomega' })
    await nextTick()
    expect(area.value).toBe('alpha, beta\n\nomega')
    expect([area.selectionStart, area.selectionEnd]).toEqual([14, 16])

    // A change after the selection leaves it alone.
    await w.setProps({ modelValue: 'alpha, beta\n\nomega!' })
    await nextTick()
    expect([area.selectionStart, area.selectionEnd]).toEqual([14, 16])
  })
})
