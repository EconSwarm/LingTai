import XCTest
@testable import Minis

/// Round 7, the phones' side of docs/parity.md: every relay refusal code reads as one plain
/// sentence (#35), the ways on read the relay's guidance first and the bundled catalogue only
/// when it sent none (#33), and the refused turn's stored line survives a round trip. The
/// Android twins are RelayRefusalTest and GuidanceTest.
@MainActor
final class LingTaiRound7Tests: XCTestCase {

    private func body(_ code: String, _ extra: String = "") -> String {
        #"{"error":{"message":"relay said \#(code)","type":"lingtai_cloud","code":"\#(code)"\#(extra)}}"#
    }

    func testEveryRelayCodeHasAKindAndASentence() {
        let table: [(Int, String, LingTaiRelayRefusal.Kind)] = [
            (413, "too_large", .tooLarge),
            (400, "content_rejected", .contentRejected),
            (403, "not_invited", .disabled),
            (429, "too_many_in_flight", .busy),
            (429, "provider_busy", .busy),
            (403, "signup_closed", .disabled),
            (503, "service_paused", .servicePaused),
            (503, "sync_paused", .syncPaused),
            (503, "hub_paused", .hubPaused),
            (429, "allowance_exhausted", .exhausted),
            (429, "daily_cap", .dailyCap),
            (401, "account_deleted", .signedOut),
            (401, "bad_key", .signedOut),
            (404, "model_not_offered", .model),
            (502, "upstream", .relayDown),
        ]
        for (status, code, kind) in table {
            let refusal = LingTaiRelayRefusal.parse(status: status, body: body(code))
            XCTAssertEqual(refusal?.kind, kind, code)
            XCTAssertEqual(refusal?.code, code)
            // the sentence is ours, not the relay's raw message and not a bare status
            let sentence = LingTaiCloud.describe(refusal!.cloudError)
            XCTAssertFalse(sentence.isEmpty, code)
            XCTAssertNotEqual(sentence, "relay said \(code)", code)
            XCTAssertFalse(sentence.hasPrefix("HTTP "), code)
            XCTAssertFalse(sentence.contains("!"), code)
        }
        for code in LingTaiRelayRefusal.relayCodes {
            XCTAssertNotNil(LingTaiRelayRefusal.parse(status: 400, body: body(code)), code)
        }
    }

