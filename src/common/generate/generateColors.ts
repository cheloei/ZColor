// ================================
//  Color Data Generator
//  Functions to generate, filter, and categorize RGB colors into HSL-based groups.
//  Used by build script to pre‑generate colors.json.
// ================================

/**
 * Generate all RGB colors with a given step for each channel.
 * @param step - Increment step for R, G, B (0-255). Default 15.
 * @returns Array of hex color strings (e.g. "#ff0000").
 */
export function generateOptimizedRGBColors(step: number = 15): string[] {
    const hexes: string[] = [];
    for (let r = 0; r <= 255; r += step) {
        for (let g = 0; g <= 255; g += step) {
            for (let b = 0; b <= 255; b += step) {
                const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                hexes.push(hex);
            }
        }
    }
    return hexes;
}

/**
 * Convert RGB to HSL color space.
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 * @returns Object with h (0-360), s (0-100), l (0-100).
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max === min) {
        h = 0;
        s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            default:
                h = (r - g) / d + 4;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Filter out colors that are too similar (Euclidean distance in RGB space).
 * @param hexes - Array of hex color strings.
 * @param minDistance - Minimum allowed distance between colors. Default 25.
 * @returns Filtered array of hex strings.
 */
export function filterSimilarColors(hexes: string[], minDistance: number = 25): string[] {
    const unique: string[] = [];
    for (const hex of hexes) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        let tooClose = false;
        for (const existing of unique) {
            const er = parseInt(existing.slice(1, 3), 16);
            const eg = parseInt(existing.slice(3, 5), 16);
            const eb = parseInt(existing.slice(5, 7), 16);
            const dr = er - r, dg = eg - g, db = eb - b;
            if (Math.sqrt(dr * dr + dg * dg + db * db) < minDistance) {
                tooClose = true;
                break;
            }
        }
        if (!tooClose) unique.push(hex);
    }
    return unique;
}

/**
 * Categorize hex colors into named groups based on HSL values.
 * @param hexes - Array of hex color strings.
 * @returns Object where keys are category names and values are arrays of objects { hex: string }.
 */
export function categorizeColors(hexes: string[]): Record<string, { hex: string }[]> {
    const categories: Record<string, { hex: string }[]> = {
        red: [], orange: [], yellow: [], green: [], cyan: [],
        blue: [], purple: [], magenta: [], pink: [], brown: [],
        gray: [], white: [], black: []
    };
    for (const hex of hexes) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const { h, s, l } = rgbToHsl(r, g, b);
        // Neutral colors (low saturation)
        if (s < 10) {
            if (l > 90) categories.white.push({ hex });
            else if (l < 10) categories.black.push({ hex });
            else categories.gray.push({ hex });
            continue;
        }
        // Hue-based classification
        if (h < 15 || h >= 345) categories.red.push({ hex });
        else if (h < 45) categories.orange.push({ hex });
        else if (h < 75) categories.yellow.push({ hex });
        else if (h < 165) categories.green.push({ hex });
        else if (h < 195) categories.cyan.push({ hex });
        else if (h < 255) categories.blue.push({ hex });
        else if (h < 285) categories.purple.push({ hex });
        else if (h < 315) categories.magenta.push({ hex });
        else if (h < 345) categories.pink.push({ hex });
        // Special case: brown (warm, low lightness, moderate saturation)
        if ((h >= 10 && h < 45) && l < 40 && s > 20) categories.brown.push({ hex });
    }
    // Remove empty categories
    for (const key in categories) {
        if (categories[key].length === 0) delete categories[key];
    }
    return categories;
}