/**
 * Robinhood Chain live stream — subscribe to the KOL tape and the full DEX
 * firehose over WebSocket. Requires a PRO/ULTRA key.
 *
 * Run: MADEONSOL_API_KEY=msk_... npx tsx examples/stream.ts
 */
import { createClient } from "robinhood-chain-x402";

const client = createClient(process.env.MADEONSOL_API_KEY!);

const stream = client.stream();
stream.on("rhc:kol_trade", (t) => console.log("KOL trade", t));
stream.on("rhc:trade", (t) => console.log("DEX trade", t));
stream.on("open", () => console.log("connected to chain 4663 stream"));
stream.subscribe(["rhc:kol_trades", "rhc:trades"]);
