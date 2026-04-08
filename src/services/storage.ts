/**
 * Interface specifying the core methods required by any storage engine.
 * These methods are intended to handle string-based storage,
 * leaving serialization to the StorageService layer.
 */
export interface StorageProvider {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * A concrete implementation of StorageProvider using the browser's localStorage.
 */
class LocalStorageProvider implements StorageProvider {
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
  clear(): void {
    localStorage.clear();
  }
}

/**
 * A generic, provider-agnostic wrapper for persistent storage.
 * Handles serialization (JSON) and provides type-safety.
 */
class StorageService {
  private static instance: StorageService;
  private provider: StorageProvider;

  private constructor(provider: StorageProvider) {
    this.provider = provider;
  }

  /**
   * Returns the singleton instance of the StorageService.
   * If it doesn't exist, it is initialized with a LocalStorageProvider by default.
   */
  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService(new LocalStorageProvider());
    }
    return StorageService.instance;
  }

  /**
   * Swaps the current storage engine for a new one at runtime.
   */
  public setProvider(provider: StorageProvider): void {
    this.provider = provider;
  }

  /**
   * Stores a typed item in the active storage provider.
   */
  public setItem<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      this.provider.setItem(key, serialized);
    } catch (error) {
      console.error(`Failed to save item [${key}] to storage:`, error);
    }
  }

  /**
   * Retrieves and deserializes a typed item from the active storage provider.
   */
  public getItem<T>(key: string): T | null {
    try {
      const stored = this.provider.getItem(key);
      if (!stored) return null;
      return JSON.parse(stored) as T;
    } catch (error) {
      console.error(`Failed to load item [${key}] from storage:`, error);
      return null;
    }
  }

  /**
   * Removes an item from the active storage provider.
   */
  public removeItem(key: string): void {
    try {
      this.provider.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item [${key}] from storage:`, error);
    }
  }

  /**
   * Clears all items from the active storage provider.
   */
  public clear(): void {
    try {
      this.provider.clear();
    } catch (error) {
      console.error("Failed to clear storage:", error);
    }
  }
}

/**
 * Export the default storage singleton.
 */
export const storage = StorageService.getInstance();
