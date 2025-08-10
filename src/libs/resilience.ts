const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function retry<T>({
  fn,
  attempts = 3,
  baseMs = 120,
  maxMs = 1000,
  jitter = true,
}: {
  fn: () => Promise<T>;
  attempts?: number;
  baseMs?: number;
  maxMs?: number;
  jitter?: boolean;
}): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const backoff = Math.min(baseMs * 2 ** i, maxMs);
      const wait = jitter ? Math.floor(backoff * (0.5 + Math.random() * 0.5)) : backoff;
      await sleep(wait);
    }
  }
  throw lastErr;
}
