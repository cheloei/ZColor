/**
 * Entry point for Favorites page.
 * Renders the favorites view and initializes the gradient modal.
 */

import { renderFavorites } from '../../common/services/common/favorites/favoritesRender.js'; 
import { setupModal } from '../../common/services/color/gradient.js'; 

(async () => {
    const container = document.getElementById('favorites-container');
    if (container) await renderFavorites(container);
    setupModal();   // enables gradient modal functionality
})();