    func testPausedAllowanceIsItsOwnKindAndLead() {
        let refusal = LingTaiRelayRefusal.parse(status: 429, body: body("allowance_exhausted", #","paused":true"#))
        XCTAssertEqual(refusal?.kind, .allowancePaused)
        XCTAssertEqual(refusal?.paused, true)
        XCTAssertEqual(refusal?.isAllowance, true)
        let sentence = LingTaiCloud.describe(refusal!.cloudError)
        XCTAssertTrue(sentence.lowercased().contains("paused"))
        XCTAssertFalse(sentence.lowercased().hasPrefix("the free allowance is used up"))
        let busy = LingTaiRelayRefusal.parse(status: 429, body: body("provider_busy", #","retry_after":90"#))
        XCTAssertEqual(busy?.retryAfterS, 90)
        XCTAssertTrue(LingTaiCloud.describe(busy!.cloudError).contains(LingTaiProviderReach.duration(90)))
    }

    func testOnlyTheRelaysRepliesAreRefusals() {
        // a proxy's plain 413 and a bare 502 count only from the relay's host
        XCTAssertEqual(LingTaiRelayRefusal.parse(status: 413, body: "Request too large", fromRelay: true)?.kind, .tooLarge)
        XCTAssertNil(LingTaiRelayRefusal.parse(status: 413, body: "Request too large", fromRelay: false))
        XCTAssertEqual(LingTaiRelayRefusal.parse(status: 502, body: "<html>bad gateway</html>", fromRelay: true)?.kind, .relayDown)
        // another provider's 429 keeps upstream's card
        XCTAssertNil(LingTaiRelayRefusal.parse(status: 429, body: #"{"error":{"message":"Rate limit","type":"rate_limit_error"}}"#))
    }

    func testAContentCheckSayingNoIsOneKindAndNothingSplitsIt() {
        // the relay's 400: `content_rejected`, the provider's line under `upstream`
        let relayBody = #"{"error":{"message":"The model provider's content check declined this request; try different words","type":"upstream","code":"content_rejected","upstream":"<400> InternalError.Algo.DataInspectionFailed: Input data may contain inappropriate content."}}"#
        let fromRelay = LingTaiRelayRefusal.parse(status: 400, body: relayBody, fromRelay: true)
        XCTAssertEqual(fromRelay?.kind, .contentRejected)
        XCTAssertEqual(fromRelay?.code, "content_rejected")
        XCTAssertEqual(fromRelay?.isAllowance, false)
        // the same inside a stream: the relay answers 200 and puts the error in a data: line, so the
        // client maps it with status 0; the code alone says what it is
        XCTAssertEqual(LingTaiRelayRefusal.parse(status: 0, body: relayBody)?.kind, .contentRejected)
        // Bailian's own 400 on a key of one's own: not the relay's shape, the same kind and code
        let bailian = #"{"error":{"message":"<400> InternalError.Algo.DataInspectionFailed: Input data may contain inappropriate content.","type":"invalid_request_error","code":"data_inspection_failed"}}"#
        let own = LingTaiRelayRefusal.parse(status: 400, body: bailian)
        XCTAssertEqual(own?.kind, .contentRejected)
        XCTAssertEqual(own?.code, "content_rejected")
        XCTAssertEqual(own.flatMap { LingTaiRelayRefusal.fromCanonical(LingTaiRelayRefusal.canonical($0)) }, own)
        // another provider's 400 is still not ours
        XCTAssertNil(LingTaiRelayRefusal.parse(status: 400, body: #"{"error":{"message":"Invalid value for 'temperature'","type":"invalid_request_error","code":"invalid_value"}}"#, fromRelay: true))
        // the sentence is ours and says what to do
        let sentence = LingTaiCloud.describe(own!.cloudError)
        XCTAssertTrue(sentence.lowercased().contains("content check"))
        XCTAssertFalse(sentence.contains("!"))
        // the compaction's split-retry leaves a content check alone: the words are the matter, not the size
        XCTAssertFalse(AIChatViewModel.isSegmentRetryableError(LLMError.providerError(message: "[400] The model provider's content check declined this request; try different words")))
        XCTAssertFalse(AIChatViewModel.isSegmentRetryableError(LLMError.providerError(message: "[0] The model provider's content check declined this request; try different words")))
        XCTAssertFalse(AIChatViewModel.isSegmentRetryableError(LLMError.providerError(message: "[400] <400> InternalError.Algo.DataInspectionFailed: Input data may contain inappropriate content.")))
        // an over-length refusal still splits, as upstream expects
        XCTAssertTrue(AIChatViewModel.isSegmentRetryableError(LLMError.providerError(message: "[400] Your input exceeds the context window of this model")))
    }

    func testCanonicalLineRoundTrips() {
        let refusal = LingTaiRelayRefusal.parse(status: 429, body: body("provider_busy", #","retry_after":12"#))!
        let line = LingTaiRelayRefusal.canonical(refusal)
        XCTAssertTrue(line.hasPrefix("lt_relay:busy:429:provider_busy:12:0|"))
        XCTAssertEqual(LingTaiRelayRefusal.fromCanonical(line), refusal)
        XCTAssertEqual(LingTaiProviderReach.classify(line)?.kind, .relay)
        XCTAssertNil(LingTaiRelayRefusal.fromCanonical("Rate limited"))
    }

    func testGuidanceComesFirstAndTheCatalogueOnlyWithoutIt() throws {
        let guidance = try XCTUnwrap(LingTaiGuidance.parse(json: """
        {"region":"global","docs":"https://example.invalid/own-key",
         "providers":[{"id":"zeta","name":"Zeta","protocol":"openai","base_url":"https://api.zeta.invalid/v1","key_url":"https://zeta.invalid/keys","auth":["key"],"regions":["global"],"covers":["chat","vision"]},
                      {"id":"openai","name":"OpenAI","protocol":"openai","base_url":"https://api.openai.com/v1","key_url":"https://platform.openai.com/api-keys","auth":["key","oauth-chatgpt"],"regions":["global"],"covers":["chat","vision","image"]}],
         "plans":[{"id":"chatgpt","provider":"openai","name":"ChatGPT","auth":"oauth-chatgpt","clients":["ios","desktop"],"covers":["chat","vision"]},
                  {"id":"desktop-only","provider":"openai","name":"Elsewhere","auth":"oauth-x","clients":["desktop"]},
                  {"id":"orphan","provider":"nobody","name":"Orphan","auth":"oauth-y"}],
         "local":[{"id":"ollama","name":"Ollama","protocol":"openai","base_url":"http://localhost:11434/v1","auth":["none"],"regions":["global"]}],
         "caveats":{"chatgpt":"Honest line.","chatgpt_zh":"诚实的一句。"}}
        """))
        let catalogue = LingTaiCatalogue.bundled
        let ways = LingTaiWays.resolve(guidance: guidance, catalogue: catalogue, mainland: false)
        XCTAssertTrue(ways.fromRelay)
        XCTAssertEqual(ways.vendors.map(\.id), ["zeta", "openai"], "the relay's order, not the catalogue's")
        XCTAssertEqual(ways.signIns.map(\.name), ["ChatGPT"], "plans for this client only; an orphan is left out")
        XCTAssertEqual(ways.signIns.first?.covers, ["chat", "vision"])
        XCTAssertEqual(ways.locals.map(\.id), ["ollama"])
        XCTAssertEqual(ways.docs, "https://example.invalid/own-key")
        XCTAssertEqual(ways.chatgptCaveat, "Honest line.")
        XCTAssertEqual(LingTaiWays.resolve(guidance: guidance, catalogue: catalogue, mainland: false, chinese: true).chatgptCaveat, "诚实的一句。")

        let fallback = LingTaiWays.resolve(guidance: nil, catalogue: catalogue, mainland: true)
        XCTAssertFalse(fallback.fromRelay)
        if !catalogue.isEmpty {
            XCTAssertEqual(fallback.vendors.first?.id, LingTaiCatalogue.bailian, "mainland China hears about Bailian first")
            XCTAssertEqual(LingTaiWays.resolve(guidance: nil, catalogue: catalogue, mainland: false).vendors.first?.id, LingTaiCatalogue.openrouter)
        }
        XCTAssertNil(LingTaiGuidance.parse(json: #"{"region":"global","providers":[]}"#), "no providers is no guidance")
    }
}
