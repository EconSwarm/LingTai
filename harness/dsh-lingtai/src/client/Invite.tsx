/**
 * The Invite button at the top right of a chat, as the Muse desktop has it: a
 * small pill with a gift, and a card with the account's invite code and link
 * — a friend who signs up with the code gets credit on LingTai Cloud, and so
 * does the person inviting. Occupies `conversation.session.header.utilities`;
 * nothing shows without an account.
 */
import { Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import { createElement as h, useEffect, useState, type ReactNode } from 'react'
import { call, type Translate, failureText } from './api.ts'
import { IconCopy, IconGift } from './icons.tsx'
import { useLive } from './live.ts'
import { mainChatId } from './MuseChats.tsx'
import { win } from './win.ts'

interface Invite {
  code: string
  url: string
  invites: number
  bonusCny: number
  earnedCny: number
}

function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text)
  return Promise.reject(new Error('clipboard unavailable'))
}

export function makeInviteButton(t: Translate) {
  return function InviteButton({ sessionId }: { sessionId?: string | undefined }): ReactNode {
    const live = useLive()
    const [open, setOpen] = useState(false)
    // this seat is per session: it tells the rest of the shell which chat is on
    // screen, and whether it is a side chat (Muse shows Invite on the main chat only)
    const side = sessionId !== undefined && mainChatId() !== undefined && mainChatId() !== sessionId
    useEffect(() => {
      win.current(sessionId ?? null)
      if (side) document.documentElement.dataset['ltSide'] = ''
      else delete document.documentElement.dataset['ltSide']
      return () => {
        delete document.documentElement.dataset['ltSide']
        win.current(null)
      }
    }, [sessionId, side])
    if (!live.cloud.signedIn || side) return null
    return h('span', null,
      h('button', { type: 'button', className: 'lt-invite', onClick: () => setOpen(true) }, h(IconGift, { size: 15 }), t('invite')),
      open ? h(InviteDialog, { t, onClose: () => setOpen(false) }) : null)
  }
}

function InviteDialog({ t, onClose }: { t: Translate; onClose(): void }): ReactNode {
  const [invite, setInvite] = useState<Invite | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [copied, setCopied] = useState<'code' | 'link' | undefined>()
  useEffect(() => {
    let alive = true
    call<Invite>('invite')
      .then((next) => { if (alive) setInvite(next) })
      .catch((err: unknown) => { if (alive) setError(failureText(t, err)) })
    return () => { alive = false }
  }, [t])
  const copy = (what: 'code' | 'link', text: string) => {
    void copyText(text).then(() => {
      setCopied(what)
      window.setTimeout(() => setCopied(undefined), 1800)
    }).catch(() => undefined)
  }
  return h(Modal, { open: true, title: t('inviteTitle'), closeLabel: t('close'), onClose, className: 'lt-invite-modal' },
    h('div', { className: 'lt-invite-card' },
      h('p', { className: 'lt-lead' }, t('inviteText', { bonus: invite?.bonusCny ?? 5 })),
      error ? h('div', { className: 'lt-ob-error', role: 'alert' }, error) : null,
      invite
        ? h('div', { className: 'lt-invite-card' },
            h('div', { className: 'lt-invite-code' },
              h('span', null, invite.code),
              h('button', { type: 'button', className: 'lt-pill lt-pill-ghost lt-pill-sm', onClick: () => copy('code', invite.code) }, h(IconCopy, { size: 14 }), copied === 'code' ? t('inviteCopied') : t('inviteCopy'))),
            invite.url
              ? h('div', { className: 'lt-invite-link' },
                  h('div', { style: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)', marginBottom: 4 } }, t('inviteLink')),
                  h('div', null, invite.url, ' ',
                    h('button', { type: 'button', className: 'lt-ob-link lt-inline', onClick: () => copy('link', invite.url) }, copied === 'link' ? t('inviteCopied') : t('inviteCopy'))))
              : null,
            h('div', { className: 'lt-invite-link' }, t('inviteStats', { n: invite.invites, earned: invite.earnedCny.toFixed(invite.earnedCny % 1 === 0 ? 0 : 2) })))
        : error ? null : h('div', { className: 'lt-spinner', style: { margin: '12px auto' } })))
}
