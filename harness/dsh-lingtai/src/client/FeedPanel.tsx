/**
 * The Feed (动态): the posts the agent wrote for the person, newest first — an
 * emoji mark, the title and when, the body with its links, a picture when
 * the story had one, and under each a heart and "Discuss", which opens a chat
 * about it. The sliders at the top right hold the feed's instructions (what
 * the person wants to read here) and a "write a batch now".
 */
import { failureText } from './api.ts'
import { createElement as h, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import type { Translate } from './api.ts'
import { IconComment, IconFeed, IconHeart, IconRefresh, IconSliders } from './icons.tsx'
import { FEED_PANEL } from './panels.ts'
import { setPrefs, usePrefs } from './prefs.ts'
import { markFeedSeen, nav, roomsCall, useRooms, type FeedPost, type FeedRoutine } from './rooms.ts'
import { ago, Empty, Markdown, MoreButton, RoomToggle, Sheet } from './ui.tsx'

export function makeFeedPanel(t: Translate) {
  return function FeedPanel(): ReactNode {
    const rooms = useRooms()
    const prefs = usePrefs()
    const [settings, setSettings] = useState(false)
    const [error, setError] = useState<string | undefined>()
    const posts = rooms.feed.posts
    const newest = posts[0]?.at ?? 0
    useEffect(() => { if (newest) markFeedSeen() }, [newest])
    // opening the Feed makes sure the daily routine exists (C5: 08:00, once, on the host)
    useEffect(() => { roomsCall('feed/open', {}).catch(() => undefined) }, [])
    const routine = rooms.feed.routine

    const fail = (err: unknown) => setError(failureText(t, err))
    const refresh = () => { setError(undefined); roomsCall('feed/refresh', {}).catch(fail) }
    const discuss = (post: FeedPost) => {
      setError(undefined)
      // the chat opens beside the feed, the post's words already in it (Muse's 讨论)
      roomsCall<{ sessionId: string }>('feed/discuss', { id: post.id }).then(({ sessionId }) => { nav.openSession(sessionId); nav.split(FEED_PANEL) }).catch(fail)
    }

    return h('div', { className: 'lt-room' },
      h('div', { className: 'lt-room-top', 'data-window-drag': true }),
      h('div', { className: 'lt-room-head' },
        h(RoomToggle, { t, panel: FEED_PANEL }),
        h('h1', { className: 'lt-room-title' }, t('railFeed')),
        h('div', { className: 'lt-room-actions' },
          rooms.busy.feed ? h('span', { className: 'lt-room-busy' }, h('span', { className: 'lt-spinner lt-spinner-sm' }), t('feedWriting')) : null,
          h('button', { type: 'button', className: 'lt-round-btn', title: t('feedSettings'), 'aria-label': t('feedSettings'), onClick: () => setSettings(true) }, h(IconSliders, { size: 18 })))),
      h('div', { className: 'lt-room-body' },
        h('div', { className: 'lt-room-inner lt-feed' },
          error ? h('div', { className: 'lt-room-error' }, error) : null,
          // the phone's intro card, until "Got it"
          !prefs.feedIntroSeen
            ? h('div', { className: 'lt-feed-intro', role: 'note' },
                h('div', { className: 'lt-feed-intro-title' }, t('feedIntroTitle')),
                h('p', { className: 'lt-feed-intro-body' }, t('feedIntroDesc')),
                h('div', { className: 'lt-feed-intro-actions' },
                  h('button', { type: 'button', className: 'lt-pill lt-pill-ghost lt-pill-sm', onClick: () => setSettings(true) }, t('feedIntroEdit')),
                  h('button', { type: 'button', className: 'lt-pill lt-pill-sm', onClick: () => setPrefs({ feedIntroSeen: true }) }, t('feedIntroGotIt'))))
            : null,
          posts.length === 0
            ? h(Empty, { icon: h(IconFeed, { size: 28 }), text: rooms.busy.feed ? t('feedWriting') : t('feedEmptyTitle') },
                h('p', { className: 'lt-empty-sub' }, rooms.ready ? t('feedEmptyBody', { time: routine.time }) : t('feedRoutineNeedsModel')),
                rooms.ready
                  ? h('div', { className: 'lt-feed-how' },
                      h('div', { className: 'lt-feed-how-title' }, t('feedEmptyHowTitle')),
                      h('p', null, t('feedEmptyHowBody')))
                  : null,
                rooms.ready && !rooms.busy.feed ? h('button', { type: 'button', className: 'lt-pill lt-pill-sm', onClick: refresh }, t('feedWriteNow')) : null)
            : posts.map((post) => h(PostCard, { key: post.id, t, post, lang: rooms.lang, onDiscuss: () => discuss(post), onFail: fail })))),
      settings ? h(FeedSettings, { t, instructions: rooms.feed.instructions, routine, busy: rooms.busy.feed, ready: rooms.ready, onClose: () => setSettings(false), onRefresh: refresh }) : null)
  }
}

function PostCard({ t, post, lang, onDiscuss, onFail }: { t: Translate; post: FeedPost; lang: string; onDiscuss(): void; onFail(err: unknown): void }): ReactNode {
  const [hideImage, setHideImage] = useState(false)
  const like = () => { roomsCall('feed/like', { id: post.id, on: !post.liked }).catch(onFail) }
  const remove = () => { roomsCall('feed/delete', { id: post.id }).catch(onFail) }
  const follow = () => { onDiscuss() }
  return h('article', { className: 'lt-post' },
    h('div', { className: 'lt-post-mark', 'aria-hidden': true }, post.emoji || '✦'),
    h('div', { className: 'lt-post-main' },
      h('div', { className: 'lt-post-head' },
        h('h3', { className: 'lt-post-title' }, post.title),
        h('span', { className: 'lt-post-when' }, ago(t, post.at)),
        h(MoreButton, { label: t('more'), quiet: true, size: 26, items: [
          { id: 'discuss', label: t('feedDiscuss'), onSelect: follow },
          ...(post.prompt ? [{ id: 'follow', label: t('feedFollowUp'), onSelect: follow }] : []),
          'sep',
          { id: 'delete', label: t('feedRemove'), danger: true, onSelect: remove },
        ] })),
      h(Markdown, { text: post.body, className: 'lt-post-body' }),
      post.image && !hideImage
        ? h('div', { className: 'lt-post-images' }, h('img', { src: post.image, alt: '', loading: 'lazy', referrerPolicy: 'no-referrer', onError: () => setHideImage(true) }))
        : null,
      h('div', { className: 'lt-post-actions' },
        h('button', { type: 'button', className: `lt-post-action${post.liked ? ' lt-liked' : ''}`, 'aria-pressed': post.liked, 'aria-label': t('feedLike'), title: t('feedLike'), onClick: like }, h(IconHeart, { size: 18, filled: post.liked })),
        h('button', { type: 'button', className: 'lt-post-action', onClick: onDiscuss }, h(IconComment, { size: 18 }), h('span', null, t('feedDiscuss'))),
        h('span', { className: 'lt-post-time-full' }, new Date(post.at).toLocaleString(lang || undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })))))
}

