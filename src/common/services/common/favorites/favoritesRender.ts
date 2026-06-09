/**
 * Renders the favorites page.
 * Shows saved colors as color boxes and saved gradients as gradient cards.
 */

import { getFavorites, removeFavorite, FavoriteItem } from './favorites.js';
import { showToast } from '../common.js';
import { openGradientModal, Gradient } from '../../color/gradient.js';

export async function renderFavorites(container: HTMLElement): Promise<void> {
    const favorites = await getFavorites();
    container.innerHTML = '';
    if (favorites.length === 0) {
        container.innerHTML = '<div class="empty-message">✨ No favorites yet. Click the star on any color or gradient to add.</div>';
        return;
    }

    const colorFavs = favorites.filter(f => f.type === 'color');
    const gradientFavs = favorites.filter(f => f.type === 'gradient');

    // ----- Colors section -----
    if (colorFavs.length) {
        const colorSection = document.createElement('div');
        colorSection.className = 'favorites-section';
        colorSection.innerHTML = `<h3>🎨 Favorite Colors (${colorFavs.length})</h3>`;
        const grid = document.createElement('div');
        grid.className = 'favorites-color-grid';
        for (const fav of colorFavs) {
            const hex = fav.data as string;
            const box = document.createElement('div');
            box.className = 'color-box';
            box.style.backgroundColor = hex;
            box.innerHTML = `<div class="hex">${hex}</div>`;
            const removeBtn = document.createElement('span');
            removeBtn.className = 'remove-fav';
            removeBtn.textContent = '🗑️';
            box.appendChild(removeBtn);
            removeBtn.onclick = async (e) => {
                e.stopPropagation();
                await removeFavorite(fav.id);
                renderFavorites(container);
            };
            box.onclick = async () => {
                await navigator.clipboard.writeText(hex);
                showToast(`✅ ${hex} copied!`);
            };
            grid.appendChild(box);
        }
        colorSection.appendChild(grid);
        container.appendChild(colorSection);
    }

    // ----- Gradients section -----
    if (gradientFavs.length) {
        const gradSection = document.createElement('div');
        gradSection.className = 'favorites-section';
        gradSection.innerHTML = `<h3>🌈 Favorite Gradients (${gradientFavs.length})</h3>`;
        const grid = document.createElement('div');
        grid.className = 'favorites-gradient-grid';
        for (const fav of gradientFavs) {
            const grad = fav.data as Gradient;
            const card = document.createElement('div');
            card.className = 'gradient-card';
            card.innerHTML = `
                <div class="gradient-preview" style="background: ${grad.css};"></div>
                <div class="gradient-info">${grad.name}</div>
            `;
            const removeBtn = document.createElement('span');
            removeBtn.className = 'remove-fav';
            removeBtn.textContent = '🗑️';
            card.appendChild(removeBtn);
            removeBtn.onclick = async (e) => {
                e.stopPropagation();
                await removeFavorite(fav.id);
                renderFavorites(container);
            };
            card.onclick = () => openGradientModal(grad);
            grid.appendChild(card);
        }
        gradSection.appendChild(grid);
        container.appendChild(gradSection);
    }
}