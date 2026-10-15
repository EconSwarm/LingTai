//
//  LingTaiBackgroundSettings.swift
//  LingTai
//
//  Two settings pages Android has and the shell was missing:
//  "Background & notifications" (what the phone lets the agent do while the
//  app is away, with the way to the system switches) and "Hands" (what Hands
//  are, and why the switch is not on iPhone). Android: ui/settings/
//  BackgroundScreen.kt and HandsScreen.kt.
//

import SwiftUI
import UIKit
import UserNotifications

// MARK: - Background & notifications

struct LingTaiBackgroundView: View {
    @State private var notifications: UNAuthorizationStatus = .notDetermined
    @State private var refresh: UIBackgroundRefreshStatus = .available
    @Environment(\.openURL) private var openURL
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        LingTaiPage(title: AppLocalized("Background & notifications")) {
            notificationsCard
            // What the phone really posts (LingTaiScheduler, LingTaiHub.notify): a routine's
            // reminder, and a note another device sent; a routine never runs in the background.
            LingTaiCaption(text: AppLocalized("A notification is how the agent gets your attention: a routine came due and waits for you to open the app, or another of your devices sent a note through the hub."))
            backgroundCard
            LingTaiCaption(text: AppLocalized("iOS pauses apps that are not on screen. With Background App Refresh on, iOS can wake the app for a moment around a routine's due time to post the reminder; the routine itself still waits for you to open the app."))
            devicesCard
            LingTaiCaption(text: AppLocalized("Long tasks are better placed on a computer that stays on. Your computers run them in full and send the result here."))
        }
        .task { await read() }
        .ltOnChange(of: scenePhase) { phase in
            // Back from the system Settings: the switches may have moved.
            if phase == .active { Task { @MainActor in await read() } }
        }
    }

    // MARK: Notifications

    private var notificationsCard: some View {
        LingTaiCard {
            switch notifications {
            case .authorized, .provisional, .ephemeral:
                LingTaiRowLabel(title: AppLocalized("Notifications"), value: AppLocalized("Allowed"), chevron: false)
            case .notDetermined:
                LingTaiActionRow(title: AppLocalized("Notifications"), value: AppLocalized("Not asked yet")) {
                    requestNotifications()
                }
            case .denied:
                LingTaiActionRow(title: AppLocalized("Notifications"), value: AppLocalized("Off")) {
                    openSystemSettings()
                }
            @unknown default:
                LingTaiRowLabel(title: AppLocalized("Notifications"), value: "…", chevron: false)
            }
            if notifications == .denied {
                LingTaiRowDivider()
                LingTaiActionRow(title: AppLocalized("Open Settings"), titleColor: LingTaiTones.action, chevron: false) {
                    openSystemSettings()
                }
            }
        }
    }

    // MARK: Background refresh

    private var backgroundCard: some View {
        LingTaiCard {
            switch refresh {
            case .available:
                LingTaiRowLabel(title: AppLocalized("Background App Refresh"), value: AppLocalized("On"), chevron: false)
            case .denied:
                LingTaiActionRow(title: AppLocalized("Background App Refresh"), value: AppLocalized("Off")) {
                    openSystemSettings()
                }
            case .restricted:
                LingTaiRowLabel(title: AppLocalized("Background App Refresh"), value: AppLocalized("Restricted"), chevron: false)
            @unknown default:
                LingTaiRowLabel(title: AppLocalized("Background App Refresh"), value: "…", chevron: false)
            }
            if refresh == .denied {
                LingTaiRowDivider()
                LingTaiActionRow(title: AppLocalized("Open Settings"), titleColor: LingTaiTones.action, chevron: false) {
                    openSystemSettings()
                }
            }
        }
    }

    private var devicesCard: some View {
        LingTaiCard {
            LingTaiLinkRow(title: AppLocalized("Computers")) { LingTaiComputersView() }
        }
    }

    // MARK: State

    @MainActor
    private func read() async {
        refresh = UIApplication.shared.backgroundRefreshStatus
        notifications = await UNUserNotificationCenter.current().notificationSettings().authorizationStatus
    }

    private func requestNotifications() {
        Task { @MainActor in
            _ = try? await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge])
            await read()
        }
    }

    private func openSystemSettings() {
        guard let url = URL(string: UIApplication.openSettingsURLString) else { return }
        openURL(url)
    }
}

// MARK: - Hands

struct LingTaiHandsView: View {
    var body: some View {
        LingTaiPage(title: AppLocalized("Hands")) {
            LingTaiCard {
                paragraph(AppLocalized("Hands are the agent's way of operating a device itself: tapping through apps, filling forms, reading what is on screen. On Android and on your computers the agent can take the controls when you let it."))
            }
            LingTaiCard {
                LingTaiRowLabel(title: AppLocalized("On this iPhone"), value: AppLocalized("Not on iPhone"), chevron: false)
                LingTaiRowDivider()
                paragraph(AppLocalized("iOS does not let one app operate another, so there is no switch here: the agent can only act inside LingTai. It can open pages in the in-app browser, keep its files and run its routines; other apps on this phone are out of its reach by design."))
                LingTaiRowDivider()
                paragraph(AppLocalized("Your other devices can hand this iPhone a task while LingTai is open here: start a message there with @ and this iPhone's name."))
            }
            LingTaiCard {
                LingTaiLinkRow(title: AppLocalized("Hands on your computers")) { LingTaiComputersView() }
            }
            LingTaiCaption(text: AppLocalized("A computer with LingTai Desktop can operate its own apps, terminal and browser. Ask from here and the result comes back to this chat."))
        }
    }

    private func paragraph(_ text: String) -> some View {
        Text(text)
            .font(.subheadline)
            .foregroundStyle(.primary)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
    }
}
