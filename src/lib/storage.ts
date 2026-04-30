import type { Paint } from "@/types/paint";

const DB_NAME = "paint_inventory_db";
const STORE = "kv";
const KEY = "state";
const CURRENT_VERSION = 1;

interface StoredState {
  paints: Paint[];
  version: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.get(key);
    req.onsuccess = () => resolve((req.result as T | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet<T>(key: string, value: T): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function loadState(): Promise<StoredState> {
  try {
    const state = await idbGet<StoredState>(KEY);
    if (!state) return { paints: [], version: CURRENT_VERSION };
    return {
      paints: Array.isArray(state.paints) ? state.paints : [],
      version: typeof state.version === "number" ? state.version : CURRENT_VERSION,
    };
  } catch {
    return { paints: [], version: CURRENT_VERSION };
  }
}

export async function saveState(paints: Paint[]) {
  await idbSet(KEY, { paints, version: CURRENT_VERSION });
}

export async function clearAll() {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).delete(KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
