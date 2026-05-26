import { useState, useEffect, useCallback } from "react";

export interface VaultEntry {
  email: string;
  password: string;
}

type VaultStore = Record<string, VaultEntry>;

const STORAGE_KEY = "zimbio_vault";

function readStore(): VaultStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as VaultStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: VaultStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

/**
 * Read/write vault credentials for a specific group.
 * Returns null entry if no credentials have been saved yet.
 */
export function useVaultEntry(groupId: string) {
  const [entry, setEntry] = useState<VaultEntry | null>(null);

  useEffect(() => {
    const store = readStore();
    setEntry(store[groupId] ?? null);
  }, [groupId]);

  const save = useCallback(
    (next: VaultEntry) => {
      const store = readStore();
      store[groupId] = next;
      writeStore(store);
      setEntry(next);
    },
    [groupId],
  );

  return { entry, save };
}
