const DB_NAME = "paint_inventory_db";
const STORE = "kv";
const KEY = "state";
const CURRENT_VERSION = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  const db = await openDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function loadState() {
  const state = await idbGet(KEY);
  if (!state) {
    return { paints: [], version: CURRENT_VERSION };
  }
  return {
    paints: Array.isArray(state.paints) ? state.paints : [],
    version: typeof state.version === "number" ? state.version : CURRENT_VERSION,
  };
}

export async function saveState(paints) {
  const state = { paints, version: CURRENT_VERSION };
  await idbSet(KEY, state);
}

export async function clearAll() {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.delete(KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
