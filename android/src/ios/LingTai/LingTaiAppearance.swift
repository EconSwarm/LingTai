//
//  LingTaiAppearance.swift
//  lingTai
//
//  The Appearance settings: how big the face is in the header (or hidden),
//  whether the model shows under the name, whether the agent's steps show
//  in the chat, the theme, and the two shell switches. Android:
//  ui/settings/AppearanceScreen.kt + AvatarSize.
//

import SwiftUI

// MARK: - Avatar size

/// The face's diameter in the big header. Android: AvatarSize.
enum LingTaiAvatarSize: String, CaseIterable, Identifiable {
    case small, medium, large, extraLarge, hidden

    var id: String { rawValue }

    /// The disc's diameter in points; nil hides the face and keeps the name pill.
    var points: CGFloat? {
        switch self {
        case .small: return 44
        case .medium: return 56
        case .large: return 66
        case .extraLarge: return 76
        case .hidden: return nil
        }
    }

    var label: String {
        switch self {
        case .small: return AppLocalized("Small")
        case .medium: return AppLocalized("Medium")
        case .large: return AppLocalized("Large")
        case .extraLarge: return AppLocalized("Extra large")
        case .hidden: return AppLocalized("Hidden")
        }
    }

    /// The stored value, or the default (extra large) when nothing or junk is stored.
    static func stored(_ raw: String?) -> LingTaiAvatarSize {
        guard let raw, let size = LingTaiAvatarSize(rawValue: raw) else { return .extraLarge }
        return size
    }
}

// MARK: - Store

/// The appearance choices, in UserDefaults, published so the header follows them live.
@MainActor
final class LingTaiAppearance: ObservableObject {
    static let shared = LingTaiAppearance()

    static let avatarSizeKey = "lingtai.appearance.avatar_size"
    static let headerModelKey = "lingtai.appearance.header_model"

    /// The face's size in the big header. Default: extra large (76 pt).
    @Published var avatarSize: LingTaiAvatarSize {
        didSet { UserDefaults.standard.set(avatarSize.rawValue, forKey: Self.avatarSizeKey) }
    }

    /// Show the model answering under the name when the agent is idle. Default off.
    @Published var headerModel: Bool {
        didSet { UserDefaults.standard.set(headerModel, forKey: Self.headerModelKey) }
    }

    private init() {
        let defaults = UserDefaults.standard
        avatarSize = LingTaiAvatarSize.stored(defaults.string(forKey: Self.avatarSizeKey))
        headerModel = defaults.bool(forKey: Self.headerModelKey)
    }
}

// MARK: - Screen

/// Settings → Appearance, as Muse cards.
struct LingTaiAppearanceView: View {
    @ObservedObject private var appearance = LingTaiAppearance.shared
    @AppStorage(LingTaiSteps.key) private var showSteps = LingTaiSteps.defaultValue
    @AppStorage("appearanceMode") private var appearanceMode = 0
    @AppStorage("lingtai.shell.enabled") private var shellEnabled = true
    @AppStorage("lingtai.header.enabled") private var museHeader = true
    @State private var confirmWelcome = false

    var body: some View {
        LingTaiPage(title: AppLocalized("Appearance")) {
            // The header: how much of the face, and what sits under the name.
            VStack(alignment: .leading, spacing: 0) {
                LingTaiCard {
                    // A menu, not five segments: "Extra large" / "Очень большой" / "Ausgeblendet" did not fit a 375 pt phone.
                    HStack(spacing: 14) {
                        LingTaiFaceView(mood: .idle, size: appearance.avatarSize.points ?? 44)
                            .opacity(appearance.avatarSize == .hidden ? 0.25 : 1)
                            .frame(width: 76, height: 76)
                        Text(AppLocalized("Avatar size")).font(.body)
                        Spacer(minLength: 8)
                        Picker(AppLocalized("Avatar size"), selection: $appearance.avatarSize) {
                            ForEach(LingTaiAvatarSize.allCases) { size in
                                Text(size.label).tag(size)
                            }
                        }
                        .pickerStyle(.menu)
                        .labelsHidden()
                        .tint(LingTaiTones.action)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    LingTaiRowDivider()
                    LingTaiToggleRow(title: AppLocalized("Show the model under the name"), isOn: $appearance.headerModel)
                }
                LingTaiCaption(text: AppLocalized("How big the face is on the home header. Hidden keeps the name only.") + " " + AppLocalized("Muse shows only the name. Turn this on to see the model group and provider · model under it; tap them to switch. Off, the model is under ••• → Model and in Settings."))
            }

            // The chat.
            VStack(alignment: .leading, spacing: 0) {
                LingTaiCard {
                    LingTaiToggleRow(title: AppLocalized("Show the agent's steps"), isOn: $showSteps)
                }
                LingTaiCaption(text: AppLocalized("Every tool it used stays as a capsule in the chat. Off, a finished message keeps to the conversation; the steps of a message still running show either way. This device only."))
            }

            // The theme.
            LingTaiCard {
                Text(AppLocalized("Theme"))
                    .font(.body)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 16)
                    .padding(.top, 14)
                Picker(AppLocalized("Theme"), selection: $appearanceMode) {
                    Text(AppLocalized("System")).tag(0)
                    Text(AppLocalized("Light")).tag(1)
                    Text(AppLocalized("Dark")).tag(2)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
            }

            // The shell.
            VStack(alignment: .leading, spacing: 0) {
                LingTaiCard {
                    LingTaiToggleRow(title: AppLocalized("Muse home"), isOn: $shellEnabled)
                    LingTaiRowDivider()
                    LingTaiToggleRow(title: AppLocalized("Face and name in the chat header"), isOn: $museHeader)
                    LingTaiRowDivider()
                    // Where the chat put its composer, for a report from a device without a Mac.
                    LingTaiLinkRow(title: AppLocalized("Composer check")) { LingTaiComposerCheckView() }
                }
                LingTaiCaption(text: AppLocalized("Muse home is the chat with the feed, ideas, goals and library as tabs. Off, the app opens on the classic OpenMinis chat list. The second switch puts the face and the name in the title of side chats; off, they show the model."))
            }

            // The welcome, once more.
            VStack(alignment: .leading, spacing: 0) {
                LingTaiCard {
                    LingTaiActionRow(title: AppLocalized("Show the welcome again"), chevron: false) {
                        confirmWelcome = true
                    }
                }
                LingTaiCaption(text: AppLocalized("Brings back the first-run pages and the first conversation on the next new chat. Nothing is deleted; the agent keeps its name."))
            }
        }
        .confirmationDialog(AppLocalized("Show the welcome again?"), isPresented: $confirmWelcome, titleVisibility: .visible) {
            Button(AppLocalized("Show it")) {
                LingTaiFirstRun.reset()
                LingTaiFirstConversation.shared.reset()
            }
            Button(AppLocalized("Cancel"), role: .cancel) {}
        }
    }
}
