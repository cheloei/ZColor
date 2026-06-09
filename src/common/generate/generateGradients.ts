// ================================
//  Gradient Data Generator
//  Pre-generates a variety of linear and radial gradients based on usage categories.
//  Used by build script to pre‑generate gradients.json.
// ================================

export interface GradientStop {
    color: string;
    position: number;
}

export interface GeneratedGradient {
    id: number;
    usage: string;
    colorCount: number;
    name: string;
    css: string;
    stops: GradientStop[];
    direction: string;
    type: 'linear' | 'radial';
}

/**
 * Convert HSL values to a hex color string.
 * @param h - Hue (0‑360)
 * @param s - Saturation (0‑100)
 * @param l - Lightness (0‑100)
 * @returns Hex color string (e.g. "#ff0000").
 */
function hslToHex(h: number, s: number, l: number): string {
    h = ((h % 360) + 360) % 360;
    s = Math.min(100, Math.max(0, s)) / 100;
    l = Math.min(100, Math.max(0, l)) / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r1: number, g1: number, b1: number;
    if (h < 60) { r1 = c; g1 = x; b1 = 0; }
    else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
    else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
    else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
    else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
    else { r1 = c; g1 = 0; b1 = x; }
    const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
}

// Usage categories: each defines a set of base hues and ranges for saturation/lightness.
const usageCategories = {
    Nature: { hues: [30, 60, 90, 120, 150], satRange: [40, 80], lightRange: [35, 70] },
    Technology: { hues: [180, 210, 240, 270, 300], satRange: [70, 98], lightRange: [45, 75] },
    Romantic: { hues: [330, 350, 10, 20], satRange: [65, 95], lightRange: [60, 85] },
    Classic: { hues: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330], satRange: [30, 70], lightRange: [40, 70] },
    Vibrant: { hues: [10, 50, 90, 130, 170, 210, 250, 290, 330], satRange: [80, 100], lightRange: [55, 85] },
    Pastel: { hues: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330], satRange: [15, 35], lightRange: [70, 90] },
    Dark: { hues: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330], satRange: [40, 80], lightRange: [15, 35] },
    Corporate: { hues: [200, 210, 220, 230, 240], satRange: [30, 60], lightRange: [35, 65] }
};

// Common linear gradient directions.
const linearDirections = [
    '135deg', '45deg', '90deg', '0deg', '180deg', '270deg', '315deg', '225deg',
    'to top', 'to bottom', 'to left', 'to right', 'to top right', 'to bottom left', 'to top left', 'to bottom right'
];

// Radial gradient types (kept minimal as they are rarely used).
const radialTypes = ['circle', 'ellipse'];

/**
 * Generate a single gradient object for a given usage, color count, and direction.
 * @param usageName - Name of the usage category (e.g., "Nature").
 * @param usageDef - The category definition containing hues, satRange, lightRange.
 * @param colorCount - Number of color stops (2‑6).
 * @param direction - CSS direction string or empty string for radial gradients.
 * @param isRadial - Whether this is a radial gradient.
 * @param radialType - Radial gradient shape/size (used only if isRadial is true).
 * @returns A complete GeneratedGradient object.
 */
function generateGradientByCount(
    usageName: string,
    usageDef: typeof usageCategories[keyof typeof usageCategories],
    colorCount: number,
    direction: string,
    isRadial: boolean = false,
    radialType: string | null = null
): GeneratedGradient {
    const baseHue = usageDef.hues[Math.floor(Math.random() * usageDef.hues.length)];
    const hues: number[] = [baseHue];
    for (let i = 1; i < colorCount; i++) {
        const variation = (Math.random() - 0.5) * 30;
        const newHue = (baseHue + variation + 360) % 360;
        hues.push(newHue);
    }
    const stops: GradientStop[] = [];
    for (let i = 0; i < colorCount; i++) {
        let sat = usageDef.satRange[0] + Math.random() * (usageDef.satRange[1] - usageDef.satRange[0]);
        let light = usageDef.lightRange[0] + Math.random() * (usageDef.lightRange[1] - usageDef.lightRange[0]);
        sat += (Math.random() - 0.5) * 15;
        light += (Math.random() - 0.5) * 15;
        sat = Math.min(98, Math.max(15, sat));
        light = Math.min(92, Math.max(20, light));
        const color = hslToHex(hues[i], sat, light);
        const position = (i / (colorCount - 1)) * 100;
        stops.push({ color, position });
    }
    let css: string;
    if (isRadial && radialType) {
        css = `radial-gradient(${radialType}, ${stops.map(s => `${s.color} ${s.position}%`).join(', ')})`;
    } else {
        css = `linear-gradient(${direction}, ${stops.map(s => `${s.color} ${s.position}%`).join(', ')})`;
    }
    const typeLabel = isRadial ? `radial (${radialType})` : direction;
    return {
        id: Math.random(),
        usage: usageName,
        colorCount,
        name: `${usageName} · ${colorCount}-color · ${typeLabel}`,
        css,
        stops,
        direction: isRadial ? radialType! : direction,
        type: isRadial ? 'radial' : 'linear'
    };
}

/**
 * Generate a large set of unique, professional gradients (2‑6 colors, multiple directions).
 * @returns Array of GeneratedGradient objects (approximately 2000+ gradients).
 */
export function generateProfessionalGradients(): GeneratedGradient[] {
    const gradients: GeneratedGradient[] = [];
    const colorCounts = [2, 3, 4, 5, 6];
    for (const [usageName, usageDef] of Object.entries(usageCategories)) {
        for (const count of colorCounts) {
            const dirsToUse = count <= 4 ? linearDirections : linearDirections.slice(0, 8);
            for (const dir of dirsToUse) {
                if (gradients.length > 2800) break;
                gradients.push(generateGradientByCount(usageName, usageDef, count, dir, false));
            }
            // Generate radial gradients only for 2‑4 colors (keep limited)
            if (count <= 4) {
                for (const radType of radialTypes) {
                    if (gradients.length > 2800) break;
                    gradients.push(generateGradientByCount(usageName, usageDef, count, '', true, radType));
                }
            }
            if (gradients.length > 2800) break;
        }
        if (gradients.length > 2800) break;
    }
    // Remove duplicates (by CSS string)
    const unique: GeneratedGradient[] = [];
    const cssSet = new Set<string>();
    for (const g of gradients) {
        if (!cssSet.has(g.css)) {
            cssSet.add(g.css);
            unique.push(g);
        }
        if (unique.length >= 2200) break;
    }
    return unique;
}