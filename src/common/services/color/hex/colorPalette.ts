/**
 * Color Palette Module
 * Loads color categories from pre‑generated JSON and renders interactive boxes.
 * No external font icons — uses emoji stars and Unicode chevrons.
 */

/// <reference types="chrome" />

import { loadJSON, showToast } from '../../common/common.js';
import { addFavorite, isFavorite, removeFavorite } from '../../common/favorites/favorites.js';

export interface SimpleColor {
    hex: string;
}

let categoriesData: Record<string, SimpleColor[]> | null = null;

/**
 * Load color data from pre‑generated colors.json.
 * @returns Record of category names to array of { hex } objects.
 */
export async function loadColorData(): Promise<Record<string, SimpleColor[]>> {
    categoriesData = await loadJSON<Record<string, SimpleColor[]>>('/data/colors.json');
    return categoriesData;
}

/**
 * Render the entire color palette inside the given container.
 * Creates collapsible categories and color boxes with favorite stars.
 * @param container - HTMLElement where the palette will be injected.
 */
export function renderColorPalette(container: HTMLElement): void {
    if (!categoriesData) return;
    container.innerHTML = '';

    for (const [catName, colorList] of Object.entries(categoriesData)) {
        if (!colorList.length) continue;

        // --- category card ---
        const card = document.createElement('div');
        card.className = 'color-container hide'; // initially collapsed

        // header (click to toggle)
        const header = document.createElement('div');
        header.className = 'card-header';
        header.innerHTML = `
            <h3>${catName} <small>(${colorList.length})</small></h3>
            <span class="chevron">▼</span>
        `;
        header.addEventListener('click', () => card.classList.toggle('hide'));

        // body (grid of colors)
        const body = document.createElement('div');
        body.className = 'card-body';

        for (const color of colorList) {
            const hex = color.hex;
            const box = document.createElement('div');
            box.className = 'color-box';
            box.style.setProperty('--box-bg', hex);
            box.innerHTML = `<div class="hex">${hex}</div>`;

            // favorite star (emoji)
            const star = document.createElement('span');
            star.className = 'favorite-star';
            star.textContent = '⭐';
            star.style.display = 'none';
            box.appendChild(star);

            // mouse events to show/hide star
            box.addEventListener('mouseenter', () => star.style.display = 'block');
            box.addEventListener('mouseleave', () => {
                isFavorite(`color-${hex}`).then(fav => { if (!fav) star.style.display = 'none'; });
            });

            // check initial favorite state
            isFavorite(`color-${hex}`).then(fav => {
                if (fav) star.style.display = 'block';
            });

            // star click: add/remove favorite
            star.addEventListener('click', async (e) => {
                e.stopPropagation();
                const fav = await isFavorite(`color-${hex}`);
                if (fav) {
                    await removeFavorite(`color-${hex}`);
                    star.style.display = 'none';
                } else {
                    await addFavorite({ id: `color-${hex}`, type: 'color', data: hex });
                    star.style.display = 'block';
                }
            });

            // box click: copy hex code
            box.addEventListener('click', async () => {
                await navigator.clipboard.writeText(hex);
                showToast(`✅ ${hex} copied!`);
            });

            body.appendChild(box);
        }

        card.appendChild(header);
        card.appendChild(body);
        container.appendChild(card);
    }
}