function FeedSettings({ t, instructions, routine, busy, ready, onClose, onRefresh }: { t: Translate; instructions: string; routine: FeedRoutine; busy: boolean; ready: boolean; onClose(): void; onRefresh(): void }): ReactNode {
  const [text, setText] = useState(instructions)
  const [on, setOn] = useState(routine.on)
  const [time, setTime] = useState(routine.time)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const save = (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    const routineChanged = on !== routine.on || time !== routine.time
    Promise.all([
      roomsCall('feed/instructions', { text }),
      routineChanged ? roomsCall('feed/routine', { on, time }) : Promise.resolve(undefined),
    ]).then(onClose).catch((err: unknown) => setError(failureText(t, err))).finally(() => setSaving(false))
  }
  return h(Sheet, { title: t('feedSettingsTitle'), closeLabel: t('close'), onClose,
    footer: h('div', { className: 'lt-sheet-actions' },
      h('button', { type: 'button', className: 'lt-pill lt-pill-ghost lt-pill-sm', disabled: busy || !ready, onClick: () => { onRefresh(); onClose() } }, h(IconRefresh, { size: 14 }), ' ', t('feedWriteNow')),
      h('span', { style: { flex: 1 } }),
      h('button', { type: 'button', className: 'lt-pill lt-pill-ghost lt-pill-sm', onClick: onClose }, t('cancel')),
      h('button', { type: 'submit', form: 'lt-feed-settings', className: 'lt-pill lt-pill-sm', disabled: saving }, t('save'))) },
    h('form', { id: 'lt-feed-settings', onSubmit: save, className: 'lt-sheet-form' },
      h('p', { className: 'lt-sheet-lead' }, t('feedSettingsLead')),
      h('textarea', { className: 'lt-textarea', rows: 6, value: text, placeholder: t('feedSettingsPlaceholder'), maxLength: 2000, onChange: (e: FormEvent<HTMLTextAreaElement>) => setText(e.currentTarget.value), 'data-modal-autofocus': true }),
      h('p', { className: 'lt-sheet-fine' }, t('feedSettingsFine')),
      // the daily routine (C5): on or off, and when
      h('label', { className: 'lt-feed-routine' },
        h('input', { type: 'checkbox', checked: on, onChange: (e: FormEvent<HTMLInputElement>) => setOn(e.currentTarget.checked) }),
        h('span', { className: 'lt-feed-routine-label' }, t('feedRoutineSwitch')),
        h('span', { className: 'lt-feed-routine-time' },
          h('input', { type: 'time', className: 'lt-field lt-field-time', value: time, disabled: !on, 'aria-label': t('feedRoutineTime', { time }), onChange: (e: FormEvent<HTMLInputElement>) => { if (/^\d{2}:\d{2}$/.test(e.currentTarget.value)) setTime(e.currentTarget.value) } }))),
      !ready ? h('p', { className: 'lt-sheet-fine' }, t('feedRoutineNeedsModel')) : null,
      error ? h('div', { className: 'lt-room-error' }, error) : null))
}
