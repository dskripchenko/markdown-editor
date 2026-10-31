export type MarkdownEditorLocale = 'en' | 'ru'

export interface MarkdownEditorLabels {
  visual: string
  source: string
  split: string
  modes: string
  preview: string
  sourceBlock: string
}

const en: MarkdownEditorLabels = {
  visual: 'Visual',
  source: 'Markdown',
  split: 'Side by side',
  modes: 'Editing mode',
  preview: 'Preview',
  sourceBlock: 'Markdown kept as written — edit it in the Markdown mode',
}

const ru: MarkdownEditorLabels = {
  visual: 'Визуально',
  source: 'Markdown',
  split: 'Рядом',
  modes: 'Режим правки',
  preview: 'Просмотр',
  sourceBlock: 'Markdown как написан — правится в режиме Markdown',
}

export const markdownEditorLocales: Record<MarkdownEditorLocale, MarkdownEditorLabels> = { en, ru }

export function labelsFor(locale: string | undefined): MarkdownEditorLabels {
  return locale?.toLowerCase().startsWith('ru') ? ru : en
}
