// ================================
//  Icon Data Generator
//  Scans installed npm packages for SVG icons and builds a manifest (icons.json).
//  Used by build script to generate the icon list for the Icon Builder.
// ================================

import * as fs from 'fs';
import * as path from 'path';

/**
 * Configuration for an icon library.
 */
interface IconLibrary {
    name: string;       // Display name of the library
    srcDir: string;     // Relative path to the folder containing SVG files
    destPrefix: string; // Destination folder name under dist/icons/
    gradientSupport: boolean;
}

// List of supported icon libraries (must be installed via npm).
const libraries: IconLibrary[] = [
    { name: 'Font Awesome', srcDir: 'node_modules/@fortawesome/fontawesome-free/svgs', destPrefix: 'fontawesome', gradientSupport: true },
    { name: 'Bootstrap Icons', srcDir: 'node_modules/bootstrap-icons/icons', destPrefix: 'bootstrap-icons', gradientSupport: true },
    { name: 'Remix Icon', srcDir: 'node_modules/remixicon/icons', destPrefix: 'remixicon', gradientSupport: true },
    { name: 'Lucide Icons', srcDir: 'node_modules/lucide-static/icons', destPrefix: 'lucide', gradientSupport: true },
    { name: 'Phosphor Icons', srcDir: 'node_modules/@phosphor-icons/core/assets', destPrefix: 'phosphor', gradientSupport: true },
    { name: 'Material Icons (Google)', srcDir: 'node_modules/@material-design-icons/svg', destPrefix: 'material-icons', gradientSupport: true },
    { name: 'Feather Icons', srcDir: 'node_modules/feather-icons/dist/icons', destPrefix: 'feather', gradientSupport: true },
    {name: 'Brand Icons', srcDir: 'node_modules/@aasaam/brand-icons/svg', destPrefix: 'brand-icons', gradientSupport: false }
];

/**
 * Recursively walks a directory to collect all .svg files.
 * @param dir - Directory to scan.
 * @param library - Name of the library (for metadata).
 * @param destPrefix - Destination folder prefix (used to build final URL path).
 * @param result - Output array where icon objects will be pushed.
 */
function walkDir(dir: string, library: string, destPrefix: string, result: any[]): void {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            // Recurse into subdirectories (e.g., Font Awesome has /solid, /regular, /brands)
            walkDir(full, library, destPrefix, result);
        } else if (entry.isFile() && entry.name.endsWith('.svg')) {
            // Compute relative path from the library's source root to preserve folder structure.
            const srcBase = path.join(process.cwd(), libraries.find(l => l.name === library)!.srcDir);
            const relativeFromSrc = path.relative(srcBase, full).replace(/\\/g, '/');
            // Final URL path inside the extension
            const finalPath = `/icons/${destPrefix}/${relativeFromSrc}`;
            const name = path.basename(entry.name, '.svg');
            result.push({
                id: `${library}/${name}`,      // unique identifier
                library: library,
                name: name,                   // human-readable icon name (e.g., "alarm")
                path: finalPath,               // extension internal path
                gradientSupport: libraries.find(x => x.name == library)?.gradientSupport
            });
        }
    }
}

/**
 * Generates the complete list of icons by scanning all configured libraries.
 * @returns Array of icon objects containing id, library, name, and path.
 */
export function generateIcons(): any[] {
    const icons: any[] = [];
    for (const lib of libraries) {
        const srcPath = path.join(process.cwd(), lib.srcDir);
        if (!fs.existsSync(srcPath)) {
            console.warn(`[generateIcons] Source not found: ${lib.srcDir} (library may not be installed)`);
            continue;
        }
        walkDir(srcPath, lib.name, lib.destPrefix, icons);
        const count = icons.filter(i => i.library === lib.name).length;
        console.log(`[generateIcons] ${lib.name}: ${count} SVGs`);
    }
    return icons;
}