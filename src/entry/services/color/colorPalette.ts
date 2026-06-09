/**
 * Entry point for Color Palette page.
 * Loads color data, renders the palette, and sets up the image picker button.
 */

import { loadColorData, renderColorPalette } from '../../../common/services/color/hex/colorPalette.js'
import { initImageColorPicker, openImageColorPicker } from '../../../common/services/color/hex/imageColorPicker.js';

(async () => {
    // load data from pre‑generated JSON
    await loadColorData();
    const container = document.getElementById('color-palette-container');
    if (container) renderColorPalette(container);

    // initialise image color picker modal (creates DOM once)
    initImageColorPicker();

    // attach the open handler to the button in the header
    const pickerBtn = document.getElementById('image-picker-btn');
    if (pickerBtn) {
        // replace any existing listener to avoid duplicates
        pickerBtn.onclick = () => openImageColorPicker();
    }
})();