/**
 * Pictures pasted, dropped or chosen with the toolbar's image button: the
 * host saves each file (`saveImage`) and says the path the Markdown names it
 * by; the editor writes `![alt](path)` where the caret is.
 */

/** Saves a picture; the path to write in the Markdown (relative to the document), or null to skip it. */
export type SaveImage = (file: File) => Promise<string | null> | string | null

/** The pictures among a paste's or a drop's files. */
export function imageFiles(data: DataTransfer | null | undefined): File[] {
  if (!data) return []
  const out: File[] = []
  for (const file of Array.from(data.files ?? [])) if (file.type.startsWith('image/')) out.push(file)
  if (out.length > 0) return out
  // A screenshot pasted: in the items only, not always in `files`.
  for (const item of Array.from(data.items ?? [])) {
    if (item.kind !== 'file' || !item.type.startsWith('image/')) continue
    const file = item.getAsFile()
    if (file) out.push(file)
  }
  return out
}

/** Whether a drag carries files: the editor takes the drop when it may. */
export function carriesFiles(data: DataTransfer | null | undefined): boolean {
  return !!data && Array.from(data.types ?? []).includes('Files')
}

/**
 * The Markdown of a saved picture: the file's name as its text (none for
 * a nameless screenshot), the path safe in a link — spaces and brackets encoded.
 */
export function imageMarkdown(file: File, path: string): string {
  const name = file.name.replace(/\.[^.]+$/, '')
  const alt = /^(image|blob|untitled)?$/i.test(name) ? '' : name.replace(/[[\]\\]/g, '')
  const href = path.replace(/[ ()<>]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
  return `![${alt}](${href})`
}
