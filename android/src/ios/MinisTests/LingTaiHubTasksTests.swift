import XCTest
@testable import Minis

/// The bookkeeping behind `stop {call | conversation}` on the iPhone (docs/hub.md): the run a
/// `stop` ends is the one the task frame opened, or the sender's run in the named conversation,
/// and never another device's. The Android twin is HubTasksTest.
@MainActor
final class LingTaiHubTasksTests: XCTestCase {

    override func setUp() {
        super.setUp()
        LingTaiHubTasks.running = [:]
    }

    override func tearDown() {
        LingTaiHubTasks.running = [:]
        super.tearDown()
    }

    func testPromptCarriesTheAskingDevicesLanguage() {
        // A device's Muse gets the context and, with `language`, the language to answer in.
        let fromPhone = LingTaiHubTasks.prompt(text: "weather tomorrow", senderName: "Pixel", senderKind: "phone", language: "zh-Hans")
        XCTAssertTrue(fromPhone.contains("Pixel"))
        XCTAssertTrue(fromPhone.contains("tagged zh-Hans"))
        XCTAssertTrue(fromPhone.hasSuffix("\n\nweather tomorrow"))
        // Without the tag the model goes by the text; nothing is said about a language tag.
        let untagged = LingTaiHubTasks.prompt(text: "weather tomorrow", senderName: "Pixel", senderKind: "computer", language: nil)
        XCTAssertFalse(untagged.contains("tagged"))
        XCTAssertEqual(LingTaiHubTasks.prompt(text: "weather tomorrow", senderName: "Pixel", senderKind: "computer", language: "  "), untagged, "blank counts as absent")
        // A web console speaks for the person: no context line, the tag still counts.
        let fromWeb = LingTaiHubTasks.prompt(text: "weather tomorrow", senderName: "web", senderKind: "web", language: "fr")
        XCTAssertEqual(fromWeb, "Answer in the language tagged fr; the device that asked shows its screens in it.\n\nweather tomorrow")
        XCTAssertEqual(LingTaiHubTasks.prompt(text: "weather tomorrow", senderName: "web", senderKind: "web", language: nil), "weather tomorrow")
        // An overlong tag is cut, so a stray value cannot pad the prompt.
        XCTAssertTrue(LingTaiHubTasks.prompt(text: "x", senderName: "web", senderKind: "web", language: String(repeating: "a", count: 80)).contains("tagged " + String(repeating: "a", count: 20) + ";"))
    }

    func testConversationKeyIsTheNamedOneOrOnePerDevice() {
        XCTAssertEqual(LingTaiHubTasks.conversationKey(senderId: "mac", conversation: nil), "from-mac")
        XCTAssertEqual(LingTaiHubTasks.conversationKey(senderId: "mac", conversation: "  "), "from-mac")
        XCTAssertEqual(LingTaiHubTasks.conversationKey(senderId: "", conversation: nil), "from-unknown")
        XCTAssertEqual(LingTaiHubTasks.conversationKey(senderId: "mac", conversation: "t-1"), "t-1")
    }

    func testStopByCallFindsTheRunTheFrameOpened() {
        LingTaiHubTasks.running["c1"] = .init(senderId: "mac", conversation: "from-mac")
        XCTAssertEqual(LingTaiHubTasks.find(senderId: "mac", callId: "c1", conversation: nil), "c1")
        XCTAssertNil(LingTaiHubTasks.find(senderId: "mac", callId: "c9", conversation: "elsewhere"))
    }

    func testStopByConversationDefaultsToTheSendersOwn() {
        LingTaiHubTasks.running["c1"] = .init(senderId: "mac", conversation: "from-mac")
        LingTaiHubTasks.running["c2"] = .init(senderId: "mac", conversation: "t-1")
        XCTAssertEqual(LingTaiHubTasks.find(senderId: "mac", callId: nil, conversation: nil), "c1")
        XCTAssertEqual(LingTaiHubTasks.find(senderId: "mac", callId: "", conversation: "t-1"), "c2")
        XCTAssertNil(LingTaiHubTasks.find(senderId: "mac", callId: nil, conversation: "t-2"))
    }

    func testAnotherDeviceCannotStopIt() {
        LingTaiHubTasks.running["c1"] = .init(senderId: "mac", conversation: "t-1")
        XCTAssertNil(LingTaiHubTasks.find(senderId: "pc", callId: "c1", conversation: nil))
        XCTAssertNil(LingTaiHubTasks.find(senderId: "pc", callId: nil, conversation: "t-1"))
        XCTAssertFalse(LingTaiHubTasks.stop(args: ["call": "c1"], from: ["id": "pc"]))
        XCTAssertEqual(LingTaiHubTasks.running["c1"]?.stopped, false)
    }

    func testStopMarksTheRunSoTheTaskAnswersCancelled() {
        LingTaiHubTasks.running["c1"] = .init(senderId: "mac", conversation: "from-mac")
        XCTAssertTrue(LingTaiHubTasks.stop(args: [:], from: ["id": "mac"]))
        XCTAssertEqual(LingTaiHubTasks.running["c1"]?.stopped, true)
        XCTAssertFalse(LingTaiHubTasks.stop(args: ["conversation": "none"], from: ["id": "mac"]))
    }
}
