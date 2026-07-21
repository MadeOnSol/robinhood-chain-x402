/**
 * Robinhood Chain token intelligence — pull a token's snapshot, its early-buyer
 * quality score, launch-bundle detection, and KOL consensus in one pass.
 *
 * Run: MADEONSOL_API_KEY=msk_... npx tsx examples/token-intel.ts 0xTOKEN
 */
import { createClient } from "robinhood-chain-x402";

const client = createClient(process.env.MADEONSOL_API_KEY!);
const token = process.argv[2] ?? "0x0000000000000000000000000000000000000000";

const [snapshot, quality, bundle, consensus] = await Promise.all([
  client.token(token),
  client.tokenBuyerQuality(token),
  client.tokenBundle(token),
  client.tokenKolConsensus(token),
]);

console.log(`${snapshot.symbol ?? token}  MC=$${snapshot.market_cap_usd ?? "?"}  launchpad=${snapshot.launchpad ?? "?"}`);
console.log(`buyer-quality: ${quality.quality.score}/100 (${quality.quality.signal})  dump_cluster=${quality.quality.breakdown.dump_cluster_count}`);
console.log(`bundle: ${bundle.bundle.bundle_kind}  held_pct_of_supply=${bundle.bundle.held_pct_of_supply ?? "?"}`);
console.log(`KOL consensus: ${consensus.consensus?.total_kol_buyers ?? 0} buyers, net_flow_eth=${consensus.consensus?.net_flow_eth ?? 0}`);
