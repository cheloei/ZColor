// src/services/common/favorites/favorites.ts
import { showToast } from '../common.js';
import { Gradient } from '../../color/gradient.js';
import { Platform } from "../../../platform.js";

export interface FavoriteItem {
    id: string;
    type: 'color' | 'gradient';
    data: string | Gradient;
    timestamp: number;
}

const STORAGE_KEY = 'favorites';

// ✅ Detect if chrome.storage is available
function isChromeStorageAvailable(): boolean {
    return (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) as boolean;
}

async function getFavoritesFromStorage() {
    const result = await Platform.getStorage(STORAGE_KEY);

    return Array.isArray(result[STORAGE_KEY])
        ? result[STORAGE_KEY]
        : [];
}

async function setFavoritesToStorage(items: FavoriteItem[]) {
    await Platform.setStorage({
        [STORAGE_KEY]: items
    });
}

export async function getFavorites(): Promise<FavoriteItem[]> {
    return getFavoritesFromStorage();
}

export async function addFavorite(item: Omit<FavoriteItem, 'timestamp'>): Promise<void> {
    const favs = await getFavorites();
    if (favs.some(f => f.id === item.id)) {
        showToast('Already in favorites!', 1000);
        return;
    }
    const newItem: FavoriteItem = { ...item, timestamp: Date.now() };
    favs.push(newItem);
    await setFavoritesToStorage(favs);
    showToast('Added to favorites ❤️', 1000);
}

export async function removeFavorite(id: string): Promise<void> {
    let favs = await getFavorites();
    favs = favs.filter(f => f.id !== id);
    await setFavoritesToStorage(favs);
    showToast('Removed from favorites', 1000);
}

export async function isFavorite(id: string): Promise<boolean> {
    const favs = await getFavorites();
    return favs.some(f => f.id === id);
}