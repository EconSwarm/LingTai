//
//  LingTaiChatGlue.swift
//  LingTai
//
//  The few places the upstream chat pipeline hands control to LingTai —
//  one `// LingTai:` line each in AIChatViewModel: before a send, after a
//  turn, while the system prompt is assembled. Everything else lives here.
//  Android: the same hooks in ChatViewModel for AvatarFlow, GoalFlow,
//  FeedFlow, FirstConversation and SessionAddenda.
//

import Foundation

// MARK: - The Muse header's menu → the chat

extension Notification.Name {
    /// `object` is the chat's session key (`ltSessionKey`); `userInfo["action"]` a
    /// `LingTaiChatAction` raw value. AIChatView acts on it for its own chat.
    static let lingTaiChatAction = Notification.Name("LingTai.chatAction")
}

/// What the Muse header's ••• menu can ask of the chat under it (the entries
/// Android's ChatScreen menu has; the shell's own rows stay in the shell).
enum LingTaiChatAction: String {
    case newChat, model, clearChat, terminal, browser, files, tokenUsage

    static func post(_ action: LingTaiChatAction, session: String) {
        NotificationCenter.default.post(name: .lingTaiChatAction, object: session, userInfo: ["action": action.rawValue])
    }

    /// The action a notification carries, when it is for the given chat.
    static func from(_ note: Notification, for session: String) -> LingTaiChatAction? {
        guard (note.object as? String) == session, let raw = note.userInfo?["action"] as? String else { return nil }
        return LingTaiChatAction(rawValue: raw)
    }
}

@MainActor
extension AIChatViewModel {
    /// What addenda, flows and cards key on: the real session, or the draft until it is created.
    var ltSessionKey: String { sessionId ?? draftId ?? "draft" }

    // MARK: Hooks

    /// Before the model sees a message. True when LingTai handled the text itself (the
    /// composer is cleared, nothing is sent); false to carry on as usual.
    func ltInterceptSend(_ text: String) -> Bool {
        guard !text.isEmpty else { return false }
        if LingTaiAvatarFlow.shared.handle(text, in: self) { return true }
        if LingTaiFirstConversation.shared.handle(text, in: self) { return true }
        // C7: "@Pixel 8 open the calendar" — the task runs on that device, its answer comes back here.
        if LingTaiDeviceMention.handle(text, in: self) { return true }
        return false
    }

    /// After a turn ended: goals, the feed, the naming flow read the reply; addenda tick; sync pushes.
    func ltAfterTurn() {
        let key = ltSessionKey
        let reply = ltLastAssistantText()
        LingTaiGoalFlow.afterTurn(session: key, assistantText: reply)
        LingTaiFeedFlow.afterTurn(session: key, assistantText: reply)
        LingTaiFirstConversation.shared.afterTurn(session: key, assistantText: reply, vm: self)
        LingTaiSessionAddenda.onTurnFinished(session: key)
        LingTaiSync.shared.turnFinished(session: key)
        // "Use LingTai Cloud this time" covered this one turn; where the turn ran decides whether the next failure offers it
        LingTaiCloudOnce.turnEnded(onCloud: resolveCurrentEntry()?.providerInstanceId == LingTaiCloud.instance?.id)
    }

    /// Appended to the system prompt of this session (empty when there is nothing to add).
    func ltSystemPromptAddenda() -> String {
        // A draft became a session: carry what was registered under the draft's id.
        if let draft = draftId, let real = sessionId, draft != real { ltRebind(from: draft, to: real) }
        let key = ltSessionKey
        var parts: [String] = []
        if let user = LingTaiSystemFiles.userPromptFragment() { parts.append(user) }
        if let goal = LingTaiGoalFlow.systemAddendum(session: key) { parts.append(goal) }
        if let feed = LingTaiFeedFlow.systemAddendum(session: key) { parts.append(feed) }
        if let addenda = LingTaiSessionAddenda.forPrompt(session: key) { parts.append(addenda) }
        if let naming = LingTaiFirstConversation.shared.systemAddendum(session: key) { parts.append(naming) }
        guard !parts.isEmpty else { return "" }
        return "\n\n" + parts.joined(separator: "\n\n")
    }

    /// A draft became a session: everything keyed on the draft follows it.
    func ltRebind(from draft: String, to real: String) {
        LingTaiSessionAddenda.rebind(from: draft, to: real)
        LingTaiFirstConversation.shared.rebind(from: draft, to: real)
        LingTaiAvatarFlow.shared.rebind(from: draft, to: real)
    }

    // MARK: Helpers

    /// The last assistant reply's text, fences included.
    func ltLastAssistantText() -> String? {
        guard let msg = messages.last(where: { $0.role == .assistant }) else { return nil }
        let text = msg.blocks.filter { $0.kind == .text }.map(\.content).joined(separator: "\n")
        if !text.isEmpty { return text }
        return msg.content.isEmpty ? nil : msg.content
    }

    /// A line from the person and a line from the agent, in the chat and in the store, with no
    /// model call: what the avatar flow and the naming flow say for themselves.
    func ltLocalTurn(user: String? = nil, assistant: String? = nil) {
        var agentMessages: [AgentMessage] = []
        if let user, !user.isEmpty {
            messages.append(ChatMessage(role: .user, content: user))
            agentMessages.append(AgentMessage(role: .user, parts: [.text(user)]))
        }
        if let assistant, !assistant.isEmpty {
            let msg = ChatMessage(role: .assistant, content: assistant, blocks: [AssistantBlock(kind: .text, content: assistant)])
            messages.append(msg)
            agentMessages.append(AgentMessage(role: .assistant, parts: [.text(assistant)]))
        }
        guard !agentMessages.isEmpty else { return }
        inputText = ""
        scrollToBottomSignal.send()
        Task { @MainActor [weak self] in
            guard let self else { return }
            let before = self.ltSessionKey
            await self.ensureSession()
            if before != self.ltSessionKey { self.ltRebind(from: before, to: self.ltSessionKey) }
            for var m in agentMessages {
                let idx = self.agentHistory.count
                self.agentHistory.append(m)
                if let id = await self.persistAgentMessage(m), idx < self.agentHistory.count {
                    m.dbMessageId = id
                    self.agentHistory[idx].dbMessageId = id
                }
            }
        }
    }

    /// Put words in the composer without sending ("Change your avatar to ").
    func ltPrefill(_ text: String) {
        inputText = text
    }

    /// Send a message on the person's behalf (an idea's "Try it", a goal's "Start").
    func ltSendNow(_ text: String) {
        inputText = text
        send()
    }

    // MARK: C9 presence

    /// Put "{device} is working…" under the last message when it is another device's user line
    /// and presence says that device is at work on this conversation; take it off otherwise
    /// (the reply arrived, presence said done, or ten minutes passed). Cheap: the last row only.
    func ltApplyPresence() {
        let key = ltSessionKey
        let last = messages.last
        let remote = last.map { $0.role == .user && $0.ltFromDevice != nil } ?? false
        var entry: LingTaiPresence.Working?
        if remote, let sid = sessionId, let cid = LingTaiSync.shared.cid(for: sid) {
            entry = LingTaiPresence.shared.working(for: cid)
        }
        let line = LingTaiPresence.line(lastIsRemoteUser: remote, lastFromDevice: last?.ltFromDevice, entry: entry, me: LingTaiHub.shared.deviceId)
        LingTaiPresence.shared.show(line, on: last, session: key)
    }
}
