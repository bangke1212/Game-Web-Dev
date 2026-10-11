import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const port = 4300 + Math.floor(Math.random() * 500)
const url = `http://127.0.0.1:${port}/`
const out = process.env.SHOTS_DIR ?? 'shots'
mkdirSync(out, { recursive: true })
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { stdio: 'ignore' })
let browser
const errors = []
const guard = setTimeout(() => fail('timed out'), 120_000)
function cleanup() { clearTimeout(guard); try { server.kill('SIGTERM') } catch {} }
async function fail(message) { console.error(`smoke: FAIL — ${message}`); await browser?.close().catch(() => {}); cleanup(); process.exit(1) }
async function waitForServer() { for (let i = 0; i < 60; i += 1) { try { if ((await fetch(url)).ok) return } catch {} await new Promise(resolve => setTimeout(resolve, 250)) } throw new Error('preview server did not start') }
async function openGame(context) {
  const page = await context.newPage()
  page.on('console', message => message.type() === 'error' && errors.push(message.text()))
  page.on('pageerror', error => errors.push(String(error)))
  page.on('response', response => response.status() >= 400 && errors.push(`HTTP ${response.status()} ${response.url()}`))
  await page.goto(url)
  await page.waitForSelector('[data-screen="title"].is-active', { timeout: 30_000 })
  await page.screenshot({ path: `${out}/title.png` })
  return page
}
const state = page => page.evaluate(() => window.__jamrush.getState())

try {
  await waitForServer()
  browser = await chromium.launch({ args: ['--ignore-gpu-blocklist'] }).catch(() => chromium.launch({ args: ['--ignore-gpu-blocklist'], channel: 'chrome' }))
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' })
  const page = await openGame(desktop)
  await page.click('[data-action="start"]')
  if (await page.locator('[data-screen="tutorial"].is-active').count()) await page.click('[data-action="continue-tutorial"]')
  await page.waitForSelector('[data-screen="game"].is-active')
  const before = await state(page)
  await page.click('[data-kind="build"]')
  await page.click('[data-kind="rest"]')
  await page.click('[data-kind="devlog"]')
  await page.waitForTimeout(120)
  if (await page.locator('[data-screen="event"].is-active').count()) await page.click('[data-action="event-choice"]')
  const afterActions = await state(page)
  if (!(afterActions.built >= 1)) throw new Error('feature action did not build a feature')
  if (!(afterActions.hoursLeft < before.hoursLeft)) throw new Error('deadline did not tick after actions')
  if (!(afterActions.hype > before.hype)) throw new Error('hype did not react to actions')
  await page.screenshot({ path: `${out}/desk.png` })
  if (afterActions.bugs > 0) {
    await page.click('[data-action="open-triage"]')
    await page.waitForSelector('[data-screen="triage"].is-active')
    const bugId = await page.locator('[data-bug-id]').first().getAttribute('data-bug-id')
    const kind = await page.locator('[data-bug-id]').first().locator('.bug-ticket-top b').textContent()
    const lane = page.locator(`.triage-lane[data-kind="${kind.toUpperCase()}"]`)
    await page.locator(`[data-bug-id="${bugId}"]`).dragTo(lane)
    await page.waitForTimeout(500)
    if (await page.locator('[data-screen="triage"].is-active').count()) await page.keyboard.press('Escape')
  }
  await page.click('[data-action="pause"]')
  await page.waitForSelector('[data-screen="pause"].is-active')
  await page.click('[data-screen="pause"] [data-action="open-settings"]')
  await page.waitForSelector('[data-screen="settings"].is-active')
  await page.click('[data-action="toggle-motion"]')
  await page.click('[data-action="close-settings"]')
  if ((await state(page)).screen !== 'game') throw new Error('settings did not return to desk')
  await page.screenshot({ path: `${out}/pause-settings.png` })
  await page.evaluate(() => {
    const app = window.__jamrush.app
    const run = app.run
    run.built = run.brief.features.map(feature => feature.id)
    run.brief.features.forEach(feature => { feature.built = true })
    run.bugs = []
    run.stability = 92
    app.submit()
  })
  await page.waitForSelector('[data-screen="results"].is-active', { timeout: 5_000 })
  const result = await state(page)
  if (!result.ended || !result.score) throw new Error('results screen did not score the run')
  await page.screenshot({ path: `${out}/results.png` })
  await desktop.close()

  const phone = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'en-US' })
  const phonePage = await openGame(phone)
  await phonePage.tap('[data-action="start"]')
  if (await phonePage.locator('[data-screen="tutorial"].is-active').count()) await phonePage.tap('[data-action="continue-tutorial"]')
  await phonePage.waitForSelector('[data-screen="game"].is-active')
  const mobile = await phonePage.evaluate(() => ({ warning: getComputedStyle(document.querySelector('.mobile-warning')).display, width: innerWidth, height: innerHeight }))
  if (mobile.warning === 'none' || mobile.width <= mobile.height) throw new Error('landscape mobile layout not active')
  await phonePage.screenshot({ path: `${out}/mobile.png` })
  await phone.close()
  if (errors.length) throw new Error(`console errors:\n  ${errors.join('\n  ')}`)
  await browser.close(); cleanup(); console.log('smoke: OK — JAMRUSH loop, bug triage, settings, results, and mobile verified')
} catch (error) { await fail(error?.message ?? String(error)) }
