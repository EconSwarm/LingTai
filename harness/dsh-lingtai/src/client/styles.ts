/**
 * The Muse look, as one stylesheet the plugin puts in the page's head. Three
 * layers: the harness's `--dsw-*` design tokens re-bound to the Muse palette
 * (so every harness surface — menus, dialogs, cards — follows without being
 * touched); the harness's conversation restyled through its stable DOM hooks
 * (`data-composer-card`, `data-chat-flow-kind`, `data-approval-key`…) into
 * Muse's pill composer, tinted user bubbles and grey agent bubbles — only
 * while the Developer switch is off (`html[data-lt-muse]`); and the `lt-*`
 * classes of the chrome we draw ourselves: the icon rail and chats column,
 * the pinned agent header, the profile drawer, the devices page, the settings
 * dialog and the first run. Everything is scoped under `html[data-lingtai]`,
 * set by the plugin, so the harness looks like itself again the moment the
 * plugin is gone.
 *
 * The colours are the Muse desktop's, sampled: one near-black (#171717) for
 * the window, the rail, the columns and the main area alike; fields and
 * cards a step lighter (#2b2b2b / #2d2d2d); the selected row #232323; agent
 * bubbles a quiet grey; user bubbles the accent colour toned down into the
 * dark. In the light the paper is #f9f9f9, fields white, bubbles #e3e4e6.
 */

const STYLE_ID = 'lingtai-muse-style'

