import type { Component } from 'vue'

/*
 * The shapes the visual editor (`@dskripchenko/wysiwyg` 0.16+) takes for its
 * bubble actions and other people's carets, and gives for its own caret.
 * Declared here as well, so the editor's types do not depend on which
 * version of the visual editor is installed.
 */

/** A caret: a top-level block's index and a character offset within its text. */
export interface CaretPosition {
  block: number
  offset: number
}

/** A host's own button at the end of the bubble («Comment», say). */
export interface BubbleAction {
  key: string
  label: string
  icon?: Component
  run: (ctx: { text: string; block: number }) => void
}

/** Another person's caret, drawn over the visual mode at a block and an offset. */
export interface RemoteCaret {
  id: string | number
  name: string
  color?: string
  block: number
  offset?: number
}

/**
 * Where a position of an old text lands in a new one: the change is the
 * span between their common start and common end; a position before it
 * stays, one after it shifts by the change in length, one inside it goes to
 * the end of what replaced it.
 */
export function shiftPosition(before: string, after: string, position: number): number {
  const shortest = Math.min(before.length, after.length)
  let head = 0
  while (head < shortest && before.charCodeAt(head) === after.charCodeAt(head)) head++
  let tail = 0
  while (tail < shortest - head && before.charCodeAt(before.length - 1 - tail) === after.charCodeAt(after.length - 1 - tail)) tail++
  if (position <= head) return Math.min(position, after.length)
  if (position >= before.length - tail) return Math.max(head, position + after.length - before.length)
  return after.length - tail
}
