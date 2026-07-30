# robinhood-chain-x402

[![npm version](https://img.shields.io/npm/v/robinhood-chain-x402?style=flat-square)](https://www.npmjs.com/package/robinhood-chain-x402)
[![npm downloads](https://img.shields.io/npm/dm/robinhood-chain-x402?style=flat-square)](https://www.npmjs.com/package/robinhood-chain-x402)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

> 📂 **[Examples](./examples/)** · 📚 **[API docs](https://madeonsol.com/api-docs)** · 🤖 **[Robinhood Chain](https://madeonsol.com/robinhood)** · 💰 **[Free API key](https://madeonsol.com/pricing)**

**TypeScript SDK for the [MadeOnSol](https://madeonsol.com/robinhood) Robinhood Chain API — EVM-native on-chain trading intelligence for Robinhood Chain, chain id 4663.**

Robinhood Chain is an Arbitrum Orbit L2. This SDK gives you the same intel you get on Solana — live KOL trades, a DEX trade tape, token discovery, launch-bundle detection, early-buyer quality, deployer reputation and smart-money wallets — but EVM-native: lowercase `0x` addresses, `eth_amount`, `tx_hash`, `block_number`, `net_flow_eth`. Data comes from our **self-hosted RHC node**. The KOL→EVM mapping is recovered by tracing each Solana KOL's bridge deposits (deBridge / Relay / Mayan / Wormhole) — a dataset unique to MadeOnSol.

RHC coverage is **bundled into every tier at no extra cost** — same API key, same base URL. Get a free key (200 req/day, no card) at [madeonsol.com/pricing](https://madeonsol.com/pricing).

> **Key-mode only.** This package authenticates with an `msk_` Bearer API key and calls the keyed Robinhood Chain v1 routes listed below. A keyless x402 pay-per-call rail for Robinhood Chain **does** exist — a deliberately narrow 6-endpoint subset with dual-accept payment (USDG on Robinhood Chain, or USDC on Solana), discoverable at [`/api/x402/rhc`](https://madeonsol.com/api/x402/rhc) and documented at [madeonsol.com/robinhood/x402](https://madeonsol.com/robinhood/x402) — but the EVM signing path is **not** bundled in this SDK yet; agents pay it directly from the self-describing 402 challenge. For keyless USDC-per-call on the Solana API, use [`madeonsol-x402`](https://www.npmjs.com/package/madeonsol-x402).

## Install

```bash
npm install robinhood-chain-x402
```

> Zero required runtime dependencies. The live stream will use the optional [`ws`](https://www.npmjs.com/package/ws) package on Node when present (recommended on Node ≥ 22 for a clean process exit); the browser uses the native `WebSocket`.

## Quick start (10 seconds)

```ts
import { createClient } from "robinhood-chain-x402";

const client = createClient("msk_your_api_key_here"); // free tier at madeonsol.com/pricing

// Live KOL buys/sells on Robinhood Chain (chain id 4663)
const { trades } = await client.kolFeed({ limit: 10, action: "buy" });
console.log(trades);
```

### Advanced initialization

```ts
import { RobinhoodChainX402 } from "robinhood-chain-x402";

const client = new RobinhoodChainX402({
  apiKey: "msk_...",
  baseUrl: "https://madeonsol.com", // optional override
});
```

## Endpoints — all 14 Robinhood Chain routes

Every method maps 1:1 to a GET /api/v1/rhc/… route. Fields are EVM-native.

### KOL intelligence

| Method | Route | Tier | Description |
|---|---|---|---|
| `kolFeed(params?)` | `/api/v1/rhc/kol/feed` | BASIC | Real-time KOL trade feed — every buy/sell from tracked KOLs' verified EVM wallets, enriched with MC/peak and `mc_multiple_since_trade` |
| `kolLeaderboard(params?)` | `/api/v1/rhc/kol/leaderboard` | BASIC | KOLs ranked by trade count then net ETH flow over `24h`/`7d`/`30d` |
| `kolHotTokens(params?)` | `/api/v1/rhc/kol/hot-tokens` | BASIC | Consensus tokens bought by 2+ distinct KOLs in the window |
| `kol(wallet)` | `/api/v1/rhc/kol/{wallet}` | BASIC | Single KOL profile — aggregate stats + 50 most recent trades |

### DEX trade tape

| Method | Route | Tier | Description |
|---|---|---|---|
| `trades(params?)` | `/api/v1/rhc/trades` | PRO+ | Every Uniswap v2/v3/v4 swap with the effective `trader_eoa`, gas/ordering for MEV, and KOL/deployer flags |

> **`trader_eoa` is the effective trading account**, not simply `tx.from`. On an ordinary transaction it *is* `tx.from`; when the trade was bundled through ERC-4337 it is the userOp sender (`UserOperationEvent`), never the bundler that relayed it. It is still an EOA either way — on Robinhood Chain a userOp sender is a normal EOA carrying an EIP-7702 delegation. Use `trader` only for the swap-log recipient (the router on aggregated swaps).

### Token discovery + intelligence

| Method | Route | Tier | Description |
|---|---|---|---|
| `tokens(params?)` | `/api/v1/rhc/tokens` | PRO+ | Live-priced token discovery — MC, liquidity, peak MC + drawdown, launchpad, deployer tier |
| `token(address)` | `/api/v1/rhc/tokens/{address}` | BASIC | Full token snapshot — price/MC/FDV, graduation, deployer block, KOL activity, pools |
| `tokenCandles(address, params?)` | `/api/v1/rhc/tokens/{address}/candles` | PRO+ | 1-minute OHLC candles — price + MC OHLC, close liquidity, volume with buy/sell split |
| `tokenKolConsensus(address)` | `/api/v1/rhc/tokens/{address}/kol-consensus` | PRO+ | KOL positioning — buyers vs sellers, exit rate, `net_flow_eth`, median entry MC (ULTRA adds wallet lists) |
| `tokenBuyerQuality(address)` | `/api/v1/rhc/tokens/{address}/buyer-quality` | BASIC | 0–100 early-buyer quality with bundle-buyer + dump-cluster legs |
| `tokenBundle(address)` | `/api/v1/rhc/tokens/{address}/bundle` | BASIC | Launch-bundle detection (`same_block`) + how much the cohort still holds |

### Deployer hunter + smart money

| Method | Route | Tier | Description |
|---|---|---|---|
| `deployerLeaderboard(params?)` | `/api/v1/rhc/deployer-hunter/leaderboard` | BASIC | 99k+ deployers ranked by reputation — `graduation_rate` ($40K+ peak MC), `runner_rate` ($100K+) |
| `deployer(address)` | `/api/v1/rhc/deployer-hunter/{address}` | BASIC | Single deployer profile + 50 most recent tokens (unknown wallets → `is_deployer: false`) |
| `alphaWallets(params?)` | `/api/v1/rhc/alpha-wallets` | PRO+ | Smart-money wallets ranked by realized performance — `net_eth`, `win_rate`, `memecoin_share`, `likely_bot` |

### Examples

> **Deployer tiers ride `runner_rate`, not `graduation_rate`.** Since migrations 267 + 269, `elite` = 5+ tokens, 24h+ of deployer history, `runner_rate >= 0.50` ($100K+ peak MC); `good` = same with `>= 0.25`. `graduation_rate` still means the $40K bar and is still returned on every row — it just no longer sets the tier (it proved farmable by operators rotating wallets). Only `spammer` still keys off it (20+ tokens, `graduation_rate < 0.05`).

```ts
// Deployer reputation leaderboard — elite deployers first
const { deployers } = await client.deployerLeaderboard({ sort: "runner_rate", tier: "elite" });

// Is this token's early cohort a launch bundle that's still holding?
const { bundle } = await client.tokenBundle("0xToken...");
console.log(bundle.bundle_kind, bundle.held_pct_of_supply);

// Smart-money memecoin traders only, biggest net ETH first
const { wallets } = await client.alphaWallets({ classification: "smart_money", min_memecoin_share: 0.7 });
```

## Streaming

Managed WebSocket stream over ws-streaming (`wss://madeonsol.com/ws/v1/stream`). Handles the token fetch + 24h refresh, auto-reconnect with backoff, and heartbeat liveness. Two RHC channels: `rhc:kol_trades` (the KOL tape) and `rhc:trades` (the full DEX firehose). PRO/ULTRA.

```ts
const stream = client.stream();

stream.on("rhc:kol_trade", (t) => console.log("KOL trade", t));
stream.on("rhc:trade", (t) => console.log("DEX trade", t));
stream.on("open", () => console.log("connected to chain 4663"));

stream.subscribe(["rhc:kol_trades", "rhc:trades"]);

// later
stream.close();
```

## Rate limits

Every successful response updates `client.lastRateLimit` from the `X-RateLimit-*` headers:

```ts
await client.kolFeed({ limit: 5 });
console.log(client.lastRateLimit); // { limit, remaining, reset, requestId }
```

## Links

- 🤖 Robinhood Chain overview — https://madeonsol.com/robinhood
- 💰 Pricing & free API key — https://madeonsol.com/pricing
- 📚 API docs — https://madeonsol.com/api-docs

## License

MIT © MadeOnSol
