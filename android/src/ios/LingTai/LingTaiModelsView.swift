//
//  LingTaiModelsView.swift
//  lingTai
//
//  Settings › Models (0.1.41 "Choice"): the four slots as four rows, each saying which
//  provider and model holds it; a picker per slot, grouped lingTai Cloud first and then
//  one group per provider of the person's own, each folded to eight rows with a "Show n
//  more" row and a search field once there is more than that (LingTaiPickerList); "Add a
//  provider" at the bottom. The "Use it for" card that follows a saved key lives here too.
//  Android: ui/models/ModelsScreen.kt and UseItForSheet.kt; desktop: client/ModelsPage.tsx.
//

import SwiftUI

// MARK: - The page

struct LingTaiModelsView: View {
    @State private var providers: [LingTaiSlotProvider] = []
    @State private var lines: [LingTaiSlot: String] = [:]
    @State private var videoOff = false
    @State private var chatChanged = false
    @State private var adding = false
    @State private var cloudOn = LingTaiCloud.modelsOn
    @State private var cloudRefused = false

    var body: some View {
        LingTaiPage(title: AppLocalized("Models")) {
            LingTaiCard {
                ForEach(Array(LingTaiSlot.allCases.enumerated()), id: \.element) { index, slot in
                    if index > 0 { LingTaiRowDivider() }
                    row(slot)
                }
            }
            if chatChanged {
                LingTaiCaption(text: AppLocalized("Applies to the main chat and to new chats; a side chat keeps its model."))
            }
            // The account's models as a source. Off, lingTai Cloud leaves the pickers and the
            // automatic order; the sign-in stays. Not a delete: the Cloud instance is the account.
            if LingTaiCloud.isSignedIn {
                LingTaiCard {
                    LingTaiToggleRow(title: AppLocalized("Use lingTai Cloud models"), isOn: Binding(
                        get: { cloudOn },
                        set: { on in
                            // Off is refused while the chat model is the account's and no model
                            // of one's own could take it: the switch stays on and the sentence
                            // under it says why. Otherwise the chat slot moves to the first own model.
                            let chatWasCloud = LingTaiModelSlots.chatProviderId() == LingTaiCloud.instance?.id
                            cloudRefused = !LingTaiCloud.setModelsOn(on)
                            if !on, !cloudRefused, chatWasCloud { chatChanged = true } // the chat slot moved: the note under the rows says so
                            reload()
                        }
                    ))
                    if cloudRefused {
                        Text(AppLocalized("Add a provider of your own first; with lingTai Cloud off, nothing else could answer."))
                            .font(.footnote)
                            .foregroundStyle(.red)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.horizontal, 16)
                            .padding(.bottom, 12)
                    }
                }
                LingTaiCaption(text: cloudOn
                    ? AppLocalized("lingTai Cloud is one of the sources for the chat, pictures and clips; what runs on it comes off your allowance.")
                    : AppLocalized("Off: nothing runs on lingTai Cloud unless you choose it yourself. You stay signed in for sync and your devices."))
            }
            LingTaiCard {
                LingTaiActionRow(title: AppLocalized("Add a provider"), titleColor: LingTaiTones.action, chevron: false) { adding = true }
            }
        }
        .task {
            reload()
            if LingTaiCloud.isSignedIn, await LingTaiRelayMenu.refresh() != nil { reload() }
        }
        .onReceive(NotificationCenter.default.publisher(for: LingTaiModelSlots.changed)) { _ in reload() }
        .onReceive(NotificationCenter.default.publisher(for: LingTaiMediaModels.changed)) { _ in reload() }
        .onReceive(NotificationCenter.default.publisher(for: .sessionModelBindingChanged)) { _ in reload() }
        .sheet(isPresented: $adding) {
            LingTaiOwnKeySheet { _ in reload() }
        }
    }

    @ViewBuilder
    private func row(_ slot: LingTaiSlot) -> some View {
        if slot == .hands {
            LingTaiSlotRow(slot: slot, value: AppLocalized("models.hands.not_on_iphone"), chevron: false)
                .opacity(0.55)
        } else {
            NavigationLink {
                LingTaiSlotPickerView(slot: slot) {
                    if slot == .chat { chatChanged = true }
                    reload()
                }
            } label: {
                LingTaiSlotRow(slot: slot, value: value(slot), chevron: true)
            }
            .buttonStyle(.plain)
        }
    }

    private func value(_ slot: LingTaiSlot) -> String {
        if slot == .video, videoOff { return AppLocalized("Off") }
        return lines[slot] ?? AppLocalized("No model yet")
    }

    private func reload() {
        cloudOn = LingTaiCloud.modelsOn
        let list = LingTaiModelSlots.providers()
        providers = list
        var next: [LingTaiSlot: String] = [:]
        for slot in LingTaiSlot.allCases {
            if let line = LingTaiModelSlots.line(slot, providers: list) { next[slot] = line }
        }
        lines = next
        videoOff = LingTaiMediaModels.videoChoice() == .off
    }
}

