// The stylesheet is one string; a few rules are load-bearing for the window chrome and are
// checked here as text, so that a later restyle cannot quietly bring the macOS bug back where
// the header face over the drag region stopped taking clicks.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// A Windows checkout may carry CRLF line endings (core.autocrlf); the tests look for
// `\n<selector> {\n`, so the file is read with LF endings whatever the checkout did.
const css = readFileSync(fileURLToPath(new URL('../src/client/styles.ts', import.meta.url)), 'utf8').replace(/\r\n/g, '\n')

/** The declarations of the first rule whose selector list is exactly `selector`. */
function rule(selector) {
  const lines = css.split('\n')
  const prefix = `${selector} {`
  const line = lines.find((l) => l.startsWith(prefix))
  assert.ok(line, `no rule for ${selector}`)
  return line.slice(prefix.length)
}

test('the header block is centred without a transform and without pointer-events tricks', () => {
  const header = rule('.lt-header')
  assert.doesNotMatch(header, /transform\s*:/)
  assert.doesNotMatch(header, /pointer-events\s*:/)
  assert.match(header, /left:\s*0;/)
  assert.match(header, /right:\s*0;/)
  assert.match(header, /margin:\s*0 auto/)
  assert.match(header, /width:\s*fit-content/)
  // the old escape hatch is gone with the wrapper's pointer-events:none
  assert.doesNotMatch(css, /^\.lt-header > \* \{ pointer-events: auto; \}/m)
})

test('the face, the header block and the rail face are no-drag islands on macOS and Windows', () => {
  const noDrag = css.split('\n').filter((l) => l.includes('-webkit-app-region: no-drag') && l.includes("[data-lt-platform='darwin']") && l.includes("[data-lt-platform='win32']"))
  const covers = (sel) => noDrag.some((l) => l.includes(sel))
  assert.ok(covers('.lt-header'), '.lt-header')
  assert.ok(covers('.lt-header-face'), '.lt-header-face')
  assert.ok(covers('.lt-rail-face'), '.lt-rail-face')
  // the chat header stays a drag handle
  assert.match(css, /\[data-lt-platform='win32'\]\) \[data-window-drag\][^\n]*-webkit-app-region: drag/)
})

test('on Windows the top bars clear the caption buttons by the title bar area, out of full screen only', () => {
  const scope = "html[data-lt-platform='win32']:not([data-lt-fullscreen])"
  const lines = css.split('\n')
  // one width, defined once, read from the window's title bar area rather than a fixed number
  const defs = lines.filter((l) => l.includes('--lt-caption-inset:'))
  assert.equal(defs.length, 1)
  assert.ok(defs[0].startsWith(`${scope} {`), defs[0])
  assert.match(defs[0], /env\(titlebar-area-x, 0px\)/)
  assert.match(defs[0], /env\(titlebar-area-width, 100vw\)/)
  assert.doesNotMatch(defs[0], /[1-9]\d*px/)
  // and their height, the same way, for the one bar that moves down instead
  const heightDefs = lines.filter((l) => l.includes('--lt-caption-height:'))
  assert.equal(heightDefs.length, 1)
  assert.ok(heightDefs[0].startsWith(`${scope} {`), heightDefs[0])
  assert.match(heightDefs[0], /--lt-caption-height: env\(titlebar-area-height, 0px\);/)
  // every use in the same scope: anywhere else the variable is undefined and the padding would drop to 0
  const uses = lines.filter((l) => l.includes('var(--lt-caption-inset)'))
  assert.ok(uses.length >= 9)
  const heightUses = lines.filter((l) => l.includes('var(--lt-caption-height)'))
  assert.ok(heightUses.length >= 1)
  for (const l of [...uses, ...heightUses]) assert.ok(l.startsWith(`${scope} `), l)
  // a task's detail is a narrow column: it moves down rather than giving up the width, and the
  // Schedules title row clears the corner only while no detail takes it
  assert.ok(heightUses.some((l) => l.includes('[data-detail-tab]')))
  assert.ok(!uses.some((l) => l.includes('[data-detail-tab]')))
  assert.ok(uses.some((l) => l.includes('task-manager-page"]:not(:has(> aside))')))
  // the harness's bars by its markers; a class name only by its stem (_pageHeading), never a full
  // hashed CSS module class
  for (const marker of ['[data-plugin-panel]', 'task-manager-page', '[data-dockkit-strip-chrome]']) {
    assert.ok(uses.some((l) => l.includes(marker)), marker)
  }
  for (const l of [...uses, ...heightUses]) assert.doesNotMatch(l, /\.[\w-]*_/, l)
  // the split pane's bars sit below its own top strip and get nothing
  for (const l of uses.filter((l) => /\.lt-(room-head|view-bar)/.test(l))) assert.match(l, /:not\(\.lt-split \*\)/, l)
})

