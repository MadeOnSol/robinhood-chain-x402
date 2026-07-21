/**
 * Robinhood Chain KOL feed — the live tape of tracked-KOL buys/sells on chain
 * 4663, attributed via tx.from from our self-hosted node.
 *
 * Run: MADEONSOL_API_KEY=msk_... npx tsx examples/kol-feed.ts
 */
import { createClient } from "robinhood-chain-x402";

const client = createClient(process.env.MADEONSOL_API_KEY!); // free key at madeonsol.com/pricing

const { trades, count, data_age_seconds } = await client.kolFeed({ limit: 10, action: "buy" });
console.log(`chain=robinhood  ${count} KOL buys  (data ${data_age_seconds}s old)`);
for (const t of trades) {
  console.log(
    `${t.kol_name ?? t.evm_address}  ${t.action}  ${t.token_symbol ?? t.token_address}` +
    `  ${t.eth_amount ?? "?"} ETH  ${t.mc_multiple_since_trade ?? "?"}x since  tx=${t.tx_hash}`,
  );
}
