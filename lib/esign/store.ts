// Storage for lease signing: envelopes (JSON) and PDFs.
// On Netlify this is Netlify Blobs (free, private, only reachable through our own server code).
// Locally (npm run dev without Netlify) it falls back to files in .data/esign so the flow can be tested.
import { getStore } from "@netlify/blobs";
import { promises as fs } from "fs";
import path from "path";

type Kv = {
  getBytes(key: string): Promise<Uint8Array | null>;
  setBytes(key: string, value: Uint8Array): Promise<void>;
  getJSON<T>(key: string): Promise<T | null>;
  setJSON(key: string, value: unknown, opts?: { onlyIfNew?: boolean }): Promise<boolean>;
  delete(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
};

const STORE = "esign";

function netlifyKv(): Kv | null {
  let store;
  try {
    // Use the platform fetch, not the one Next.js wraps for caching: the wrapped one stalls
    // Netlify Blobs reads inside GET route handlers.
    const g = globalThis as unknown as { _nextOriginalFetch?: typeof fetch };
    const base = g._nextOriginalFetch || fetch;
    const raw: typeof fetch = (input, init) =>
      base(input, { ...init, cache: "no-store", signal: init?.signal ?? AbortSignal.timeout(15_000) });
    store = getStore({ name: STORE, consistency: "strong", fetch: raw });
  } catch {
    return null;
  }
  return {
    async getBytes(key) {
      const v = await store.get(key, { type: "arrayBuffer" });
      return v ? new Uint8Array(v) : null;
    },
    async setBytes(key, value) {
      await store.set(key, value.slice().buffer as ArrayBuffer);
    },
    async getJSON<T>(key: string) {
      return ((await store.get(key, { type: "json" })) as T) ?? null;
    },
    async setJSON(key, value, opts) {
      const r = await store.setJSON(key, value, opts?.onlyIfNew ? { onlyIfNew: true } : undefined);
      return r.modified !== false;
    },
    async delete(key) {
      await store.delete(key);
    },
    async list(prefix) {
      const { blobs } = await store.list({ prefix });
      return blobs.map((b) => b.key);
    },
  };
}

const ROOT = path.join(process.cwd(), ".data", "esign");
const fileFor = (key: string) => path.join(ROOT, ...key.split("/").map((p) => encodeURIComponent(p)));

const localKv: Kv = {
  async getBytes(key) {
    try {
      return new Uint8Array(await fs.readFile(fileFor(key)));
    } catch {
      return null;
    }
  },
  async setBytes(key, value) {
    await fs.mkdir(path.dirname(fileFor(key)), { recursive: true });
    await fs.writeFile(fileFor(key), value);
  },
  async getJSON<T>(key: string) {
    const b = await localKv.getBytes(key);
    return b ? (JSON.parse(Buffer.from(b).toString("utf8")) as T) : null;
  },
  async setJSON(key, value, opts) {
    if (opts?.onlyIfNew && (await localKv.getBytes(key))) return false;
    await localKv.setBytes(key, new Uint8Array(Buffer.from(JSON.stringify(value))));
    return true;
  },
  async delete(key) {
    await fs.rm(fileFor(key), { force: true });
  },
  async list(prefix) {
    const dir = path.dirname(fileFor(prefix + "x"));
    try {
      const names = await fs.readdir(dir);
      const base = prefix.slice(0, prefix.lastIndexOf("/") + 1);
      return names.map((n) => base + decodeURIComponent(n)).filter((k) => k.startsWith(prefix));
    } catch {
      return [];
    }
  },
};

let cached: Kv | null = null;
export function kv(): Kv {
  if (cached) return cached;
  const blobs = process.env.ESIGN_LOCAL_STORE ? null : netlifyKv();
  if (blobs) return (cached = blobs);
  // Never fall back to the local disk in production: it is wiped between requests on serverless hosts.
  if (process.env.NODE_ENV === "production" && !process.env.ESIGN_LOCAL_STORE) {
    throw new Error("Document storage is not available. Netlify Blobs did not initialise.");
  }
  return (cached = localKv);
}
