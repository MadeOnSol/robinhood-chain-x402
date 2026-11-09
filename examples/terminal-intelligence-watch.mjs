/**
 * Robinhood Chain terminal: one intelligent REST first paint, then WS push updates.
 * Staged SDK integration example — requires the next SDK package release.
 * Node 22+ (or npm install ws for managed streams).
 *
 * To run with your own subscription:
 *   MADEONSOL_API_KEY=msk_... RHC_TOKEN_ADDRESS=... node examples/terminal-intelligence-watch.mjs
 */
import { RobinhoodChainX402 } from "robinhood-chain-x402";

const key = process.env.MADEONSOL_API_KEY;
if (!key) throw new Error("Set MADEONSOL_API_KEY to a PRO+ account API key");
const token = process.env.RHC_TOKEN_ADDRESS ?? "0xc0ffee00000000000000000000000000000decaf";
const client = new RobinhoodChainX402({ apiKey: key });
const stream = client.stream(); // Reuse ONE socket for all your terminal panels.

const watcher = client.watchTokenIntelligence(token, {
  stream,
  subId: "terminal_panel_one", // Different string for every panel on this socket.
  tier: "PRO", // Your actual plan; server entitlements remain authoritative.
  include: ["snapshot", "risk", "flow"],
  // ULTRA clients MAY opt in to includeRhcFirehose:true. It is a global stream,
  // not token-filtered at the server: leave it off for most dashboards.
  onChange(view) {
    const statuses = Object.fromEntries(Object.entries(view.snapshot?.modules ?? {})
      .map(([name, module]) => [name, { status: module?.status, as_of: module?.as_of }]));
    console.log("status", { phase: view.phase, stale: view.stale,
      no_push: view.no_push, incomplete: view.incomplete, modules: statuses });
    // view.incomplete = true: don't imply missed historical fills were recovered.
    // view.snapshot?.modules.holder_count on Solana is the LAST complete census,
    // not a tick-by-tick count; 'unavailable' is not zero holders.
  },
  onLive(frame, module) {
    if (module === "snapshot") {
      // Live price overlay; does NOT rewrite the REST source's as_of/provenance.
      console.log("live price update", frame.event, frame.data);
    }
  },
});

// In a browser: dispose when the token panel unmounts; keep the shared socket
// until the last panel closes. The view's own dispose() does not close stream.
process.once("SIGINT", () => { watcher.dispose(); stream.close(); });
process.once("SIGTERM", () => { watcher.dispose(); stream.close(); });
