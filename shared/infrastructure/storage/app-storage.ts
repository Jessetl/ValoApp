type StorageLike = {
  getString: (key: string) => string | undefined;
  getBoolean: (key: string) => boolean | undefined;
  set: (key: string, value: string | boolean) => void;
  remove: (key: string) => void;
  contains: (key: string) => boolean;
  clearAll: () => void;
};

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string | boolean>();

  return {
    getString: (key: string): string | undefined => {
      const value = map.get(key);
      return typeof value === 'string' ? value : undefined;
    },
    getBoolean: (key: string): boolean | undefined => {
      const value = map.get(key);
      return typeof value === 'boolean' ? value : undefined;
    },
    set: (key: string, value: string | boolean): void => {
      map.set(key, value);
    },
    remove: (key: string): void => {
      map.delete(key);
    },
    contains: (key: string): boolean => map.has(key),
    clearAll: (): void => {
      map.clear();
    },
  };
}

function createStorage(): StorageLike {
  try {
    const maybeRequire = (globalThis as { require?: (id: string) => unknown })
      .require;

    if (!maybeRequire) {
      return createMemoryStorage();
    }

    const { createMMKV } = maybeRequire('react-native-mmkv') as {
      createMMKV: (config: { id: string }) => StorageLike;
    };
    return createMMKV({ id: 'valo-app-storage' }) as StorageLike;
  } catch {
    return createMemoryStorage();
  }
}

const storage = createStorage();

export const appStorage = {
  getString: (key: string): string | undefined => storage.getString(key),
  setString: (key: string, value: string): void => storage.set(key, value),
  getBoolean: (key: string): boolean | undefined => storage.getBoolean(key),
  setBoolean: (key: string, value: boolean): void => storage.set(key, value),
  remove: (key: string): void => {
    storage.remove(key);
  },
  contains: (key: string): boolean => storage.contains(key),
  clearAll: (): void => storage.clearAll(),
} as const;

// Adaptador para Zustand persist middleware
export const mmkvZustandStorage = {
  getItem: (name: string): string | null => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.remove(name);
  },
} as const;
