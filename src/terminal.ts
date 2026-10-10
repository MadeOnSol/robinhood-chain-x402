/**
 * Robinhood terminal integration over existing REST + managed WebSocket (#534).
 *
 * A shared SDK socket is REQUIRED. We do not open a socket per token widget,
 * and no REST module is refetched on every price tick. Each terminal must use
 * its own explicit named subscription, and each disconnect/replay gap is visible.
 *
 * This adapter does NOT make the selected token's historical capture complete.
 */
import type { RobinhoodChainX402 } from "./index.js";
import type { RobinhoodChainStream, StreamChannel } from "./stream.js";
import type { RhcTokenIntelligenceModuleId } from "./types.js";
import { createTerminalTokenView, type TerminalStreamPort, type TerminalTokenView,
  type TerminalView, type TerminalStreamFrame } from "./terminal-watch.js";
import type { TerminalTier, TerminalModule } from "./terminal-policy.js";

export interface RobinhoodTerminalWatchOptions {
  /** Caller-selected modules, obeying existing API budget (at most 5, cost <=8). */
  include: readonly RhcTokenIntelligenceModuleId[];
  /** Account's current tier. Server still enforces its authoritative entitlement. */
  tier: TerminalTier;
  /** Reuse ONE existing client.stream() across terminal widgets. */
  stream: RobinhoodChainStream;
  /** Unique per shared connection, 1..64 chars, A-Z a-z 0-9 _ . - */
  subId: string;
  /** Subscribe to global, unscoped KOL broadcasts (may be high bandwidth). */
  includeKolBroadcast?: boolean;
  /** Optional full RHC DEX firehose (ULTRA+). NOT token-filtered at source. */
  includeRhcFirehose?: boolean;
  /** Min interval between REST refreshes for any invalidated module. Default 15s. */
  minModuleRefreshMs?: number;
  debounceMs?: number;
  /** Snapshot, stale module names, live overlays and historical gap status. */
  onChange?: (view: TerminalView) => void;
  onLive?: (frame: TerminalStreamFrame, module: TerminalModule) => void;
}

/**
 * The existing stream's public `on` overloads use specific event signatures.
 * Narrowly adapt those overloads to the small event-port used by the shared
 * controller, without changing stream/client behavior.
 *
 * Exported for BROWSER terminals that must not hold an API key: pair it with
 * `createTerminalTokenView({ stream: terminalStreamPort(stream), read })`, where
 * `stream` gets its short-lived token from your backend (`getToken`) and `read`
 * calls your backend, which calls the keyed intelligence endpoint.
 */
export function terminalStreamPort(stream: RobinhoodChainStream): TerminalStreamPort {
  const listenerPort = stream as unknown as {
    on(event: string, cb: (...args: unknown[]) => unknown): unknown;
    off(event: string, cb: (...args: unknown[]) => unknown): unknown;
  };
  return {
    subscribe({ subId, channels, filters }) {
      stream.subscribe({ subId, channels: channels as StreamChannel[], filters });
    },
    unsubscribe(subId) { stream.unsubscribe(subId); },
    on(event, listener) { listenerPort.on(event, listener); },
    off(event, listener) { listenerPort.off(event, listener); },
  };
}

/** Creates an active, terminal-scoped view; returns a handle with dispose(). */
export function createRobinhoodTerminalWatch(
  client: RobinhoodChainX402,
  address: string,
  options: RobinhoodTerminalWatchOptions,
): TerminalTokenView {
  if (client.authMode !== "key") throw new Error("token_intelligence_requires_api_key");
  if (!options || !options.stream) throw new Error("shared_stream_required");
  if (!options.subId || !/^[A-Za-z0-9_.-]{1,64}$/.test(options.subId) || options.subId === "default") {
    throw new Error("unique_named_sub_id_required");
  }
  // A named subscribe REPLACES that subId's filters on the server. Never allow
  // a different terminal widget to silently commandeer an existing watch.
  if (options.stream.getSubscriptions().some(sub => sub.subId === options.subId)) {
    throw new Error("named_sub_id_already_in_use");
  }

  const watch = createTerminalTokenView({
    chain: "robinhood-chain",
    address: address,
    tier: options.tier,
    include: options.include as readonly TerminalModule[],
    includeKolBroadcast: options.includeKolBroadcast,
    includeRhcFirehose: options.includeRhcFirehose,
    subId: options.subId,
    stream: terminalStreamPort(options.stream),
    read: modules => client.tokenIntelligence(address, { include: [...modules] as RhcTokenIntelligenceModuleId[] }),
    onChange: options.onChange,
    onLive: options.onLive,
    minModuleRefreshMs: options.minModuleRefreshMs,
    debounceMs: options.debounceMs,
  });
  watch.start();
  return watch;
}
