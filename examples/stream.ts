/**
 * Robinhood Chain live stream — subscribe to the KOL tape and the full DEX
 * firehose over WebSocket. The KOL tape needs a PRO+ key; the DEX firehose
 * (`rhc:dex_trades`) is ULTRA+ — on a PRO key you'll get a `warning` event
 * for it and the KOL tape still flows.
 *
 * Run: MADEONSOL_API_KEY=msk_... npx tsx examples/stream.ts
 */
import { createClient } from "robinhood-chain-x402";

const client = createClient(process.env.MADEONSOL_API_KEY!);

const stream = client.stream();
stream.on("rhc:kol_trade", (t) => console.log("KOL trade", t));
stream.on("rhc:dex_trade", (t) => console.log("DEX trade", t)); // firehose is ULTRA+
stream.on("open", () => console.log("connected to chain 4663 stream"));
// New in 0.5.0: a refused channel (typo or tier gate) is surfaced here instead
// of leaving the stream silently quiet.
stream.on("warning", (w) => console.warn("stream warning:", w.code, w.rejected));
stream.subscribe(["rhc:kol_trades", "rhc:dex_trades"]);