/// One slot's row: the title and what it does on the left, the provider and model on the right.
private struct LingTaiSlotRow: View {
    let slot: LingTaiSlot
    let value: String
    let chevron: Bool

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: slot.symbol)
                .font(.body)
                .foregroundStyle(.secondary)
                .frame(width: 24)
            VStack(alignment: .leading, spacing: 2) {
                Text(slot.title)
                    .font(.body)
                    .foregroundStyle(.primary)
                Text(slot.subtitle)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }
            Spacer(minLength: 8)
            Text(value)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .lineLimit(2)
                .multilineTextAlignment(.trailing)
                .truncationMode(.middle)
                .layoutPriority(-1)
            if chevron {
                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 13)
        .contentShape(Rectangle())
    }
}

// MARK: - The picker for one slot

/// The models that can hold `slot`: lingTai Cloud's group first when signed in (the relay's
/// recommended one marked), then one group per provider of the person's own that covers the
/// slot. A group shows at most `LingTaiPickerList.fold` rows until its *Show n more* row is
/// tapped; once the groups together hold more than that, a search field under the Automatic
/// row filters every group live. A tap on a model sets the slot and goes back.
struct LingTaiSlotPickerView: View {
    let slot: LingTaiSlot
    var onPick: () -> Void = {}

    @Environment(\.dismiss) private var dismiss
    @State private var providers: [LingTaiSlotProvider] = []
    @State private var current: LingTaiSlotChoice?
    /// False while the slot follows the automatic order (no choice stored).
    @State private var chosen = true
    @State private var videoOff = false
    @State private var automaticLine: String?
    @State private var adding = false
    /// What the person typed in the search field.
    @State private var query = ""
    /// The groups whose *Show n more* row was tapped; kept while the picker is open.
    @State private var expanded: Set<String> = []
    /// Own providers the catalogue says could serve the slot but the iPhone cannot drive for it.
    @State private var notDriven: [String] = []

    private var able: [LingTaiSlotProvider] { providers.filter { $0.has(slot) } }
    /// Pictures and clips can go back to the automatic order; chat is the anchor.
    private var offersAutomatic: Bool { slot == .image || slot == .video }
    /// The query as the filter reads it; empty when there is none.
    private var needle: String { LingTaiPickerList.normalized(query) }
    /// The search field shows once the groups together hold more rows than one fold.
    private var offersSearch: Bool {
        LingTaiPickerList.offersSearch(total: able.reduce(0) { $0 + ordered($1).count })
    }
    /// The groups with something to show: all of them, or, with a query, those with a match.
    private var visible: [LingTaiSlotProvider] {
        needle.isEmpty ? able : able.filter { !rows($0).shown.isEmpty }
    }

