import XCTest
@testable import Minis

/// The app's two link names: `minis` inside, `lingtai` towards the system, so a phone with
/// OpenMinis installed too never has two apps on one scheme. The Android twin is OwnSchemeTest.
final class LingTaiOwnSchemeTests: XCTestCase {

    func testBothNamesAreOursAndNothingElseIs() {
        for s in ["minis", "MINIS", "lingtai", "LingTai"] { XCTAssertTrue(LingTaiOwnScheme.isOwn(s), s) }
        for s in ["", "http", "https", "minis-mcp", "lingtai-mcp", "file", "shortcuts"] {
            XCTAssertFalse(LingTaiOwnScheme.isOwn(s), s)
        }
        XCTAssertFalse(LingTaiOwnScheme.isOwn(nil))
    }

    func testTheSystemsNameReadsAsTheAppsOwn() {
        func read(_ s: String) -> String { LingTaiOwnScheme.internalURL(URL(string: s)!).absoluteString }
        XCTAssertEqual(read("lingtai://share"), "minis://share")
        XCTAssertEqual(read("LingTai://settings/soul"), "minis://settings/soul")
        XCTAssertEqual(read("lingtai://session/abc/index.html?title=x&y=1"), "minis://session/abc/index.html?title=x&y=1")
        XCTAssertEqual(read("minis://attachments/a.png"), "minis://attachments/a.png")
        XCTAssertEqual(read("https://lingtai.cn/"), "https://lingtai.cn/")
        // the host part is not a scheme
        XCTAssertEqual(read("https://lingtai.cn/lingtai://x"), "https://lingtai.cn/lingtai://x")
        // a host with no path still has a host
        XCTAssertEqual(LingTaiOwnScheme.internalURL(URL(string: "lingtai://share")!).host, "share")
    }

    func testThePlistRegistersTheSystemsNamesOnly() throws {
        // the test bundle sits inside the app bundle; its parent's Info.plist is the app's
        let schemes = try XCTUnwrap(Self.appURLSchemes(), "the app's Info.plist")
        XCTAssertTrue(schemes.contains(LingTaiOwnScheme.system), "\(schemes)")
        XCTAssertTrue(schemes.contains(LingTaiOwnScheme.systemMCP), "\(schemes)")
        XCTAssertFalse(schemes.contains(LingTaiOwnScheme.internalScheme), "upstream's scheme must not be registered: \(schemes)")
        XCTAssertFalse(schemes.contains("minis-mcp"), "\(schemes)")
    }

    /// Every `CFBundleURLSchemes` entry of the host app: from the running app's bundle, or from the
    /// source tree's Info.plist when the tests run without a host.
    private static func appURLSchemes() -> [String]? {
        var types = Bundle.main.object(forInfoDictionaryKey: "CFBundleURLTypes") as? [[String: Any]]
        if types == nil {
            let plist = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
                .appendingPathComponent("Info.plist")
            if let data = try? Data(contentsOf: plist),
               let dict = try? PropertyListSerialization.propertyList(from: data, format: nil) as? [String: Any] {
                types = dict["CFBundleURLTypes"] as? [[String: Any]]
            }
        }
        return types?.flatMap { ($0["CFBundleURLSchemes"] as? [String]) ?? [] }
    }
}
