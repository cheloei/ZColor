const fs = require("fs");
const path = require("path");

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * SAFE ignore check (based on path segments, not includes)
 */
function shouldIgnore(relPath, ignoreList = []) {
    if (!ignoreList.length) return false;

    const parts = relPath.split(path.sep);

    return ignoreList.some(i => parts.includes(i));
}

function copyFile(src, dest) {
    if (!fs.existsSync(src)) {
        console.warn(`   ⚠️ Missing: ${src}`);
        return false;
    }

    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);

    return true;
}

/**
 * MAIN FIXED COPY FUNCTION
 */
function copyFolder(src, dest, optimizeSvg = false, options = {}, basePath = "") {
    if (!fs.existsSync(src)) {
        console.warn(`⚠️ Folder not found: ${src}`);
        return;
    }

    const {
        verbose = false,
        logEvery = 1000,
        ignore = []
    } = options;

    ensureDir(dest);

    const entries = fs.readdirSync(src, { withFileTypes: true });

    let counter = 0;

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const relPath = path.join(basePath, entry.name);
        const dstPath = path.join(dest, entry.name);

        // 🚫 SAFE IGNORE
        if (shouldIgnore(relPath, ignore)) {
            continue;
        }

        if (entry.isDirectory()) {
            copyFolder(srcPath, dstPath, optimizeSvg, options, relPath);
            continue;
        }

        if (!entry.isFile()) continue;

        const ext = path.extname(entry.name).toLowerCase();

        // 🎨 SVG OPTIMIZATION
        if (ext === ".svg" && optimizeSvg) {
            let content = fs.readFileSync(srcPath, "utf8");

            content = content
                .replace(/<\?xml[^?]*\?>\s*/g, "")
                .replace(/<!--[\s\S]*?-->/g, "")
                .replace(/\s+id="[^"]*"/g, "")
                .replace(/\s+class="[^"]*"/g, "")
                .replace(/\s+data-[a-z-]+="[^"]*"/g, "")
                .replace(/>\s+</g, "><")
                .trim();

            fs.writeFileSync(dstPath, content);
        } else {
            // 📦 COPY ALL FILE TYPES (exe, dll, png, js, json, etc.)
            fs.copyFileSync(srcPath, dstPath);
        }

        counter++;

        // 📊 minimal logging (NOT per-file spam)
        if (verbose && counter % logEvery === 0) {
            process.stdout.write(`\r📦 Copied ${counter} files...`);
        }
    }

    if (verbose) {
        console.log(`\n✅ Copy done: ${counter} files from ${src}`);
    }
}

/**
 * HTML COPY (unchanged but safe)
 */
function copyHtmlRecursive(src, destRoot, relative = "") {
    if (!fs.existsSync(src)) return;

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const e of entries) {
        const fullSrc = path.join(src, e.name);
        const rel = relative ? path.join(relative, e.name) : e.name;

        if (e.isDirectory()) {
            copyHtmlRecursive(fullSrc, destRoot, rel);
        } else if (e.name.endsWith(".html")) {
            const destFull = path.join(destRoot, rel);

            ensureDir(path.dirname(destFull));

            const content = fs.readFileSync(fullSrc, "utf8");
            fs.writeFileSync(destFull, content);

            console.log(`   ✅ ${e.name}`);
        }
    }
}

/**
 * CSS COPY (unchanged but safe)
 */
function copyCssRecursive(src, destRoot, relative = "") {
    if (!fs.existsSync(src)) return;

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const e of entries) {
        const fullSrc = path.join(src, e.name);
        const rel = relative ? path.join(relative, e.name) : e.name;

        if (e.isDirectory()) {
            copyCssRecursive(fullSrc, destRoot, rel);
        } else if (e.name.endsWith(".css")) {
            const destFull = path.join(destRoot, rel);

            ensureDir(path.dirname(destFull));
            fs.copyFileSync(fullSrc, destFull);
        }
    }
}

function generateJsonData(dataDir) {
    require("ts-node").register();

    const genColors = require("../src/common/generate/generateColors.ts");
    const all = genColors.generateOptimizedRGBColors(15);
    const uniq = genColors.filterSimilarColors(all, 25);
    const cats = genColors.categorizeColors(uniq);

    fs.writeFileSync(
        path.join(dataDir, "colors.json"),
        JSON.stringify(cats, null, 2)
    );

    const genGrads = require("../src/common/generate/generateGradients.ts");
    const grads = genGrads.generateProfessionalGradients();

    fs.writeFileSync(
        path.join(dataDir, "gradients.json"),
        JSON.stringify(grads, null, 2)
    );

    const genIcons = require("../src/common/generate/generateIcons.ts");
    const icons = genIcons.generateIcons();

    fs.writeFileSync(
        path.join(dataDir, "icons.json"),
        JSON.stringify(icons, null, 2)
    );

    console.log(`   ✅ JSON generated`);
}

module.exports = {
    ensureDir,
    copyFile,
    copyFolder,
    copyHtmlRecursive,
    copyCssRecursive,
    generateJsonData
};