    var body: some View {
        LingTaiPage(title: slot.title) {
            if offersAutomatic {
                LingTaiCard {
                    LingTaiChoiceRow(
                        title: AppLocalized("Automatic"),
                        subtitle: automaticLine.map { String(format: AppLocalized("Currently %@"), $0) } ?? (able.isEmpty ? emptyLine : nil),
                        selected: !chosen
                    ) { pickAutomatic() }
                    if slot == .video {
                        LingTaiRowDivider()
                        LingTaiChoiceRow(title: AppLocalized("Off"), subtitle: nil, selected: videoOff) { pickOff() }
                    }
                }
            } else if able.isEmpty {
                LingTaiCaption(text: emptyLine)
            }
            if offersSearch {
                LingTaiSearchField(text: $query, placeholder: AppLocalized("Search models"))
            }
            if !needle.isEmpty, visible.isEmpty {
                LingTaiCaption(text: AppLocalized("No model matches"))
            }
            ForEach(visible, id: \.id) { provider in
                let group = rows(provider)
                VStack(alignment: .leading, spacing: 6) {
                    Text(provider.label)
                        .font(.footnote.weight(.semibold))
                        .foregroundStyle(.secondary)
                        .padding(.horizontal, 32)
                    LingTaiModelList(
                        provider: provider, slot: slot, current: chosen ? current : nil,
                        models: group.shown, hidden: group.hidden,
                        onPick: { model in pick(provider, model) },
                        onMore: { expanded.insert(provider.id) }
                    )
                }
            }
            if needle.isEmpty, !notDriven.isEmpty {
                LingTaiCaption(text: String(format: notDrivenLine, notDriven.joined(separator: ", ")))
            }
            LingTaiCard {
                LingTaiActionRow(title: AppLocalized("Add a provider"), titleColor: LingTaiTones.action, chevron: false) { adding = true }
            }
        }
        .task { await load() }
        .onReceive(NotificationCenter.default.publisher(for: LingTaiMediaModels.changed)) { _ in reload() }
        .sheet(isPresented: $adding) {
            LingTaiOwnKeySheet { _ in reload() }
        }
    }

    /// A group's rows in the picker's order: the provider's default for the slot, the chosen
    /// model, then the rest as listed. Cloud without a menu on the phone: one row, the
    /// relay's own choice.
    private func ordered(_ provider: LingTaiSlotProvider) -> [String] {
        let list = provider.models(for: slot)
        if list.isEmpty, provider.isCloud { return [""] }
        let mine = chosen && current?.providerId == provider.id ? current?.model : nil
        return LingTaiPickerList.ordered(list, preferred: provider.defaultModel(for: slot), chosen: mine)
    }

    /// What a group shows right now: every match while a query is present, else the first
    /// fold with the count behind its *Show n more* row.
    private func rows(_ provider: LingTaiSlotProvider) -> (shown: [String], hidden: Int) {
        let all = ordered(provider)
        if !needle.isEmpty { return (LingTaiPickerList.filtered(all, names: provider.names, query: needle), 0) }
        return LingTaiPickerList.collapsed(all, expanded: expanded.contains(provider.id))
    }

    private var emptyLine: String {
        switch slot {
        case .chat, .hands: return AppLocalized("Sign in to lingTai Cloud or add a provider")
        case .image: return AppLocalized("None of your providers can draw. Sign in to lingTai Cloud, or add an Alibaba Cloud Bailian provider with an API key; the avatar is drawn with one of the two.")
        case .video: return AppLocalized("No provider that can make video yet. lingTai speaks Alibaba Cloud Model Studio's video API, which lingTai Cloud relays too. Sign in to lingTai Cloud, or add a Model Studio key (it can be the same one as the image model uses), and the avatar starts moving; until then it stays as still pictures.")
        }
    }

    /// The sentence naming the providers the iPhone cannot draw or film through (`%@`), and why.
    private var notDrivenLine: String {
        switch slot {
        case .video: return AppLocalized("Not offered here: %@. Clips go through Alibaba Cloud Model Studio's video API, which lingTai Cloud relays too.")
        default: return AppLocalized("Not offered here: %@. On the iPhone, pictures with a key of your own go through Alibaba Cloud Model Studio's image API; the desktop app also draws through providers that speak the OpenAI images API.")
        }
    }

    private func load() async {
        reload()
        // a Model Studio key is asked once which video models it has; the list grows when it answers
        if slot == .video {
            for inst in LingTaiImageGen.bailianInstances() where !LingTaiMediaModels.videoCheckIsFresh(for: inst) {
                _ = await LingTaiMediaModels.checkVideoModels(for: inst)
            }
            reload()
        }
    }

