// ================================
//  Common Utilities (Toast, JSON loader)
// ================================

import { Platform } from "../../platform.js";

/// <reference types="chrome" />

export function showToast(message: string, duration: number = 1500): void {
    const existing = document.querySelector('.toast-notify');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast-notify';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

export async function loadJSON<T>(url: string): Promise<T> {
    const isChromeExt = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL;
    const fullUrl = Platform.getAssetUrl(url);
    const response = await fetch(fullUrl);
    return response.json();
}