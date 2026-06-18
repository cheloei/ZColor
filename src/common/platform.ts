type StorageObject = Record<string, any>;

export const Platform = {
  isElectron(): boolean {
    return typeof window !== "undefined" && !!(window as any).zcolor;
  },

  isChrome(): boolean {
    return (
      typeof chrome !== "undefined" && !!chrome.runtime && !!chrome.storage
    );
  },

  isBrowser(): boolean {
    return !this.isElectron() && !this.isChrome();
  },
  isDevServer(): boolean {
    return (
      typeof window !== "undefined" && !!(window as any).__ZCOLOR_DEV_SERVER__
    );
  },

  async getStorage(key: string): Promise<any> {
    if (this.isElectron()) {
      return (window as any).zcolor.storage.get(key);
    }

    if (this.isChrome()) {
      return new Promise((resolve) => {
        chrome.storage.local.get(key, resolve);
      });
    }

    const value = localStorage.getItem(key);

    return {
      [key]: value ? JSON.parse(value) : null,
    };
  },

  async setStorage(data: StorageObject): Promise<void> {
    if (this.isElectron()) {
      await (window as any).zcolor.storage.set(data);
      return;
    }

    if (this.isChrome()) {
      await chrome.storage.local.set(data);
      return;
    }

    for (const [key, value] of Object.entries(data)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  async removeStorage(key: string): Promise<void> {
    if (this.isElectron()) {
      await (window as any).zcolor.storage.remove?.(key);
      return;
    }

    if (this.isChrome()) {
      await chrome.storage.local.remove(key);
      return;
    }

    localStorage.removeItem(key);
  },

  async clearStorage(): Promise<void> {
    if (this.isElectron()) {
      await (window as any).zcolor.storage.clear?.();
      return;
    }

    if (this.isChrome()) {
      await chrome.storage.local.clear();
      return;
    }

    localStorage.clear();
  },

  getAssetUrl(relativePath: string): string {
    if (this.isChrome()) {
      return chrome.runtime.getURL(relativePath);
    }
    if (this.isDevServer()) {
      return relativePath;
    }

    const pathname = window.location.pathname;
    const base = pathname.replace(/\/html\/.*$/, "");
    const path = relativePath.startsWith("/")
      ? relativePath
      : "/" + relativePath;
    return base + path;
  },
};