    private func reload() {
        let list = LingTaiModelSlots.providers()
        providers = list
        notDriven = LingTaiModelSlots.notDriven(for: slot)
        chosen = LingTaiModelSlots.hasChoice(slot)
        videoOff = slot == .video && LingTaiMediaModels.videoChoice() == .off
        automaticLine = offersAutomatic ? LingTaiModelSlots.automaticLine(slot, providers: list) : nil
        switch slot {
        case .chat: current = LingTaiModelSlots.chatChoice()
        case .hands: current = nil
        case .image: current = LingTaiModelSlots.imageValue(providers: list)
        case .video: current = LingTaiModelSlots.videoValue(providers: list)
        }
    }

    /// Forget the stored choice: the slot follows the order again, nothing else changes.
    private func pickAutomatic() {
        LingTaiModelSlots.clear(slot)
        onPick()
        dismiss()
    }

    /// No clips at all (video only); remembered, unlike "never chosen".
    private func pickOff() {
        LingTaiMediaModels.saveVideo(instanceId: nil, model: "")
        onPick()
        dismiss()
    }

    private func pick(_ provider: LingTaiSlotProvider, _ model: String) {
        if slot == .chat, !LingTaiModelSlots.useForChat(instanceId: provider.id, model: model) {
            // the relay's menu named a model the phone has no entry for yet: fetch the list, then set it
            Task {
                if let inst = ProviderConfigStore.shared.instance(for: provider.id) {
                    await ProviderConfigStore.shared.refreshModels(for: inst)
                }
                if LingTaiModelSlots.useForChat(instanceId: provider.id, model: model) {
                    onPick()
                    dismiss()
                }
            }
            return
        }
        if slot != .chat { LingTaiModelSlots.use(slot, providerId: provider.id, model: model) }
        onPick()
        dismiss()
    }
}

/// A row of a picker that is not a model: a title, what it means right now, a tick when selected.
private struct LingTaiChoiceRow: View {
    let title: String
    let subtitle: String?
    let selected: Bool
    let onPick: () -> Void

    var body: some View {
        Button(action: onPick) {
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.body)
                        .foregroundStyle(.primary)
                    if let subtitle, !subtitle.isEmpty {
                        Text(subtitle)
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                            .lineLimit(3)
                    }
                }
                Spacer(minLength: 8)
                if selected {
                    Image(systemName: "checkmark")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(LingTaiTones.action)
                        .accessibilityHidden(true)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 13)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        // VoiceOver says "selected" for the chosen row instead of reading the tick's symbol name
        .accessibilityAddTraits(selected ? [.isSelected] : [])
    }
}

/// The picker's search field: a magnifier, the text, a clear button while there is text.
private struct LingTaiSearchField: View {
    @Binding var text: String
    let placeholder: String

    var body: some View {
        LingTaiCard {
            HStack(spacing: 10) {
                Image(systemName: "magnifyingglass")
                    .font(.system(size: 15))
                    .foregroundStyle(.secondary)
                TextField(placeholder, text: $text)
                    .font(.body)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                if !text.isEmpty {
                    Button { text = "" } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 16))
                            .foregroundStyle(.tertiary)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(Text(AppLocalized("Clear")))
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 11)
        }
    }
}

/// One provider's rows for a slot as the picker hands them over: the chosen one ticked, the
/// recommended one marked, and a *Show n more* row when `hidden` rows wait behind it.
private struct LingTaiModelList: View {
    let provider: LingTaiSlotProvider
    let slot: LingTaiSlot
    let current: LingTaiSlotChoice?
    let models: [String]
    let hidden: Int
    let onPick: (String) -> Void
    let onMore: () -> Void

    /// Whether `model` is the slot's current choice in this group (Cloud's one row is "").
    private func isChosen(_ model: String) -> Bool {
        current?.providerId == provider.id && (current?.model == model || (model.isEmpty && current?.model.isEmpty == true))
    }

