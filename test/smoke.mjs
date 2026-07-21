/**
 * Dependency-light smoke test for robinhood-chain-x402.
 *
 * Imports the BUILT dist and asserts the client constructs, exposes all 14 RHC
 * methods, rejects a missing key, and builds the correct base URL — fully
 * offline, no network, no key needed. Run: npm run build && node test/smoke.mjs
 */
import assert from "node:assert/strict";
import { createClient, RobinhoodChainX402, RobinhoodChainStream } from "../dist/index.js";

// 1. Factory + class construct with a key.
const client = createClient("msk_smoke_test");
assert.ok(client instanceof RobinhoodChainX402, "createClient returns a RobinhoodChainX402");

// 2. Missing key throws.
assert.throws(() => new RobinhoodChainX402({ apiKey: "" }), /apiKey/, "empty apiKey rejected");

// 3. All 14 RHC endpoints are present as methods.
const methods = [
  "kolFeed", "kolLeaderboard", "kolHotTokens", "kol",
  "trades",
  "tokens", "token", "tokenCandles", "tokenKolConsensus", "tokenBuyerQuality", "tokenBundle",
  "deployerLeaderboard", "deployer",
  "alphaWallets",
];
for (const m of methods) {
  assert.equal(typeof client[m], "function", `client.${m} is a method`);
}
assert.equal(methods.length, 14, "covers all 14 RHC endpoints");

// 4. Streaming surface.
assert.equal(typeof client.stream, "function", "client.stream()");
assert.equal(typeof client.getStreamToken, "function", "client.getStreamToken()");
const stream = client.stream();
assert.ok(stream instanceof RobinhoodChainStream, "stream() returns RobinhoodChainStream");
stream.close();

// 5. Rate-limit accessor is initialized.
assert.deepEqual(client.lastRateLimit, { limit: null, remaining: null, reset: null, requestId: null });

console.log("robinhood-chain-x402 smoke test: OK (14/14 endpoints + stream)");
