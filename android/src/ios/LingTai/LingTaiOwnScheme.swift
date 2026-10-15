import Foundation

/// The app's own links have two names. Inside, they are `minis://…`: the system prompt, the
/// sandbox, Markdown in a reply and every view speak that vocabulary, which is upstream's and must
/// not change. Towards the system (Info.plist, the share extension) the app is `lingtai://`, so a
/// phone that also has OpenMinis installed never has two apps claiming one scheme. A `lingtai://`
/// link arriving from the system is read as its `minis://` form, nothing else changes.
enum LingTaiOwnScheme {
    /// What Info.plist registers; what the share extension opens.
    static let system = "lingtai"
    /// The MCP OAuth callback scheme Info.plist registers (the default redirect is a loopback URL).
    static let systemMCP = "lingtai-mcp"
    /// Upstream's in-app vocabulary; never registered with the system.
    static let internalScheme = "minis"

    /// Both names are ours; `lingtai-mcp` is a different callback and not a link of the app's.
    static func isOwn(_ scheme: String?) -> Bool {
        guard let s = scheme?.lowercased() else { return false }
        return s == internalScheme || s == system
    }

    /// `lingtai://x` reads as `minis://x`; any other URL is returned as it came.
    static func internalURL(_ url: URL) -> URL {
        let text = url.absoluteString
        guard let range = text.range(of: system + "://", options: [.anchored, .caseInsensitive]) else { return url }
        return URL(string: internalScheme + "://" + text[range.upperBound...]) ?? url
    }

    /// Opens one of the app's own links without going through the system: the deep-link router
    /// handles it as if it had arrived from outside. For a button that sits outside the chat's
    /// `openURL` override (the chat's own views use `\.openMinisURL`).
    static func open(_ link: String) {
        guard let url = URL(string: link) else { return }
        Task { @MainActor in
            DeepLinkRouter.handle(url: url, shareCoordinator: ShareCoordinator.shared)
        }
    }
}
