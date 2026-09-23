# robinhood-chain-x402

[![npm version](https://img.shields.io/npm/v/robinhood-chain-x402?style=flat-square)](https://www.npmjs.com/package/robinhood-chain-x402)
[![npm downloads](https://img.shields.io/npm/dm/robinhood-chain-x402?style=flat-square)](https://www.npmjs.com/package/robinhood-chain-x402)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

> 📂 **[Examples](./examples/)** · 📚 **[API docs](https://madeonsol.com/api-docs)** · 🤖 **[Robinhood Chain](https://madeonsol.com/robinhood)** · 💰 **[Free API key](https://madeonsol.com/pricing)**

**TypeScript SDK for the [MadeOnSol](https://madeonsol.com/robinhood) Robinhood Chain API — EVM-native on-chain trading intelligence for Robinhood Chain, chain id 4663.**

Robinhood Chain is an Arbitrum Orbit L2. This SDK gives you the same intel you get on Solana — live KOL trades, a DEX trade tape, token discovery, launch-bundle detection, early-buyer quality, deployer reputation and smart-money wallets — but EVM-native: lowercase `0x` addresses, `eth_amount`, `tx_hash`, `block_number`, `net_flow_eth`. Data comes from our **self-hosted RHC node**. The KOL→EVM mapping is recovered by tracing each Solana KOL's bridge deposits (deBridge / Relay / Mayan / Wormhole) — a dataset unique to MadeOnSol.

RHC coverage is **bundled into every tier at no extra cost** — same API key, same base URL. Get a free key (200 req/day, no card) at [madeonsol.com/pricing](https://madeonsol.com/pricing).

> **Two auth modes.** **Key mode** — an `msk_` Bearer API key calls every Robinhood Chain v1 route below (54 methods, all tiers). **Keyless x402 mode** (since 0.7.0) — pass an EVM `privateKey` instead and the client pays per call in **USDG on Robinhood Chain** on the 10-endpoint x402 rail (from $0.04/call, no signup, wallet needs USDG but no ETH — our facilitator relays gas). It handles the 402 → sign EIP-3009 `transferWithAuthorization` → retry flow itself; the rail is discoverable at [`/api/x402/rhc`](https://madeonsol.com/api/x402/rhc) and documented at [madeonsol.com/robinhood/x402](https://madeonsol.com/robinhood/x402). For keyless USDC-per-call on the Solana API, use [`madeonsol-x402`](https://www.npmjs.com/package/madeonsol-x402).

> **New in 0.14.0 — named subscriptions: several independent subscriptions per socket.** `subscribe({ subId, channels, filters })`, `updateSubscription(subId, filters)`, `unsubscribe(subId)`, `getSubscriptions()` / `listSubscriptions()`. Each named subscription has its own channels and filters (the server caps the total per connection, default included: PRO 5, ULTRA 10, BUSINESS 20); frames carry `evt.sub_id`; an event matching several subscriptions is delivered once per subscription (dedupe per `(sub_id, id)`). Resume is per subscription with one commit for the connection. The plain `subscribe(channels, filters)` API is unchanged. See "Named subscriptions" in the stream section.
> **Also in 0.14.0 — `rhc:token_prices` and enriched RHC trade payloads (WS Phase 2).** A tenth RHC channel, `rhc:token_prices` (PRO+, address-scoped): subscribe with `filters.addresses` (25 / 100 / 250 per connection on PRO / ULTRA / BUSINESS, rejected above the cap) and receive one `snapshot: true` frame per address, then ticks derived from the RHC trade feed at most once per address per 250 ms, each typed `RhcTokenPriceTick` with `quality` fresh | stale | unreliable and a `quality_reason`; a stale or unreliable price is never delivered as fresh. `rhc:dex_trade` / `rhc:dex_trade_unattributed` frames now carry additive enrichment, typed `RhcDexTradeEvent` / `RhcDexTradeUnattributedEvent`: exact `amount_in_raw` / `amount_out_raw` decimal strings (never floats), `token` + `quote` identity with decimals, `metadata_status`, `price_status` / `price_source` / `price_observed_at`, `mc_status` (why `mc_usd` is null) and `side` / `side_reason`. Every existing field keeps its name.

> **New in 0.13.0 — stream recovery: resume cursor, de-duplication, honest gaps.** The managed stream now tracks the cursor `{ instance, seq, ts }` of the last frame your handlers finished and resumes after it on every reconnect (the v1 `resume` request, with an automatic fallback to `replay_since_seq` / `replay_since_ts` on older servers). Delivery is at-least-once, de-duplicated by event `id`; new lifecycle events `cursor`, `replay`, `gap` (what could not be recovered — a `seq` gap is never loss) and `fatal`. Close codes are handled: 4001 re-fetches the token (bounded), 4002 waits ≥ 60 s instead of looping every second, 4003 stops, 4008 resumes; the backoff resets only after a `subscribed` ack. Every server `warning` frame is emitted (incl. `channels_rejected` / `channels_revoked`). `StreamChannel` / `STREAM_CHANNELS` now list all nine RHC channels (adds `rhc:dex_trades_unattributed`, `rhc:new_tokens`, `rhc:token_locks`); `PriceAlertEvaluation.mode` is `"event_driven" | "polled"` with the new optional `trigger` / `fallback_poll_seconds`. See the stream section's "Recovery" notes.

> **New in 0.11.0 — BREAKING for keyless (x402) mode only: an explicit payment policy is required (security fix, SDK-01).** Before, a keyless client signed whatever USDG amount and recipient a 402 challenge asked for. Now `createKeylessClient(key, baseUrl, paymentPolicy)` / `new RobinhoodChainX402({ privateKey, paymentPolicy })` requires `{ payTo, maxAmountAtomic, maxTotalAmountAtomic }` (optional `timeoutMs`, `authorizationTtlSeconds`, `beforePayment`), and the client refuses before signing any challenge whose scheme, network (`eip155:4663`), asset (USDG), recipient or amount falls outside it. Use the canonical merchant address below and caps of at least `40000` (0.04 USDG) per call. The budget is per client instance: it is not wallet-wide, not shared between clients or processes, and resets when a new instance is created. A paid response that arrives after the payment deadline is still returned with its receipt. **API-key (`msk_`) users: no change, no new config.** Keyless requires `baseUrl` exactly `https://madeonsol.com`.

> **New in 0.10.0 — 11 endpoints closing the RHC agentic-infra coverage gap.** Found by an internal audit comparing this client against MCP/ElizaOS/SAK (which already had all of these): `kolCoordination`, `kolFirstTouches`, `deployerTrajectory`, `deployerTokens`, `deployerHistory`, `deployerBestTokens`, `deployerStats`, `recentBonds`, `tokenBatch`, `tokenBatchBuyerQuality` (the last two use the body-capable `send()` path — key-mode only, same as every other write), and `tokenEarlyBuyers` — first buyers of a token, ranked, with still-holding status, previously unreachable from any agent surface.
>
> **New in 0.9.1 — stream tokens never expire.** `POST /api/v1/stream/token` now returns the **same token on every call, forever** (server change of 2026-08-27). `StreamToken.expires_at` is typed `string | null` and `next_refresh_at` `string | null` — both are **always `null`** now and kept only for wire compatibility; the response gained `rotated: boolean` and `lifetime: string`. A token only stops working when the subscription lapses or you replace it with the new `client.getStreamToken({ rotate: true })` (the previous value keeps working for 60 s). The server never rotates on its own and never sends `token_refresh` unless you rotated; a `4001` close means "mint again", never a timer. Preferred handshake auth is `Authorization: Bearer <token>` (`?token=` still works and is masked in access logs); RHC channels ride the same socket and token as Solana. `client.stream()` already fetched a token on every (re)connect and never read `expires_at`, so its behavior is unchanged — only its docs are.

> **New in 0.9.0 — tokenized equities + the rug signal (key mode).** The two routes flagged as "bindings follow" in 0.7.0 are now bound: `client.equities(params?)` → `GET /rhc/equities` (**BASIC**, typed `EquitiesResponse` / `RhcEquity`) lists every official Robinhood tokenized stock/ETF (NVDA, SPY, AAPL, …) with live price / MC / liquidity and 24h trades / ETH volume / buyer-seller split. **Identity is the issuer BEACON, never the name** — a token is listed only if its contract is an EIP-1967 beacon proxy on Robinhood's issuer beacon, read from our own node; on ship day there were 20 fake "GameStop • Robinhood Token" contracts and 8 fake NVDAs with the exact official suffix, and none appear here. `client.lpEvents(params?)` → `GET /rhc/lp-events` (**PRO+**, typed `LpEventsResponse` / `RhcLpEvent`) is the liquidity **removals** feed — Uniswap v2/v3 `Burn` + v4 `ModifyLiquidity` with a negative delta on tracked pools, each row enriched with the token, the provider wallet, `provider_is_token_deployer` (the classic rug tell) and `provider_kol_name`. Removals ONLY: adds are not persisted, so an empty page means "no removals seen", never "no liquidity activity" — the `coverage` block says `adds_persisted: false`. Amounts are raw uint256 strings; v4 rows carry `liquidity` only. Filter by `token` / `pool` / `provider` / `dex`, cursor via `next_before`. Data since 2026-08-05. Both are **key mode only** — neither is on the 10-endpoint x402 rail; a keyless client throws `KeylessNotAvailableError` for them.

> **New in 0.8.0 — `holder_growth`: who arrived and who left.** `client.tokenHolders(address)` (key mode and the keyless USDG rail alike — same handler) now returns `holder_growth` on `GET /rhc/tokens/{address}/holders`: `{ "1h", "24h", "7d" }` × `{ cutoff_block, entered, entered_still_holding, exited, net }`. *entered* = addresses whose first `Transfer` of the token landed at-or-after the window's cutoff block (any current balance); *entered_still_holding* = those still non-zero; *exited* = pre-existing holders whose last movement in the window left them at zero; *net* ≈ the change in `holder_count`. Pools and burn addresses are excluded from every count. This exists because RHC balances are folded from ERC-20 Transfer logs on our own node — the fold keeps first-seen and last-moved blocks per address and retains zero-balance rows — so it is a direct read, not an estimate; the Solana census is a point-in-time ledger scan with no history and cannot answer this. A window is `null` (never 0) only when the chain had no ingested trades in it; the whole block is `null` only if the growth read failed. Sanity check from ship day: a token launched that morning showed 593 entered / 560 still holding over 24h, and `holder_count` was exactly 560.

> **New in 0.7.0 — keyless x402 mode.** `createKeylessClient("0x…", undefined, paymentPolicy)` / `new RobinhoodChainX402({ privateKey, paymentPolicy })`: any EVM wallet holding USDG on chain 4663 can call `kolFeed`, `kolHotTokens`, `kolLeaderboard`, `token`, `tokenBuyerQuality`, `tokenKolConsensus`, `tokenRisk`, `tokenHolders`, `walletPnl` and `deployerAlerts` with no API key. The signature is EIP-712 over the USDG domain `{ Global Dollar, 1, 4663 }`, one payment attempt per call, `client.lastPayment` exposes the on-chain settlement (`transaction`, `payer`). Requires the optional peer dependency `viem` (`npm i viem`); key mode still has zero runtime deps. Calling any other method on a keyless client throws `KeylessNotAvailableError` — it names the rail, it does not silently downgrade. Also new on the server this release: `/rhc/equities` (beacon-verified tokenized stocks/ETFs), `/rhc/tokens?sort=newest&since=`, `/rhc/lp-events` — key-mode bindings for those follow in the next minor.

> **New in 0.6.0 — wallet intelligence.** Ten new operations covering the Robinhood Chain wallet surface, which had no SDK binding at all until now: `wallet()` (90-day profile with reputation flags), `walletPnl()` (FIFO PnL with daily curve, closed and open positions), `walletPositions()` (open book marked to market), `walletTrades()` (per-wallet keyset-paginated tape), plus the watchlist — `walletTrackerList()`, `walletTrackerAdd()`, `walletTrackerRemove()`, `walletTrackerRelabel()`, `walletTrackerTrades()` and `walletTrackerSummary()`. Everything is **ETH**-denominated, and cost basis is FIFO over a rolling 90-day window — `cost_basis_observable_from` names the date the window opens, so a position opened before it reads as a sell with no matching buy. The profile / PnL / positions trio shares ONE snapshot cache server-side, so calling all three on an address costs roughly one computation rather than three; `cache_hit` says which call paid for it. Watchlist quotas are **per chain** (PRO 50 / ULTRA 100 / BUSINESS 500 RHC wallets), independent of your Solana list. Dependency ranges are now bounded to the versions actually tested (`@x402/*` `^2.x`, `@solana/kit` `^5.5.1`) instead of open-ended `>=0.0.1`, and the lazily-imported x402 peers are marked optional — a keyed install no longer pulls the whole Solana stack.

## Install

```bash
npm install robinhood-chain-x402
# keyless x402 mode additionally needs viem:
npm install viem
```

> Zero required runtime dependencies in key mode. The live stream will use the optional [`ws`](https://www.npmjs.com/package/ws) package on Node when present (recommended on Node ≥ 22 for a clean process exit); the browser uses the native `WebSocket`.

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

### Keyless x402 mode — pay per call in USDG, no API key

**Canonical MadeOnSol merchant address (USDG on Robinhood Chain, chain 4663):**
`0xb2Af9Ad9EE09dAc999ac5A6Db993739128b27F10`. It is pinned here (GitHub + registry
README) so you do not have to take it from a 402; https://madeonsol.com/api/x402/rhc
lists the same value as a second check. If a challenge names any other address the
client refuses to sign; that is the point of the policy. A rotation would ship as a
new package release with a changelog entry, never only in a 402.

```ts
import { createKeylessClient } from "robinhood-chain-x402";

// An EVM wallet that holds USDG on Robinhood Chain (chain 4663). No ETH needed.
// Read the key from the environment — never hard-code it.
const agent = createKeylessClient(process.env.RHC_PAYER_KEY!, undefined, {
  payTo: "0xb2Af9Ad9EE09dAc999ac5A6Db993739128b27F10", // canonical MadeOnSol merchant (see above)
  maxAmountAtomic: "40000",           // At most 0.04 USDG per authorization.
  maxTotalAmountAtomic: "1000000",    // At most 1 USDG for this client instance.
});

const risk = await agent.tokenRisk("0xd0601ce157db5bdc3162bbac2a2c8af5320d9eec"); // NVDA; the USDG leg has a $0.04 floor
console.log(risk.score, risk.sellability, agent.lastPayment?.transaction); // settlement tx on Robinhood Chain

// Keyless rail = 10 endpoints; anything else throws KeylessNotAvailableError:
console.log(agent.constructor.KEYLESS_ENDPOINTS);
```

How it works: the first request gets a `402` with `accepts[]`; the client validates the exact USDG/`eip155:4663` offer against the trusted recipient and configured limits, signs an EIP-3009 `transferWithAuthorization` (EIP-712 domain `{ name: "Global Dollar", version: "1", chainId: 4663 }`, at most 60-second validity by default (also capped by the challenge), 5-second valid-after clock skew, random 32-byte nonce) with `viem`, and retries with `PAYMENT-SIGNATURE`. Our facilitator verifies balance + nonce and settles on-chain (`transferWithAuthorization`, gas paid by us); the `PAYMENT-RESPONSE` header comes back decoded on `client.lastPayment`. Prices: from **$0.04** on the USDG leg (the relayer's gas floor); the same endpoints also accept USDC on Solana via [`madeonsol-x402`](https://www.npmjs.com/package/madeonsol-x402).

### Required payment policy (SDK-01 upgrade)

Keyless construction now requires `paymentPolicy`; API-key mode is unchanged. This is a
breaking keyless change: deploy updated callers together with the next reviewed release.
The recipient must come from trusted configuration, never copied from an untrusted 402.
Only `exact`, chain `eip155:4663`, and USDG contract
`0x5fc5360d0400a0fd4f2af552add042d716f1d168` are allowed. HTTPS is required and
redirects are refused on both requests. Amounts are positive decimal strings or bigint
in atomic units (1 USDG = 1,000,000); challenge amounts must be decimal strings.

`maxAmountAtomic` caps each authorization; `maxTotalAmountAtomic` caps the lifetime of
one client, including concurrent requests. `authorizedAmountAtomic` reports reserved
plus signer-attempted units. A denied/timed-out approval releases its unsigned reservation;
once signing is invoked, the reservation remains consumed even if signing, HTTP or
settlement fails. This deliberately counts uncertain outcomes, not confirmed expenditure.
There is no automatic reset or refund. New clients/processes have separate budgets: use
one long-lived client per allowance; a wallet-wide/durable budget needs an external coordinator.

Optional `beforePayment(proposal)` may return a boolean or Promise<boolean>; only literal
`true` approves. The proposal is immutable and built-in checks cannot be waived by the hook.
`timeoutMs` defaults to 30000 for the whole keyless operation, including approval/signing;
`authorizationTtlSeconds` defaults to 60 and may be 1–300. A late signature is never submitted.
Timeout cannot undo a proof already sent or forcibly stop synchronous application code.

## Endpoints — all 54 Robinhood Chain routes

Every method maps 1:1 to an /api/v1/rhc/… route. Fields are EVM-native. Everything is a GET except the four rule engines at the bottom, which are full CRUD.

### KOL intelligence

| Method | Route | Tier | Description |
|---|---|---|---|
| `kolFeed(params?)` | `/api/v1/rhc/kol/feed` | BASIC | KOL trade feed — every buy/sell from tracked KOLs' verified EVM wallets, enriched with MC/peak and `mc_multiple_since_trade` (real-time on PRO+ and x402; 5-min delay on free keys) |
| `kolLeaderboard(params?)` | `/api/v1/rhc/kol/leaderboard` | BASIC | KOLs ranked by trade count then net ETH flow over `24h`/`7d`/`30d` |
| `kolHotTokens(params?)` | `/api/v1/rhc/kol/hot-tokens` | BASIC | Consensus tokens bought by 2+ distinct KOLs in the window |
| `kol(wallet)` | `/api/v1/rhc/kol/{wallet}` | BASIC | Single KOL profile — aggregate stats + 50 most recent trades |

### DEX trade tape

| Method | Route | Tier | Description |
|---|---|---|---|
| `trades(params?)` | `/api/v1/rhc/trades` | PRO+ | Every Uniswap v2/v3/v4 swap with the effective `trader_eoa`, gas/ordering for MEV, and KOL/deployer flags |
| `lpEvents(params?)` | `/api/v1/rhc/lp-events` | PRO+ | Liquidity **removals** feed — v2/v3 `Burn` + v4 negative `ModifyLiquidity` on tracked pools; `provider_is_token_deployer` = rug tell. Removals only (`coverage.adds_persisted: false`); raw uint256 string amounts; filters `token` / `pool` / `provider` / `dex`, cursor `next_before` |

> **`trader_eoa` is the effective trading account**, not simply `tx.from`. On an ordinary transaction it *is* `tx.from`; when the trade was bundled through ERC-4337 it is the userOp sender (`UserOperationEvent`), never the bundler that relayed it. It is still an EOA either way — on Robinhood Chain a userOp sender is a normal EOA carrying an EIP-7702 delegation. Use `trader` only for the swap-log recipient (the router on aggregated swaps).

### Token discovery + intelligence

| Method | Route | Tier | Description |
|---|---|---|---|
| `tokens(params?)` | `/api/v1/rhc/tokens` | PRO+ | Live-priced token discovery — MC, liquidity, peak MC + drawdown, launchpad, deployer tier |
| `equities(params?)` | `/api/v1/rhc/equities` | BASIC | Every official Robinhood tokenized stock/ETF — identity = issuer **beacon** (never the name), live price / MC / liquidity, 24h trades / ETH volume / buyers vs sellers. `sort` volume\|trades\|market_cap\|last_trade\|symbol, `symbol` exact, `q` substring, `limit` ≤ 300 |
| `token(address)` | `/api/v1/rhc/tokens/{address}` | BASIC | Full token snapshot — price/MC/FDV, graduation, deployer block, KOL activity, pools |
| `tokenCandles(address, params?)` | `/api/v1/rhc/tokens/{address}/candles` | PRO+ | 1-minute OHLC candles — price + MC OHLC, close liquidity, volume with buy/sell split |
| `tokenKolConsensus(address)` | `/api/v1/rhc/tokens/{address}/kol-consensus` | PRO+ | KOL positioning — buyers vs sellers, exit rate, `net_flow_eth`, median entry MC (ULTRA adds wallet lists) |
| `tokenBuyerQuality(address)` | `/api/v1/rhc/tokens/{address}/buyer-quality` | BASIC | 0–100 early-buyer quality with bundle-buyer + dump-cluster legs |
| `tokenBundle(address)` | `/api/v1/rhc/tokens/{address}/bundle` | BASIC | Launch-bundle detection (`same_block`) + how much the cohort still holds |
| `tokenTopTraders(address, params?)` | `/api/v1/rhc/tokens/{address}/top-traders` | PRO+ | Traders ranked by REALIZED ETH (`sell − buy`) — **not PnL**; a wallet still holding ranks last |
| `tokenFlow(address, window?)` | `/api/v1/rhc/tokens/{address}/flow` | PRO+ | Net flow split by cohort (kol → bot → dump_cluster → early_buyer → …); positive `net_eth` means that cohort distributed |
| `tokenPeakHistory(address, params?)` | `/api/v1/rhc/tokens/{address}/peak-history` | PRO+ | Two peaks because they disagree — `peak_mc_usd_recorded` (stored high-water) vs `peak_mc_usd_observed` (candle highs) |
| `tokenRisk(address)` | `/api/v1/rhc/tokens/{address}/risk` | PRO+ | EVM-native risk computed live on-chain — proxy upgradeability, LP custody, simulated **sellability** (never cached) |
| `tokenHolders(address, params?)` | `/api/v1/rhc/tokens/{address}/holders` | PRO+ | Exact holder set from `Transfer` logs + concentration. **Check `verified` first**; `balance` is a raw uint256 string. `holder_growth` (`"1h"` / `"24h"` / `"7d"`) = `entered`, `entered_still_holding`, `exited`, `net` ≈ Δ `holder_count` per window (pools/burns excluded; a window is `null` only when the chain had no ingested trades in it) |

### Deployer hunter + smart money

| Method | Route | Tier | Description |
|---|---|---|---|
| `deployerLeaderboard(params?)` | `/api/v1/rhc/deployer-hunter/leaderboard` | BASIC | 99k+ deployers ranked by reputation — `graduation_rate` ($40K+ peak MC), `runner_rate` ($100K+) |
| `deployer(address)` | `/api/v1/rhc/deployer-hunter/{address}` | BASIC | Single deployer profile + 50 most recent tokens (unknown wallets → `is_deployer: false`) |
| `deployerAlerts(params?)` | `/api/v1/rhc/deployer-hunter/alerts` | BASIC · keyless $0.01 | Launch alerts from tracked (graded) deployers — tier, lifetime bond rate, MC at alert; `since` = polling cursor (feed back `next_since`) |
| `alphaWallets(params?)` | `/api/v1/rhc/alpha-wallets` | PRO+ | Smart-money wallets ranked by realized performance — `net_eth`, `win_rate`, `memecoin_share`, `likely_bot` |

### Rule engines — push, not polling

Four server-side rule engines that watch the RHC tape for you and deliver over webhook or WebSocket. **Every quota is per chain** — configuring RHC rules never consumes your Solana budget. A `webhook_secret` is returned exactly once on create; payloads are signed HMAC-SHA256 over `` `<timestamp>.<body>` `` in the `X-MadeOnSol-Signature` header.

| Method | Route | Tier | Description |
|---|---|---|---|
| `copyTradeList()` | `GET /api/v1/rhc/copytrade/subscriptions` | PRO+ | Your copy-trade rules |
| `copyTradeCreate(params)` | `POST /api/v1/rhc/copytrade/subscriptions` | PRO+ | Follow up to 250 **tracked KOL wallets** (the set behind `/rhc/kol/wallets`); sizes are **ETH**, and there is no MC band (the RHC notify payload carries no market cap). Any `0x` address is accepted, but only tracked wallets can ever fire — read `subscription.source_wallets_untracked` / `warnings[{ code: "untracked_source_wallets" }]` on the response (also on list / get / update; added 2026-09-22) |
| `copyTradeGet(id)` | `GET /api/v1/rhc/copytrade/subscriptions/{id}` | PRO+ | One rule (numeric id) |
| `copyTradeUpdate(id, params)` | `PATCH /api/v1/rhc/copytrade/subscriptions/{id}` | PRO+ | Partial update; the wallet cap is re-checked so a rule cannot be PATCHed past its tier |
| `copyTradeDelete(id)` | `DELETE /api/v1/rhc/copytrade/subscriptions/{id}` | PRO+ | Delete a rule (signals cascade) |
| `copyTradeSignals(params?)` | `GET /api/v1/rhc/copytrade/signals` | PRO+ | Fire history — the catch-up path for a missed webhook. Retained 7 days |
| `priceAlertsList()` | `GET /api/v1/rhc/price-alerts` | PRO+ | Your price alerts |
| `priceAlertsCreate(params)` | `POST /api/v1/rhc/price-alerts` | PRO+ | Baseline MC is captured at creation; token must already be tracked with an MC |
| `priceAlertsGet(id)` | `GET /api/v1/rhc/price-alerts/{id}` | PRO+ | One alert (numeric id) |
| `priceAlertsUpdate(id, params)` | `PATCH /api/v1/rhc/price-alerts/{id}` | PRO+ | Only `name`, `delivery_mode`, `webhook_url`, `is_active` are mutable |
| `priceAlertsDelete(id)` | `DELETE /api/v1/rhc/price-alerts/{id}` | PRO+ | Delete an alert (events cascade) |
| `priceAlertsEvents(params?)` | `GET /api/v1/rhc/price-alerts/events` | PRO+ | Dip/recovery fire history. Retained 30 days |
| `coordinationAlertsList()` | `GET /api/v1/rhc/kol/coordination/alerts` | PRO+ | Your coordination rules |
| `coordinationAlertsCreate(params)` | `POST /api/v1/rhc/kol/coordination/alerts` | PRO+ | Fire when N+ tracked KOLs buy the same token inside a rolling window |
| `coordinationAlertsGet(id)` | `GET /api/v1/rhc/kol/coordination/alerts/{id}` | PRO+ | One rule (UUID) |
| `coordinationAlertsUpdate(id, params)` | `PATCH /api/v1/rhc/kol/coordination/alerts/{id}` | PRO+ | Partial update |
| `coordinationAlertsDelete(id)` | `DELETE /api/v1/rhc/kol/coordination/alerts/{id}` | PRO+ | Delete a rule (cooldown state + signals cascade) |
| `firstTouchSubscriptionsList()` | `GET /api/v1/rhc/kol/first-touches/subscriptions` | ULTRA+ | Your first-touch subscriptions |
| `firstTouchSubscriptionsCreate(params)` | `POST /api/v1/rhc/kol/first-touches/subscriptions` | ULTRA+ | Push when a token gets its FIRST tracked-KOL buy |
| `firstTouchSubscriptionsGet(id)` | `GET /api/v1/rhc/kol/first-touches/subscriptions/{id}` | ULTRA+ | One subscription (UUID) |
| `firstTouchSubscriptionsUpdate(id, params)` | `PATCH /api/v1/rhc/kol/first-touches/subscriptions/{id}` | ULTRA+ | `filters` is a whole-object **replace**, not a merge |
| `firstTouchSubscriptionsDelete(id)` | `DELETE /api/v1/rhc/kol/first-touches/subscriptions/{id}` | ULTRA+ | Delete a subscription |

> **RHC price alerts are event-driven, but not sub-second.** Since 2026-09-15 alerts are evaluated as trades land on the `rhc:dex_trade` feed, with a price-table poll (every 5 s while the feed is degraded or a trade carried no market cap, every 60 s otherwise) and a trade-tape replay after a feed outage as safety nets. Latency is a few seconds (the chain trade flush is ~2 s) — **do not assume parity with the Solana alerts, which are sub-second.** The create response spells this out in its `evaluation` block (`mode: "event_driven"`, `trigger`, `fallback_poll_seconds`; `interval_seconds` is kept for compatibility and equals the fast fallback poll).

> **Coordination scoring is comparable to Solana, but not identical.** The shared v1 scorer runs, `quality` is a real KOL win-rate, and `earliness` is **defaulted** — RHC has no early-entry equivalent. Every fired signal records which components were real in `score_inputs`.

> **First-touch filters are not the Solana set.** RHC has no scout score, so `min_scout_tier` and `min_n_touches` do not exist here rather than silently matching nothing; `min_kol_winrate` and `strategy` are the quality gates. Unknown filter keys are rejected with a 400, not ignored.

```ts
// Follow three wallets, 0.05 ETH per copy, pushed over WebSocket
const { subscription, webhook_secret } = await client.copyTradeCreate({
  name: "degen desk",
  source_wallets: ["0xaaa...", "0xbbb...", "0xccc..."],
  min_trade_eth: 0.01,
  sizing_mode: "fixed",
  sizing_amount: 0.05,
  delivery_mode: "websocket",
});

// Catch up on anything the webhook missed in the last hour
const since = new Date(Date.now() - 3_600_000).toISOString();
const { signals } = await client.copyTradeSignals({ subscription_id: subscription.id, since });

// Alert me if this token drops 30% from where it is right now
await client.priceAlertsCreate({ token_address: "0xToken...", drop_pct: 30, recovery_pct: 15, webhook_url: "https://example.com/hook" });
```

### Examples

> **Deployer tiers ride `runner_rate`, not `graduation_rate`.** Since migrations 267 + 269, `elite` = 5+ tokens, 24h+ of deployer history, `runner_rate >= 0.50` ($100K+ peak MC); `good` = same with `>= 0.25`. `graduation_rate` still means the $40K bar and is still returned on every row — it just no longer sets the tier (it proved farmable by operators rotating wallets). Only `spammer` still keys off it (20+ tokens, `graduation_rate < 0.05`).

```ts
// Deployer reputation leaderboard — elite deployers first
const { deployers } = await client.deployerLeaderboard({ sort: "runner_rate", tier: "elite" });

// Is this token's early cohort a launch bundle that's still holding?
const { bundle } = await client.tokenBundle("0xToken...");
console.log(bundle.bundle_kind, bundle.held_pct_of_supply);

// Tokenized equities ranked by 24h ETH volume — beacon-verified, so no fake NVDA/GameStop contracts
const { equities, identity } = await client.equities({ sort: "volume", limit: 20 });
console.log(identity.method, equities[0]?.symbol, equities[0]?.price_usd, equities[0]?.trades_24h);

// Rug watch — liquidity REMOVALS for one token (adds are never persisted; coverage.adds_persisted is false)
const { events, next_before } = await client.lpEvents({ token: "0xToken...", limit: 50 });
for (const ev of events) if (ev.provider_is_token_deployer) console.warn("deployer pulled LP:", ev.tx_hash, ev.dex);

// Smart-money memecoin traders only, biggest net ETH first
const { wallets } = await client.alphaWallets({ classification: "smart_money", min_memecoin_share: 0.7 });
```

## Streaming

Managed WebSocket stream over ws-streaming (`wss://madeonsol.com/ws/v1/stream`). Handles the token fetch on every (re)connect, auto-reconnect with backoff, and heartbeat liveness. Stream tokens **never expire** (since 2026-08-27) — there is no refresh timer; `client.getStreamToken()` returns the same token every call (`expires_at` / `next_refresh_at` are always `null`), and `getStreamToken({ rotate: true })` replaces it (the old one keeps working for 60 s). Ten RHC channels:

| Channel | Emits | Tier | Scope |
|---|---|---|---|
| `rhc:kol_trades` | `rhc:kol_trade` | PRO+ | broadcast — the live KOL tape |
| `rhc:dex_trades` | `rhc:dex_trade` | **ULTRA+** | broadcast — the full DEX firehose |
| `rhc:dex_trades_unattributed` | `rhc:dex_trade_unattributed` | **ULTRA+** | broadcast — trades on pools with no single "token" side (e.g. WETH/USDG); subscribe with `rhc:dex_trades` for full coverage |
| `rhc:new_tokens` | `rhc:new_token` | **ULTRA+** | broadcast — a token's symbol/name/decimals resolved for the first time |
| `rhc:copytrade:signals` | `rhc:copytrade:signal` | PRO+ | user-scoped — only **your** rules' fires |
| `rhc:price_alert:events` | `rhc:price_alert:dip`, `rhc:price_alert:recovery` | PRO+ | user-scoped; event-driven off each trade (a few seconds), not sub-second |
| `rhc:kol:coordination` | `rhc:kol:coordination` | PRO+ | user-scoped — only **your** rules' fires |
| `rhc:kol:first_touches` | `rhc:kol:first_touch` | PRO+ | broadcast — ULTRA gates only the first-touch *subscription CRUD*, not this channel |
| `rhc:token_locks` | `rhc:token_lock` | PRO+ | broadcast — a token lock / vesting contract created on chain |
| `rhc:token_prices` | `rhc:token_price` | PRO+ | **address-scoped** — `filters.addresses` required (25 / 100 / 250 per connection); one `snapshot: true` frame per address, then ≤ 1 tick per address per 250 ms with `quality` fresh / stale / unreliable + reason (`RhcTokenPriceTick`); no `seq` / `id` |

> **Deprecated:** `rhc:trades` was never a real channel — 0.4.0 subscribers got a `channels_rejected` warning and silence. The server now accepts it as an alias of `rhc:dex_trades` (and acks it under the canonical name), and the SDK keeps the literal marked `@deprecated` so 0.4.0 code compiles. Use `rhc:dex_trades`.

```ts
const stream = client.stream();

stream.on("rhc:kol_trade", (t) => console.log("KOL trade", t));
stream.on("rhc:dex_trade", (t) => console.log("DEX trade", t)); // ULTRA+
stream.on("open", () => console.log("connected to chain 4663"));
// New in 0.5.0 — a refused channel (typo or tier gate) is surfaced instead of
// leaving the stream silently quiet.
stream.on("warning", (w) => console.warn("rejected:", w.code, w.rejected, w.valid_channels));

stream.subscribe(["rhc:kol_trades", "rhc:dex_trades"]);

// later
stream.close();
```

### Recovery: cursor, resume, de-duplication *(new in 0.13.0)*

The stream client keeps a **resume cursor** `{ instance, seq, ts }` — the position of the last frame your handlers finished — and on every reconnect asks the server to resume after it (`subscribe { …, resume }`).

- **"Processed"** means every handler for that frame returned, or the promise it returned settled. Return a promise from an async handler and the cursor waits for it (and for every earlier frame). A handler that throws or rejects still counts as processed; the error goes to `error`.
- **At-least-once, never exactly-once.** After a reconnect a frame can arrive again. The client drops ids it delivered recently (the last 10,000, option `dedupeSize`); anything you persist should still dedupe on `evt.id`. Replayed frames carry `evt.replayed === true`.
- **Persistence.** The cursor lives in memory. Save `stream.getCursor()` (or on every `cursor` event) and pass it back as `{ resume }` to continue after a process restart. Persist the committed cursor, never `getProgress()`.
- **Committed cursor vs progress.** `getCursor()` is the COMMITTED, safe cursor — persist and resume from this one. `getProgress()` is what has been received and handled (replayed frames included) and is not safe to resume from. Live frames commit as they are handled. Replayed frames never commit: the server replays channel by channel, so only a `replay_end` the server calls complete — or one whose gaps are all final — commits, at the server's `last_seq` / `last_ts`. If a recovery is incomplete, or the socket closes mid-replay, the committed cursor stays at the pre-resume point, and live frames after it are delivered but not committed until a later recovery completes (`isRecoveryIncomplete()`). **Trade-off:** the next reconnect re-requests the unrecovered range from the old cursor, and what arrives twice is dropped by id. Call `acceptGap()` once you have backfilled the range the `gap` event named, or decided to skip it. A gap the server calls final is handled by `onUnrecoverableGap` (below).
- **Gaps: what is known, and who decides.** A `gap` event says which channels the server could not rebuild, the **range that may be incomplete** (`skipped.from` → `skipped.to`, plus `from`), the server's `reason`, whether it is `permanent`, and the bounds the server reported (`limits`, and per-channel `time_basis` / `truncated_at_ts` / `retry_after_ms` under `channels`). Events in that range **may** be missing — the number cannot be known, so it is never stated. Backfill the range from REST if you need certainty.
  - **Transient** (`retryable: true` — `backpressure`, `closed`, `source_busy`, `source_error`, `late_ingest_possible`, `row_cap`): the committed cursor stays put, live frames do not commit, and the client resumes again after the server's `retryAfterMs` (for `row_cap`, from `resumeTsHint`), then on every reconnect. `resumeTsHint` is used only when every incomplete **retryable** channel is `row_cap` (a channel whose gap is final does not block it, and is still reported); otherwise the retry asks from the committed cursor again. The client asks again after the server’s `retryAfterMs` at most `maxResumeRetries` times per connection (default 5; the budget resets on every reconnect); when that budget is spent the gap event says `exhausted: true`, the cursor stays where it is, and the next reconnect resumes again.
  - **Final** (`retryable: false` — `not_reconstructable`, `window_exceeded`, and an older server's `ring_truncated` / `instance_changed`): asking again can never fill it. **The SDK then decides to continue** — that is the client's decision, not your approval — and reports it on the same `gap` event with `advancedPastGap: true`, `source: "auto"` and the range being skipped, *before* the cursor moves. Set `onUnrecoverableGap: "stop"` to keep the cursor instead: the stream stops and emits `fatal` with the gap, and you decide (`acceptGap()` then `connect()` continues; `acceptGap()` reports the same gap with `source: "manual"`).
- **Older servers.** Against a server that does not understand `resume` yet, the client falls back to `replay_since_seq` (same server process) or `replay_since_ts` (the server restarted). That only covers the server's in-memory buffer (minutes), and a restart is reported as a `gap` with `instance_changed`.
- **Close codes.** `4001` → the token is re-fetched and the client reconnects (`maxAuthRetries`, default 3, then `fatal`); `4002` connection limit → `error` plus a wait of at least 60 s (`connectionLimitBackoffMs`) — free a ghost slot with the stream-sessions API; `4003` → `fatal`, the client stops; `4008` slow consumer → reconnect and resume. The backoff resets only when the server acks a subscribe, never on a bare socket open.
- **Warnings.** `warning` fires for every server warning frame, including `channels_rejected` and `channels_revoked` (revoked channels are removed from the subscription so reconnects do not re-request them) (a channel dropped after a plan change). A rejected or revoked channel is silent, so handle it.

```ts
const stream = client.stream({ resume: loadCursor() ?? undefined });
stream.on("*", async (data, evt) => {
  await store.upsert(evt!.id, data); // the cursor advances once this resolves
});
stream.on("cursor", (c) => saveCursor(c));        // { instance, seq, ts }
stream.on("gap", (g) => console.warn("may be missing:", g.reasons, g.skipped)); // g.advancedPastGap: the SDK continued past it
stream.on("fatal", (f) => console.error("stream stopped:", f.code, f.reason));
```

### Named subscriptions *(new in 0.14.0)*

One socket can hold several independent subscriptions, each with its own channels and filters; the server caps the total per connection, the default one included (PRO 5, ULTRA 10, BUSINESS 20). `subscribe(channels, filters)` stays the connection's `"default"` subscription and its wire is unchanged; `subscribe({ subId, channels, filters })` opens a named one (`subId`: 1-64 characters of `A-Z a-z 0-9 _ . -`). A frame delivered under a named subscription carries `evt.sub_id`. **An event that matches several subscriptions is delivered once per matching subscription**, each copy stamped with its `sub_id`: the client dedupes per `(sub_id, id)`, so the same event can legitimately reach a handler twice, under two sub_ids. Filters of one subscription never affect another. `updateSubscription(subId, filters)` REPLACES that subscription's filters (`"default"` addresses the plain one), `unsubscribe(subId)` removes it, `getSubscriptions()` is the local view and `listSubscriptions()` asks the server (`list` / `subscriptions`). Server refusals arrive as `warning` frames carrying the `sub_id` and one of `invalid_sub_id`, `too_many_subscriptions`, `unknown_sub_id`, `invalid_filters`, `channels_rejected`, `channels_revoked`, `replay_in_progress`; a subscription refused as `too_many_subscriptions` or `invalid_sub_id` is dropped locally so reconnects stop re-requesting it. Lifecycle events `updated` and `unsubscribed` surface the server acks.

**Resume with several subscriptions** is per subscription: on every reconnect each subscription is re-sent with the same cursor, the server serves one replay per subscription, one after another (`replay_start` … `replay_end` each carry the `sub_id`; live frames are held until the last one ends), and the cursor commits once ALL of them have ended, at the smallest `last_seq` / `last_ts` across them. The `replay` event lists `subscriptions` and the raw `ends` per subscription; a gap's `channels` entries are keyed `sub_id/channel` for named subscriptions, and an incomplete retryable replay is retried for those subscriptions only. Against an older server that ignores `sub_id`, the client emits `warning` `named_subscriptions_unsupported` once.

```ts
const stream = client.stream();
stream.subscribe({ subId: "kol-buys", channels: ["rhc:kol_trades"], filters: { action: "buy" } });
stream.subscribe({ subId: "firehose", channels: ["rhc:dex_trades"], filters: {} });
stream.on("rhc:kol_trade", (t, evt) => console.log(evt!.sub_id, t)); // "kol-buys"
stream.updateSubscription("kol-buys", { action: "buy" });
console.log(await stream.listSubscriptions()); // [{ subId, channels, filters }, …]
stream.unsubscribe("firehose");
```

### New in 0.5.0 — stream fixes

- **Channel names corrected.** `StreamChannel` now lists the six real RHC channels above. 0.4.0's `rhc:trades` never existed server-side; it is now a server-accepted deprecated alias of `rhc:dex_trades` and stays in the union as `@deprecated`.
- **Event names corrected.** The firehose broadcasts `rhc:dex_trade` — a 0.4.0 `on("rhc:trade", …)` handler never fired, and is now a **compile error** so you find it. `StreamEventName` covers all six channels' events.
- **Server warnings surfaced.** `channels_rejected` frames used to be silently dropped; they now emit a typed `"warning"` lifecycle event (`StreamWarning`: `code`, `rejected`, `valid_channels`, `message`).

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