test('the desk-a additions sit at the end of the sheet, under their marker', () => {
  const marker = css.indexOf('/* desk-a */')
  assert.ok(marker > 0)
  assert.ok(css.indexOf('.lt-rail-face, button:has(> .lt-rail-face)') > marker)
})

test('the lights breathe: nothing runs round, sweeps across or flows in the stylesheet', () => {
  // the phone's rhythm — 2.4 s in, 2.4 s out — on every light that says "working"
  for (const sel of ['.lt-chat-dot.lt-live', '.lt-status-dot.lt-live', '.lt-traj-live', '.lt-mic.lt-live', '.lt-remote-working::before']) {
    const r = rule(sel)
    assert.match(r, /animation:\s*lt-(pulse 2\.4s|breathe-light 4\.8s|mic-pulse 4\.8s) ease-in-out infinite/, sel)
  }
  assert.match(rule('html[data-lt-muse] [data-chat-running]::after'), /lt-breathe-light 4\.8s ease-in-out infinite/)
  // no marquee, no shimmer, no running border, no flowing gradient
  assert.doesNotMatch(css, /conic-gradient/)
  assert.doesNotMatch(css, /background-position/)
  assert.doesNotMatch(css, /@keyframes lt-(dots|ripple|stage-pulse|flow|sweep|shimmer|marquee)\b/)
  assert.doesNotMatch(css, /\.lt-stage/)
  // the breathing keyframes go between a dim and a full light, no travel
  assert.match(css, /@keyframes lt-breathe-light \{ 0%, 100% \{ opacity: 0\.3; \} 50% \{ opacity: 1; \} \}/)
})

