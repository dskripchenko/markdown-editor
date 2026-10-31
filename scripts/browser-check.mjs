// The editor in real browsers (Chromium, WebKit): a contenteditable behaves in
// ways jsdom does not model — typing, shortcuts, pasting, the caret — so the
// round trip is checked where it happens. Builds the playground into
// tests/browser/site, serves it, drives it with Playwright.
import { createServer } from 'node:http'
import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, extname } from 'node:path'
import { execSync } from 'node:child_process'
import { chromium, webkit } from 'playwright'

const root = join(import.meta.dirname, '..')
const site = join(root, 'tests/browser/site')
const output = join(root, 'tests/browser/output')
mkdirSync(output, { recursive: true })
execSync('npx vite build --config playground/vite.config.ts', { cwd: root, stdio: 'ignore' })

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' }
const server = createServer((req, res) => {
  const path = join(site, decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/$/, '/index.html'))
  if (!path.startsWith(site) || !existsSync(path)) {
    res.writeHead(404).end()
    return
  }
  res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' }).end(readFileSync(path))
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}/`

let failed = 0
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`)
  if (!ok) failed++
}

for (const [name, type] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await type.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  try {
    await page.goto(base)
    await page.waitForSelector('#editor [contenteditable="true"]')
    const value = () => page.evaluate(() => window.__md())
    const sample = await value()
    await page.waitForTimeout(300)
    check(`${name}: loading the editor does not change the value`, (await value()) === sample)
    check(`${name}: what the editor cannot hold is shown as written`, (await page.locator('#editor pre code.language-x-markdown').count()) === 3)

    // Typing at the end of the first paragraph, with bold by the shortcut.
    const mod = name === 'webkit' || process.platform === 'darwin' ? 'Meta' : 'Control'
    const paragraph = page.locator('#editor [contenteditable] p').first()
    await paragraph.click()
    await page.keyboard.press('End')
    await page.keyboard.type(' Extra ')
    await page.keyboard.press(`${mod}+b`)
    await page.keyboard.type('strong')
    await page.keyboard.press(`${mod}+b`)
    await page.keyboard.type(' text.')
    await page.waitForTimeout(300)
    const typed = await value()
    check(`${name}: typing and bold become Markdown`, /changelog "Changelog"\)\. Extra \*\*strong\*\* text\./.test(typed), JSON.stringify(typed.split('\n')[2]))
    check(`${name}: the blocks kept as written stay byte for byte`, typed.includes('#### Kept as written\n\n- [x] Release notes\n- [ ] Customer email\n\n> [!NOTE]\n> Watchers get no notification.'))
    check(`${name}: the table and the code survive the edit`, typed.includes('| Method | Fee |\n| :--- | ---: |') && typed.includes('```js\nconst fee = amount * 0.004\n```'))

    // Markdown pasted as plain text arrives formatted.
    await page.locator('#editor [contenteditable] p').first().click()
    await page.keyboard.press('End')
    await page.keyboard.press('Enter')
    await page.evaluate(() => {
      const data = new DataTransfer()
      data.setData('text/plain', '## Pasted heading\n\n- one\n- two')
      document.activeElement.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }))
    })
    await page.waitForTimeout(300)
    const pasted = await value()
    check(`${name}: pasted Markdown becomes a heading and a list`, (await page.locator('#editor [contenteditable] h2', { hasText: 'Pasted heading' }).count()) === 1 && pasted.includes('## Pasted heading') && /- one\n- two/.test(pasted), JSON.stringify(pasted.slice(0, 400)))

    // The Markdown mode edits the text; back in the visual mode the editor shows it.
    await page.locator('#editor .dsk-md__mode').nth(1).click()
    const area = page.locator('#editor .dsk-md__source')
    check(`${name}: the Markdown mode shows the value`, (await area.inputValue()) === (await value()))
    await area.click()
    await page.keyboard.press(`${mod}+End`)
    await page.keyboard.type('\n## From the source\n')
    await page.waitForTimeout(200)
    check(`${name}: typing in the source changes the value`, (await value()).includes('## From the source'))
    await page.locator('#editor .dsk-md__mode').nth(2).click()
    check(`${name}: side by side shows the preview`, (await page.locator('#editor .dsk-md__preview h2', { hasText: 'From the source' }).count()) === 1)
    await page.locator('#editor .dsk-md__mode').nth(0).click()
    await page.waitForSelector('#editor [contenteditable="true"]')
    check(`${name}: back in the visual mode the editor has the source's change`, (await page.locator('#editor [contenteditable] h2', { hasText: 'From the source' }).count()) === 1)
    const before = await value()
    await page.waitForTimeout(300)
    check(`${name}: switching modes does not change the value`, (await value()) === before)

    if (name === 'chromium') await page.screenshot({ path: join(output, 'editor.png'), fullPage: true })
    check(`${name}: no console errors`, errors.length === 0, errors.slice(0, 3).join(' | '))
  } catch (error) {
    check(`${name}: ran to the end`, false, error.message.split('\n')[0])
  } finally {
    await browser.close()
  }
}

server.close()
console.log(failed ? `${failed} check(s) failed` : 'all checks passed')
process.exit(failed ? 1 : 0)
