/**
 * Memory — what the agent remembers about the person, one line each, kept on this
 * computer (`rooms.json`) and read into every chat's prompt. The drawer's Memory tab
 * lists it; Muse's "import memory" sheet pastes a text from another assistant in,
 * one line per memory; the Data controls page downloads everything as a zip or
 * resets the agent.
 */
import { failureText } from './api.ts'
import { createElement as h, Fragment, useState, type FormEvent, type ReactNode } from 'react'
import type { Translate } from './api.ts'
import { IconBrain, IconClose } from './icons.tsx'
import { roomsCall, useRooms, type MemoryItem } from './rooms.ts'
import { ago, Sheet } from './ui.tsx'

/** The memory list with an add field and the import button — the drawer's Memory tab. */
export function MemoryList({ t, onImport }: { t: Translate; onImport(): void }): ReactNode {
  const rooms = useRooms()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const items = [...rooms.memory].sort((a, b) => b.at - a.at)
  const add = (event: FormEvent) => {
    event.preventDefault()
    const line = text.trim()
    if (!line) return
    setBusy(true)
    roomsCall('memory/add', { text: line }).then(() => setText('')).catch(() => undefined).finally(() => setBusy(false))
  }
  return h(Fragment, null,
    h('form', { className: 'lt-mem-add', onSubmit: add },
      h('input', { className: 'lt-mem-input', value: text, placeholder: t('memAddPlaceholder'), maxLength: 400, onChange: (e: FormEvent<HTMLInputElement>) => setText(e.currentTarget.value) }),
      h('button', { type: 'submit', className: 'lt-pill lt-pill-sm', disabled: busy || !text.trim() }, t('memAdd'))),
    items.length
      ? h('div', { className: 'lt-pf-rows' }, items.map((item) => h(MemoryRow, { key: item.id, t, item })))
      : h('p', { className: 'lt-pf-empty' }, t('memEmpty')),
    h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
      h('button', { type: 'button', className: 'lt-pill lt-pill-ghost lt-pill-sm', onClick: onImport }, t('memImport'))))
}

function MemoryRow({ t, item }: { t: Translate; item: MemoryItem }): ReactNode {
  return h('div', { className: 'lt-pf-row' },
    h('span', { className: 'lt-pf-row-icon' }, h(IconBrain, { size: 18 })),
    h('div', { className: 'lt-pf-row-main' },
      h('div', { className: 'lt-pf-row-title lt-wrap' }, item.text),
      h('div', { className: 'lt-pf-row-sub' }, `${t(item.source === 'agent' ? 'memFromAgent' : item.source === 'import' ? 'memFromImport' : 'memFromYou')} · ${ago(t, item.at)}`)),
    h('button', { type: 'button', className: 'lt-icon-btn lt-mem-forget', 'aria-label': t('memForget'), title: t('memForget'), onClick: () => { void roomsCall('memory/delete', { id: item.id }).catch(() => undefined) } }, h(IconClose, { size: 14 })))
}

/** Muse's "import memory": paste what another assistant knew; each line becomes a memory. */
export function ImportMemorySheet({ t, onClose }: { t: Translate; onClose(): void }): ReactNode {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<number | undefined>()
  const [error, setError] = useState<string | undefined>()
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!text.trim()) return
    setBusy(true)
    setError(undefined)
    roomsCall<{ added: number }>('memory/import', { text }).then((r) => setDone(r.added)).catch((err: unknown) => setError(failureText(t, err))).finally(() => setBusy(false))
  }
  return h(Sheet, { title: t('memImport'), closeLabel: t('close'), onClose,
    footer: h('div', { className: 'lt-sheet-actions' },
      h('span', { style: { flex: 1 } }),
      h('button', { type: 'button', className: 'lt-pill lt-pill-ghost lt-pill-sm', onClick: onClose }, done === undefined ? t('cancel') : t('close')),
      done === undefined ? h('button', { type: 'submit', form: 'lt-mem-import', className: 'lt-pill lt-pill-sm', disabled: busy || !text.trim() }, busy ? t('memImporting') : t('memImportDo')) : null) },
    h('form', { id: 'lt-mem-import', className: 'lt-sheet-form', onSubmit: submit },
      h('p', { className: 'lt-sheet-lead' }, t('memImportLead')),
      h('ol', { className: 'lt-sheet-steps' },
        h('li', null, t('memImportStep1')),
        h('li', null, t('memImportStep2')),
        h('li', null, t('memImportStep3'))),
      done === undefined
        ? h('textarea', { className: 'lt-textarea', rows: 8, value: text, placeholder: t('memImportPlaceholder'), maxLength: 60000, onChange: (e: FormEvent<HTMLTextAreaElement>) => setText(e.currentTarget.value), 'data-modal-autofocus': true })
        : h('p', { className: 'lt-sheet-lead' }, t('memImported', { n: done })),
      error ? h('div', { className: 'lt-room-error' }, error) : null))
}