    var body: some View {
        LingTaiCard {
            ForEach(Array(models.enumerated()), id: \.offset) { index, model in
                if index > 0 { LingTaiRowDivider() }
                Button { onPick(model) } label: {
                    HStack(spacing: 12) {
                        Text(model.isEmpty ? provider.label : model)
                            .font(.body)
                            .foregroundStyle(.primary)
                            .lineLimit(1)
                            .truncationMode(.middle)
                        Spacer(minLength: 8)
                        if provider.isCloud, model == provider.defaults[slot.defaultsKey] ?? "" {
                            Text(AppLocalized("Recommended"))
                                .font(.footnote)
                                .foregroundStyle(.secondary)
                        }
                        if isChosen(model) {
                            Image(systemName: "checkmark")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundStyle(LingTaiTones.action)
                                .accessibilityHidden(true)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 13)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityAddTraits(isChosen(model) ? [.isSelected] : [])
            }
            if hidden > 0 {
                if !models.isEmpty { LingTaiRowDivider() }
                LingTaiActionRow(title: String(format: AppLocalized("Show %lld more"), hidden), titleColor: LingTaiTones.action, chevron: false, action: onMore)
            }
        }
    }
}

// MARK: - "Use it for"

/// After a key was saved: which slots it takes over. Every slot the provider covers is
/// ticked; "Use it" switches the ticked ones to the provider's default model for each,
/// "Not now" changes nothing. Pictures and clips go through Model Studio's endpoints, so
/// only a key on a DashScope host offers those two; the screen is never offered on iPhone.
struct LingTaiUseItForView: View {
    let instance: ProviderInstance
    var onDone: () -> Void

    @State private var provider: LingTaiSlotProvider?
    @State private var on: Set<LingTaiSlot> = []

    /// True when the provider can hold at least one slot, so the card has something to ask.
    @MainActor
    static func worthAsking(_ inst: ProviderInstance) -> Bool {
        guard let p = LingTaiModelSlots.ownProvider(inst) else { return false }
        return offered.contains { p.has($0) }
    }

    private static let offered: [LingTaiSlot] = [.chat, .image, .video]

    private var slots: [LingTaiSlot] {
        guard let provider else { return [] }
        return Self.offered.filter { provider.has($0) }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(LingTaiCloud.modelsOn
                     ? AppLocalized("Pick what this key should handle. lingTai Cloud keeps the rest.")
                     : AppLocalized("Pick what this key should handle."))
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .padding(.horizontal, 32)
                    .padding(.top, 8)
                LingTaiCard {
                    ForEach(Array(slots.enumerated()), id: \.element) { index, slot in
                        if index > 0 { LingTaiRowDivider() }
                        LingTaiToggleRow(title: slot.title, subtitle: provider?.defaultModel(for: slot), isOn: binding(slot))
                    }
                }
                VStack(spacing: 10) {
                    Button(action: useIt) {
                        Text(AppLocalized("Use it"))
                            .font(.body.weight(.semibold))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(LingTaiTones.action)
                    .disabled(on.isEmpty)
                    Button(action: onDone) {
                        Text(AppLocalized("Not now"))
                            .font(.body)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(.secondary)
                }
                .padding(.horizontal, 16)
                Text(AppLocalized("You can change this any time under Settings › Models."))
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .padding(.horizontal, 32)
            }
            .padding(.bottom, 24)
        }
        .background(LingTaiTones.canvas.ignoresSafeArea())
        .navigationTitle(AppLocalized("Use it for"))
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(true)
        .onAppear {
            provider = LingTaiModelSlots.ownProvider(instance)
            on = Set(slots)
        }
    }

    private func binding(_ slot: LingTaiSlot) -> Binding<Bool> {
        Binding(
            get: { on.contains(slot) },
            set: { if $0 { on.insert(slot) } else { on.remove(slot) } }
        )
    }

    private func useIt() {
        guard let provider else { onDone(); return }
        for slot in slots where on.contains(slot) {
            guard let model = provider.defaultModel(for: slot) else { continue }
            LingTaiModelSlots.use(slot, providerId: provider.id, model: model)
        }
        onDone()
    }
}
