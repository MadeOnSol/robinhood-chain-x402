# robinhood-chain-x402 examples

RHC-only, EVM-native examples for chain id 4663. Get a free API key at
[madeonsol.com/pricing](https://madeonsol.com/pricing) and export it:

```bash
export MADEONSOL_API_KEY=msk_your_key_here
npx tsx examples/kol-feed.ts
```

| File | What it shows |
|---|---|
| [`kol-feed.ts`](./kol-feed.ts) | Live KOL buys/sells on Robinhood Chain (`kolFeed`) |
| [`token-intel.ts`](./token-intel.ts) | Token snapshot + buyer-quality + bundle + KOL consensus |
| [`stream.ts`](./stream.ts) | Live WebSocket stream — `rhc:kol_trades` (PRO+) + `rhc:dex_trades` (ULTRA+), with the 0.5.0 `warning` event |

> Key-mode only. Robinhood Chain does have a keyless x402 pay-per-call rail (a
> narrow keyless subset, listed live at `/api/x402/rhc` — see [madeonsol.com/robinhood/x402](https://madeonsol.com/robinhood/x402)),
> but its signing path is not part of this package. For keyless USDC-per-call on
> the Solana API, see [`madeonsol-x402`](https://www.npmjs.com/package/madeonsol-x402).