/** Muse's Data controls, the local part: import memory, download the agent data, reset. */
export function DataRows({ t }: { t: Translate }): ReactNode {
  const [sheet, setSheet] = useState(false)
  const [notice, setNotice] = useState<string | undefined>()
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const download = () => {
    setBusy(true)
    setNotice(undefined)
    roomsCall<{ path: string }>('data/export', {}).then((r) => setNotice(t('dataExported', { path: r.path }))).catch((err: unknown) => setNotice(failureText(t, err))).finally(() => setBusy(false))
  }
  const reset = () => {
    setBusy(true)
    roomsCall('data/reset', {}).then(() => window.location.reload()).catch((err: unknown) => { setNotice(failureText(t, err)); setBusy(false) })
  }
  return h(Fragment, null,
    h('div', { className: 'lt-card' },
      h('div', { className: 'lt-row' },
        h('div', { className: 'lt-row-main' },
          h('span', { className: 'lt-row-title' }, t('memImport')),
          h('span', { className: 'lt-row-sub lt-wrap' }, t('dataImportSub'))),
        h('button', { type: 'button', className: 'lt-pill lt-pill-ghost lt-pill-sm', onClick: () => setSheet(true) }, t('dataImportDo'))),
      h('div', { className: 'lt-row' },
        h('div', { className: 'lt-row-main' },
          h('span', { className: 'lt-row-title' }, t('dataDownload')),
          h('span', { className: 'lt-row-sub lt-wrap' }, t('dataDownloadSub'))),
        h('button', { type: 'button', className: 'lt-pill lt-pill-ghost lt-pill-sm', disabled: busy, onClick: download }, t('dataDownloadDo'))),
      h('div', { className: 'lt-row' },
        h('div', { className: 'lt-row-main' },
          h('span', { className: 'lt-row-title lt-danger' }, t('dataReset')),
          h('span', { className: 'lt-row-sub lt-wrap' }, t('dataResetSub'))),
        h('button', { type: 'button', className: 'lt-pill lt-pill-ghost lt-pill-sm lt-danger', disabled: busy, onClick: () => setConfirm(true) }, t('dataResetDo'))),
      notice ? h('div', { className: 'lt-row' }, h('span', { className: 'lt-row-sub lt-wrap' }, notice)) : null),
    sheet ? h(ImportMemorySheet, { t, onClose: () => setSheet(false) }) : null,
    confirm
      ? h(Sheet, { title: t('dataReset'), closeLabel: t('close'), onClose: () => setConfirm(false),
          footer: h('div', { className: 'lt-sheet-actions' },
            h('span', { style: { flex: 1 } }),
            h('button', { type: 'button', className: 'lt-pill lt-pill-ghost lt-pill-sm', onClick: () => setConfirm(false) }, t('cancel')),
            h('button', { type: 'button', className: 'lt-pill lt-pill-sm lt-pill-danger', disabled: busy, onClick: reset }, busy ? t('dataResetting') : t('dataResetDo'))) },
          h('div', { className: 'lt-sheet-form' },
            h('p', { className: 'lt-sheet-lead' }, t('dataResetConfirm'))))
      : null)
}
