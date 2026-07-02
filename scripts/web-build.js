// scripts/chrome.js
const path = require('path');
const fs = require('fs');
const utils = require('./build-utils.js');

const distDir = path.join(__dirname, '../dist');
const dirs = {
    data: path.join(distDir, 'data'),
    html: path.join(distDir, 'html'),
    css: path.join(distDir, 'css'),
    assets: path.join(distDir, 'assets'),
    icons: path.join(distDir, 'icons')
};
Object.values(dirs).forEach(utils.ensureDir);

console.log('🔵 Building Chrome extension...\n');

// 1. Copy manifest.json from chrome folder
utils.copyFile(path.join(__dirname, '../src/chrome/manifest.json'), path.join(distDir, 'manifest.json'));

// 2. Copy HTML from common/html
console.log('\n📄 HTML files');
const srcHtml = path.join(__dirname, '../src/common/html');
if (fs.existsSync(srcHtml)) utils.copyHtmlRecursive(srcHtml, dirs.html);
else console.warn('   ⚠️ src/common/html not found');

// 3. Copy CSS from common/css
console.log('\n🎨 CSS files');
const srcCss = path.join(__dirname, '../src/common/css');
if (fs.existsSync(srcCss)) utils.copyCssRecursive(srcCss, dirs.css);
else console.warn('   ⚠️ src/common/css not found');

// 4. Copy assets (icon.png)
const srcAssets = path.join(__dirname, '../src/common/assets');
if (fs.existsSync(srcAssets)) {
    utils.copyFile(path.join(srcAssets, 'icon.png'), path.join(dirs.assets, 'icon.png'));
    utils.copyFile(path.join(srcAssets, 'icon.ico'), path.join(dirs.assets, 'icon.ico'));
} else {
    console.warn('   ⚠️ src/common/assets not found');
}

// 5. Copy SVG icons (required for Icon Builder)
console.log('\n🔧 Icon libraries');
const iconLibs = [
    { name: 'Font Awesome', src: 'node_modules/@fortawesome/fontawesome-free/svgs', dest: 'icons/fontawesome' },
    { name: 'Bootstrap Icons', src: 'node_modules/bootstrap-icons/icons', dest: 'icons/bootstrap-icons' },
    { name: 'Remix Icon', src: 'node_modules/remixicon/icons', dest: 'icons/remixicon' },
    { name: 'Lucide Icons', src: 'node_modules/lucide-static/icons', dest: 'icons/lucide' },
    { name: 'Phosphor Icons', src: 'node_modules/@phosphor-icons/core/assets', dest: 'icons/phosphor' },
    { name: 'Material Icons', src: 'node_modules/@material-design-icons/svg', dest: 'icons/material-icons' },
    { name: 'Feather Icons', src: 'node_modules/feather-icons/dist/icons', dest: 'icons/feather' },
    {name: 'Brand Icons', src: 'node_modules/@aasaam/brand-icons/svg', dest: 'icons/brand-icons'}
];
for (const lib of iconLibs) {
    console.log(`\n📦 ${lib.name}`);
    const srcPath = path.join(__dirname, '..', lib.src);
    if (fs.existsSync(srcPath)) {
        utils.copyFolder(srcPath, path.join(distDir, lib.dest), true);
        console.log(`   ✅ ${lib.name} SVGs optimized`);
    } else {
        console.warn(`   ⚠️ ${lib.name} not installed – run npm install`);
    }
}

// 6. Generate JSON data (colors, gradients, icons)
console.log('\n📊 Generating JSON');
utils.generateJsonData(dirs.data);

console.log('\n✅ Web build complete');