import { describe, expect, it } from 'vitest'
import { imageFiles, imageMarkdown } from '../src'

const file = (name: string, type = 'image/png') => new File(['x'], name, { type })

describe('pictures pasted or dropped', () => {
  it('writes the name as its text and the path safe in a link', () => {
    expect(imageMarkdown(file('Diagram one.png'), 'attachments/Diagram one.png')).toBe('![Diagram one](attachments/Diagram%20one.png)')
    expect(imageMarkdown(file('image.png'), 'attachments/Pasted 1.png')).toBe('![](attachments/Pasted%201.png)')
    expect(imageMarkdown(file('a [b].png'), 'x (1).png')).toBe('![a b](x%20%281%29.png)')
  })

  it('takes only pictures, from the files or the items', () => {
    const data = {
      files: [file('a.png'), file('b.txt', 'text/plain')],
      items: [],
      types: ['Files'],
    } as unknown as DataTransfer
    expect(imageFiles(data).map((f) => f.name)).toEqual(['a.png'])
    const pasted = {
      files: [],
      items: [{ kind: 'file', type: 'image/png', getAsFile: () => file('image.png') }, { kind: 'string', type: 'text/plain', getAsFile: () => null }],
      types: ['Files'],
    } as unknown as DataTransfer
    expect(imageFiles(pasted).map((f) => f.name)).toEqual(['image.png'])
    expect(imageFiles(null)).toEqual([])
  })
})
