// ================================
//  Main Entry Point
// ================================

import { loadColorData } from '../common/services/color/hex/colorPalette.js';
import { loadGradientData } from '../common/services/color/gradient.js'; 
import { showToast } from '../common/services/common/common.js'; 

window.cachedCategories = null;
window.cachedGradients = null;
window.cachedIcons = false;

async function init() {
    document.documentElement.style.width = '100%';
    document.body.style.paddingTop = '70px';
    window.cachedCategories = await loadColorData();
    window.cachedGradients = await loadGradientData();
    window.showToast = showToast;
}
init();