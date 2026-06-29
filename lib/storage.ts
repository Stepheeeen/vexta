/**
 * Safe localStorage wrappers to prevent DOMException / SecurityError crashes
 * when running inside sandboxed webviews (e.g. WhatsApp, Instagram in-app browsers)
 * or when private browsing / blocked cookies are active.
 */

export function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch (e) {
    console.warn(`[storage] safeGetItem failed for key "${key}":`, e);
  }
  return null;
}

export function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn(`[storage] safeSetItem failed for key "${key}":`, e);
  }
}

export function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn(`[storage] safeRemoveItem failed for key "${key}":`, e);
  }
}
