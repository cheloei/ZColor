// src/entry/services/color/gradient.ts
import { loadGradientData, renderGradientGallery, setupModal, initFloatingBuilder } from '../../../common/services/color/gradient.js';

(async () => {
    await loadGradientData();
    const container = document.getElementById('gradient-container');
    if (container) renderGradientGallery(container);
    setupModal();
    initFloatingBuilder();
})();