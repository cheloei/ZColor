/**
 * Entry point for Icon Builder page
 * Loads icons, colors, gradients and renders the builder UI.
 */

import { loadIconsData, loadColorDataForPicker, loadGradientsForPicker, renderIconBuilder } from '../../../common/services/icon/iconBuilder.js';

(async () => {
    await loadIconsData();
    await loadColorDataForPicker();
    await loadGradientsForPicker();
    const container = document.getElementById('icon-builder-container');
    if (container) renderIconBuilder(container);
})();