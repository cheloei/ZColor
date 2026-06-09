/**
 * Image Color Picker Module
 * Creates a modal that allows uploading an image and picking a color by clicking.
 * Uses emoji instead of font icons.
 */

import { showToast } from '../../common/common.js';

let modal: HTMLElement | null = null;

/**
 * Initializes the image color picker modal (creates DOM elements if not already present).
 */
export function initImageColorPicker(): void {
    if (document.getElementById('image-color-picker-modal')) return;

    modal = document.createElement('div');
    modal.id = 'image-color-picker-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <span class="modal-close">&times;</span>
            <h3>🔍 Pick color from image</h3>
            <input type="file" id="upload-image" accept="image/*" style="margin: 1rem 0;">
            <canvas id="image-canvas" style="max-width: 100%; border-radius: 12px; cursor: crosshair; display: none;"></canvas>
            <div id="selected-color-info" style="margin-top: 1rem; font-family: monospace;"></div>
        </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.modal-close');
    const fileInput = modal.querySelector('#upload-image') as HTMLInputElement;
    const canvas = modal.querySelector('#image-canvas') as HTMLCanvasElement;
    const colorInfo = modal.querySelector('#selected-color-info') as HTMLElement;
    let ctx: CanvasRenderingContext2D | null = null;
    let img = new Image();

    fileInput.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.style.maxWidth = '100%';
                canvas.style.height = 'auto';
                ctx = canvas.getContext('2d');
                ctx!.drawImage(img, 0, 0, img.width, img.height);
                canvas.style.display = 'block';
                colorInfo.innerHTML = 'Click on the image to pick a color';
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    canvas.onclick = (e) => {
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            const hex = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
            navigator.clipboard.writeText(hex);
            colorInfo.innerHTML = `✅ Color copied: ${hex}`;
            showToast(`🎨 ${hex} copied!`);
            setTimeout(() => modal!.style.display = 'none', 1000);
        }
    };

    closeBtn?.addEventListener('click', () => {
        if (modal) modal.style.display = 'none';
    });
}

/**
 * Opens the image color picker modal (resets previous state).
 */
export function openImageColorPicker(): void {
    if (!modal) {
        initImageColorPicker();
        modal = document.getElementById('image-color-picker-modal');
    }
    if (!modal) return;
    const fileInput = modal.querySelector('#upload-image') as HTMLInputElement;
    const canvas = modal.querySelector('#image-canvas') as HTMLCanvasElement;
    const colorInfo = modal.querySelector('#selected-color-info') as HTMLElement;
    if (fileInput) fileInput.value = '';
    if (canvas) canvas.style.display = 'none';
    if (colorInfo) colorInfo.innerHTML = '';
    modal.style.display = 'block';
}