test('a thread from other devices in the hero layout is bottom-aligned by an auto margin, so it scrolls (#261)', () => {
  const scroll = '[data-conversation-content][data-content-phase="hero"] > [data-conversation-scroll]'
  // the bubbles and the run card in the scrolling body: the alignment of the column itself stays at
  // the start, since a column aligned to its end or centred puts its overflow above the top edge,
  // where no scroll reaches it
  assert.match(rule(`${scroll}:has(.lt-remote, .lt-traj)`), /justify-content:\s*flex-start/)
  for (const line of css.split('\n').filter((l) => l.startsWith(scroll))) {
    assert.doesNotMatch(line, /justify-content:\s*(flex-end|end|center|safe)/, line)
  }
  // the first of them takes the free space above it while there is some
  const first = rule(`${scroll} > :is(.lt-remote, .lt-traj):not(:is(.lt-remote, .lt-traj) ~ :is(.lt-remote, .lt-traj))`)
  assert.match(first, /margin-top:\s*auto/)
  // and the old first-child margin, which did nothing once the bubbles overflowed, is gone
  assert.doesNotMatch(css, /\.lt-remote:first-child \{ margin-top: 16px/)
})

test('under prefers-reduced-motion every breathing light is steady', () => {
  const reduced = css.split('\n').filter((l) => l.startsWith('@media (prefers-reduced-motion: reduce)'))
  assert.ok(reduced.length >= 2)
  const steady = reduced.find((l) => l.includes('.lt-traj-live'))
  assert.ok(steady, 'the trajectory light is covered')
  for (const sel of ['.lt-chat-dot.lt-live', '.lt-status-dot.lt-live', '.lt-remote-working::before', '.lt-mic.lt-live', 'html[data-lt-muse] [data-chat-running]::after']) assert.ok(steady.includes(sel), sel)
  assert.match(steady, /animation: none; opacity: 1;/)
})

test('in the Muse look the chat is monochrome: ink pills, grey agent pills, the send disc the same ink', () => {
  // the token blocks span several lines
  const block = (selector) => {
    const at = css.indexOf(`\n${selector} {\n`)
    assert.ok(at >= 0, `no block for ${selector}`)
    return css.slice(at, css.indexOf('\n}', at))
  }
  const light = block('html[data-lingtai] body')
  const dark = block('html[data-lingtai] body[data-ds-dark-theme]')
  const tokens = (block) => Object.fromEntries([...block.matchAll(/--(lt-[a-z-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
  const l = tokens(light)
  const d = tokens(dark)
  assert.equal(l['lt-user-bubble'], '#000000')
  assert.equal(l['lt-user-bubble-fg'], '#ffffff')
  assert.equal(l['lt-agent-bubble'], '#f2f2f7')
  assert.equal(l['lt-canvas'], '#ffffff')
  assert.equal(l['lt-ink'], '#000000')
  assert.equal(l['lt-ink-fg'], '#ffffff')
  assert.equal(d['lt-user-bubble'], '#ffffff')
  assert.equal(d['lt-user-bubble-fg'], '#000000')
  assert.equal(d['lt-ink'], '#ffffff')
  assert.equal(d['lt-ink-fg'], '#000000')
  // the agent's dark pill keeps the same step off the near-black as the phone's off pure black
  assert.equal(d['lt-agent-bubble'], '#242424')
  assert.equal(d['lt-canvas'], d['lt-base'])
  for (const t of [l, d]) assert.equal(t['lt-send'], 'var(--lt-ink)')
  // the user's pill carries its own text colour, and so do the remote and coding copies of it
  for (const sel of [
    'html[data-lt-muse] [data-chat-flow-kind="user"] [class*="_bubble"]',
    'html[data-lt-muse] .lt-remote-user .lt-remote-bubble',
    '.lt-cd-from-you .lt-cd-bubble',
  ]) {
    const r = rule(sel)
    assert.match(r, /background:\s*var\(--lt-user-bubble\)/, sel)
    assert.match(r, /color:\s*var\(--lt-user-bubble-fg\)/, sel)
  }
  // the send disc and the scroll-to-latest disc: the ink, the glyph in the opposite colour
  assert.match(rule('html[data-lt-muse] [data-composer-card] [class*="_primary"]'), /color:\s*var\(--lt-ink-fg\)/)
  const toBottom = rule('html[data-lt-muse] [data-conversation-scroll] [class*="_toBottomSlot"] > button[class*="_toBottom"]')
  assert.match(toBottom, /background:\s*var\(--lt-send\)/)
  assert.match(toBottom, /color:\s*var\(--lt-ink-fg\)/)
})

test('in the Muse look the header is a scrim over the thread, not a bar with a line under it', () => {
  const header = 'html[data-lt-muse] header[data-window-drag]:has(.lt-header)'
  const scrim = rule(header)
  assert.match(scrim, /position:\s*absolute/)
  assert.match(scrim, /border-bottom:\s*0/)
  assert.match(scrim, /pointer-events:\s*none/)
  assert.match(scrim, /linear-gradient\(to bottom, color-mix\(in srgb, var\(--lt-canvas\) 80%, transparent\) 0%, color-mix\(in srgb, var\(--lt-canvas\) 35%, transparent\) 55%, transparent 100%\)/)
  // the controls in it still take clicks, and the drag strip still drags
  const controls = css.split('\n').find((l) => l.startsWith(`${header} :is(`) && l.includes('pointer-events: auto'))
  assert.ok(controls, 'the header controls take their clicks back')
  for (const sel of ['button', 'a', '.lt-header', '.lt-header-drag', '[role="tab"]']) assert.ok(controls.includes(sel), sel)
  // the thread keeps the header's height clear, one variable per platform
  const thread = 'html[data-lt-muse] [data-slot="conversation.header"]:has(.lt-header) ~ [data-conversation-content]'
  assert.match(rule(`${thread} > [data-conversation-scroll]`), /padding-top:\s*var\(--lt-header-h\)/)
  assert.match(rule('header[data-window-drag]:has(.lt-header)'), /min-height:\s*var\(--lt-header-h\)/)
  assert.match(rule("html[data-lt-platform='darwin']:not([data-lt-fullscreen])"), /--lt-header-h:\s*136px/)
  assert.match(rule("html[data-lt-platform='win32']:not([data-lt-fullscreen])"), /--lt-header-h:\s*122px/)
  // the chat's canvas: white in the light, and the harness's own base token follows it there
  const content = rule(thread)
  assert.match(content, /background:\s*var\(--lt-canvas\)/)
  assert.match(content, /--dsw-alias-bg-base:\s*var\(--lt-canvas\)/)
})
