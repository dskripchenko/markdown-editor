import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { MarkdownEditor } from '../src'

describe('MarkdownEditor', () => {
  it('loading a document does not report a change', async () => {
    const w = mount(MarkdownEditor, { props: { modelValue: '* a\n* b\n\n__bold__' } })
    await nextTick()
    expect(w.emitted('update:modelValue')).toBeUndefined()
    expect(w.find('[contenteditable]').exists()).toBe(true)
  })

  it('the Markdown mode edits the text as is', async () => {
    const w = mount(MarkdownEditor, { props: { modelValue: '# A', mode: 'source' } })
    const area = w.find('textarea')
    expect((area.element as HTMLTextAreaElement).value).toBe('# A')
    await area.setValue('# A\n\nB')
    expect(w.emitted('update:modelValue')?.at(-1)).toEqual(['# A\n\nB'])
  })

  it('without its mode switch when the host switches modes; the toolbar where the host wants it', async () => {
    const { DskWysiwyg } = await import('@dskripchenko/wysiwyg')
    const w = mount(MarkdownEditor, { props: { modeSwitch: false, toolbarTarget: '#bar' } })
    expect(w.find('.dsk-md__modes').exists()).toBe(false)
    expect(w.findComponent(DskWysiwyg).props('toolbarTarget')).toBe('#bar')
    await w.setProps({ mode: 'source' })
    expect(w.find('textarea').exists()).toBe(true)
  })

  it('offers the modes asked for, and none with only one', async () => {
    const w = mount(MarkdownEditor, { props: { modes: ['visual', 'source'] } })
    expect(w.findAll('.dsk-md__mode').map((b) => b.text())).toEqual(['Visual', 'Markdown'])
    await w.findAll('.dsk-md__mode')[1]!.trigger('click')
    expect(w.emitted('update:mode')?.[0]).toEqual(['source'])
    const one = mount(MarkdownEditor, { props: { modes: ['visual'] } })
    expect(one.find('.dsk-md__modes').exists()).toBe(false)
  })

  it('speaks Russian when asked', () => {
    const w = mount(MarkdownEditor, { props: { locale: 'ru' } })
    expect(w.findAll('.dsk-md__mode').map((b) => b.text())).toEqual(['Визуально', 'Markdown', 'Рядом'])
  })
})
