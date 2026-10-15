/**
 * One task, opened from the Activity tab the way the Muse desktop opens an
 * entry: a status pill and the title at the top, the steps down the left
 * (started, each tool step, the summary, finished) and, on the right, the step
 * chosen — what it did, its arguments, what the tool returned. The record is
 * the host's (`/lingtai/rooms/activity?session=`), fetched in full here; the
 * stream carries it without the texts.
 */
import { createElement as h, useEffect, useState, type ReactNode } from 'react'
import { failureText, type Translate } from './api.ts'
import { IconCheck, IconCheckCircle, IconClose, IconCpu, IconFile, IconGlobe, IconSparkle, IconSpinner } from './icons.tsx'
import type { ChatListState } from './MuseChats.tsx'
import { nav, roomsCall, useRooms, type ActivityRecord, type ActivityStep } from './rooms.ts'
import { Markdown, clockLabel } from './ui.tsx'

export interface TaskDetailProps {
  t: Translate
  sessionId: string
  useSessions?: (<S>(selector: (state: ChatListState) => S) => S) | undefined
  onClose(): void
}

export function TaskDetail({ t, sessionId, useSessions, onClose }: TaskDetailProps): ReactNode {
  const rooms = useRooms()
  const [record, setRecord] = useState<ActivityRecord | null>(null)
  const [error, setError] = useState<string | undefined>()
  const [picked, setPicked] = useState<number | null>(null)
  const title = typeof useSessions === 'function' ? useSessions((s) => s.byId[sessionId]?.displayTitle) : undefined
  const live = rooms.activity.find((r) => r.sessionId === sessionId)

  // the full record, again whenever the stream says it moved
  useEffect(() => {
    let alive = true
    roomsCall<ActivityRecord>(`activity?session=${encodeURIComponent(sessionId)}`)
      .then((r) => { if (alive) setRecord(r) })
      .catch((err: unknown) => { if (alive) setError(failureText(t, err)) })
    return () => { alive = false }
  }, [sessionId, live?.updatedAt])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.stopPropagation(); onClose() } }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [onClose])

  const steps = record?.steps ?? []
  const summary = [...steps].reverse().find((s) => s.kind === 'answer')
  const list = steps.filter((s) => s.kind !== 'answer')
  const index = picked ?? (summary ? -1 : Math.max(0, list.length - 1))
  const current: ActivityStep | undefined = index === -1 ? summary : list[index]
  const status = record?.status ?? live?.status ?? 'done'
  const pill = status === 'running' || status === 'waiting' ? ['lt-live', t('taskRunning')] : status === 'error' ? ['lt-err', t('taskFailed')] : status === 'stopped' ? ['', t('taskStopped')] : ['lt-ok', t('taskDone')]

  const stepIcon = (step: ActivityStep) => {
    if (step.kind === 'start') return h('span', { className: 'lt-task-dot' })
    if (step.kind === 'end') return h(IconCheckCircle, { size: 16 })
    const base = step.name.replace(/^mcp__[^_]+(?:_[^_]+)*?__/, '')
    if (/file|edit|write|read|glob|grep|present/i.test(base)) return h(IconFile, { size: 16 })
    if (/web|fetch|search|browser/i.test(base)) return h(IconGlobe, { size: 16 })
    if (/computer|screen|act|hands/i.test(base)) return h(IconCpu, { size: 16 })
    if (/draw|studio|image/i.test(base)) return h(IconSparkle, { size: 16 })
    return step.ok === undefined && status === 'running' ? h(IconSpinner, { size: 16 }) : h(IconCheck, { size: 16 })
  }
  const stepTitle = (step: ActivityStep) => {
    if (step.kind === 'start') return t('taskStarted')
    if (step.kind === 'end') return status === 'error' ? t('taskFailed') : status === 'stopped' ? t('taskStopped') : t('taskDone')
    const base = step.name.replace(/^mcp__[^_]+(?:_[^_]+)*?__/, '').replace(/_/g, ' ')
    return step.title ? `${base} · ${step.title}` : base
  }

  return h('div', { className: 'lt-task-backdrop', onMouseDown: (e: MouseEvent) => { if (e.target === e.currentTarget) onClose() } },
    h('div', { className: 'lt-task', role: 'dialog', 'aria-modal': true, 'aria-label': title ?? t('pfActivity') },
      h('div', { className: 'lt-task-head' },
        h('span', { className: `lt-task-pill ${pill[0]}`.trim() }, status === 'running' || status === 'waiting' ? h(IconSpinner, { size: 12 }) : null, pill[1]),
        h('div', { className: 'lt-task-title' }, title || record?.request || t('chUntitled')),
        h('button', { type: 'button', className: 'lt-pill lt-pill-ghost lt-pill-sm', onClick: () => { onClose(); nav.openSession(sessionId) } }, t('taskOpenChat')),
        h('button', { type: 'button', className: 'lt-icon-btn', 'aria-label': t('close'), onClick: onClose }, h(IconClose, { size: 16 }))),
      error ? h('div', { className: 'lt-doc-error', role: 'alert' }, error) : null,
      !record && !error ? h('div', { className: 'lt-task-loading' }, t('loading')) : null,
      record
        ? h('div', { className: 'lt-task-body' },
            h('div', { className: 'lt-task-steps', role: 'list' },
              list.map((step, i) => h('button', { key: `${step.at}-${i}`, type: 'button', role: 'listitem', className: `lt-task-step${index === i ? ' lt-active' : ''}${step.ok === false ? ' lt-err' : ''}`, onClick: () => setPicked(i) },
                h('span', { className: 'lt-task-step-icon' }, stepIcon(step)),
                h('span', { className: 'lt-task-step-text' }, stepTitle(step)),
                h('span', { className: 'lt-task-step-time' }, clockLabel(step.at, rooms.lang)))),
              summary ? h('button', { type: 'button', role: 'listitem', className: `lt-task-step${index === -1 ? ' lt-active' : ''}`, onClick: () => setPicked(-1) },
                h('span', { className: 'lt-task-step-icon' }, h(IconCheck, { size: 16 })),
                h('span', { className: 'lt-task-step-text' }, t('taskSummary')),
                h('span', { className: 'lt-task-step-time' }, clockLabel(summary.at, rooms.lang))) : null),
            h('div', { className: 'lt-task-detail' },
              current
                ? h('div', null,
                    h('h3', { className: 'lt-task-detail-title' }, current.kind === 'answer' ? t('taskSummary') : stepTitle(current)),
                    current.kind === 'answer'
                      ? h(Markdown, { text: current.detail })
                      : h('div', null,
                          current.kind === 'tool' && current.detail ? h('div', { className: 'lt-task-block' }, h('div', { className: 'lt-task-label' }, t('taskArguments')), h('pre', { className: 'lt-task-pre' }, current.detail)) : null,
                          current.kind === 'tool' ? h('div', { className: 'lt-task-block' }, h('div', { className: 'lt-task-label' }, t('taskReturned')), current.result ? h('pre', { className: 'lt-task-pre' }, current.result) : h('div', { className: 'lt-task-muted' }, current.ok === undefined ? t('taskPending') : t('taskNothing'))) : null,
                          current.kind === 'start' ? h('div', { className: 'lt-task-muted' }, record.request ? h(Markdown, { text: record.request }) : t('taskStartedText')) : null,
                          current.kind === 'end' ? h('div', { className: 'lt-task-muted' }, current.detail || t('taskDone')) : null))
                : h('div', { className: 'lt-task-muted' }, t('taskNoSteps'))))
        : null))
}
