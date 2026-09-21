/** Application authorization for the native USDG/RHC signing client. */
export const RHC_PAYMENT_NETWORK = "eip155:4663";
export const RHC_PAYMENT_ASSET = "0x5fc5360d0400a0fd4f2af552add042d716f1d168";
const UINT256_MAX = (1n << 256n) - 1n;

export class PaymentPolicyError extends Error {
  constructor(message: string) { super(message); this.name = "PaymentPolicyError"; }
}

export interface PaymentProposal {
  readonly url: string;
  readonly network: typeof RHC_PAYMENT_NETWORK;
  readonly scheme: "exact";
  readonly asset: typeof RHC_PAYMENT_ASSET;
  readonly payTo: string;
  readonly amount: string;
  readonly maxTimeoutSeconds: number;
}

export interface PaymentPolicy {
  /** Trusted recipient obtained independently of the HTTP 402 challenge. */
  payTo: string;
  /** USDG atomic units (6 decimals); decimal string or bigint, never float. */
  maxAmountAtomic: string | bigint;
  /** Lifetime authorization budget for this client instance, shared by concurrent calls. */
  maxTotalAmountAtomic: string | bigint;
  /** Whole keyless request deadline, including policy/signing. Default 30 seconds. */
  timeoutMs?: number;
  /** Maximum signed authorization lifetime, 1–300 seconds. Default 60. */
  authorizationTtlSeconds?: number;
  /** Optional additional approval. Only literal true approves; built-in checks still apply. */
  beforePayment?: (proposal: Readonly<PaymentProposal>) => boolean | Promise<boolean>;
}

function atomic(value: unknown, name: string): bigint {
  if (typeof value !== "bigint" && (typeof value !== "string" || !/^[1-9][0-9]{0,77}$/.test(value))) {
    throw new PaymentPolicyError(`${name} must be a positive integer in atomic units`);
  }
  const n = BigInt(value as string | bigint);
  if (n <= 0n || n > UINT256_MAX) throw new PaymentPolicyError(`${name} is outside uint256`);
  return n;
}
function address(value: unknown): string | null {
  return typeof value === "string" && /^0x[0-9a-fA-F]{40}$/.test(value) && !/^0x0{40}$/i.test(value)
    ? value.toLowerCase() : null;
}
function integer(value: number, name: string, max: number): number {
  if (!Number.isSafeInteger(value) || value < 1 || value > max) throw new PaymentPolicyError(`${name} is out of range`);
  return value;
}
export function paymentUrl(value: string): URL {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.hash) {
    throw new PaymentPolicyError("Keyless payment URLs must use HTTPS without credentials or fragments");
  }
  return url;
}

/** A reserved amount is released only before a signer has been invoked. */
export class PaymentBudget {
  readonly timeoutMs: number;
  readonly authorizationTtlSeconds: number;
  private readonly payTo: string;
  private readonly maxAmount: bigint;
  private readonly maxTotal: bigint;
  private readonly approve?: PaymentPolicy["beforePayment"];
  private used = 0n;

  constructor(policy: PaymentPolicy | undefined) {
    if (!policy) throw new PaymentPolicyError("Keyless mode requires paymentPolicy with payTo, maxAmountAtomic and maxTotalAmountAtomic");
    const recipient = address(policy.payTo);
    if (!recipient) throw new PaymentPolicyError("paymentPolicy.payTo must be a nonzero EVM address");
    this.payTo = recipient;
    this.maxAmount = atomic(policy.maxAmountAtomic, "maxAmountAtomic");
    this.maxTotal = atomic(policy.maxTotalAmountAtomic, "maxTotalAmountAtomic");
    this.timeoutMs = integer(policy.timeoutMs ?? 30_000, "timeoutMs", 2_147_483_647);
    this.authorizationTtlSeconds = integer(policy.authorizationTtlSeconds ?? 60, "authorizationTtlSeconds", 300);
    if (policy.beforePayment !== undefined && typeof policy.beforePayment !== "function") throw new PaymentPolicyError("beforePayment must be a function");
    this.approve = policy.beforePayment;
  }