/** The agent's accent, from the account's chosen colour when it has one. */
export function setAccent(color: string | undefined): void {
  const root = document.documentElement
  if (color && /^#[0-9a-f]{6}$/i.test(color)) root.style.setProperty('--lt-accent', color)
  else root.style.removeProperty('--lt-accent')
}

/** Whether the harness's own controls show (`false`: the Muse composer and column). */
export function setMuseMode(on: boolean, placeholder?: string, steps = false): void {
  const root = document.documentElement
  if (on) root.setAttribute('data-lt-muse', '')
  else root.removeAttribute('data-lt-muse')
  // "Show the agent's steps": the tool rows come back into the Muse chat
  if (steps) root.setAttribute('data-lt-steps', '')
  else root.removeAttribute('data-lt-steps')
  if (placeholder !== undefined) root.style.setProperty('--lt-placeholder', JSON.stringify(placeholder))
}

const CSS = `
html[data-lingtai] {
  --lt-accent: #c8743a;
  --lt-blue: #2f6fd0;
  --lt-blue-hover: #2a63ba;
  --lt-rail: 66px;
  --lt-header-h: 108px;
  --lt-radius: 14px;
  --lt-font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif;
}
/* Light: paper, white fields; the conversation monochrome as on the phone (ChatColors.kt): the
   chat's canvas plain white, your pill the ink (black, white text), the agent's a grey a step
   off the canvas, the send button and the scroll-to-latest disc the same ink with the glyph in
   the opposite colour. The paper stays under the rail, the columns and the pages. */
html[data-lingtai] body {
  --lt-base: #f9f9f9;
  --lt-canvas: #ffffff;
  --lt-field: #ffffff;
  --lt-field-border: #e3e4e6;
  --lt-card: #ffffff;
  --lt-selected: #f0f0f1;
  --lt-hover: #f1f1f2;
  --lt-divider: #ececec;
  --lt-agent-bubble: #f2f2f7;
  --lt-user-bubble: #000000;
  --lt-user-bubble-fg: #ffffff;
  --lt-user-bubble-selection: rgb(255 255 255 / 0.3);
  --lt-ink: #000000;
  --lt-ink-fg: #ffffff;
  --lt-send: var(--lt-ink);
  --lt-send-idle: #c9c9cc;
  --dsw-alias-bg-base: #f9f9f9;
  --dsw-alias-bg-layer-1: #f2f2f2;
  --dsw-alias-bg-layer-2: #ececec;
  --dsw-alias-bg-layer-3: #e3e4e6;
  --dsw-specific-sidebar-fill: #f9f9f9;
  --dsw-specific-bubble: #e9e9eb;
  --dsw-specific-bubble-highlight: #dedfe2;
  --dsw-specific-input-major: #ffffff;
  --dsw-alias-brand-primary: #1d1d1f;
}
/* Dark: one near-black, fields and cards a step lighter; the ink inverted: your pill white with
   black text, the agent's the quiet grey a step off the near-black (the step the phone's #1c1c1e
   is off pure black), the send button and the scroll-to-latest disc white with a black glyph. */
html[data-lingtai] body[data-ds-dark-theme] {
  --lt-base: #171717;
  --lt-canvas: #171717;
  --lt-field: #2b2b2b;
  --lt-field-border: #2b2b2b;
  --lt-card: #2d2d2d;
  --lt-selected: #262626;
  --lt-hover: #222222;
  --lt-divider: #242424;
  --lt-agent-bubble: #242424;
  --lt-user-bubble: #ffffff;
  --lt-user-bubble-fg: #000000;
  --lt-user-bubble-selection: rgb(0 0 0 / 0.3);
  --lt-ink: #ffffff;
  --lt-ink-fg: #000000;
  --lt-send: var(--lt-ink);
  --lt-send-idle: #3a3a3a;
  --dsw-alias-bg-base: #171717;
  --dsw-alias-bg-layer-1: #1d1d1d;
  --dsw-alias-bg-layer-2: #232323;
  --dsw-alias-bg-layer-3: #2d2d2d;
  --dsw-specific-sidebar-fill: #171717;
  --dsw-specific-bubble: #242424;
  --dsw-specific-bubble-highlight: #2f2f2f;
  --dsw-specific-input-major: #2b2b2b;
  --dsw-alias-brand-primary: #f2f2f4;
}
html[data-lingtai] body { font-family: var(--lt-font); }

/* ---- shared controls --------------------------------------------------- */
.lt-pill { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 40px; padding: 0 22px; border: 0; border-radius: 999px; background: var(--lt-blue); color: #fff; font: inherit; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 120ms, opacity 120ms; }
.lt-pill:hover:not(:disabled) { background: var(--lt-blue-hover); }
.lt-pill:disabled { opacity: 0.45; cursor: default; }
.lt-pill:focus-visible { outline: 2px solid var(--lt-blue); outline-offset: 2px; }
.lt-pill-ghost { background: var(--lt-card); color: var(--dsw-alias-label-primary); box-shadow: inset 0 0 0 1px var(--lt-field-border); }
.lt-pill-ghost:hover:not(:disabled) { background: var(--lt-selected); }
.lt-pill-sm { min-height: 30px; padding: 0 14px; font-size: 13px; }
.lt-field { box-sizing: border-box; width: 100%; height: 44px; padding: 0 14px; border: 1px solid var(--lt-field-border); border-radius: 12px; background: var(--lt-field); color: var(--dsw-alias-label-primary); font: inherit; font-size: 15px; outline: none; transition: border-color 120ms, box-shadow 120ms; }
.lt-field::placeholder { color: var(--dsw-alias-label-tertiary); }
.lt-field:focus { border-color: var(--lt-blue); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lt-blue) 25%, transparent); }
.lt-seg { display: inline-flex; gap: 2px; padding: 3px; border-radius: 12px; background: var(--dsw-alias-bg-layer-2); }
.lt-seg-btn { display: inline-flex; align-items: center; justify-content: center; min-width: 44px; height: 32px; padding: 0 10px; border: 0; border-radius: 9px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 13px; cursor: pointer; }
.lt-seg-btn:hover { color: var(--dsw-alias-label-primary); }
.lt-seg-btn.lt-active { background: var(--lt-card); color: var(--dsw-alias-label-primary); box-shadow: 0 1px 3px rgba(0,0,0,0.18); }
.lt-spinner { width: 28px; height: 28px; border-radius: 50%; border: 3px solid color-mix(in srgb, var(--lt-blue) 25%, transparent); border-top-color: var(--lt-blue); animation: lt-spin 0.8s linear infinite; }
@keyframes lt-spin { to { transform: rotate(360deg); } }
.lt-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.lt-icon-btn { width: 30px; height: 30px; border: 0; padding: 0; border-radius: 9px; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.lt-icon-btn:hover { background: var(--lt-hover); color: var(--dsw-alias-label-primary); }
.lt-icon-btn:disabled { opacity: 0.45; cursor: default; }
.lt-icon-btn-sm { width: 24px; height: 24px; border-radius: 7px; }

/* ---- sidebar: icon rail + chats column -------------------------------- */
.lt-sidebar { display: flex; height: 100%; min-height: 0; color: var(--dsw-alias-label-primary); background: var(--lt-base); }
.lt-rail { width: var(--lt-rail); flex: none; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 0 12px; box-sizing: border-box; }
.lt-rail-top { height: 12px; flex: none; }
html[data-lt-platform='darwin']:not([data-lt-fullscreen]) .lt-rail-top { height: 78px; }
.lt-rail-face { display: inline-flex; border-radius: 50%; overflow: hidden; }
/* macOS, no title bar: the empty tops of the rail, the column and the chat are drag handles.
   Windows draws its caption buttons over the top right corner (titleBarOverlay, 40px): the same
   drag handles, and the chat's header keeps clear of the buttons. Linux has its system bar. */
html:is([data-lt-platform='darwin'], [data-lt-platform='win32']) [data-window-drag], html:is([data-lt-platform='darwin'], [data-lt-platform='win32']) .lt-ob { -webkit-app-region: drag; }
html:is([data-lt-platform='darwin'], [data-lt-platform='win32']) :is([data-window-drag], .lt-ob, [data-slot="conversation.session.header"]) :is(button, a, input, select, textarea, [contenteditable], [role="button"], [role="dialog"], [role="menu"]) { -webkit-app-region: no-drag; }
/* The chat's header is not a drag region (the shell marks its <header data-window-drag>; that
   and its leading box are reset here): the only handle over the chat is .lt-header-drag, an
   empty strip above the face (MuseHeader). Chromium builds the window's drag map as
   union(drag boxes) − union(no-drag boxes), so a box that is never "drag" needs no carve-out —
   which is what kept failing for the face on macOS. The face also sits below the macOS title
   bar band (traffic lights at y 18 → ~36px), which the system handles before the page. */
html:is([data-lt-platform='darwin'], [data-lt-platform='win32']) header[data-window-drag]:has(.lt-header), html:is([data-lt-platform='darwin'], [data-lt-platform='win32']) [data-conversation-header-leading] { -webkit-app-region: initial; }
.lt-header-drag { position: absolute; left: 0; right: 0; top: 0; height: 10px; z-index: 1; }
html[data-lt-platform='darwin']:not([data-lt-fullscreen]) .lt-header-drag { height: 36px; }
html[data-lt-platform='darwin']:not([data-lt-fullscreen]) .lt-header { top: 40px; }
html[data-lt-platform='darwin']:not([data-lt-fullscreen]) .lt-header-back { top: 42px; }
html[data-lt-platform='darwin']:not([data-lt-fullscreen]) { --lt-header-h: 136px; }
html[data-lt-platform='win32']:not([data-lt-fullscreen]) .lt-rail-top { height: 24px; }
html[data-lt-platform='win32']:not([data-lt-fullscreen]) .lt-header-drag { height: 22px; right: 150px; }
html[data-lt-platform='win32']:not([data-lt-fullscreen]) .lt-header { top: 26px; }
html[data-lt-platform='win32']:not([data-lt-fullscreen]) .lt-header-back { top: 28px; }
html[data-lt-platform='win32']:not([data-lt-fullscreen]) { --lt-header-h: 122px; }
html[data-lt-platform='win32']:not([data-lt-fullscreen]) [data-slot="conversation.session.header"] > :first-child { padding-right: 150px; min-height: 40px; }
html[data-lt-platform='win32']:not([data-lt-fullscreen]) .lt-ob-pager { top: 48px; }
/* Windows, out of full screen: the caption buttons cover the top right corner, so each top bar
   with actions at its right end keeps their width free. --lt-caption-inset is that width, read
   from the window's title bar area (0 in a plain browser); every bar below adds it to the end
   padding its own rule sets, so when a base rule's right padding changes, change it here too.
   The split pane's bars start below its 44px top and get nothing. Schedules' title row clears them
   only while no task is open: an open task's detail then takes the top right, and as a narrow
   column its tab bar moves down by --lt-caption-height, the caption buttons' height, instead of
   giving up their width (that rule sets the bar's top padding outright; the harness's own is 0).
   The harness's bars are found by its data-* hooks; the two schedule rules also rely on its
   data-testid and a class-name stem (_pageHeading) as of dsh 0.2.0-rc.2, which
   harness/desktop/scripts/prepare-dsh.mjs installs by exact version with no lock file.
   harness/desktop/scripts/check-hooks.mjs reads every data-* hook, test id and class stem out of
   this file and looks for each in the staged dsh; the desktop and harness workflows run it, so a
   version that renamed one fails the build instead of leaving a rule that matches nothing. */
html[data-lt-platform='win32']:not([data-lt-fullscreen]) { --lt-caption-inset: max(0px, 100vw - env(titlebar-area-x, 0px) - env(titlebar-area-width, 100vw)); --lt-caption-height: env(titlebar-area-height, 0px); }
html[data-lt-platform='win32']:not([data-lt-fullscreen]) .lt-room-head:not(.lt-split *) { padding-inline-end: calc(40px + var(--lt-caption-inset)); }
html[data-lt-platform='win32']:not([data-lt-fullscreen]) .lt-lib-main .lt-room-head:not(.lt-split *) { padding-inline-end: calc(32px + var(--lt-caption-inset)); }
html[data-lt-platform='win32']:not([data-lt-fullscreen]) .lt-view-bar:not(.lt-split *) { padding-inline-end: calc(16px + var(--lt-caption-inset)); }
html[data-lt-platform='win32']:not([data-lt-fullscreen]) .lt-doc-bar { padding-inline-end: calc(14px + var(--lt-caption-inset)); }
html[data-lt-platform='win32']:not([data-lt-fullscreen]) .lt-pf-top { padding-inline-end: calc(10px + var(--lt-caption-inset)); }
html[data-lt-platform='win32']:not([data-lt-fullscreen]) .lt-fr-gear { right: calc(16px + var(--lt-caption-inset)); }
html[data-lt-platform='win32']:not([data-lt-fullscreen]) [data-plugin-panel] > header[data-window-drag] { padding-inline-end: var(--lt-caption-inset); }
html[data-lt-platform='win32']:not([data-lt-fullscreen]) [data-testid="task-manager-page"]:not(:has(> aside)) [class*="_pageHeading"] { padding-inline-end: var(--lt-caption-inset); }
html[data-lt-platform='win32']:not([data-lt-fullscreen]) [data-testid="task-manager-page"] > aside > div:has(> [role="tablist"] > [data-detail-tab]) { padding-top: var(--lt-caption-height); }
html[data-lt-platform='win32']:not([data-lt-fullscreen]) [data-sidebar-right-panel] [data-dockkit-strip]:has(> [data-dockkit-strip-chrome]) { padding-inline-end: calc(6px + var(--lt-caption-inset)); }
.lt-rail-avatar { width: 44px; height: 44px; margin: 2px 0 10px; border: 0; padding: 0; border-radius: 50%; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.lt-rail-avatar:focus-visible { outline: 2px solid var(--lt-accent); outline-offset: 2px; }
.lt-rail-btn { position: relative; width: 44px; height: 44px; border: 0; padding: 0; border-radius: 13px; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 120ms, color 120ms; }
.lt-rail-btn:hover { background: var(--lt-hover); color: var(--dsw-alias-label-primary); }
.lt-rail-btn[aria-current], .lt-rail-btn[aria-expanded="true"] { background: var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-primary); }
.lt-rail-btn:focus-visible { outline: 2px solid var(--lt-accent); outline-offset: -2px; }
.lt-rail-dot { position: absolute; top: 9px; right: 9px; width: 7px; height: 7px; border-radius: 50%; background: var(--lt-accent); box-shadow: 0 0 0 2px var(--lt-base); }
.lt-rail-spacer { flex: 1; }
.lt-col { flex: 1; min-width: 0; display: flex; flex-direction: column; border-right: 1px solid var(--lt-divider); opacity: 1; transition: opacity 150ms; }
.lt-col.lt-fading { opacity: 0; }
.lt-col-top { height: 10px; flex: none; }
html[data-lt-platform='darwin']:not([data-lt-fullscreen]) .lt-col-top { height: 10px; }
.lt-col-head { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 4px 8px 4px 16px; font-size: 15px; font-weight: 600; letter-spacing: 0.01em; }
.lt-col-head-actions { display: flex; gap: 2px; }
.lt-col-body { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.lt-col-body > * { min-height: 0; }
.lt-col-body > :last-child { flex: 1; }
.lt-col-foot { flex: none; display: flex; flex-direction: column; gap: 2px; padding: 6px; }
.lt-col-foot:empty { display: none; }

.lt-chats { display: flex; flex-direction: column; height: 100%; min-height: 0; }
.lt-chats-head { flex: none; display: flex; align-items: center; gap: 4px; padding: 0 8px 8px 10px; }
.lt-chats-search { flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px; height: 32px; padding: 0 10px; border-radius: 10px; background: var(--lt-field); border: 1px solid var(--lt-field-border); color: var(--dsw-alias-label-tertiary); cursor: text; }
.lt-chats-search:focus-within { border-color: var(--lt-blue); }
.lt-chats-search input { flex: 1; min-width: 0; border: 0; background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 13.5px; outline: none; }
.lt-chats-search input::placeholder { color: var(--dsw-alias-label-tertiary); }
.lt-chats-search input::-webkit-search-cancel-button { -webkit-appearance: none; }
.lt-chats-list { flex: 1; min-height: 0; overflow-y: auto; padding: 0 8px 8px; display: flex; flex-direction: column; gap: 1px; }
.lt-chats-section { display: flex; align-items: center; justify-content: space-between; padding: 14px 4px 4px 10px; font-size: 13px; color: var(--dsw-alias-label-tertiary); }
.lt-chats-empty { padding: 6px 10px; font-size: 12.5px; line-height: 1.5; color: var(--dsw-alias-label-tertiary); }
.lt-chat-row { position: relative; display: flex; align-items: center; border-radius: 9px; min-height: 34px; }
.lt-chat-row:hover { background: var(--lt-hover); }
.lt-chat-row.lt-selected { background: var(--lt-selected); }
.lt-chat-open { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; height: 34px; padding: 0 8px 0 10px; border: 0; background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 14px; text-align: left; cursor: pointer; border-radius: 9px; }
.lt-chat-open:focus-visible { outline: 2px solid var(--lt-accent); outline-offset: -2px; }
.lt-chat-row.lt-main .lt-chat-title { font-weight: 500; }
.lt-chat-title { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lt-chat-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--lt-accent); flex: none; }
.lt-chat-dot.lt-live { animation: lt-pulse 2.4s ease-in-out infinite alternate; }
.lt-chat-mark { flex: none; font-size: 12px; color: var(--dsw-alias-state-warn-primary, #d98c1f); }
.lt-chat-more { position: absolute; right: 4px; top: 50%; transform: translateY(-50%); width: 26px; height: 26px; border: 0; padding: 0; border-radius: 7px; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; opacity: 0; }
.lt-chat-row:hover .lt-chat-more, .lt-chat-more:focus-visible, .lt-chat-more[aria-expanded="true"] { opacity: 1; }
.lt-chat-more:hover { background: var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-primary); }
.lt-chat-row:hover .lt-chat-title { padding-right: 22px; }
.lt-chat-edit { flex: 1; min-width: 0; height: 30px; margin: 2px 4px; padding: 0 8px; border: 1px solid var(--lt-blue); border-radius: 7px; background: var(--lt-field); color: var(--dsw-alias-label-primary); font: inherit; font-size: 14px; outline: none; }
/* a turn of the conversation written on another device of the account (C8): the person's bubble on the
   right like the harness's own, the Muse's on the left, "From Pixel 8" under either (RemoteBubbles.ts) */
.lt-remote { display: flex; flex-direction: column; gap: 4px; margin: 6px 0; }
.lt-remote-user { align-items: flex-end; }
.lt-remote-assistant { align-items: flex-start; }
.lt-remote-bubble { max-width: 100%; padding: 10px 16px; border-radius: var(--dsw-radius-xl, 16px); font-size: var(--dsh-content-font-size, 14px); line-height: calc(22px + var(--dsh-content-font-delta, 0px)); white-space: pre-wrap; word-break: break-word; color: var(--dsw-alias-label-primary); }
.lt-remote-user .lt-remote-bubble { background: var(--dsw-specific-bubble, var(--lt-hover)); }
.lt-remote-assistant .lt-remote-bubble { padding-left: 0; padding-right: 0; }
.lt-remote-from { font-size: 11px; color: var(--dsw-alias-label-tertiary); padding: 0 4px; }
/* the other device is working on its last prompt (C9): a quiet line with a slow dot */
.lt-remote-working { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--dsw-alias-label-tertiary); padding: 0 4px; }
.lt-remote-working::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; animation: lt-breathe-light 4.8s ease-in-out infinite; }
/* The breathing light: every "something is going on" light in this app breathes — 2.4 s in, 2.4 s out,
   the phone's rhythm — rather than running, sweeping or shimmering. A steady light under reduced motion. */
@keyframes lt-breathe-light { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
/* a session with no turn of its own yet (the chat's "hero" layout centres the composer): the other
   devices' turns, and a run's card, sit above the composer, bottom-aligned like a transcript, inside
   the scrolling body. The bottom alignment is an auto margin on the first of them, not
   justify-content: a column aligned to its end (or centred) puts what overflows above the top edge,
   where no scroll reaches it (#261: a long thread from the phone could not be scrolled up at all);
   an auto margin takes the free space while there is some and is nothing once the thread is taller
   than the body, so the body scrolls from its first line. */
[data-conversation-content][data-content-phase="hero"] > [data-conversation-scroll]:has(.lt-remote, .lt-traj) { justify-content: flex-start; }
[data-conversation-content][data-content-phase="hero"] > [data-conversation-scroll] > .lt-remote { flex: 0 0 auto; width: min(var(--dsh-chat-content-width, 680px), 100%); align-self: center; box-sizing: border-box; padding: 0 var(--dsh-composer-side-clearance, 16px); }
[data-conversation-content][data-content-phase="hero"] > [data-conversation-scroll] > :is(.lt-remote, .lt-traj):not(:is(.lt-remote, .lt-traj) ~ :is(.lt-remote, .lt-traj)) { margin-top: auto; padding-top: 16px; }

/* ---- the pinned agent header over the conversation -------------------- */
header[data-window-drag]:has(.lt-header) { position: relative; min-height: var(--lt-header-h); }
/* In the Muse look the header is a scrim rather than a bar: it lies over the conversation, which scrolls
   under it and dissolves into the canvas (the canvas at 80 percent at the top edge, 35 percent past the
   middle, clear at the bottom, as the phone draws it), and no line runs under it. The thread keeps the
   header's height clear at its top, so the first message starts under the face rather than behind it.
   The wheel over the empty parts of the scrim reaches the thread; the controls take their own clicks,
   and the drag strip stays a drag strip. The chat's canvas is white in the light theme, the paper
   staying under the rail, the columns and the pages; the harness's base token follows inside the
   conversation so the composer's own fade matches. (The header sits in its slot's display:contents
   anchor, so the thread is the anchor's sibling, not the header's.) */
html[data-lt-muse] header[data-window-drag]:has(.lt-header) { position: absolute; top: 0; left: 0; right: 0; z-index: 6; border-bottom: 0; pointer-events: none; background: linear-gradient(to bottom, color-mix(in srgb, var(--lt-canvas) 80%, transparent) 0%, color-mix(in srgb, var(--lt-canvas) 35%, transparent) 55%, transparent 100%); }
html[data-lt-muse] header[data-window-drag]:has(.lt-header) :is(button, a, input, [role="tab"], [role="dialog"], [role="menu"], .lt-header, .lt-header-drag) { pointer-events: auto; }
html[data-lt-muse] [data-slot="conversation.header"]:has(.lt-header) ~ [data-conversation-content] { background: var(--lt-canvas); --dsw-alias-bg-base: var(--lt-canvas); }
html[data-lt-muse] [data-slot="conversation.header"]:has(.lt-header) ~ [data-conversation-content] > [data-conversation-scroll] { padding-top: var(--lt-header-h); }
/* Centred with auto margins, not translateX(-50%): the window's drag-region map is built from
   untransformed boxes, and a transformed, pointer-events:none box over a drag region left the
   face unclickable on macOS. The header block itself is the no-drag island (see desk-a below). */
.lt-header { position: absolute; left: 0; right: 0; top: 12px; width: fit-content; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 3px; z-index: 2; max-width: min(60%, 520px); }
.lt-header-face { position: relative; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 0; padding: 0; background: transparent; cursor: pointer; box-shadow: 0 0 0 2px transparent; transition: box-shadow 300ms; }
.lt-header-face.lt-live { box-shadow: 0 0 0 2px var(--lt-accent); }
.lt-header-face.lt-wait { box-shadow: 0 0 0 2px var(--dsw-alias-state-warn-primary, #d98c1f); }
.lt-header-face:focus-visible { outline: 2px solid var(--lt-accent); outline-offset: 2px; }
.lt-header-name { font-size: 14px; font-weight: 600; line-height: 1.2; color: var(--dsw-alias-label-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.lt-header-status { display: flex; align-items: center; gap: 6px; font-size: 12px; line-height: 1.2; color: var(--dsw-alias-label-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.lt-header-status.lt-live { color: var(--dsw-alias-label-secondary); }
.lt-header-chip { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px 3px 8px; border-radius: 999px; background: var(--dsw-alias-bg-layer-2); }
.lt-header-chip.lt-live { background: color-mix(in srgb, var(--lt-blue) 28%, var(--dsw-alias-bg-layer-2)); }
.lt-header-chip.lt-wait { background: color-mix(in srgb, #d98c1f 25%, var(--dsw-alias-bg-layer-2)); }
.lt-status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--dsw-alias-label-dimmed); flex: none; }
.lt-status-dot.lt-on { background: var(--dsw-alias-state-success-primary, #2f9e5f); }
.lt-status-dot.lt-live { background: var(--lt-accent); animation: lt-pulse 2.4s ease-in-out infinite alternate; }
.lt-status-dot.lt-wait { background: var(--dsw-alias-state-warn-primary, #d98c1f); }
@keyframes lt-pulse { from { opacity: 0.45; transform: scale(0.85); } to { opacity: 1; transform: scale(1.1); } }
@media (prefers-reduced-motion: reduce) { .lt-chat-dot.lt-live, .lt-status-dot.lt-live, .lt-remote-working::before, .lt-mic.lt-live, html[data-lt-muse] [data-chat-running]::after, .lt-traj-live { animation: none; opacity: 1; } }
.lt-stop { display: inline-flex; align-items: center; gap: 4px; margin-left: 4px; padding: 1px 8px 1px 5px; border-radius: 999px; border: 1px solid var(--dsw-alias-interactive-bg-active); background: var(--lt-base); color: var(--dsw-alias-label-primary); font-size: 12px; line-height: 18px; cursor: pointer; }
.lt-stop:hover { background: var(--lt-hover); }
.lt-stop:disabled { opacity: 0.5; cursor: default; }
.lt-invite { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px 0 10px; border: 0; border-radius: 999px; background: var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; cursor: pointer; }
.lt-invite:hover { background: var(--dsw-alias-bg-layer-2); }
.lt-invite-card { display: flex; flex-direction: column; gap: 14px; }
.lt-invite-code { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 12px; background: var(--dsw-alias-bg-layer-2); font-size: 22px; font-weight: 600; letter-spacing: 0.12em; }
.lt-invite-code .lt-pill { margin-left: auto; letter-spacing: 0; }
.lt-invite-link { font-size: 13px; color: var(--dsw-alias-label-secondary); word-break: break-all; }

/* ---- the Muse conversation: the harness's DOM, Muse's shapes ----------- */
/* The composer card becomes one pill: + | the text | send. */
html[data-lt-muse] [data-composer-card] { display: flex !important; flex-direction: row !important; flex-wrap: wrap; align-items: flex-end; gap: 2px 4px; padding: 5px 5px 5px 6px !important; border-radius: 26px !important; background: var(--lt-field) !important; box-shadow: 0 0 0 1px var(--lt-field-border), 0 6px 24px rgba(0,0,0,0.10) !important; }
html[data-lt-muse] [data-composer-card] > [data-input-scroll] { flex: 1 1 120px; min-width: 0; order: 0; margin: 0 !important; }
html[data-lt-muse] [data-composer-card] > [data-input-scroll] [contenteditable] { min-height: 34px !important; padding: 5px 6px 5px 8px !important; }
html[data-lt-muse] [data-composer-card] [data-composer-placeholder] { inset: 5px 6px auto 8px !important; color: transparent !important; }
html[data-lt-muse] [data-composer-card] [data-composer-placeholder]::before { content: var(--lt-placeholder, "Message"); position: absolute; inset: 0 auto auto 0; color: var(--dsw-alias-label-tertiary); white-space: nowrap; }
/* An empty chat: no greeting, the composer sits at the bottom like Muse's. */
html[data-lt-muse] [data-conversation-scroll]:has([class*="_composerHero"]) { justify-content: flex-end; }
html[data-lt-muse] [class*="_composerHero"] > [class*="_root"]:first-child { display: none; }
/* no workspace/preset chips over an empty chat: the inert composer itself opens the workspace picker when one is needed */
html[data-lt-muse] [class*="_composerHero"] > [class*="_heroWorkspaceRow"] { display: none; }
html[data-lt-muse] [data-composer-card] > div:last-child { display: contents; }
html[data-lt-muse] [data-composer-card] > div:last-child > div:first-child { order: -1; gap: 2px; }
html[data-lt-muse] [data-composer-card] > div:last-child > div:last-child { order: 1; margin-left: 0 !important; }
html[data-lt-muse] [data-composer-card] > [class*="_rail"] { flex-basis: 100%; order: -2; }
html[data-lt-muse] [data-composer-card] > [class*="_accessory"] { flex-basis: 100%; order: -3; padding-top: 4px !important; }
html[data-lt-muse] [data-composer-card] [class*="_modes"] { display: none !important; }
/* the right-hand seats stay for the microphone; the model picker goes (Settings keeps it) */
html[data-lt-muse] [data-composer-card] [class*="_standardControls"] { gap: 2px !important; }
html[data-lt-muse] [data-composer-card] [data-slot="conversation.input.model"] { display: none !important; }
html[data-lt-muse] [data-composer-card] [class*="_activity"] { display: none !important; }
html[data-lt-muse] [data-composer-card] [class*="_add"] { width: 34px; height: 34px; border-radius: 50%; color: var(--dsw-alias-label-secondary); }
/* the send disc is the ink (black in the light, white in the dark) with the arrow in the opposite colour */
html[data-lt-muse] [data-composer-card] [class*="_primary"] { width: 34px; height: 34px; transform: none !important; background: var(--lt-send) !important; color: var(--lt-ink-fg) !important; }
html[data-lt-muse] [data-composer-card] [class*="_primary"]:disabled { background: var(--lt-send-idle) !important; opacity: 1 !important; color: var(--lt-canvas) !important; }
/* the harness's scroll-to-latest disc, floating over the thread, reads the same ink */
html[data-lt-muse] [data-conversation-scroll] [class*="_toBottomSlot"] > button[class*="_toBottom"] { background: var(--lt-send); color: var(--lt-ink-fg); box-shadow: 0 2px 10px rgba(0,0,0,0.18); }
html[data-lt-muse] [data-conversation-scroll] [class*="_toBottomSlot"] > button[class*="_toBottom"]:hover { background: var(--lt-send); opacity: 0.88; }
html[data-lt-muse] [data-composer-card] ~ [class*="_dock"] { display: none !important; }
.lt-mic { width: 34px; height: 34px; border: 0; padding: 0; border-radius: 50%; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.lt-mic:hover { background: var(--lt-hover); color: var(--dsw-alias-label-primary); }
/* recording: the red breathes (no ring running outward) */
.lt-mic.lt-live { color: #fff; background: #e0245e; box-shadow: 0 0 0 4px rgba(224,36,94,0.25); animation: lt-mic-pulse 4.8s ease-in-out infinite; }
@keyframes lt-mic-pulse { 0%, 100% { opacity: 0.72; } 50% { opacity: 1; } }
/* Muse keeps the chat bare: no tool-step disclosure, no usage, no fork, no context rows */
html[data-lt-muse] [data-chat-flow-kind="context"] { display: none !important; }
/* the "done in 6 s" accordion goes; what the agent said along the way stays a bubble, as Muse shows it (the harness folds it under the accordion with hidden=until-found) */
html[data-lt-muse] [data-chat-flow-kind="turn-process"] { display: none !important; }
html[data-lt-muse] [data-turn-process-member]:not([data-chat-flow-kind="assistant-step"]):not([data-chat-flow-kind="tool-call"]) { display: none !important; }
html[data-lt-muse] [data-chat-flow-kind="assistant-step"][hidden] { display: block !important; content-visibility: visible !important; }
/* the rooms' trigger rows and the agent's tool rows stay out of the chat (the Activity tab has them); approvals, presented files and open questions stay */
html[data-lt-muse] [data-chat-flow-kind="turn-trigger"] { display: none !important; }
html[data-lt-muse]:not([data-lt-steps]) [data-chat-flow-kind="tool-call"]:not(:has([data-approval-key], [data-tool="present"], [data-tool="ask_user_question"]:not([data-state="error"]))) { display: none !important; }
html[data-lt-muse] [data-chat-flow-kind="tool-call"][hidden]:has([data-approval-key], [data-tool="present"], [data-tool="ask_user_question"]:not([data-state="error"])) { display: block !important; content-visibility: visible !important; }
/* with "Show the agent's steps" on, every tool row is unfolded from the accordion */
html[data-lt-muse][data-lt-steps] [data-chat-flow-kind="tool-call"][hidden] { display: block !important; content-visibility: visible !important; }
/* while the agent thinks: three dots in a grey bubble, not the whale; the three breathe together (no wave running across them) */
html[data-lt-muse] [data-chat-running] { display: flex !important; flex-direction: row; align-items: center; justify-content: center; width: fit-content; min-height: 36px; margin: 6px 0; padding: 0 16px; border-radius: 18px; background: var(--lt-agent-bubble); line-height: 0; }
html[data-lt-muse] [data-chat-running] > [class*="_runningDivider"], html[data-lt-muse] [data-chat-running] > [class*="_runningContent"] { display: none !important; }
html[data-lt-muse] [data-chat-running]::after { content: ''; display: block; flex: none; width: 7px; height: 7px; margin: 0 22px 0 0; border-radius: 50%; background: var(--dsw-alias-label-secondary); box-shadow: 11px 0 0 var(--dsw-alias-label-secondary), 22px 0 0 var(--dsw-alias-label-secondary); animation: lt-breathe-light 4.8s ease-in-out infinite; }
html[data-lt-muse] [data-chat-flow-kind="turn-tail"] [class*="_endInfo"] > :not([class*="_timeEnd"]) { display: none !important; }
html[data-lt-muse] [data-chat-flow-kind="turn-tail"] [data-clock="end"] > button[class*="_action"]:nth-of-type(2) { display: none !important; }
.lt-quote-act { width: 24px; height: 24px; border: 0; padding: 0; border-radius: 6px; background: transparent; color: var(--dsw-alias-label-tertiary); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.lt-quote-act:hover { background: var(--lt-hover); color: var(--dsw-alias-label-primary); }
/* the time of a message sits centred over it, small and grey, as Muse's do */
html[data-lt-muse] [data-chat-flow-kind="user"] [class*="_userRow"] { position: relative; margin-top: 18px; }
html[data-lt-muse] [data-chat-flow-kind="user"] [data-clock="start"] { position: absolute; left: 0; right: 0; top: -18px; justify-content: center; opacity: 1 !important; }
html[data-lt-muse] [data-chat-flow-kind="user"] [data-clock="start"] [class*="_timeStart"] { font-size: 11px; color: var(--dsw-alias-label-dimmed); }
html[data-lt-muse] [data-chat-flow-kind="user"] [data-clock="start"] button { opacity: 0; transition: opacity 160ms; }
html[data-lt-muse] [data-chat-flow-kind="user"]:hover [data-clock="start"] button, html[data-lt-muse] [data-chat-flow-kind="user"] [data-clock="start"] button:focus-visible { opacity: 1; }
html[data-lt-muse] [data-chat-flow-kind="turn-tail"] [class*="_timeEnd"] { font-size: 11px; color: var(--dsw-alias-label-dimmed); }
/* The user's words: the ink pill on the right (black with white text in the light, white with black
   in the dark). The agent's: a quiet grey one a step off the canvas. A link inside your pill keeps the
   pill's text colour, underlined, and a selection on it is a translucent wash of that colour. */
html[data-lt-muse] [data-chat-flow-kind="user"] [class*="_bubble"] { background: var(--lt-user-bubble) !important; color: var(--lt-user-bubble-fg); border-radius: 18px !important; padding: 9px 14px !important; }
html[data-lt-muse] [data-chat-flow-kind="user"] [class*="_bubble"] a { color: inherit; text-decoration: underline; }
html[data-lt-muse] [data-chat-flow-kind="user"] [class*="_bubble"] ::selection { background: var(--lt-user-bubble-selection); color: var(--lt-user-bubble-fg); }
html[data-lt-muse] .lt-remote-user .lt-remote-bubble { background: var(--lt-user-bubble); color: var(--lt-user-bubble-fg); }
html[data-lt-muse] .lt-remote-user .lt-remote-bubble ::selection { background: var(--lt-user-bubble-selection); color: var(--lt-user-bubble-fg); }
html[data-lt-muse] [data-chat-flow-kind="assistant-step"] [data-slot="conversation.chat.node"] > [class*="_root"] > [class*="_body"] { width: fit-content; max-width: 100%; box-sizing: border-box; background: var(--lt-agent-bubble); border-radius: 20px; padding: 10px 16px; }
html[data-lt-muse] [data-chat-flow-kind="assistant-step"] [data-slot="conversation.chat.node"] > [class*="_root"] > [class*="_body"]:empty { display: none; }
html[data-lt-muse] [data-chat-flow-kind="assistant-step"] [data-slot="conversation.chat.node"] > [class*="_root"] > [class*="_body"] > [class*="_markdown"] > :first-child { margin-top: 0; }
html[data-lt-muse] [data-chat-flow-kind="assistant-step"] [data-slot="conversation.chat.node"] > [class*="_root"] > [class*="_body"] > [class*="_markdown"] > :last-child { margin-bottom: 0; }
/* Timestamps and per-message actions appear on hover, as Muse keeps its chat quiet. */
html[data-lt-muse] [data-chat-flow-kind="user"] [class*="_actions"][data-clock],
html[data-lt-muse] [data-chat-flow-kind="turn-tail"] [class*="_actions"][data-clock] { opacity: 0; transition: opacity 160ms; }
html[data-lt-muse] [data-chat-flow-kind="user"]:hover [class*="_actions"][data-clock],
html[data-lt-muse] [data-chat-flow-kind="user"] [class*="_actions"][data-clock]:focus-within,
html[data-lt-muse] [data-chat-flow-kind="turn-tail"]:hover [class*="_actions"][data-clock],
html[data-lt-muse] [data-chat-flow-kind="turn-tail"] [class*="_actions"][data-clock]:focus-within { opacity: 1; }
/* The session header keeps only what Muse shows up there: Invite and the corner;
   a side chat shows its title at the left (a new one reads "New side chat"). */
html[data-lt-muse] [data-slot="conversation.session.header"] [class*="_titleCluster"] { display: none; }
html[data-lt-muse][data-lt-side] [data-slot="conversation.session.header"] [class*="_titleCluster"] { display: flex; }
html[data-lt-muse][data-lt-side] [data-slot="conversation.session.header"] [class*="_crumb"] { font-size: 13px; font-weight: 500; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-2); border-radius: 999px; padding: 4px 12px; }
html[data-lt-muse] [data-slot="conversation.session.header"] [class*="_headerActions"] { display: none; }
html[data-lt-muse] [data-slot="conversation.session.header"] [class*="_titleRow"] { justify-content: flex-end; }
html[data-lt-muse][data-lt-side] [data-slot="conversation.session.header"] [class*="_titleRow"] { justify-content: space-between; }
html[data-lt-muse] [data-slot="conversation.session.header"] [data-conversation-tabs] { display: none; }
/* …except while another view (the trajectory a tool row's "Inspect" opens) is up: then the
   tabs come back as the way out — a small segmented control, "Chat" first, at the top right
   (the centre is the face and its status line). Esc does the same. */
html[data-lt-muse] [data-slot="conversation.session.header"] [data-conversation-tabs]:has([role="tab"][aria-selected="true"]:not(:first-child)) { display: inline-flex; align-self: flex-start; margin: 10px 16px 0 auto; padding: 3px; gap: 2px; border-radius: 999px; background: var(--dsw-alias-bg-layer-2); }
html[data-lt-muse] [data-slot="conversation.session.header"] [data-conversation-tabs]:has([role="tab"][aria-selected="true"]:not(:first-child)) [role="tab"] { border: 0; border-radius: 999px; padding: 4px 12px; font-size: 12.5px; font-weight: 500; color: var(--dsw-alias-label-secondary); background: transparent; cursor: pointer; }
html[data-lt-muse] [data-slot="conversation.session.header"] [data-conversation-tabs]:has([role="tab"][aria-selected="true"]:not(:first-child)) [role="tab"][aria-selected="true"] { background: var(--lt-base); color: var(--dsw-alias-label-primary); box-shadow: 0 1px 2px rgba(0,0,0,.08); }
html[data-lt-muse] [data-slot="conversation.session.header.utilities"] > *:not(:has(.lt-invite)) { display: none; }
html[data-lt-muse] [data-turn-process-inline] { display: none !important; }
html[data-lt-muse] [data-slot="conversation.session.header.corner"] [data-sidebar-right-expand] { display: none; }
.lt-header-back { position: absolute; left: 14px; top: 14px; z-index: 3; width: 30px; height: 30px; border: 0; border-radius: 50%; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.lt-header-back:hover { background: var(--dsw-alias-bg-layer-3); }
.lt-header-toast { color: var(--dsw-alias-state-success-primary, #2f9e5f); }
.lt-header-status.lt-done { color: var(--dsw-alias-label-secondary); }
.lt-header-status.lt-wait { color: var(--dsw-alias-state-warn-primary, #d98c1f); }
.lt-header-line { overflow: hidden; text-overflow: ellipsis; }
.lt-spin { transform-origin: 12px 12px; animation: lt-spin 0.9s linear infinite; }
/* the rail: the face at the top (in a room, or collapsed), recent documents under the rooms */
.lt-rail-face { display: inline-flex; border-radius: 50%; overflow: hidden; box-shadow: 0 0 0 1.5px var(--lt-divider); }
.lt-rail-face.lt-live { box-shadow: 0 0 0 2px var(--lt-accent); }
.lt-rail-recent { display: flex; flex-direction: column; align-items: center; gap: 6px; padding-top: 6px; margin-top: 2px; border-top: 1px solid var(--lt-divider); }
.lt-rail-doc { width: 40px; height: 40px; border-radius: 11px; flex-direction: column; gap: 0; }
.lt-rail-doc svg { margin-top: -2px; }
.lt-rail-doc-tag { font-size: 8.5px; line-height: 1; font-weight: 600; letter-spacing: 0.02em; color: var(--dsw-alias-label-tertiary); margin-top: -3px; }
.lt-rail-doc.lt-pinned .lt-rail-doc-tag { color: var(--lt-accent); }
/* the split: the chat keeps the main area, the room docks at the right */
/* a narrow chat column at the left, the room wide at the right — the room's own top-left toggle closes it */
html[data-lt-split] { --lt-split-w: clamp(420px, 62vw, 1200px); }
.lt-split { position: fixed; top: 0; right: 0; bottom: 0; width: var(--lt-split-w, 62vw); z-index: 50; display: flex; flex-direction: column; background: var(--lt-base); border-left: 1px solid var(--lt-divider); animation: lt-slide-in 180ms ease-out; }
html[data-lt-split] [class*="_centerCol"] { min-width: 0; padding-right: var(--lt-split-w, 62vw); box-sizing: border-box; }
html[data-lt-split] .lt-header-back { left: 10px; }
.lt-header-chats { width: auto; padding: 0 10px 0 8px; gap: 6px; border-radius: 8px; font-size: 13px; font-weight: 600; }
.lt-split .lt-room-head, .lt-split .lt-room-inner { padding-left: 24px; padding-right: 24px; }
.lt-split .lt-room-title { font-size: 22px; }
.lt-split .lt-room-top { height: 44px; }
/* a room has the window beside the rail: the frame's sidebar track shrinks to the rail, no drag handle, no right bar */
html[data-lt-room] [class*="_frame"] { grid-template-columns: 66px minmax(0, 1fr) 0px !important; }
html[data-lt-room] [class*="_frame"] > [class*="_handle"] { display: none; }
/* the sidebar-toggle at a room's top left */
.lt-room-toggle { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; margin-left: -8px; border: 0; border-radius: 8px; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; }
.lt-room-toggle:hover, .lt-room-toggle.lt-active { background: var(--lt-hover); color: var(--dsw-alias-label-primary); }
.lt-lib-col-tools { display: flex; align-items: center; height: 36px; padding: 0 2px; }
.lt-lib-col-tools .lt-room-toggle { margin-left: 0; }
.lt-room-head > .lt-room-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lt-cat-row:disabled { cursor: progress; opacity: 0.7; }
/* search (⌘K) */
.lt-search-backdrop { position: fixed; inset: 0; z-index: 85; background: rgba(0,0,0,0.28); display: flex; align-items: flex-start; justify-content: center; padding-top: 12vh; animation: lt-fade-in 120ms ease-out; }
.lt-search { width: min(620px, calc(100vw - 48px)); max-height: 70vh; display: flex; flex-direction: column; border-radius: 16px; background: var(--lt-base); color: var(--dsw-alias-label-primary); box-shadow: 0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px var(--lt-divider); overflow: hidden; animation: lt-rise 160ms ease-out; }
.lt-search-field { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid var(--lt-divider); color: var(--dsw-alias-label-tertiary); }
.lt-search-input { flex: 1; min-width: 0; border: 0; background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 16px; outline: none; }
.lt-search-label { font-size: 11.5px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--dsw-alias-label-tertiary); padding: 10px 16px 4px; }
.lt-search-empty { padding: 20px 16px 24px; font-size: 13.5px; color: var(--dsw-alias-label-tertiary); }
.lt-search-list { flex: 1; min-height: 0; overflow-y: auto; padding: 0 8px 8px; display: flex; flex-direction: column; gap: 1px; }
.lt-search-row { display: flex; align-items: center; gap: 12px; width: 100%; padding: 9px 10px; border: 0; border-radius: 10px; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.lt-search-row:hover, .lt-search-row.lt-active { background: var(--lt-hover); }
.lt-search-row-icon { width: 30px; height: 30px; border-radius: 9px; display: inline-flex; align-items: center; justify-content: center; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); flex: none; }
.lt-search-row-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.lt-search-row-title { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lt-search-row-sub { font-size: 12.5px; color: var(--dsw-alias-label-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lt-search-row-time { flex: none; font-size: 12px; color: var(--dsw-alias-label-dimmed); }
/* the document editor */
.lt-doc { position: fixed; inset: 0; z-index: 75; display: flex; flex-direction: column; background: var(--lt-base); color: var(--dsw-alias-label-primary); animation: lt-fade-in 140ms ease-out; }
.lt-doc-bar { flex: none; display: flex; align-items: center; gap: 8px; padding: 10px 14px 8px; border-bottom: 1px solid var(--lt-divider); }
html[data-lt-platform='darwin']:not([data-lt-fullscreen]) .lt-doc-bar { padding-top: 30px; }
.lt-doc-name { font-size: 14px; font-weight: 600; margin: 0 6px 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lt-doc-tools { display: flex; align-items: center; gap: 2px; padding: 0 4px; border-left: 1px solid var(--lt-divider); margin-left: 4px; }
.lt-doc-tool { min-width: 28px; height: 28px; padding: 0 7px; border: 0; border-radius: 7px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; }
.lt-doc-tool:hover { background: var(--lt-hover); color: var(--dsw-alias-label-primary); }
.lt-doc-tool-i { font-style: italic; font-family: Georgia, serif; }
.lt-doc-state { margin-left: auto; font-size: 12px; color: var(--dsw-alias-label-tertiary); white-space: nowrap; }
.lt-doc-state.lt-dirty { color: var(--dsw-alias-state-warn-primary, #d98c1f); }
.lt-doc-error { font-size: 12.5px; color: var(--dsw-alias-state-error-primary, #d2453d); padding: 10px 24px 0; }
.lt-doc-loading { flex: 1; display: flex; align-items: center; justify-content: center; }
.lt-doc-scroll { flex: 1; min-height: 0; overflow-y: auto; }
.lt-doc-body { max-width: 760px; width: 100%; margin: 0 auto; padding: 36px 48px 120px; box-sizing: border-box; outline: none; font-size: 15px; line-height: 1.7; }
.lt-doc-body:empty::before { content: attr(data-placeholder); color: var(--dsw-alias-label-dimmed); }
.lt-doc-body h1 { font-size: 30px; margin: 0 0 14px; line-height: 1.25; letter-spacing: -0.01em; }
.lt-doc-body h2 { font-size: 22px; margin: 26px 0 8px; }
.lt-doc-body h3 { font-size: 17px; margin: 20px 0 6px; }
.lt-doc-body p { margin: 0 0 10px; }
.lt-doc-body ul, .lt-doc-body ol { margin: 0 0 10px; padding-left: 24px; }
.lt-doc-body blockquote { margin: 0 0 10px; padding: 2px 0 2px 14px; border-left: 3px solid var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-secondary); }
.lt-doc-body pre { background: var(--dsw-alias-bg-layer-2); padding: 12px 14px; border-radius: 12px; overflow-x: auto; font-size: 13px; }
.lt-doc-body code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.92em; }
.lt-doc-body hr { border: 0; height: 1px; background: var(--lt-divider); margin: 18px 0; }
.lt-doc-body table { border-collapse: collapse; margin: 0 0 12px; }
.lt-doc-body th, .lt-doc-body td { padding: 6px 12px; border: 1px solid var(--lt-divider); text-align: left; }
.lt-doc-note { color: var(--dsw-alias-label-tertiary); }
.lt-doc-source { flex: 1; min-height: 0; width: 100%; box-sizing: border-box; border: 0; outline: none; resize: none; padding: 28px 48px 120px; background: transparent; color: var(--dsw-alias-label-primary); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13.5px; line-height: 1.6; max-width: 860px; margin: 0 auto; display: block; }
@media print { html[data-lt-print] body * { visibility: hidden; } html[data-lt-print] .lt-doc, html[data-lt-print] .lt-doc * { visibility: visible; } html[data-lt-print] .lt-doc { position: absolute; inset: 0; height: auto; overflow: visible; } html[data-lt-print] .lt-doc-bar { display: none; } html[data-lt-print] .lt-doc-scroll { overflow: visible; } }
/* a task's detail (from the Activity tab) */
.lt-task-backdrop { position: fixed; inset: 0; z-index: 86; background: rgba(0,0,0,0.32); display: flex; align-items: center; justify-content: center; animation: lt-fade-in 120ms ease-out; }
.lt-task { width: min(920px, calc(100vw - 48px)); height: min(640px, calc(100vh - 48px)); display: flex; flex-direction: column; border-radius: 18px; background: var(--lt-base); color: var(--dsw-alias-label-primary); box-shadow: 0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px var(--lt-divider); overflow: hidden; animation: lt-rise 160ms ease-out; }
.lt-task-head { flex: none; display: flex; align-items: center; gap: 10px; padding: 14px 14px 12px 18px; border-bottom: 1px solid var(--lt-divider); }
.lt-task-pill { flex: none; font-size: 11.5px; font-weight: 600; padding: 3px 9px; border-radius: 999px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); }
.lt-task-pill.lt-live { background: color-mix(in srgb, var(--lt-blue) 22%, transparent); color: var(--lt-blue); }
.lt-task-pill.lt-ok { background: color-mix(in srgb, #2f9e5f 20%, transparent); color: #2f9e5f; }
.lt-task-pill.lt-err { background: color-mix(in srgb, #d2453d 20%, transparent); color: #d2453d; }
.lt-task-title { flex: 1; min-width: 0; font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lt-task-body { flex: 1; min-height: 0; display: flex; }
.lt-task-steps { flex: none; width: 300px; overflow-y: auto; padding: 10px 8px; border-right: 1px solid var(--lt-divider); display: flex; flex-direction: column; gap: 1px; }
.lt-task-step { display: flex; align-items: flex-start; gap: 10px; width: 100%; padding: 8px 10px; border: 0; border-radius: 10px; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.lt-task-step:hover, .lt-task-step.lt-active { background: var(--lt-hover); }
.lt-task-step-icon { width: 24px; height: 24px; border-radius: 7px; display: inline-flex; align-items: center; justify-content: center; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); flex: none; }
.lt-task-step-icon.lt-ok { color: #2f9e5f; }
.lt-task-step-icon.lt-err { color: #d2453d; }
.lt-task-step-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.lt-task-step-title { font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lt-task-step-time { font-size: 11.5px; color: var(--dsw-alias-label-dimmed); }
.lt-task-detail { flex: 1; min-width: 0; overflow-y: auto; padding: 18px 22px 28px; display: flex; flex-direction: column; gap: 14px; }
.lt-task-detail h3 { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--dsw-alias-label-tertiary); margin: 0 0 6px; }
.lt-task-detail pre { margin: 0; padding: 12px 14px; border-radius: 12px; background: var(--dsw-alias-bg-layer-2); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; line-height: 1.55; white-space: pre-wrap; word-break: break-word; max-height: 320px; overflow: auto; }
.lt-task-muted { font-size: 13.5px; color: var(--dsw-alias-label-tertiary); }
.lt-task-empty { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 13.5px; color: var(--dsw-alias-label-tertiary); }
/* the profile drawer's Identity tab */
.lt-pf-card { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 14px; background: var(--lt-card); margin: 4px 0 10px; }
.lt-pf-card-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.lt-pf-card-name { font-size: 15px; font-weight: 600; }
.lt-pf-card-sub { font-size: 12px; color: var(--dsw-alias-label-tertiary); }
.lt-pf-doc { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 14px; border: 0; border-radius: 14px; background: var(--lt-card); color: inherit; font: inherit; text-align: left; cursor: pointer; margin-bottom: 8px; }
.lt-pf-doc:hover { background: var(--dsw-alias-bg-layer-2); }
.lt-pf-doc-icon { width: 36px; height: 36px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); flex: none; }
.lt-pf-doc-soul .lt-pf-doc-icon { background: color-mix(in srgb, var(--lt-accent) 22%, transparent); color: var(--lt-accent); }
.lt-pf-doc-memory .lt-pf-doc-icon { background: color-mix(in srgb, var(--lt-blue) 20%, transparent); color: var(--lt-blue); }
.lt-pf-doc-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.lt-pf-doc-title { font-size: 14px; font-weight: 600; }
.lt-pf-doc-sub { font-size: 12px; color: var(--dsw-alias-label-tertiary); }
.lt-pf-stop { width: 26px; height: 26px; border: 0; border-radius: 50%; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; flex: none; }
.lt-pf-stop:hover { background: #d2453d; color: #fff; }
.lt-pf-row-chev { color: var(--dsw-alias-label-dimmed); flex: none; display: inline-flex; transition: transform 120ms; }
.lt-pf-row-chev.lt-open { transform: rotate(180deg); }
.lt-pf-approval { cursor: pointer; }
.lt-pf-task.lt-clickable { cursor: pointer; }
.lt-pf-row-time { flex: none; font-size: 11.5px; color: var(--dsw-alias-label-dimmed); }
.lt-pf-card-actions { display: flex; align-items: center; gap: 6px; }
.lt-pf-doc-foot { flex: none; display: flex; flex-direction: column; align-items: flex-end; gap: 2px; font-size: 11px; color: var(--dsw-alias-label-dimmed); }
.lt-seg-btn.lt-seg-text { min-width: 0; padding: 0 12px; font-size: 12.5px; }
.lt-task-loading { padding: 24px; font-size: 13.5px; color: var(--dsw-alias-label-tertiary); }
.lt-task-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--dsw-alias-label-dimmed); }
.lt-task-step-text { font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lt-task-detail-title { font-size: 16px; font-weight: 600; margin: 0 0 4px; }
.lt-task-block { display: flex; flex-direction: column; gap: 6px; }
.lt-task-label { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--dsw-alias-label-tertiary); }
.lt-task-pre { margin: 0; padding: 12px 14px; border-radius: 12px; background: var(--dsw-alias-bg-layer-2); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; line-height: 1.55; white-space: pre-wrap; word-break: break-word; max-height: 320px; overflow: auto; }
/* The approval card: a dark rounded card with a shield, Allow in blue. */
/* The approval card, Muse-shaped: shield + headline, Allow (blue) first, then Reject. */
html[data-lingtai] [data-approval-key] > div { background: var(--lt-card) !important; border: 1px solid var(--lt-divider) !important; border-radius: 18px !important; box-shadow: 0 10px 30px rgba(0,0,0,0.18) !important; padding: 14px 16px !important; outline: none !important; }
html[data-lingtai] [data-approval-key] > div > :first-child { font-size: 12px; color: var(--dsw-alias-label-tertiary); background: transparent !important; padding: 0 !important; border: 0 !important; margin-bottom: 6px; }
html[data-lingtai] [data-approval-key] > div > :first-child::before { content: ''; display: inline-block; width: 16px; height: 16px; margin-right: 6px; vertical-align: -3px; background: currentColor; -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5 5 6.2v5.3c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6.2z"/><path d="m9 12 2 2 4-4"/></svg>') center / contain no-repeat; mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5 5 6.2v5.3c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6.2z"/><path d="m9 12 2 2 4-4"/></svg>') center / contain no-repeat; }
html[data-lingtai] [data-approval-key] [data-approval-scroll] > :first-child { font-size: 15px; font-weight: 600; line-height: 1.4; color: var(--dsw-alias-label-primary); }
html[data-lingtai] [data-approval-key] > div > :last-child { display: flex; flex-direction: row-reverse; justify-content: flex-end; gap: 8px; margin-top: 12px; }
html[data-lingtai] [data-approval-key] > div > :last-child button { border-radius: 999px !important; min-height: 36px; padding: 0 20px !important; font-weight: 500; border: 0 !important; box-shadow: none !important; }
html[data-lingtai] [data-approval-key] > div > :last-child button:last-child { background: var(--lt-blue) !important; color: #fff !important; }
html[data-lingtai] [data-approval-key] > div > :last-child button:last-child:hover { filter: brightness(1.08); }
html[data-lingtai] [data-approval-key] > div > :last-child button:not(:last-child) { background: var(--lt-field) !important; color: var(--dsw-alias-label-primary) !important; }

/* ---- the profile drawer ------------------------------------------------ */
.lt-pf { position: fixed; top: 0; right: 0; bottom: 0; width: 310px; z-index: 60; display: flex; flex-direction: column; background: var(--lt-base); color: var(--dsw-alias-label-primary); border-left: 1px solid var(--lt-divider); outline: none; animation: lt-slide-in 180ms ease-out; }
html[data-lt-profile] [class*="_centerCol"] { padding-right: 310px; box-sizing: border-box; }
@keyframes lt-slide-in { from { transform: translateX(24px); opacity: 0; } to { transform: none; opacity: 1; } }
.lt-pf-top { flex: none; display: flex; align-items: center; padding: 10px 10px 0; min-height: 40px; }
html[data-lt-platform='darwin']:not([data-lt-fullscreen]) .lt-pf-top { padding-top: 12px; }
.lt-pf-head { flex: none; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 6px 20px 16px; }
.lt-pf-face { position: relative; }
.lt-pf-face-btn { display: block; border: 0; padding: 0; background: transparent; border-radius: 50%; cursor: pointer; }
.lt-pf-face-btn:focus-visible { outline: 2px solid var(--lt-accent); outline-offset: 3px; }
.lt-pf-pen { position: absolute; right: -2px; bottom: 0; width: 26px; height: 26px; border-radius: 50%; border: 2px solid var(--lt-base); background: var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-primary); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0; }
.lt-pf-pen:hover { background: var(--lt-blue); color: #fff; }
.lt-menu.lt-pf-menu { position: absolute; left: 50%; top: calc(100% + 6px); transform: translateX(-50%); min-width: 160px; }
.lt-pf-name { font-size: 18px; font-weight: 600; margin-top: 4px; }
.lt-pf-status { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--dsw-alias-label-secondary); }
.lt-pf .lt-seg { align-self: center; margin: 0 20px 10px; }
.lt-pf-body { flex: 1; min-height: 0; overflow-y: auto; padding: 4px 16px 20px; }
.lt-pf-day { font-size: 12px; font-weight: 600; letter-spacing: 0.04em; color: var(--dsw-alias-label-tertiary); padding: 10px 4px 6px; }
.lt-pf-rows { display: flex; flex-direction: column; gap: 2px; }
.lt-pf-row { display: flex; align-items: center; gap: 10px; padding: 8px 6px; border-radius: 10px; }
.lt-pf-row:hover { background: var(--lt-hover); }
.lt-pf-row-icon { width: 32px; height: 32px; border-radius: 9px; display: inline-flex; align-items: center; justify-content: center; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); flex: none; }
.lt-pf-row-icon.lt-live { color: var(--lt-accent); }
.lt-pf-row-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.lt-pf-row-title { font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lt-pf-row-sub { font-size: 12px; color: var(--dsw-alias-label-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lt-pf-row-sub.lt-wrap { white-space: normal; line-height: 1.45; }
.lt-pf-empty { font-size: 13px; line-height: 1.55; color: var(--dsw-alias-label-tertiary); margin: 6px 4px; }
.lt-pf-stack { display: flex; flex-direction: column; gap: 10px; }
.lt-pf-label { font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-tertiary); }
.lt-pf-actions { display: flex; gap: 8px; }
.lt-pf-preview { display: flex; justify-content: center; padding: 6px 0; }
.lt-pf-choices { display: flex; flex-wrap: wrap; gap: 6px; }
.lt-pf-choice { width: 36px; height: 36px; border-radius: 10px; border: 2px solid transparent; background: var(--dsw-alias-bg-layer-2); font-size: 20px; cursor: pointer; }
.lt-pf-choice.lt-active { border-color: var(--lt-blue); }
.lt-pf-swatch { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; box-shadow: 0 0 0 1px rgba(0,0,0,0.12); }
.lt-pf-swatch.lt-active { border-color: var(--dsw-alias-label-primary); }

/* ---- the devices page ------------------------------------------------- */
.lt-page { height: 100%; min-height: 0; overflow: auto; box-sizing: border-box; padding: 28px 32px 40px; color: var(--dsw-alias-label-primary); }
.lt-page-inner { max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 18px; }
.lt-page h1 { font-size: 22px; font-weight: 600; margin: 0; }
.lt-page h2 { font-size: 13px; font-weight: 600; margin: 10px 0 0; color: var(--dsw-alias-label-tertiary); text-transform: uppercase; letter-spacing: 0.06em; }
.lt-lead { font-size: 14px; line-height: 1.55; color: var(--dsw-alias-label-secondary); margin: 0; }
.lt-card { background: var(--lt-card); border-radius: var(--lt-radius); padding: 4px 14px; }
.lt-row { display: flex; align-items: center; gap: 12px; padding: 11px 0; font-size: 14px; border-bottom: 1px solid var(--lt-divider); }
.lt-row:last-child { border-bottom: 0; }
.lt-row-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); flex: none; }
.lt-row-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.lt-row-title { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lt-row-sub { font-size: 12.5px; line-height: 1.45; color: var(--dsw-alias-label-tertiary); }
.lt-row-sub.lt-wrap { white-space: normal; }
.lt-row-chevron { color: var(--dsw-alias-label-tertiary); flex: none; }
.lt-row-link { display: flex; align-items: center; gap: 12px; width: 100%; padding: 11px 0; border: 0; border-bottom: 1px solid var(--lt-divider); background: transparent; color: inherit; font: inherit; font-size: 14px; text-align: left; cursor: pointer; }
.lt-row-link:last-child { border-bottom: 0; }
.lt-row-link:hover .lt-row-title { color: var(--lt-blue); }
.lt-switch { position: relative; width: 40px; height: 24px; border-radius: 999px; border: 0; padding: 0; background: var(--dsw-alias-bg-layer-3); cursor: pointer; transition: background 120ms; flex: none; }
.lt-switch::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.3); transition: transform 120ms; }
.lt-switch[aria-checked="true"] { background: var(--lt-blue); }
.lt-switch[aria-checked="true"]::after { transform: translateX(16px); }
.lt-switch:disabled { opacity: 0.5; cursor: default; }

/* ---- settings dialog -------------------------------------------------- */
.lt-settings-overlay { position: fixed; inset: 0; z-index: 70; display: flex; align-items: center; justify-content: center; }
.lt-settings-mask { position: absolute; inset: 0; background: var(--dsw-alias-bg-mask-1, rgba(0,0,0,0.3)); }
.lt-settings { position: relative; width: min(900px, calc(100vw - 48px)); height: min(620px, calc(100vh - 48px)); display: flex; border-radius: 18px; overflow: hidden; background: var(--lt-base); color: var(--dsw-alias-label-primary); box-shadow: 0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px var(--lt-divider); outline: none; }
.lt-settings-nav { width: 212px; flex: none; display: flex; flex-direction: column; background: var(--lt-base); border-right: 1px solid var(--lt-divider); padding: 18px 10px 12px; box-sizing: border-box; overflow: auto; }
.lt-settings-title { font-size: 16px; font-weight: 600; padding: 0 10px 12px; outline: none; }
.lt-settings-group { font-size: 11.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dsw-alias-label-tertiary); padding: 12px 10px 6px; }
.lt-settings-cell { display: flex; align-items: center; gap: 10px; width: 100%; border: 0; text-align: left; padding: 8px 10px; border-radius: 10px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 14px; cursor: pointer; }
.lt-settings-cell:hover { background: var(--lt-hover); color: var(--dsw-alias-label-primary); }
.lt-settings-cell.lt-active { background: var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-primary); }
.lt-settings-cell.lt-danger { color: var(--dsw-alias-state-error-primary, #d2453d); }
.lt-settings-cell svg { flex: none; }
.lt-settings-cell-label { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lt-settings-foot { margin-top: auto; padding-top: 10px; }
.lt-settings-content { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.lt-settings-head { flex: none; display: flex; align-items: center; justify-content: flex-end; gap: 6px; padding: 12px 14px 0; min-height: 36px; }
.lt-settings-back { margin: 0 auto 0 14px; }
.lt-settings-body { flex: 1; min-height: 0; overflow: auto; padding: 8px 28px 28px; }
.lt-settings-body > * { max-width: 560px; }
.lt-settings-body .lt-page { padding: 0; height: auto; overflow: visible; }
.lt-settings-body .lt-page h1 { display: none; }
.lt-general { display: flex; flex-direction: column; }
/* General, Muse's way: the account card, the usage bars, the key cap */
.lt-usage { padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
.lt-usage-row { display: flex; align-items: center; justify-content: space-between; font-size: 14px; }
.lt-usage-plan { font-weight: 600; }
.lt-usage-pct { font-size: 12.5px; color: var(--dsw-alias-label-secondary); }
.lt-usage-bar { height: 6px; border-radius: 3px; background: var(--lt-hover); overflow: hidden; }
.lt-usage-bar > span { display: block; height: 100%; border-radius: 3px; background: var(--lt-accent); transition: width 240ms; }
.lt-usage-fine { font-size: 12px; color: var(--dsw-alias-label-tertiary); }
.lt-usage-link { font-size: 13px; color: var(--lt-blue); text-decoration: none; align-self: flex-start; }
.lt-ways { display: flex; flex-direction: column; gap: 10px; margin-top: 6px; padding-top: 10px; border-top: 1px solid var(--lt-divider); }
.lt-ways-lead { font-size: 13px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.lt-way { display: flex; gap: 10px; align-items: flex-start; }
.lt-way-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex: none; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); }
.lt-way-main { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.lt-way-title { font-size: 13.5px; font-weight: 500; }
.lt-way-sub { font-size: 12.5px; line-height: 1.45; color: var(--dsw-alias-label-tertiary); }
.lt-refusal .lt-allowance.lt-ways { border-top: 0; padding-top: 0; margin-top: 0; }
.lt-allowance > .lt-ways-lead { font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-primary); }
.lt-allowance .lt-ways { border-top: 0; padding-top: 0; margin-top: 0; gap: 8px; }
.lt-aw-more { display: inline-flex; align-items: center; gap: 2px; color: var(--dsw-alias-label-secondary); }
.lt-aw-chevron { display: inline-flex; transition: transform 120ms; }
.lt-aw-chevron.lt-aw-open { transform: rotate(90deg); }
.lt-aw-list { list-style: none; margin: 6px 0 0; padding: 0; display: flex; flex-direction: column; gap: 4px; font-size: 12.5px; }
.lt-aw-list li { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 12px; align-items: baseline; }
.lt-aw-list-actions { display: inline-flex; gap: 8px; }
.lt-aw-list-actions .lt-ob-link.lt-inline { color: var(--lt-blue); text-decoration: none; }
.lt-refusal { display: flex; flex-direction: column; gap: 10px; padding: 12px 14px; margin: 4px 0; border: 1px solid var(--lt-divider); max-width: 100%; }
.lt-refusal-text { font-size: 13.5px; line-height: 1.5; color: var(--dsw-alias-label-primary); }
.lt-refusal-sub { font-size: 12.5px; line-height: 1.45; overflow-wrap: anywhere; }
.lt-refusal-actions { flex-wrap: wrap; }
.lt-refusal-details summary { font-size: 12px; cursor: pointer; }
.lt-refusal-details pre { margin: 6px 0 0; padding: 8px 10px; border-radius: 8px; background: var(--lt-hover); font-size: 11.5px; line-height: 1.4; white-space: pre-wrap; overflow-wrap: anywhere; color: var(--dsw-alias-label-secondary); }
.lt-headsup { display: flex; align-items: flex-start; gap: 8px; margin: 0 0 6px; padding: 8px 12px; border-radius: 12px; font-size: 12.5px; line-height: 1.45; background: color-mix(in srgb, var(--lt-accent) 12%, transparent); color: var(--dsw-alias-label-primary); }
.lt-headsup-icon { display: inline-flex; margin-top: 2px; color: var(--lt-accent); flex: none; }
.lt-headsup-text { flex: 1; min-width: 0; }
.lt-headsup-text .lt-ob-link.lt-inline { color: var(--lt-blue); font-weight: 600; font-size: 12.5px; }
.lt-headsup-close { width: 22px; height: 22px; flex: none; }
.lt-star-card { display: flex; flex-direction: column; gap: 10px; padding: 12px 14px; border-radius: var(--lt-radius); background: var(--lt-card); border: 1px solid var(--lt-divider); }
.lt-star-head { display: flex; gap: 10px; align-items: flex-start; }
.lt-star-icon { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex: none; background: color-mix(in srgb, var(--lt-accent) 18%, transparent); color: var(--lt-accent); }
.lt-star-title { font-size: 13.5px; font-weight: 600; }
.lt-star-text { font-size: 12.5px; line-height: 1.45; color: var(--dsw-alias-label-secondary); }
.lt-star-actions { display: flex; gap: 8px; }
.lt-header-star { color: var(--lt-accent); }
.lt-header-star .lt-ob-link { color: var(--lt-blue); }
.lt-kbd { font-size: 12px; padding: 3px 8px; border-radius: 6px; background: var(--lt-hover); color: var(--dsw-alias-label-secondary); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; flex: none; }
.lt-hotkey { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex: none; max-width: 60%; }
.lt-hotkey-row { display: flex; align-items: center; gap: 6px; }
.lt-hotkey-recording { border: 1px dashed var(--dsw-alias-label-primary); background: transparent; color: var(--dsw-alias-label-primary); cursor: default; font-family: inherit; }
.lt-hotkey-recording:focus-visible { outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 1px; }
.lt-hotkey-hint { font-size: 12px; color: var(--dsw-alias-label-secondary); text-align: right; white-space: normal; line-height: 1.4; }
.lt-harness-rows > [data-slot] > * { border-bottom: 1px solid var(--lt-divider); }
.lt-harness-rows > [data-slot] > :last-child { border-bottom: 0; }
/* Connectors, Muse's shape: a search, connected / available rows with a trailing Connect, a detail per connector */
.lt-cn-search { margin: 0 0 4px; height: 36px; }
.lt-cn-row { padding: 0; gap: 0; }
.lt-cn-main { flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px; padding: 11px 0; border: 0; background: none; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.lt-cn-main:hover .lt-row-title { color: var(--lt-accent); }
.lt-cn-connect { flex: none; border: 0; background: none; color: var(--lt-blue); font: inherit; font-size: 13px; font-weight: 600; padding: 6px 10px; border-radius: 8px; cursor: pointer; }
.lt-cn-connect:hover { background: var(--lt-hover); }
.lt-cn-connect-big { background: var(--lt-blue); color: #fff; padding: 7px 16px; border-radius: 999px; }
.lt-cn-connect-big:hover { background: var(--lt-blue-hover); }
.lt-cn-back { align-self: flex-start; display: inline-flex; align-items: center; gap: 2px; border: 0; background: none; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 13px; padding: 4px 8px 4px 2px; border-radius: 8px; cursor: pointer; margin-bottom: -6px; }
.lt-cn-back:hover { background: var(--lt-hover); color: var(--dsw-alias-label-primary); }
.lt-cn-hero { display: flex; align-items: flex-start; gap: 14px; }
.lt-cn-hero-icon { flex: none; width: 48px; height: 48px; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; background: var(--lt-card); color: var(--dsw-alias-label-primary); }
.lt-cn-hero-main { flex: 1; min-width: 0; }
.lt-cn-hero-main h3 { margin: 4px 0 4px; font-size: 17px; font-weight: 600; }
.lt-cn-hero-main p { margin: 0; font-size: 13px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.lt-cn-state { margin-top: 10px; }
.lt-cn-consent { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; }
.lt-cn-consent-lead { margin: 4px 0 0; font-size: 13.5px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.lt-sheet-body .lt-card + h2, .lt-sheet-body h2 { font-size: 13px; font-weight: 600; margin: 18px 0 8px; color: var(--dsw-alias-label-tertiary); text-transform: uppercase; letter-spacing: 0.06em; }
.lt-cn-steps { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 10px; font-size: 13.5px; line-height: 1.5; }
.lt-cn-command { position: relative; margin-top: 6px; }
.lt-cn-command pre { margin: 0; padding: 10px 40px 10px 12px; border-radius: 10px; background: var(--lt-card); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; line-height: 1.5; white-space: pre-wrap; word-break: break-all; }
.lt-cn-copy { position: absolute; top: 6px; right: 6px; width: 28px; height: 28px; border: 0; border-radius: 8px; background: transparent; color: var(--dsw-alias-label-secondary); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
.lt-cn-copy:hover { background: var(--lt-hover); color: var(--dsw-alias-label-primary); }
.lt-cn-redirect { font-size: 12px; padding: 2px 6px; border-radius: 6px; background: var(--dsw-alias-bg-layer-2); user-select: all; white-space: nowrap; }
.lt-cn-redirect-line { display: inline-flex; flex-wrap: wrap; align-items: baseline; gap: 4px 6px; }
.lt-cn-redirect-copy { border: 0; padding: 0 4px; background: transparent; color: var(--lt-accent, var(--dsw-alias-label-primary)); font: inherit; font-size: 12.5px; cursor: pointer; }
.lt-cn-redirect-copy:hover { text-decoration: underline; }
.lt-cn-chips { margin: 2px 0 6px; }
.lt-chip-on, .lt-chip-on:hover { background: var(--dsw-alias-label-primary); color: var(--dsw-alias-bg-layer-1, #fff); }
.lt-cn-mark { flex: none; display: inline-flex; align-items: center; justify-content: center; border-radius: 10px; background: #fff; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08); }
.lt-cn-mark svg { display: block; }
.lt-cn-mark-letter { color: #fff; font-weight: 700; letter-spacing: 0; box-shadow: none; }
.lt-cn-builtin-mark { flex: none; }
.lt-cn-static { cursor: default; }
.lt-cn-static:hover .lt-row-title { color: inherit; }
.lt-cn-sub-warn { color: #c2410c; }
.lt-cn-warn { margin: 6px 0 0; font-size: 13px; line-height: 1.5; color: #c2410c; }
.lt-cn-hero-mark { flex: none; display: inline-flex; }
.lt-cn-hero-mark .lt-cn-mark { border-radius: 14px; }
.lt-cn-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.lt-cn-pill { min-height: 34px; padding: 0 14px; font-size: 13px; }
.lt-cn-pill-danger, .lt-cn-pill-danger:hover:not(:disabled) { background: #c2410c; color: #fff; box-shadow: none; }
.lt-cn-pill-spin { border-color: rgba(255, 255, 255, 0.35); border-top-color: #fff; }
.lt-cn-tools-lead { margin: 10px 0 -4px; white-space: normal; line-height: 1.5; }
.lt-cn-tool-off .lt-row-main { opacity: 0.55; }
.lt-cn-url code { font-size: 11.5px; word-break: break-all; }
.lt-cn-registry { margin-top: 4px; }
.lt-cn-registry-note { margin: 10px 0; }
.lt-cn-wait { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; padding: 12px 14px; border-radius: 12px; background: var(--lt-card); font-size: 13.5px; line-height: 1.5; }
.lt-cn-wait-failed { flex-direction: column; align-items: flex-start; gap: 2px; }
.lt-cn-wait-failed strong { color: #c2410c; }
.lt-cn-key-where { margin: 0 0 10px; font-size: 13.5px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.lt-cn-key, .lt-cn-field { margin-bottom: 10px; font-size: 14px; }
.lt-cn-custom-lead { margin: 0 0 12px; }
.lt-cn-more { border: 0; background: none; color: var(--lt-blue); font: inherit; font-size: 13px; padding: 0 0 10px; cursor: pointer; }
.lt-sheet-body .lt-fine { margin-top: 14px; }

.lt-close { width: 30px; height: 30px; border: 0; padding: 0; border-radius: 50%; background: var(--lt-hover); color: var(--dsw-alias-label-secondary); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.lt-close:hover { background: var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-primary); }
.lt-advanced-note { font-size: 12.5px; line-height: 1.5; color: var(--dsw-alias-label-tertiary); margin: 0 0 14px; }
.lt-section { display: flex; flex-direction: column; gap: 16px; }
.lt-section h2 { font-size: 13px; font-weight: 600; margin: 8px 0 -8px; color: var(--dsw-alias-label-tertiary); text-transform: uppercase; letter-spacing: 0.06em; }
.lt-section p { font-size: 13.5px; line-height: 1.55; color: var(--dsw-alias-label-secondary); margin: 0; }

/* ---- the first run: the whole window ----------------------------------- */
.lt-ob { position: fixed; inset: 0; z-index: 90; display: flex; align-items: center; justify-content: center; background: var(--lt-base); color: var(--dsw-alias-label-primary); font-family: var(--lt-font); outline: none; animation: lt-fade-in 220ms ease-out; }
.lt-ob.lt-ob-fading { opacity: 0; transition: opacity 240ms ease-in; }
@keyframes lt-fade-in { from { opacity: 0; } to { opacity: 1; } }
.lt-ob-drag { position: absolute; top: 0; left: 0; right: 0; height: 40px; }
.lt-ob-center { display: flex; flex-direction: column; align-items: center; gap: 18px; width: min(360px, calc(100vw - 48px)); text-align: center; animation: lt-rise 260ms ease-out; }
@keyframes lt-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.lt-ob-title { font-size: 26px; font-weight: 600; letter-spacing: -0.01em; margin: 6px 0 2px; line-height: 1.25; }
.lt-ob-title-sm { font-size: 22px; }
.lt-ob-sub { font-size: 14px; line-height: 1.55; color: var(--dsw-alias-label-secondary); margin: -6px 0 0; }
.lt-ob-cta { min-width: 132px; margin-top: 6px; }
.lt-ob-wide { width: 100%; }
.lt-ob-form { gap: 14px; }
.lt-ob-form .lt-ob-title { margin-bottom: 8px; }
.lt-ob-fine { font-size: 12px; line-height: 1.55; color: var(--dsw-alias-label-tertiary); margin: -4px 0 0; }
.lt-ob-fine a { color: var(--dsw-alias-label-secondary); text-decoration: underline; text-underline-offset: 2px; }
.lt-ob-links { display: flex; align-items: center; gap: 10px; margin-top: 2px; }
.lt-ob-sep { color: var(--dsw-alias-label-dimmed); }
.lt-ob-link { border: 0; background: transparent; padding: 6px 8px; border-radius: 8px; color: var(--dsw-alias-label-tertiary); font: inherit; font-size: 13px; cursor: pointer; }
.lt-ob-link:hover { color: var(--dsw-alias-label-primary); background: var(--lt-hover); }
.lt-ob-link.lt-inline { padding: 0 2px; font-size: 12px; text-decoration: underline; text-underline-offset: 2px; }
.lt-ob-link.lt-inline:hover { background: transparent; }
.lt-ob-link:disabled { opacity: 0.5; cursor: default; }
.lt-ob-error { font-size: 13px; color: var(--dsw-alias-state-error-primary, #d2453d); }
.lt-code { position: relative; display: flex; gap: 8px; justify-content: center; cursor: text; }
.lt-code-input { position: absolute; inset: 0; width: 100%; opacity: 0; border: 0; font-size: 16px; }
.lt-code-box { width: 46px; height: 54px; border-radius: 12px; background: var(--lt-field); border: 1px solid var(--lt-field-border); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 600; transition: border-color 120ms; }
.lt-code:focus-within .lt-code-caret { border-color: var(--lt-blue); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lt-blue) 25%, transparent); }
.lt-ob-slide-wrap { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
.lt-ob-pager { position: absolute; top: 16px; right: 18px; display: flex; gap: 6px; }
html[data-lt-platform='darwin']:not([data-lt-fullscreen]) .lt-ob-pager { top: 14px; }
.lt-ob-pager-btn { width: 30px; height: 30px; border: 0; border-radius: 50%; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.lt-ob-pager-btn:hover:not(:disabled) { background: var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-primary); }
.lt-ob-pager-btn:disabled { opacity: 0.35; cursor: default; }
.lt-ob-slide { width: min(400px, calc(100vw - 48px)); gap: 14px; }
.lt-ob-slide .lt-ob-wide { width: auto; min-width: 150px; align-self: center; }
.lt-ob-skip { border: 0; background: transparent; padding: 8px 14px; border-radius: 10px; color: var(--dsw-alias-label-primary); font: inherit; font-size: 15px; cursor: pointer; }
.lt-ob-skip:hover { background: var(--lt-hover); }
.lt-ob-dots { display: flex; gap: 6px; justify-content: center; margin-top: -4px; }
.lt-ob-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--dsw-alias-label-dimmed); opacity: 0.55; }
.lt-ob-dot.lt-on { background: var(--dsw-alias-label-primary); opacity: 1; }
.lt-ob-mode { flex: none; font-size: 12.5px; color: var(--dsw-alias-label-secondary); }
.lt-ob-folder { display: inline-flex; align-items: center; gap: 8px; max-width: 100%; align-self: center; padding: 6px 12px; border-radius: 999px; background: var(--lt-card); font-size: 12.5px; color: var(--dsw-alias-label-secondary); }
.lt-ob-folder-path { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lt-ob-card-label { align-self: flex-start; font-size: 12px; color: var(--dsw-alias-label-tertiary); margin: 0 0 -8px 6px; }
.lt-ob-card { width: 100%; box-sizing: border-box; border-radius: 16px; background: var(--lt-card); padding: 2px 14px; text-align: left; box-shadow: 0 0 0 1px var(--lt-divider); }
.lt-ob-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--lt-divider); }
.lt-ob-row:last-child { border-bottom: 0; }
.lt-ob-row-icon { width: 34px; height: 34px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); flex: none; }
.lt-ob-row-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.lt-ob-row-title { font-size: 14px; font-weight: 500; }
.lt-ob-row-sub { font-size: 12.5px; color: var(--dsw-alias-label-tertiary); }
.lt-ob-path { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; direction: rtl; text-align: left; }
.lt-ob-relaunch { display: flex; align-items: center; gap: 12px; margin-top: 10px; padding: 10px 12px; border-radius: 12px; background: color-mix(in srgb, #2f9e5f 12%, transparent); font-size: 12.5px; line-height: 1.4; color: var(--dsw-alias-label-secondary); }
.lt-ob-relaunch > span { flex: 1; }
.lt-row > .lt-ob-relaunch, .lt-card > .lt-ob-relaunch { margin: 6px 12px 10px; }
.lt-ob-granted { width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, #2f9e5f 22%, transparent); color: #2f9e5f; flex: none; }
.lt-ob-granted.lt-ob-pending { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-dimmed); }
.lt-art { display: block; margin: 0 auto 4px; }
.lt-art-back { fill: var(--dsw-alias-bg-layer-2); }
.lt-art-mid { fill: var(--dsw-alias-bg-layer-3); }
.lt-art-front { fill: var(--lt-card); stroke: var(--lt-divider); }
.lt-art-dot { fill: var(--dsw-alias-label-dimmed); }
.lt-art-line { fill: var(--dsw-alias-bg-layer-3); }
.lt-art-cursor { fill: var(--dsw-alias-label-primary); }
.lt-art-accent { fill: var(--lt-accent); }
.lt-art-link { stroke: var(--lt-accent); stroke-width: 2.5; stroke-dasharray: 4 6; stroke-linecap: round; }

/* ---- the rooms: Feed, Ideas, Goals, Library ---------------------------- */
.lt-room { position: relative; display: flex; flex-direction: column; height: 100%; min-height: 0; color: var(--dsw-alias-label-primary); background: var(--lt-base); }
.lt-room-top { flex: none; height: 8px; }
html[data-lt-platform='darwin']:not([data-lt-fullscreen]) .lt-room-top { height: 30px; }
.lt-room-head { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 40px 6px; max-width: 920px; width: 100%; box-sizing: border-box; margin: 0 auto; }
.lt-room-title { font-size: 26px; font-weight: 600; letter-spacing: -0.01em; margin: 0; }
.lt-room-actions { display: flex; align-items: center; gap: 8px; }
.lt-room-busy { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--dsw-alias-label-tertiary); margin-right: 4px; }
.lt-spinner-sm { width: 14px; height: 14px; border-width: 2px; }
.lt-round-btn { width: 36px; height: 36px; border: 0; padding: 0; border-radius: 50%; background: var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-primary); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.lt-round-btn:hover { background: var(--dsw-alias-bg-layer-2); }
.lt-more.lt-icon-btn { border-radius: 50%; background: var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-primary); }
.lt-more.lt-icon-btn:hover { background: var(--dsw-alias-bg-layer-2); }
.lt-more.lt-quiet { background: transparent; color: var(--dsw-alias-label-secondary); opacity: 0; transition: opacity 120ms; }
.lt-more.lt-quiet:hover { background: var(--dsw-alias-bg-layer-3); }
:is(.lt-post, .lt-idea, .lt-goal, .lt-lib-card, .lt-auto-row):hover .lt-more.lt-quiet, .lt-more.lt-quiet:focus-visible, .lt-more.lt-quiet[aria-expanded="true"] { opacity: 1; }
.lt-room-body { flex: 1; min-height: 0; overflow-y: auto; }
.lt-room-inner { max-width: 920px; margin: 0 auto; padding: 4px 40px 48px; box-sizing: border-box; }
.lt-room-h2 { font-size: 15px; font-weight: 600; margin: 26px 0 8px; }
.lt-room-error { font-size: 13px; color: var(--dsw-alias-state-error-primary, #d2453d); padding: 8px 0; }
.lt-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; min-height: 320px; text-align: center; color: var(--dsw-alias-label-tertiary); }
.lt-empty-icon { display: inline-flex; color: var(--dsw-alias-label-dimmed); }
.lt-empty-text { font-size: 14px; }
.lt-empty-sub { max-width: 420px; font-size: 13px; line-height: 1.55; margin: 0 0 6px; }
.lt-menu-item.lt-danger { color: var(--dsw-alias-state-error-primary, #d2453d); }
.lt-pill-danger { background: var(--dsw-alias-state-error-primary, #d2453d); }
.lt-pill-danger:hover:not(:disabled) { background: #b8352f; }
/* sheets */
/* our className lands on the primitives' dialog card itself: resize and recolour it, the sheet fills it */
.lt-sheet-modal[role="dialog"] { width: min(520px, 100%); max-height: 100%; padding: 0; gap: 0; border-radius: 18px; background: var(--lt-base); color: var(--dsw-alias-label-primary); box-shadow: 0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px var(--lt-divider); }
.lt-sheet-modal.lt-wide[role="dialog"] { width: min(600px, 100%); }
.lt-sheet { width: 100%; max-height: 100%; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
.lt-sheet-head { flex: none; display: flex; align-items: center; gap: 8px; padding: 16px 16px 8px 20px; }
.lt-sheet-title { flex: 1; min-width: 0; font-size: 17px; font-weight: 600; margin: 0; line-height: 1.3; }
.lt-sheet-body { flex: 1; min-height: 0; overflow-y: auto; padding: 4px 20px 16px; }
.lt-sheet-foot { flex: none; padding: 10px 16px 16px; }
.lt-sheet-actions { display: flex; align-items: center; gap: 8px; }
.lt-sheet-form { display: flex; flex-direction: column; gap: 12px; }
.lt-sheet-lead { font-size: 14px; line-height: 1.6; color: var(--dsw-alias-label-secondary); margin: 0; }
.lt-sheet-fine { font-size: 12px; line-height: 1.55; color: var(--dsw-alias-label-tertiary); margin: 0; }
.lt-textarea { box-sizing: border-box; width: 100%; padding: 12px 14px; border: 1px solid var(--lt-field-border); border-radius: 14px; background: var(--lt-field); color: var(--dsw-alias-label-primary); font: inherit; font-size: 14px; line-height: 1.55; resize: vertical; outline: none; }
.lt-textarea:focus { border-color: var(--lt-blue); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lt-blue) 25%, transparent); }
.lt-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.lt-chip { border: 0; padding: 7px 12px; border-radius: 999px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); font: inherit; font-size: 12.5px; line-height: 1.4; text-align: left; cursor: pointer; }
.lt-chip:hover { background: var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-primary); }
/* markdown the rooms render */
.lt-md { font-size: 14px; line-height: 1.65; }
.lt-md p { margin: 0 0 10px; }
.lt-md p:last-child { margin-bottom: 0; }
.lt-md a { color: var(--lt-blue); text-decoration: none; }
.lt-md a:hover { text-decoration: underline; }
.lt-md ul, .lt-md ol { margin: 0 0 10px; padding-left: 22px; }
.lt-md li { margin: 2px 0; }
.lt-md li.lt-done { text-decoration: line-through; color: var(--dsw-alias-label-tertiary); }
.lt-md h2, .lt-md h3, .lt-md h4, .lt-md h5, .lt-md h6 { margin: 18px 0 8px; line-height: 1.3; }
.lt-md h2 { font-size: 20px; } .lt-md h3 { font-size: 17px; } .lt-md h4 { font-size: 15px; } .lt-md h5, .lt-md h6 { font-size: 14px; }
.lt-md code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.92em; background: var(--dsw-alias-bg-layer-2); padding: 1px 5px; border-radius: 5px; }
.lt-md pre { background: var(--dsw-alias-bg-layer-2); padding: 12px 14px; border-radius: 12px; overflow-x: auto; margin: 0 0 12px; }
.lt-md pre code { background: transparent; padding: 0; }
.lt-md blockquote { margin: 0 0 10px; padding: 2px 0 2px 14px; border-left: 3px solid var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-secondary); }
.lt-md hr { border: 0; height: 1px; background: var(--lt-divider); margin: 16px 0; }
.lt-md table { border-collapse: collapse; margin: 0 0 12px; font-size: 13.5px; }
.lt-md th, .lt-md td { padding: 6px 12px; border-bottom: 1px solid var(--lt-divider); text-align: left; vertical-align: top; }
.lt-md th { font-weight: 600; color: var(--dsw-alias-label-secondary); }
/* feed */
.lt-feed { display: flex; flex-direction: column; gap: 6px; padding-top: 10px; }
.lt-post { display: flex; gap: 14px; padding: 16px 12px 14px; border-radius: 16px; }
.lt-post:hover { background: var(--lt-hover); }
.lt-post-mark { flex: none; width: 38px; height: 38px; border-radius: 11px; background: var(--dsw-alias-bg-layer-2); display: flex; align-items: center; justify-content: center; font-size: 20px; }
.lt-post-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.lt-post-head { display: flex; align-items: center; gap: 10px; }
.lt-post-title { flex: 1; min-width: 0; font-size: 15px; font-weight: 600; margin: 0; line-height: 1.4; }
.lt-post-when { flex: none; font-size: 12px; color: var(--dsw-alias-label-tertiary); }
.lt-post-body { color: var(--dsw-alias-label-primary); }
.lt-post-images { display: flex; gap: 8px; }
.lt-post-images img { display: block; max-width: 100%; max-height: 260px; border-radius: 12px; object-fit: cover; }
.lt-post-actions { display: flex; align-items: center; gap: 14px; margin-top: 2px; }
.lt-post-action { display: inline-flex; align-items: center; gap: 6px; border: 0; padding: 4px 6px; margin-left: -6px; border-radius: 8px; background: transparent; color: var(--dsw-alias-label-tertiary); font: inherit; font-size: 13px; cursor: pointer; }
.lt-post-action:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-2); }
.lt-post-action.lt-liked { color: #e0245e; }
.lt-post-time-full { margin-left: auto; font-size: 12px; color: var(--dsw-alias-label-dimmed); }
/* ideas */
.lt-ideas { padding-top: 4px; }
.lt-idea-group:first-child .lt-room-h2 { margin-top: 10px; }
.lt-idea { display: flex; align-items: flex-start; gap: 14px; padding: 12px 12px; margin: 0 -12px; border-radius: 14px; cursor: pointer; }
.lt-idea:hover, .lt-idea:focus-visible { background: var(--lt-hover); outline: none; }
.lt-idea-mark { flex: none; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.lt-idea-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.lt-idea-title { font-size: 15px; font-weight: 600; line-height: 1.4; }
.lt-idea-detail { font-size: 13px; line-height: 1.5; color: var(--dsw-alias-label-tertiary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.lt-idea-done { flex: none; color: var(--dsw-alias-state-success-primary, #2f9e5f); display: inline-flex; margin-top: 4px; }
.lt-idea-card section { margin-top: 18px; }
.lt-idea-card h3 { font-size: 14px; font-weight: 600; margin: 0 0 6px; }
.lt-idea-card p { font-size: 14px; line-height: 1.6; margin: 0; color: var(--dsw-alias-label-secondary); }
.lt-idea-card ul { margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6; color: var(--dsw-alias-label-secondary); }
.lt-idea-prompt { margin: 0; padding: 10px 14px; border-radius: 12px; background: var(--dsw-alias-bg-layer-2); font-size: 13.5px; line-height: 1.55; color: var(--dsw-alias-label-secondary); white-space: pre-wrap; }
.lt-idea-hero { display: flex; justify-content: center; margin: 2px 0 10px; }
.lt-idea-hero-mark { font-size: 40px; line-height: 1; }
.lt-idea-kind { display: flex; align-items: center; gap: 6px; margin-top: 12px; font-size: 13px; color: var(--dsw-alias-label-secondary); }
.lt-idea-actions { display: flex; gap: 8px; }
.lt-room-toast { margin: 0 0 10px; padding: 8px 12px; border-radius: 10px; background: var(--dsw-alias-bg-layer-2); font-size: 13px; color: var(--dsw-alias-label-secondary); }
/* goals: the agent's progress and the flag */
.lt-goal-bar { position: relative; height: 5px; border-radius: 999px; background: var(--dsw-alias-bg-layer-2); overflow: hidden; margin-top: 6px; }
.lt-goal-bar > span { position: absolute; inset: 0 auto 0 0; border-radius: 999px; background: var(--lt-accent, #1d6fe0); }
.lt-goal-bar.lt-attention > span { background: #d9480f; }
.lt-goal-flag { margin-left: 8px; font-size: 11px; font-weight: 600; color: #d9480f; }
.lt-goal-progress { display: flex; align-items: center; gap: 10px; margin: 10px 0 4px; }
.lt-goal-progress .lt-goal-bar { flex: 1; margin: 0; }
.lt-goal-pct { font-size: 12px; color: var(--dsw-alias-label-secondary); white-space: nowrap; }
.lt-goal-steps { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 6px; font-size: 14px; }
.lt-goal-steps li { display: flex; align-items: flex-start; gap: 8px; }
.lt-goal-steps li svg { flex: none; margin-top: 3px; color: var(--dsw-alias-label-secondary); }
/* the agent's app fences as cards in the chat (goal created, goal update, feed post, new look) */
.lt-fence { margin: 6px 0; padding: 12px 14px; border-radius: 16px; border: 1px solid var(--dsw-alias-divider, rgba(127,127,127,0.25)); background: var(--dsw-alias-bg-layer-1, transparent); font-size: 14px; }
.lt-fence-kind { font-size: 12px; font-weight: 500; color: var(--dsw-alias-label-secondary); }
.lt-fence-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.lt-fence-status { font-size: 12px; font-weight: 600; color: var(--lt-accent, #1d6fe0); }
.lt-fence-status.lt-attention { color: #d9480f; }
.lt-fence-title { margin-top: 4px; font-size: 16px; font-weight: 600; }
.lt-fence-sub { margin-top: 3px; font-size: 13px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.lt-fence-steps { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 4px; font-size: 13px; }
.lt-fence-steps li::before { content: '☐'; margin-right: 8px; color: var(--dsw-alias-label-secondary); }
.lt-fence-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 8px; }
.lt-fence-fine { font-size: 12px; color: var(--dsw-alias-label-secondary); }
.lt-fence-btn { border: 0; background: transparent; color: var(--lt-accent, #1d6fe0); font: inherit; font-size: 13px; font-weight: 600; padding: 4px 8px; border-radius: 8px; cursor: pointer; }
.lt-fence-btn:hover { background: var(--dsw-alias-bg-layer-2); }
.lt-fence-row { display: flex; align-items: center; gap: 10px; }
.lt-fence-main { flex: 1; min-width: 0; }
.lt-fence-tile { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; background: var(--dsw-alias-bg-layer-2); font-size: 18px; flex: none; }
.lt-fence-face { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; flex: none; }
.lt-fence .lt-goal-bar { margin-top: 10px; height: 6px; }
.lt-clamp2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
/* goals */
.lt-goals { padding-top: 8px; }
.lt-goals-label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: var(--dsw-alias-state-success-primary, #2f9e5f); padding: 6px 0 10px; }
.lt-goals-label.lt-muted { color: var(--dsw-alias-label-tertiary); margin-top: 16px; }
.lt-goal { display: flex; align-items: flex-start; gap: 14px; padding: 12px 12px; margin: 0 -12px; border-radius: 14px; cursor: pointer; }
.lt-goal:hover, .lt-goal:focus-visible { background: var(--lt-hover); outline: none; }
.lt-goal.lt-done .lt-goal-title { color: var(--dsw-alias-label-tertiary); text-decoration: line-through; }
.lt-check { flex: none; width: 18px; height: 18px; margin-top: 2px; border-radius: 5px; border: 1.5px solid var(--dsw-alias-label-dimmed); background: transparent; color: #fff; padding: 0; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.lt-check:hover { border-color: var(--lt-blue); }
.lt-check.lt-on { background: var(--lt-blue); border-color: var(--lt-blue); }
.lt-goal-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.lt-goal-title { font-size: 15px; font-weight: 500; line-height: 1.4; }
.lt-goal-sub { font-size: 13px; line-height: 1.5; color: var(--dsw-alias-label-tertiary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.lt-goals-create { margin-top: 28px; }
.lt-cat-row { display: flex; align-items: center; gap: 12px; width: 100%; padding: 11px 12px; margin: 0 -12px; width: calc(100% + 24px); border: 0; border-radius: 12px; background: transparent; color: inherit; font: inherit; font-size: 15px; text-align: left; cursor: pointer; }
.lt-cat-row:hover { background: var(--lt-hover); }
.lt-cat-icon { display: inline-flex; width: 24px; justify-content: center; color: var(--dsw-alias-label-secondary); }
.lt-cat-label { flex: 1; }
.lt-goal-card { display: flex; flex-direction: column; gap: 14px; }
.lt-goal-summary { font-size: 14px; margin: 0; color: var(--dsw-alias-label-primary); }
.lt-auto-card { border-radius: 14px; background: var(--dsw-alias-bg-layer-1); padding: 10px 12px 6px; }
.lt-auto-head { font-size: 11.5px; font-weight: 600; letter-spacing: 0.04em; color: var(--dsw-alias-label-tertiary); padding: 0 2px 8px; }
.lt-auto-empty { font-size: 13px; line-height: 1.5; color: var(--dsw-alias-label-tertiary); padding: 0 2px 8px; }
.lt-auto-row { display: flex; align-items: center; gap: 12px; padding: 8px 6px; border-radius: 10px; }
.lt-auto-row:hover { background: var(--lt-hover); }
.lt-auto-icon { width: 34px; height: 34px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--lt-blue) 22%, transparent); color: var(--lt-blue); flex: none; }
.lt-auto-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.lt-auto-title { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lt-auto-sub { font-size: 12.5px; color: var(--dsw-alias-label-tertiary); }
.lt-goal-h3 { font-size: 16px; font-weight: 600; margin: 6px 0 0; }
.lt-day-label { font-size: 11.5px; font-weight: 600; letter-spacing: 0.06em; color: var(--dsw-alias-label-tertiary); padding: 8px 0 6px; }
.lt-act { display: flex; align-items: flex-start; gap: 10px; padding: 7px 0; }
.lt-act-icon { color: var(--dsw-alias-state-success-primary, #2f9e5f); display: inline-flex; margin-top: 2px; flex: none; }
.lt-act-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.lt-act-title { font-size: 14px; font-weight: 500; line-height: 1.4; }
.lt-act-text { font-size: 13px; line-height: 1.5; color: var(--dsw-alias-label-tertiary); }
/* library */
.lt-lib { flex-direction: row; }
.lt-lib-col { flex: none; width: 212px; display: flex; flex-direction: column; gap: 2px; padding: 0 10px 12px; box-sizing: border-box; border-right: 1px solid var(--lt-divider); }
.lt-lib-col-top { height: 10px; flex: none; }
html[data-lt-platform='darwin']:not([data-lt-fullscreen]) .lt-lib-col-top { height: 30px; }
.lt-lib-search { display: flex; align-items: center; gap: 8px; height: 34px; margin: 0 2px 10px; padding: 0 10px; border-radius: 10px; background: var(--lt-field); border: 1px solid var(--lt-field-border); color: var(--dsw-alias-label-tertiary); }
.lt-lib-search:focus-within { border-color: var(--lt-blue); }
.lt-lib-search input { flex: 1; min-width: 0; border: 0; background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 13.5px; outline: none; }
.lt-lib-search input::-webkit-search-cancel-button { -webkit-appearance: none; }
.lt-lib-group { font-size: 12px; color: var(--dsw-alias-label-tertiary); padding: 12px 10px 4px; }
.lt-lib-shelf { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 10px; border: 0; border-radius: 10px; background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 14px; text-align: left; cursor: pointer; }
.lt-lib-shelf svg { color: var(--dsw-alias-label-secondary); flex: none; }
.lt-lib-shelf:hover { background: var(--lt-hover); }
.lt-lib-shelf.lt-active { background: var(--dsw-alias-bg-layer-3); }
.lt-lib-spacer { flex: 1; }
.lt-lib-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.lt-lib-main .lt-room-head, .lt-lib-inner { max-width: none; padding-left: 32px; padding-right: 32px; }
.lt-lib-recent { font-size: 13px; color: var(--dsw-alias-label-tertiary); padding: 10px 0 10px; }
.lt-lib-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.lt-lib-card { position: relative; border-radius: 16px; background: var(--dsw-alias-bg-layer-1); overflow: hidden; cursor: pointer; outline: none; box-shadow: 0 0 0 1px transparent; transition: box-shadow 120ms; }
.lt-lib-card:hover, .lt-lib-card:focus-visible { box-shadow: 0 0 0 1px var(--dsw-alias-bg-layer-3); }
.lt-lib-card.lt-selected { box-shadow: 0 0 0 2px var(--lt-blue); }
.lt-lib-preview { position: relative; height: 180px; background: var(--dsw-alias-bg-layer-2); display: flex; align-items: center; justify-content: center; overflow: hidden; }
.lt-lib-preview img, .lt-lib-preview video { width: 100%; height: 100%; object-fit: cover; display: block; }
.lt-lib-preview-icon { color: var(--dsw-alias-label-dimmed); }
.lt-lib-preview-text { align-self: flex-start; width: 100%; box-sizing: border-box; padding: 16px 18px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10.5px; line-height: 1.55; color: var(--dsw-alias-label-secondary); white-space: pre-wrap; word-break: break-word; mask-image: linear-gradient(to bottom, #000 60%, transparent); }
.lt-lib-tick { position: absolute; top: 10px; left: 10px; width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.8); background: rgba(0,0,0,0.35); color: #fff; display: inline-flex; align-items: center; justify-content: center; }
.lt-lib-tick.lt-on { background: var(--lt-blue); border-color: var(--lt-blue); }
.lt-lib-caption { display: flex; align-items: center; gap: 10px; padding: 10px 10px 10px 14px; }
.lt-lib-caption-icon { display: inline-flex; color: var(--dsw-alias-label-secondary); flex: none; }
.lt-lib-caption-main { flex: 1; min-width: 0; }
.lt-lib-name { font-size: 13.5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lt-lib-sub { font-size: 12px; color: var(--dsw-alias-label-tertiary); }
/* the viewer */
.lt-view-bar { flex: none; display: flex; align-items: center; gap: 8px; padding: 6px 16px 8px 12px; border-bottom: 1px solid var(--lt-divider); }
.lt-view-icon { display: inline-flex; color: var(--dsw-alias-label-secondary); }
.lt-view-name { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 40%; }
.lt-view-sub { font-size: 12px; color: var(--dsw-alias-label-tertiary); white-space: nowrap; }
.lt-view-edit-actions { display: flex; gap: 6px; }
.lt-view-body { flex: 1; min-height: 0; overflow: auto; display: flex; flex-direction: column; }
.lt-view-md { max-width: 760px; width: 100%; margin: 0 auto; padding: 28px 40px 60px; box-sizing: border-box; font-size: 15px; }
.lt-view-md h1, .lt-view-md h2:first-child { font-size: 26px; margin-top: 0; }
.lt-view-pre { max-width: 860px; width: 100%; margin: 0 auto; padding: 24px 40px; box-sizing: border-box; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
.lt-view-editor { flex: 1; min-height: 0; width: 100%; box-sizing: border-box; border: 0; outline: none; resize: none; padding: 24px 40px; background: transparent; color: var(--dsw-alias-label-primary); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13.5px; line-height: 1.6; }
.lt-view-media { flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px; }
.lt-view-media img, .lt-view-media video { max-width: 100%; max-height: 100%; border-radius: 12px; }
.lt-view-audio { flex-direction: column; gap: 20px; color: var(--dsw-alias-label-secondary); }
.lt-view-frame { flex: 1; border: 0; background: #fff; }
.lt-view-loading { flex: 1; display: flex; align-items: center; justify-content: center; }

/* a Muse section inside one of the harness's own pages (General's App behavior) */
.lt-section-inline { margin-top: 18px; padding: 0; }
.lt-section-inline h2 { font-size: 13px; font-weight: 600; color: var(--dsw-alias-label-secondary); margin: 0 0 8px; }

/* ---- the Connectors / Permissions / Files / Dictation pages ---- */
.lt-row-button { width: 100%; text-align: left; background: none; border: 0; border-bottom: 1px solid var(--lt-divider); color: inherit; font: inherit; cursor: pointer; }
.lt-row-button:hover .lt-row-title { color: var(--lt-accent); }
.lt-row-button:focus-visible { outline: 2px solid var(--lt-accent); outline-offset: -2px; border-radius: 8px; }
.lt-state { display: inline-flex; align-items: center; gap: 2px; font-size: 12px; color: var(--dsw-alias-label-tertiary); flex: none; }
.lt-state-on { color: #2e9e5b; }
.lt-row-sublist { padding: 4px 0 10px 42px; }
.lt-tool-list { margin: 0; padding-left: 16px; font-size: 12.5px; line-height: 1.6; color: var(--dsw-alias-label-secondary); }
.lt-tool-list code { font-size: 12px; }
.lt-path { display: block; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; opacity: 0.8; margin-top: 2px; word-break: break-all; }
.lt-fine { font-size: 12px; color: var(--dsw-alias-label-tertiary); }

/* ---- the avatar studio ---- */
.lt-st-label { font-size: 12.5px; font-weight: 600; color: var(--dsw-alias-label-secondary); margin: 12px 0 6px; }
.lt-st-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.lt-st-cell { position: relative; aspect-ratio: 1; border-radius: 16px; overflow: hidden; border: 0; padding: 0; background: var(--lt-card); box-shadow: inset 0 0 0 1px var(--lt-field-border); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.lt-st-cell:disabled { cursor: default; }
.lt-st-cell img { width: 100%; height: 100%; object-fit: cover; display: block; }
.lt-st-cell.lt-active { box-shadow: 0 0 0 3px var(--lt-accent); }
.lt-st-tag { position: absolute; left: 10px; bottom: 10px; padding: 2px 8px; border-radius: 999px; background: rgba(0,0,0,0.55); color: #fff; font-size: 11.5px; }
.lt-st-wait { font-size: 28px; color: var(--dsw-alias-label-tertiary); }
.lt-st-moods { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin: 6px 0 14px; }
.lt-st-mood { position: relative; width: 92px; height: 92px; border-radius: 14px; overflow: hidden; background: var(--lt-card); box-shadow: inset 0 0 0 1px var(--lt-field-border); display: flex; align-items: center; justify-content: center; }
.lt-st-mood img { width: 100%; height: 100%; object-fit: cover; display: block; }
.lt-st-mood .lt-st-tag { left: 6px; bottom: 6px; font-size: 10.5px; padding: 1px 6px; }
/* a clip of the person's own as the face (#324): the studio's section and the preview's disc */
.lt-oc-section { margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--lt-divider); }
.lt-oc-section .lt-st-label { margin-top: 0; }
.lt-sheet-body .lt-oc-body { margin: 0 0 8px; line-height: 1.5; }
.lt-oc-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 2px 0 10px; }
.lt-oc-disc { width: 148px; height: 148px; margin: 12px auto 8px; }
.lt-sheet-body .lt-oc-details { margin: 0 0 12px; text-align: center; }

/* ---- memory and the data controls ---- */
.lt-mem-add { display: flex; gap: 8px; align-items: center; }
.lt-mem-input { flex: 1; min-width: 0; height: 34px; padding: 0 12px; border-radius: 10px; border: 1px solid var(--lt-field-border); background: var(--lt-card); color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; }
.lt-mem-input:focus { outline: none; border-color: var(--lt-accent); }
.lt-mem-forget { opacity: 0; }
.lt-pf-row:hover .lt-mem-forget, .lt-mem-forget:focus-visible { opacity: 1; }
.lt-danger { color: #d93025; }
.lt-pill-danger { background: #d93025; color: #fff; }
.lt-sheet-steps { margin: 0 0 12px; padding-left: 20px; color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 1.6; }

/* ---- the trajectory of a hands run, in the chat (Trajectory.tsx) ------- */
/* The phone stage's hues: Muse's action blue and its cyan, for the marks drawn on a step's picture. */
.lt-traj { --lt-traj-accent: #0a66e4; --lt-traj-cyan: #06b6d4; display: block; margin: 8px 0 10px; }
.lt-traj-card { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 100%; box-sizing: border-box; padding: 10px 12px 12px; border-radius: 16px; background: var(--lt-card, var(--dsw-alias-bg-layer-2)); box-shadow: inset 0 0 0 1px var(--lt-field-border, var(--lt-divider)); color: var(--dsw-alias-label-primary); outline: none; }
.lt-traj-card:focus-visible { box-shadow: inset 0 0 0 2px var(--lt-accent); }
.lt-traj-head { display: flex; align-items: center; gap: 6px; min-height: 26px; font-size: 12.5px; color: var(--dsw-alias-label-secondary); }
.lt-traj-head > svg { color: var(--lt-accent); flex: none; }
.lt-traj-title { font-weight: 600; color: var(--dsw-alias-label-primary); }
.lt-traj-sub { white-space: nowrap; }
.lt-traj-space { flex: 1; }
/* the run is on: a breathing light, not a running ring */
.lt-traj-live { width: 7px; height: 7px; border-radius: 50%; background: var(--lt-accent); flex: none; animation: lt-breathe-light 4.8s ease-in-out infinite; }
.lt-traj-nav { display: inline-flex; align-items: center; gap: 2px; }
.lt-traj-nav-sheet { margin-left: auto; margin-right: 8px; }
.lt-traj-count { min-width: 44px; text-align: center; font-size: 12px; font-variant-numeric: tabular-nums; color: var(--dsw-alias-label-secondary); }
.lt-traj-btn { width: 26px; height: 26px; border: 0; padding: 0; border-radius: 8px; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.lt-traj-btn:hover:not(:disabled) { background: var(--lt-hover); color: var(--dsw-alias-label-primary); }
.lt-traj-btn:disabled { opacity: 0.35; cursor: default; }
.lt-traj-open { display: block; width: 100%; border: 0; padding: 0; background: transparent; cursor: zoom-in; text-align: left; }
.lt-traj-open:focus-visible { outline: 2px solid var(--lt-accent); outline-offset: 2px; border-radius: 12px; }
.lt-traj-picture { position: relative; max-width: 100%; border-radius: 12px; overflow: hidden; background: #111; box-shadow: 0 0 0 1px rgba(0,0,0,0.08); }
.lt-traj-picture.lt-big { width: 100%; }
.lt-traj-picture img { display: block; width: 100%; height: 100%; object-fit: contain; user-select: none; }
.lt-traj-picture.lt-gone { background: var(--lt-hover); }
.lt-traj-nopic { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 12px; text-align: center; font-size: 12.5px; color: var(--dsw-alias-label-tertiary); }
.lt-traj-marks { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
/* the action's words on the picture: the phone's label pill — dark, a hairline, a cyan→blue bar at its start */
.lt-traj-chip { position: absolute; left: 8px; top: 8px; max-width: calc(100% - 16px); box-sizing: border-box; padding: 4px 10px 4px 8px; border-radius: 999px; background: rgba(17,18,24,0.88); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); color: #fff; font-size: 12px; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none; display: inline-flex; align-items: center; gap: 7px; }
.lt-traj-chip::before { content: ''; flex: none; width: 3px; height: 12px; border-radius: 2px; background: linear-gradient(var(--lt-traj-cyan), var(--lt-traj-accent)); }
.lt-traj-chip.lt-aimed { transform: translate(14px, -50%); max-width: 46%; }
.lt-traj-chip.lt-aimed.lt-left { transform: translate(calc(-100% - 14px), -50%); }
.lt-traj-caption { font-size: 13px; font-weight: 600; line-height: 1.35; overflow-wrap: anywhere; }
.lt-traj-words { font-size: 12.5px; line-height: 1.45; color: var(--dsw-alias-label-secondary); white-space: pre-wrap; overflow-wrap: anywhere; }
.lt-clamp3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; white-space: normal; }
.lt-traj-strip { display: flex; gap: 6px; overflow-x: auto; padding: 2px 2px 4px; scrollbar-width: thin; }
.lt-traj-thumb { position: relative; flex: none; width: 88px; height: 56px; border: 0; padding: 0; border-radius: 8px; overflow: hidden; background: #111; cursor: pointer; box-shadow: 0 0 0 1px rgba(0,0,0,0.12); opacity: 0.72; transition: opacity 150ms, box-shadow 150ms; }
.lt-traj-thumb:hover, .lt-traj-thumb:focus-visible { opacity: 1; outline: none; }
.lt-traj-thumb.lt-on { opacity: 1; box-shadow: 0 0 0 2px var(--lt-accent); }
.lt-traj-thumb img { display: block; width: 100%; height: 100%; object-fit: cover; }
.lt-traj-thumb-gone { display: block; width: 100%; height: 100%; background: var(--lt-hover); }
.lt-traj-thumb-n { position: absolute; left: 4px; bottom: 4px; min-width: 16px; padding: 0 4px; border-radius: 6px; background: rgba(0,0,0,0.65); color: #fff; font-size: 10.5px; line-height: 16px; text-align: center; }
.lt-traj-fine { font-size: 11.5px; color: var(--dsw-alias-label-tertiary); }
.lt-traj-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.lt-traj-pill { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 12px 0 10px; border: 0; border-radius: 999px; background: var(--lt-hover); color: var(--dsw-alias-label-primary); font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; }
.lt-traj-pill:hover:not(:disabled) { background: var(--dsw-alias-bg-layer-3, var(--lt-hover)); }
.lt-traj-pill:disabled { opacity: 0.6; cursor: default; }
.lt-traj-pill.lt-on { background: var(--lt-accent); color: #fff; }
.lt-traj-pill.lt-stop { background: rgba(155,59,59,0.14); color: #9b3b3b; }
.lt-traj-pill.lt-stop:hover:not(:disabled) { background: rgba(155,59,59,0.24); }
.lt-traj-big { display: flex; flex-direction: column; gap: 12px; }
.lt-traj-big-foot { display: flex; align-items: flex-start; gap: 12px; }
.lt-traj-big-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
/* a run's card in the "hero" layout (no row yet): the width of the thread */
[data-conversation-content][data-content-phase="hero"] > [data-conversation-scroll] > .lt-traj { flex: 0 0 auto; width: min(var(--dsh-chat-content-width, 680px), 100%); align-self: center; box-sizing: border-box; padding: 0 var(--dsh-composer-side-clearance, 16px); }
/* the agent's face: a round frame; a clip or a still inside, or an emoji on its colour */
.lt-avatar { display: block; flex: 0 0 auto; border-radius: 50%; overflow: hidden; background: var(--dsw-alias-surface-sunken, #f1efe9); will-change: transform; transform-origin: 50% 60%; }
.lt-avatar > img, .lt-avatar > video { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.lt-avatar-emoji { display: block; width: 100%; height: 100%; text-align: center; user-select: none; }
@keyframes lt-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.035); } }
@keyframes lt-sway { 0%, 100% { transform: rotate(-4deg) translateY(0); } 25% { transform: rotate(0deg) translateY(-2%); } 50% { transform: rotate(4deg) translateY(0); } 75% { transform: rotate(0deg) translateY(-2%); } }
@keyframes lt-hop { 0%, 70%, 100% { transform: translateY(0) scale(1); } 78% { transform: translateY(-9%) scale(1.04, 0.97); } 86% { transform: translateY(0) scale(0.98, 1.03); } 92% { transform: translateY(-3%) scale(1); } }
.lt-avatar-idle { animation: lt-breathe 4.5s ease-in-out infinite; }
.lt-avatar-working { animation: lt-sway 2.6s ease-in-out infinite; }
.lt-avatar-waiting { animation: lt-hop 3.2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .lt-avatar-idle, .lt-avatar-working, .lt-avatar-waiting { animation: none; } }
/* ---- menus we draw ---------------------------------------------------- */
.lt-menu { position: fixed; z-index: 80; min-width: 200px; padding: 6px; border-radius: 12px; background: var(--dsw-alias-bg-layer-3, var(--lt-base)); color: var(--dsw-alias-label-primary); box-shadow: 0 12px 40px rgba(0,0,0,0.28), 0 0 0 1px var(--lt-divider); display: flex; flex-direction: column; gap: 1px; }
.lt-menu-item { display: flex; align-items: center; gap: 10px; width: 100%; border: 0; text-align: left; padding: 8px 10px; border-radius: 8px; background: transparent; color: inherit; font: inherit; font-size: 13.5px; cursor: pointer; }
.lt-menu-item:hover, .lt-menu-item:focus-visible { background: var(--lt-hover); outline: none; }
.lt-menu-item svg { color: var(--dsw-alias-label-secondary); flex: none; }
.lt-menu-item-label { flex: 1; min-width: 0; }
.lt-menu-sep { height: 1px; margin: 4px 6px; background: var(--lt-divider); }
.lt-menu-hint { font-size: 11px; color: var(--dsw-alias-label-tertiary); }
.lt-ask { width: min(420px, calc(100vw - 32px)); padding: 12px 14px; border-radius: 14px; background: var(--dsw-alias-bg-primary, #fff); color: var(--dsw-alias-label-primary, inherit); box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18); border: 1px solid var(--lt-divider); display: flex; flex-direction: column; gap: 8px; }
.lt-ask-title { font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-secondary); }
.lt-ask-text { font-size: 14px; line-height: 1.4; word-break: break-word; }
.lt-ask-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.lt-ask-sub { font-size: 11.5px; color: var(--dsw-alias-label-tertiary); }

.lt-select { width: auto; max-width: 240px; }

/* ---- the model picker (ModelPicker.tsx): a button, a panel with search and folded groups ---- */
.lt-mp { position: relative; flex: none; max-width: 100%; }
.lt-mp-btn { display: inline-flex; align-items: center; gap: 6px; max-width: 240px; padding: 0 10px 0 14px; cursor: pointer; text-align: left; }
.lt-mp-btn:disabled { opacity: 0.55; cursor: default; }
.lt-mp-btn svg { flex: none; color: var(--dsw-alias-label-tertiary); }
.lt-mp-btn-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; }
.lt-mp-panel { position: fixed; z-index: 80; box-sizing: border-box; display: flex; flex-direction: column; padding: 6px; border-radius: 12px; background: var(--dsw-alias-bg-layer-3, var(--lt-base)); color: var(--dsw-alias-label-primary); box-shadow: 0 12px 40px rgba(0,0,0,0.28), 0 0 0 1px var(--lt-divider); overflow: hidden; }
.lt-mp-heads { flex: none; display: flex; flex-direction: column; gap: 1px; padding-bottom: 4px; margin-bottom: 4px; border-bottom: 1px solid var(--lt-divider); }
.lt-mp-search { flex: none; display: flex; align-items: center; gap: 6px; height: 32px; margin: 0 0 6px; padding: 0 10px; border-radius: 9px; background: var(--lt-field); border: 1px solid var(--lt-field-border); color: var(--dsw-alias-label-tertiary); }
.lt-mp-search:focus-within { border-color: var(--lt-blue); }
.lt-mp-search input { flex: 1; min-width: 0; border: 0; padding: 0; background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 13.5px; outline: none; }
.lt-mp-search input::placeholder { color: var(--dsw-alias-label-tertiary); }
.lt-mp-search input::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; }
.lt-mp-list { flex: 1; min-height: 0; overflow: auto; display: flex; flex-direction: column; gap: 1px; }
.lt-mp-group + .lt-mp-group { margin-top: 6px; }
.lt-mp-group-label { padding: 6px 10px 3px; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--dsw-alias-label-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lt-mp-row { display: flex; align-items: center; gap: 8px; width: 100%; border: 0; text-align: left; padding: 7px 10px; border-radius: 8px; background: transparent; color: inherit; font: inherit; font-size: 13.5px; cursor: pointer; }
.lt-mp-row:hover, .lt-mp-row:focus-visible, .lt-mp-more:hover, .lt-mp-more:focus-visible { background: var(--lt-hover); outline: none; }
.lt-mp-row.lt-selected { color: var(--lt-blue); }
.lt-mp-row svg { flex: none; }
.lt-mp-row-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lt-mp-more { display: block; width: 100%; border: 0; text-align: left; padding: 6px 10px; border-radius: 8px; background: transparent; color: var(--lt-blue); font: inherit; font-size: 12.5px; cursor: pointer; }
.lt-mp-none { padding: 10px; font-size: 13px; color: var(--dsw-alias-label-tertiary); }
.lt-menu-dot { display: inline-block; width: 7px; height: 7px; margin-left: 6px; border-radius: 50%; background: var(--lt-accent); vertical-align: middle; }

/* ---- the look changed from the chat (AvatarChat.tsx) ------------------ */
.lt-pf-top-space { flex: 1; }
.lt-ac { position: fixed; left: 50%; bottom: 108px; transform: translateX(-50%); z-index: 58; width: min(440px, calc(100vw - 32px)); padding: 12px 14px 14px; border-radius: 16px; background: var(--dsw-alias-bg-primary, #fff); color: var(--dsw-alias-label-primary); box-shadow: 0 18px 48px rgba(0,0,0,0.22), 0 0 0 1px var(--lt-divider); animation: lt-card-in 220ms ease-out; display: flex; flex-direction: column; gap: 10px; }
@keyframes lt-card-in { from { opacity: 0; transform: translate(-50%, 8px) scale(0.98); } to { opacity: 1; transform: translateX(-50%); } }
html[data-lt-profile] .lt-ac { left: calc(50% - 155px); }
.lt-ac-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.lt-ac-title { font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-secondary); letter-spacing: 0.02em; }
.lt-ac-desc { margin: 0; font-size: 14px; line-height: 1.45; }
.lt-ac-hint, .lt-ac-err { margin: 0; font-size: 12.5px; color: var(--dsw-alias-label-secondary); }
.lt-ac-err { color: var(--dsw-alias-state-error-primary, #b42318); }
.lt-ac-status { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--dsw-alias-label-secondary); }
.lt-ac-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.lt-ac-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.lt-ac-tile { position: relative; aspect-ratio: 1; border: 0; padding: 0; border-radius: 12px; overflow: hidden; background: var(--lt-hover); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.lt-ac-tile img { width: 100%; height: 100%; object-fit: cover; display: block; }
.lt-ac-tile:hover:not(:disabled), .lt-ac-tile:focus-visible { outline: 2px solid var(--lt-accent); outline-offset: 2px; }
.lt-ac-tile:disabled { cursor: default; }
.lt-ac-n { position: absolute; left: 8px; top: 8px; min-width: 22px; height: 22px; padding: 0 6px; border-radius: 11px; background: rgba(0,0,0,0.55); color: #fff; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; }
.lt-ac-final { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.lt-ac-final-img { width: 160px; height: 160px; border-radius: 16px; object-fit: cover; }
.lt-ac-done p { margin: 0 0 4px; font-size: 14px; line-height: 1.45; }
.lt-ac-share-canvas { width: 100%; max-width: 360px; aspect-ratio: 1; border-radius: 14px; display: block; margin: 10px auto 0; box-shadow: 0 6px 24px rgba(0,0,0,0.18); }

/* desk-a */
/* Belt and braces: the face, the name and the status line are a no-drag island on macOS and
   Windows alike (the header itself is no longer a drag region, see the platform block above);
   the face on the rail and the drawer's own face too. Plain boxes, no transform and no
   pointer-events games: Chromium maps drag regions from layout. */
html:is([data-lt-platform='darwin'], [data-lt-platform='win32']) :is(.lt-header, .lt-header-face, .lt-header-back, .lt-rail-face, button:has(> .lt-rail-face)) { -webkit-app-region: no-drag; }

/* The first run (C4): the phone's pages, one at a time, the dots and the gear on top. */
.lt-ob { align-items: stretch; justify-content: flex-start; flex-direction: column; }
.lt-fr-top { position: relative; flex: none; height: 56px; display: flex; align-items: center; justify-content: center; }
html[data-lt-platform='darwin']:not([data-lt-fullscreen]) .lt-fr-top { height: 64px; }
.lt-fr-dots { display: flex; gap: 7px; }
.lt-fr-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--dsw-alias-label-dimmed); opacity: 0.45; transition: opacity 200ms, background 200ms; }
.lt-fr-dot.lt-on { background: var(--dsw-alias-label-primary); opacity: 1; }
.lt-fr-gear { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); width: 34px; height: 34px; border: 0; border-radius: 50%; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; -webkit-app-region: no-drag; }
.lt-fr-gear:hover { background: var(--lt-hover); color: var(--dsw-alias-label-primary); }
.lt-fr-scroll { flex: 1; min-height: 0; overflow: auto; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px 24px 32px; }
.lt-fr-page { width: min(420px, 100%); gap: 14px; margin: auto 0; }
.lt-fr-page .lt-ob-sub { margin: -4px 0 2px; }
.lt-fr-primary { margin-top: 4px; }
/* The app's mark as a page hero (sign-in, permissions): the tile on the page background, its own hairline edge, nothing added (docs/brand.md). */
.lt-fr-hero-mark { flex: none; display: block; width: 72px; height: 72px; }
.lt-ob-form > .lt-fr-hero-mark { margin-bottom: 2px; }

/* The Devices page as cards (0.1.37): this computer first, the others in a grid (one column
   narrow, two from 560px of page), 16 px corners, a hairline so the card holds in both themes. */
.lt-dv .lt-page-inner { gap: 12px; container-type: inline-size; }
.lt-dv-head { display: flex; flex-direction: column; gap: 6px; }
.lt-dv-count { margin: 0; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dsw-alias-label-tertiary); }
.lt-dv-card { box-sizing: border-box; min-width: 0; border-radius: 16px; background: var(--lt-card); box-shadow: 0 0 0 1px var(--lt-divider); padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
.lt-dv-top { display: flex; align-items: flex-start; gap: 12px; }
.lt-dv-glyph { flex: none; width: 44px; height: 44px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); }
.lt-dv-glyph.lt-on { background: color-mix(in srgb, var(--lt-blue) 12%, transparent); color: var(--lt-blue); }
.lt-dv-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.lt-dv-name-row { display: flex; align-items: center; gap: 4px; min-width: 0; }
.lt-dv-name { font-size: 15px; font-weight: 600; line-height: 1.35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lt-dv-sub { font-size: 12.5px; line-height: 1.45; color: var(--dsw-alias-label-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lt-dv-sub.lt-wrap { white-space: normal; }
.lt-dv-rename { display: flex; align-items: center; gap: 8px; }
.lt-dv-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.lt-dv-chip { padding: 4px 10px; border-radius: 999px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 1.4; font-weight: 500; }
.lt-dv-hint { margin-top: 4px; font-size: 12.5px; line-height: 1.45; color: var(--dsw-alias-label-secondary); }
.lt-dv-rows { margin: 2px -16px -10px; padding: 0 16px; border-top: 1px solid var(--lt-divider); }
.lt-dv-rows .lt-row:last-child { border-bottom: 0; }
.lt-dv-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
@container (min-width: 600px) { .lt-dv-grid { grid-template-columns: 1fr 1fr; } }
.lt-dv .lt-more.lt-icon-btn { flex: none; }
.lt-dv-chip-button { border: 0; font: inherit; font-size: 12px; font-weight: 500; line-height: 1.4; cursor: pointer; color: var(--lt-blue); background: color-mix(in srgb, var(--lt-blue) 12%, transparent); }
.lt-dv-chip-button:hover { background: color-mix(in srgb, var(--lt-blue) 20%, transparent); }

/* Settings → Coding agents (CodingPanel.tsx): the agents as tiles, the chats as rows, a chat as bubbles with a composer. */
.lt-cd-where .lt-chip { display: inline-flex; align-items: center; gap: 4px; }
.lt-cd-where-label { align-self: center; margin-left: 6px; font-size: 11.5px; color: var(--dsw-alias-label-tertiary); }
.lt-cd-agents { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.lt-cd-agent { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; min-width: 0; padding: 12px 14px; border: 0; border-radius: 16px; background: var(--lt-card); box-shadow: 0 0 0 1px var(--lt-divider); color: inherit; font: inherit; text-align: left; cursor: pointer; }
.lt-cd-agent:hover:not(:disabled) { box-shadow: 0 0 0 1px var(--lt-field-border); }
.lt-cd-agent.lt-active { box-shadow: 0 0 0 2px var(--lt-blue); }
.lt-cd-agent-off { opacity: 0.5; cursor: default; }
.lt-cd-agent-top { display: flex; align-items: center; justify-content: space-between; width: 100%; margin-bottom: 4px; }
.lt-cd-agent-name { font-size: 13.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.lt-cd-agent-sub { font-size: 11.5px; color: var(--dsw-alias-label-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.lt-cd-running { display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; border-radius: 999px; font-size: 10.5px; font-weight: 600; color: var(--dsw-alias-state-success-primary, #2f9e5f); background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #2f9e5f) 12%, transparent); }
.lt-cd-glyph { flex: none; display: inline-flex; align-items: center; justify-content: center; border-radius: 30%; color: #fff; font-weight: 700; letter-spacing: 0.02em; background: #4b5563; }
.lt-cd-glyph-cursor { background: linear-gradient(135deg, #334155, #0f172a); }
.lt-cd-glyph-codex { background: linear-gradient(135deg, #10b981, #0f766e); }
.lt-cd-glyph-claude { background: linear-gradient(135deg, #fb923c, #d97706); }
.lt-cd-glyph-dsh { background: linear-gradient(135deg, #6366f1, #3730a3); }
.lt-cd-section-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.lt-cd-section-head h2 { flex: 1; }
.lt-cd-link { display: inline-flex; align-items: center; gap: 2px; border: 0; padding: 0; background: none; color: var(--lt-blue); font: inherit; font-size: 12.5px; font-weight: 500; cursor: pointer; }
.lt-cd-row-title { display: flex; align-items: center; gap: 8px; min-width: 0; }
.lt-cd-pill { flex: none; padding: 1px 7px; border-radius: 999px; font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
.lt-cd-pill-running { color: var(--dsw-alias-state-success-primary, #2f9e5f); background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #2f9e5f) 12%, transparent); }
.lt-cd-pill-active { color: var(--lt-blue); background: color-mix(in srgb, var(--lt-blue) 12%, transparent); }
.lt-cd-chat { display: flex; flex-direction: column; }
.lt-cd-chat-inner { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 10px; height: 100%; }
.lt-settings-body .lt-cd-chat-inner { height: auto; min-height: 60vh; }
.lt-cd-chat-head { display: flex; align-items: center; gap: 10px; }
.lt-cd-thread { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding: 4px 0; }
.lt-cd-msg { display: flex; flex-direction: column; gap: 2px; max-width: 100%; }
.lt-cd-from-you { align-items: flex-end; }
.lt-cd-from-agent { align-items: flex-start; }
.lt-cd-bubble { max-width: 88%; padding: 9px 14px; border-radius: 18px; font-size: 14px; line-height: 1.55; color: var(--dsw-alias-label-primary); word-break: break-word; }
.lt-cd-from-you .lt-cd-bubble { background: var(--lt-user-bubble); color: var(--lt-user-bubble-fg); }
.lt-cd-from-you .lt-cd-bubble a { color: inherit; }
.lt-cd-from-you .lt-cd-bubble ::selection { background: var(--lt-user-bubble-selection); color: var(--lt-user-bubble-fg); }
.lt-cd-from-you .lt-cd-bubble pre { background: rgb(127 127 127 / 0.25); }
.lt-cd-from-agent .lt-cd-bubble { background: var(--lt-agent-bubble); }
.lt-cd-bubble p { margin: 0 0 6px; }
.lt-cd-bubble p:last-child { margin-bottom: 0; }
.lt-cd-bubble pre { margin: 6px 0; padding: 8px 10px; border-radius: 10px; background: rgba(0,0,0,0.08); font-size: 12px; overflow-x: auto; }
.lt-cd-pre { white-space: pre-wrap; }
.lt-cd-badge { font-size: 11px; color: var(--dsw-alias-label-tertiary); padding: 0 4px; }
.lt-cd-steps { padding: 8px 12px; border-radius: 14px; background: var(--lt-card); box-shadow: 0 0 0 1px var(--lt-divider); font-size: 12.5px; }
.lt-cd-steps-head { display: flex; align-items: center; gap: 6px; font-weight: 500; color: var(--dsw-alias-label-secondary); }
.lt-cd-steps-device { margin-left: auto; display: inline-flex; align-items: center; gap: 3px; color: var(--dsw-alias-label-tertiary); font-weight: 400; }
.lt-cd-steps-list { margin: 6px 0 0; padding: 0; list-style: none; max-height: 112px; overflow-y: auto; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; color: var(--dsw-alias-label-tertiary); }
.lt-cd-steps-list li { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.6; }
.lt-cd-caret { display: inline-block; width: 4px; height: 14px; margin-left: 4px; vertical-align: middle; background: var(--lt-accent); animation: lt-breathe-light 1.2s ease-in-out infinite; }
.lt-cd-composer { flex: none; display: flex; flex-direction: column; gap: 6px; padding-top: 6px; border-top: 1px solid var(--lt-divider); }
.lt-cd-form { display: flex; align-items: flex-end; gap: 8px; }
.lt-cd-input { flex: 1; min-width: 0; min-height: 40px; max-height: 140px; padding: 9px 12px; border-radius: 14px; border: 1px solid var(--lt-field-border); background: var(--lt-card); color: var(--dsw-alias-label-primary); font: inherit; font-size: 13.5px; line-height: 1.45; resize: none; }
.lt-cd-input:focus { outline: 2px solid var(--lt-blue); outline-offset: -1px; }
.lt-cd-input:disabled { opacity: 0.6; }
.lt-cd-input-tall { min-height: 96px; width: 100%; box-sizing: border-box; }
.lt-cd-send { flex: none; width: 40px; height: 40px; border: 0; border-radius: 50%; background: var(--lt-blue); color: #fff; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
.lt-cd-send:disabled { opacity: 0.4; cursor: default; }
.lt-cd-stop { background: var(--dsw-alias-state-error-primary, #d2453d); }
.lt-cd-label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--dsw-alias-label-tertiary); }
@media (prefers-reduced-motion: reduce) { .lt-cd-caret { animation: none; } }
.lt-fr-features { width: 100%; display: flex; flex-direction: column; gap: 4px; text-align: left; }
.lt-fr-feature { display: flex; align-items: flex-start; gap: 12px; padding: 8px 6px; }
.lt-fr-feature .lt-ob-row-icon { flex: none; }
.lt-fr-feature .lt-ob-row-sub { line-height: 1.45; }
.lt-fr-notice { width: 100%; box-sizing: border-box; text-align: left; padding: 12px 14px; border-radius: 14px; background: var(--lt-card); box-shadow: 0 0 0 1px var(--lt-divider); display: flex; flex-direction: column; gap: 6px; }
.lt-fr-notice-title { font-size: 13.5px; font-weight: 600; }
.lt-fr-notice p { margin: 0; font-size: 12.5px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.lt-fr-notice-closing { color: var(--dsw-alias-label-tertiary) !important; }
.lt-fr-choices { width: 100%; display: flex; flex-direction: column; gap: 10px; }
.lt-fr-choice { display: flex; width: 100%; box-sizing: border-box; text-align: left; padding: 14px 16px; border-radius: 14px; border: 1px solid var(--lt-divider); background: var(--lt-card); color: inherit; font: inherit; cursor: pointer; }
.lt-fr-choice:hover:not(:disabled) { border-color: var(--lt-blue); background: var(--lt-selected); }
.lt-fr-choice:disabled { opacity: 0.5; cursor: default; }
.lt-fr-choice .lt-ob-row-sub { line-height: 1.45; margin-top: 2px; }
.lt-fr-granted { display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; color: #2f9e5f; }

/* The first conversation: the app's opening lines as agent bubbles, and the name chooser. */
.lt-intro-host { width: 100%; max-width: var(--dsh-chat-content-width, 760px); box-sizing: border-box; margin: 0 auto; padding: 12px 0 0; }
html[data-lt-muse] [data-conversation-scroll]:has(> .lt-intro-host):has([class*="_composerHero"]) { justify-content: flex-start; }
html[data-lt-muse] [data-conversation-scroll]:has(> .lt-intro-host) [class*="_composerHero"] { margin-top: auto; }
.lt-intro { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
.lt-intro-bubble { width: fit-content; max-width: 100%; box-sizing: border-box; background: var(--lt-agent-bubble); border-radius: 20px; padding: 10px 16px; font-size: 15px; line-height: 1.5; white-space: pre-wrap; animation: lt-rise 260ms ease-out; }
.lt-naming { display: flex; flex-direction: column; gap: 8px; width: min(360px, 100%); box-sizing: border-box; margin: 8px 0; padding: 14px; border-radius: 16px; background: var(--lt-card); box-shadow: 0 0 0 1px var(--lt-divider); }
.lt-naming-title { font-size: 13px; font-weight: 600; color: var(--dsw-alias-label-secondary); margin-bottom: 2px; }
.lt-naming-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; box-sizing: border-box; padding: 11px 14px; border-radius: 12px; border: 1px solid var(--lt-divider); background: var(--lt-base); color: var(--dsw-alias-label-primary); font: inherit; font-size: 15px; text-align: left; cursor: pointer; transition: opacity 200ms, border-color 200ms; }
.lt-naming-row:hover:not(:disabled) { border-color: var(--lt-blue); }
.lt-naming-row:disabled { cursor: default; }
.lt-naming-row.lt-selected { border: 1.5px solid var(--lt-blue); color: var(--lt-blue); }
.lt-naming-row.lt-dimmed { opacity: 0.4; }
.lt-naming-custom { border-style: dashed; color: var(--dsw-alias-label-tertiary); background: transparent; }

/* The Feed (C5): the intro card, the "how" card under the empty state, the routine row in the sliders. */
.lt-feed-intro { display: flex; flex-direction: column; gap: 8px; margin: 0 0 14px; padding: 14px 16px; border-radius: var(--lt-radius); background: var(--lt-card); border: 1px solid var(--lt-divider); }
.lt-feed-intro-title { font-size: 14px; font-weight: 600; }
.lt-feed-intro-body { margin: 0; font-size: 13px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.lt-feed-intro-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 2px; }
.lt-feed-how { width: min(360px, 100%); box-sizing: border-box; text-align: left; margin: 6px 0 2px; padding: 12px 14px; border-radius: 14px; background: var(--lt-card); border: 1px solid var(--lt-divider); }
.lt-feed-how-title { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.lt-feed-how p { margin: 0; font-size: 12.5px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.lt-feed-routine { display: flex; align-items: center; gap: 10px; margin-top: 6px; font-size: 13.5px; }
.lt-feed-routine-label { flex: 1; }
.lt-field-time { width: auto; min-width: 0; padding: 4px 8px; font: inherit; font-size: 13px; }
/* The version (C2): the two lines under one title. */
.lt-version-row .lt-row-main { gap: 3px; }
.lt-version-line { white-space: normal; }

/* desk-b */
/* Computer use: the "try it" rows, the runtime row, the black-screen notice; Media: the clips. */
.lt-hc-result { display: flex; align-items: center; gap: 10px; margin: 0 12px 10px; padding: 10px 12px; border-radius: 12px; font-size: 12.5px; line-height: 1.4; color: var(--dsw-alias-label-secondary); }
.lt-hc-result > span.lt-wrap { flex: 1; min-width: 0; }
.lt-hc-ok { background: color-mix(in srgb, #2f9e5f 12%, transparent); }
.lt-hc-ok > svg { color: #2f9e5f; flex: none; }
.lt-hc-bad { background: color-mix(in srgb, #d9534f 12%, transparent); color: var(--dsw-alias-label-primary); }
.lt-hc-thumb { width: 96px; height: auto; max-height: 72px; object-fit: cover; border-radius: 8px; flex: none; box-shadow: 0 1px 4px rgba(0,0,0,0.25); background: #000; }
.lt-hc-black { width: 48px; height: 32px; border-radius: 6px; background: #000; flex: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.2); }
.lt-hc-actions { display: inline-flex; gap: 8px; flex: none; flex-wrap: wrap; justify-content: flex-end; }
.lt-hc-live { margin-left: 8px; font-size: 11px; font-weight: 500; padding: 1px 7px; border-radius: 999px; background: color-mix(in srgb, #d9534f 14%, transparent); color: #c9302c; vertical-align: 1px; }
.lt-hc-live.lt-hc-live-ok { background: color-mix(in srgb, #2f9e5f 16%, transparent); color: #2f9e5f; }
.lt-hc-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; word-break: break-all; }
.lt-hc-runtime-bad { background: color-mix(in srgb, #d9534f 10%, transparent); }
.lt-hc-runtime-bad .lt-row-sub { color: var(--dsw-alias-label-primary); }
.lt-hc-black-notice { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin: 0 0 12px; padding: 12px 14px; border-radius: 14px; background: #1b1b1f; color: #fff; border: 2px solid #d9534f; box-shadow: 0 8px 28px rgba(0,0,0,0.35); font-size: 13px; line-height: 1.45; max-width: 560px; }
.lt-hc-black-notice .lt-hc-black-text { flex: 1 1 260px; display: flex; flex-direction: column; gap: 4px; }
.lt-hc-black-notice strong { font-size: 14px; }
.lt-hc-black-notice .lt-pill { background: #fff; color: #1b1b1f; }
.lt-hc-black-notice .lt-pill.lt-pill-ghost { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.4); }
.lt-hc-compact { padding: 8px 12px; font-size: 12.5px; }
.lt-md-clip { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; flex: none; background: var(--dsw-alias-bg-layer-2); }
.lt-md-clip-none { display: inline-block; border: 1px dashed var(--lt-divider); background: transparent; }
.lt-md-bar { height: 4px; margin: 0 14px 12px; border-radius: 999px; background: var(--dsw-alias-bg-layer-3); overflow: hidden; }
.lt-md-bar > span { display: block; height: 100%; background: var(--lt-accent, #0064d4); border-radius: 999px; transition: width 300ms; }
.lt-md-failed { color: #c9302c; }
`

/** Put the stylesheet in the head once and mark the document as ours. */
export function ensureStyles(): () => void {
  const root = document.documentElement
  root.setAttribute('data-lingtai', '')
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (!style) {
    style = document.createElement('style')
    style.id = STYLE_ID
    document.head.appendChild(style)
  }
  style.textContent = CSS
  return () => {
    style?.remove()
    root.removeAttribute('data-lingtai')
    root.removeAttribute('data-lt-muse')
    root.style.removeProperty('--lt-accent')
  }
}