  /** Reserved plus signer-attempted amount; not a claim about settled on-chain spend. */
  get authorizedAmountAtomic(): string { return this.used.toString(); }

  select(challenge: unknown, url: string): Readonly<PaymentProposal> {
    paymentUrl(url);
    if (!challenge || typeof challenge !== "object") throw new PaymentPolicyError("Invalid x402 challenge");
    const c = challenge as Record<string, unknown>;
    if (c.x402Version !== 2 || !Array.isArray(c.accepts) || c.accepts.length > 32) throw new PaymentPolicyError("Expected a bounded x402 v2 accepts list");
    if (c.resource !== undefined) {
      const resource = c.resource as { url?: unknown } | null;
      if (!resource || typeof resource.url !== "string") {
        throw new PaymentPolicyError("Challenge resource does not match the requested URL");
      }
      const advertised = paymentUrl(resource.url), requested = paymentUrl(url);
      // MadeOnSol advertises pathname-only resources. If a query is advertised,
      // it must match; never allow a different origin/path or follow a redirect.
      if (advertised.origin !== requested.origin || advertised.pathname !== requested.pathname ||
          (advertised.search && advertised.search !== requested.search)) {
        throw new PaymentPolicyError("Challenge resource does not match the requested URL");
      }
    }
    const leg = c.accepts.find((a: unknown) => {
      if (!a || typeof a !== "object") return false;
      const v = a as Record<string, unknown>;
      return v.scheme === "exact" && v.network === RHC_PAYMENT_NETWORK &&
        address(v.asset) === RHC_PAYMENT_ASSET && address(v.payTo) === this.payTo;
    }) as Record<string, unknown> | undefined;
    if (!leg) throw new PaymentPolicyError("No exact USDG/RHC offer for the trusted recipient");
    if (typeof leg.amount !== "string") throw new PaymentPolicyError("Challenge amount must be a decimal string");
    const amount = atomic(leg.amount, "amount");
    if (amount > this.maxAmount) throw new PaymentPolicyError("Payment exceeds maxAmountAtomic");
    const timeout = integer(leg.maxTimeoutSeconds as number, "maxTimeoutSeconds", Number.MAX_SAFE_INTEGER);
    if (leg.extra !== undefined) {
      const extra = leg.extra as Record<string, unknown> | null;
      if (!extra || typeof extra !== "object" || Array.isArray(extra) ||
          (extra.name !== undefined && extra.name !== "Global Dollar") ||
          (extra.version !== undefined && extra.version !== "1")) throw new PaymentPolicyError("Unexpected USDG signing domain");
    }
    return Object.freeze({ url, network: RHC_PAYMENT_NETWORK, scheme: "exact", asset: RHC_PAYMENT_ASSET,
      payTo: this.payTo, amount: amount.toString(), maxTimeoutSeconds: Math.min(timeout, this.authorizationTtlSeconds) });
  }

  reserve(proposal: Readonly<PaymentProposal>): { signerInvoked(): void; release(): void } {
    const amount = atomic(proposal.amount, "amount");
    if (this.used + amount > this.maxTotal) throw new PaymentPolicyError("Payment exceeds maxTotalAmountAtomic");
    this.used += amount; // No await between check and reservation.
    let retained = false, released = false;
    return {
      signerInvoked: () => { retained = true; },
      release: () => { if (!retained && !released) { this.used -= amount; released = true; } },
    };
  }

  async checkApproval(proposal: Readonly<PaymentProposal>, signal: AbortSignal): Promise<void> {
    signal.throwIfAborted();
    if (this.approve && await withinDeadline(Promise.resolve(this.approve(proposal)), signal) !== true) {
      throw new PaymentPolicyError("beforePayment did not approve the payment");
    }
    signal.throwIfAborted();
  }
}

/** Observe the losing promise too; a timed-out signer must never trigger a later send. */
export async function withinDeadline<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  signal.throwIfAborted();
  let onAbort: () => void = () => {};
  const aborted = new Promise<never>((_, reject) => {
    onAbort = () => reject(signal.reason);
    signal.addEventListener("abort", onAbort, { once: true });
  });
  try { return await Promise.race([promise, aborted]); }
  finally { signal.removeEventListener("abort", onAbort); }
}
