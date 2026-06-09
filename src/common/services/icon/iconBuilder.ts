/**
 * Icon Builder Module – Final with mobile toggle and fixed filter
 * Features:
 * - Icon selection from multiple libraries (with "All" tab)
 * - Search (filters by icon name)
 * - Customisation: solid color (with palette and manual), gradient background, icon size, transparent fill
 * - Output: copy SVG code, download SVG file with naming: library-name-random.svg
 * - Mobile: toggle button to show/hide icon panel
 */

import { loadJSON, showToast } from "../common/common.js";
import { loadColorData, SimpleColor } from "../color/hex/colorPalette.js";
import { Gradient } from "../color/gradient.js";
import { Platform } from "../../platform.js";

interface IconItem {
  id: string;
  library: string;
  name: string;
  path: string;
}

let iconsList: IconItem[] = [];
let currentLibrary = "All";
let searchQuery = "";
let selectedIcon: IconItem | null = null;
let svgContent: string = "";

// customisation state
let colorType: "solid" | "gradient" = "solid";
let solidColor = "#ffffff";
let isTransparent = false;
let selectedGradient: Gradient | null = null;
let iconSize = 64;

let colorCategories: Record<string, SimpleColor[]> = {};
let gradientsList: Gradient[] = [];

export async function loadIconsData(): Promise<void> {
  iconsList = await loadJSON<IconItem[]>("/data/icons.json");
  if (iconsList.length) {
    currentLibrary = "All";
  }
}

export async function loadColorDataForPicker(): Promise<void> {
  colorCategories = await loadColorData();
}

export async function loadGradientsForPicker(): Promise<void> {
  gradientsList = await loadJSON<Gradient[]>("/data/gradients.json");
}

// apply gradient to SVG
function applyGradientToSvg(
  svgString: string,
  gradient: Gradient,
  gradientId: string = "grad",
): string {
  const css = gradient.css;
  const match = css.match(/linear-gradient\(([^,]+),(.+)\)/);
  if (!match) return svgString;
  let direction = match[1].trim();
  const colorsStr = match[2];
  let x1 = "0%",
    y1 = "0%",
    x2 = "100%",
    y2 = "0%";
  if (direction === "135deg") {
    x1 = "100%";
    y1 = "0%";
    x2 = "0%";
    y2 = "100%";
  } else if (direction === "45deg") {
    x1 = "0%";
    y1 = "100%";
    x2 = "100%";
    y2 = "0%";
  } else if (direction === "90deg") {
    x1 = "0%";
    y1 = "0%";
    x2 = "0%";
    y2 = "100%";
  } else if (direction === "0deg") {
    x1 = "0%";
    y1 = "0%";
    x2 = "100%";
    y2 = "0%";
  } else if (direction === "to top") {
    x1 = "0%";
    y1 = "100%";
    x2 = "0%";
    y2 = "0%";
  } else if (direction === "to bottom") {
    x1 = "0%";
    y1 = "0%";
    x2 = "0%";
    y2 = "100%";
  } else if (direction === "to left") {
    x1 = "100%";
    y1 = "0%";
    x2 = "0%";
    y2 = "0%";
  } else if (direction === "to right") {
    x1 = "0%";
    y1 = "0%";
    x2 = "100%";
    y2 = "0%";
  }
  const stops = colorsStr.split(",").map((s) => s.trim());
  const stopElements = stops
    .map((stop, idx) => {
      const [color, percent] = stop.split(" ");
      const offset = percent || `${(idx / (stops.length - 1)) * 100}%`;
      return `<stop offset="${offset}" stop-color="${color}"/>`;
    })
    .join("");
  const defs = `<defs><linearGradient id="${gradientId}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stopElements}</linearGradient></defs>`;
  let result = svgString.replace(/<svg([^>]*)>/, (match, attrs) => {
    return `<svg${attrs}>${defs}`;
  });
  result = result.replace(/fill="[^"]*"/g, `fill="url(#${gradientId})"`);
  return result;
}

export function renderIconBuilder(container: HTMLElement): void {
  container.innerHTML = `
        <div class="icon-builder-main">
            <div class="icon-selector-panel">
                <div class="library-tabs" id="library-tabs"></div>
                <input type="text" id="icon-search" placeholder="Search icons across all libraries..." class="search-input">
                <div id="icon-grid" class="icon-grid"></div>
            </div>
            <div class="icon-customize-panel">
                <div class="preview-area">
                    <div id="icon-preview" class="icon-preview"></div>
                </div>
                <div class="controls">
                    <div class="control-group">
                        <label>Icon Color</label>
                        <div class="color-type-tabs">
                            <button class="color-type-btn ${colorType === "solid" ? "active" : ""}" data-type="solid">Solid</button>
                            <button class="color-type-btn ${colorType === "gradient" ? "active" : ""}" data-type="gradient">Gradient</button>
                        </div>
                        <div id="solid-control" style="display: ${colorType === "solid" ? "block" : "none"}">
                            <div class="color-selector" id="solid-color-selector">
                                <div class="color-swatch" style="background: ${solidColor}"></div>
                                <span>${solidColor}</span>
                            </div>
                            <label style="display: flex; align-items: center; gap: 0.3rem; margin-top: 0.3rem;">
                                <input type="checkbox" id="transparent-checkbox" ${isTransparent ? "checked" : ""}> Transparent Fill
                            </label>
                        </div>
                        <div id="gradient-control" style="display: ${colorType === "gradient" ? "block" : "none"}">
                            <div class="color-selector" id="gradient-selector">
                                <div class="gradient-preview-swatch" style="background: ${selectedGradient ? selectedGradient.css : "#6A0DAD"}"></div>
                                <span>${selectedGradient ? selectedGradient.name : "Select Gradient"}</span>
                            </div>
                        </div>
                    </div>
                    <div class="control-group">
                        <label>Icon Size (px)</label>
                        <input type="range" id="icon-size" class="slider" min="16" max="120" value="${iconSize}">
                        <span id="size-val">${iconSize}px</span>
                    </div>
                    <div class="output-buttons">
                        <button id="copy-svg-btn" class="btn-primary">Copy SVG Code</button>
                        <button id="export-svg-btn" class="btn-secondary">Export as SVG</button>
                    </div>
                </div>
            </div>
        </div>
    `;

  // ---- Mobile toggle: add button to show/hide icon panel ----
  const customizePanel = container.querySelector('.icon-customize-panel');
  const iconSelectorPanel = container.querySelector('.icon-selector-panel');
  
  if (customizePanel && iconSelectorPanel) {
    // Add toggle button to customize panel (only visible on mobile via CSS)
    let toggleBtn = customizePanel.querySelector('.mobile-toggle-icons-btn');
    if (!toggleBtn) {
      toggleBtn = document.createElement('button');
      toggleBtn.className = 'mobile-toggle-icons-btn';
      toggleBtn.textContent = '📂 Select Icon';
      const previewArea = customizePanel.querySelector('.preview-area');
      if (previewArea) {
        customizePanel.insertBefore(toggleBtn, previewArea);
      } else {
        customizePanel.prepend(toggleBtn);
      }
    }
    
    // Add close button inside icon selector panel (hidden on desktop)
    let closeBtn = iconSelectorPanel.querySelector('.mobile-close-icons');
    if (!closeBtn) {
      closeBtn = document.createElement('button');
      closeBtn.className = 'mobile-close-icons';
      closeBtn.textContent = '✕';
      iconSelectorPanel.prepend(closeBtn);
      (closeBtn as HTMLButtonElement).onclick = () => {
        iconSelectorPanel.classList.remove('open');
      };
    }
    
    // Toggle open/close on button click
    (toggleBtn as HTMLElement).onclick = () => {
      iconSelectorPanel.classList.toggle('open');
    };
  }

  // ---- library tabs ----
  const libraries = [...new Set(iconsList.map((i) => i.library))];
  const totalIcons = iconsList.length;
  const tabsContainer = document.getElementById("library-tabs")!;
  const searchInput = document.getElementById("icon-search") as HTMLInputElement;
  
  function renderTabs() {
    tabsContainer.innerHTML = "";
    const allBtn = document.createElement("button");
    allBtn.textContent = `All (${totalIcons})`;
    allBtn.className = `library-btn ${currentLibrary === "All" ? "active" : ""}`;
    allBtn.onclick = () => {
      currentLibrary = "All";
      // Clear search when switching tabs for better UX
      searchInput.value = "";
      searchQuery = "";
      renderTabs();
      renderIconGrid();
    };
    tabsContainer.appendChild(allBtn);
    libraries.forEach((lib) => {
      const count = iconsList.filter((i) => i.library === lib).length;
      const btn = document.createElement("button");
      btn.textContent = `${lib} (${count})`;
      btn.className = `library-btn ${currentLibrary === lib ? "active" : ""}`;
      btn.onclick = () => {
        currentLibrary = lib;
        searchInput.value = "";
        searchQuery = "";
        renderTabs();
        renderIconGrid();
      };
      tabsContainer.appendChild(btn);
    });
  }
  renderTabs();

  // ---- icon grid with fixed filtering ----
  function renderIconGrid() {
    const grid = document.getElementById("icon-grid")!;
    
    // Filter by search query and current library
    let filtered = iconsList.filter((icon) => {
      const matchesSearch = icon.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLibrary = (currentLibrary === "All") || (icon.library === currentLibrary);
      return matchesSearch && matchesLibrary;
    });
    
    // Limit to 200 icons for performance
    filtered = filtered.slice(0, 200);
    
    grid.innerHTML = "";
    if (filtered.length === 0) {
      grid.innerHTML = '<div class="no-icons">No icons found</div>';
      return;
    }
    
    for (const icon of filtered) {
      const div = document.createElement("div");
      div.className = `icon-item ${selectedIcon?.id === icon.id ? "selected" : ""}`;
      div.innerHTML = `<img src="${Platform.getAssetUrl(icon.path)}" alt="${icon.name}"><span>${icon.name}</span>`;
      div.onclick = async () => {
        selectedIcon = icon;
        // Resolve URL for fetch
        let iconUrl = Platform.getAssetUrl(icon.path)
        
        const resp = await fetch(iconUrl);
        svgContent = await resp.text();
        document.querySelectorAll(".icon-item").forEach((el) => el.classList.remove("selected"));
        div.classList.add("selected");
        updatePreview();
        
        // Close icon panel on mobile after selection
        if (window.innerWidth <= 768) {
          const panel = document.querySelector('.icon-selector-panel');
          if (panel) panel.classList.remove('open');
        }
      };
      grid.appendChild(div);
    }
  }

  // Search input handler
  searchInput.oninput = (e) => {
    searchQuery = (e.target as HTMLInputElement).value;
    renderIconGrid();
  };

  // ---- controls ----
  const colorTypeBtns = document.querySelectorAll(".color-type-btn");
  const solidControl = document.getElementById("solid-control")!;
  const gradientControl = document.getElementById("gradient-control")!;
  colorTypeBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const type = (e.target as HTMLElement).getAttribute("data-type") as
        | "solid"
        | "gradient";
      colorType = type;
      solidControl.style.display = type === "solid" ? "block" : "none";
      gradientControl.style.display = type === "gradient" ? "block" : "none";
      document
        .querySelectorAll(".color-type-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      updatePreview();
    });
  });

  const solidSelector = document.getElementById("solid-color-selector")!;
  const transparentCheckbox = document.getElementById(
    "transparent-checkbox",
  ) as HTMLInputElement;
  transparentCheckbox.onchange = () => {
    isTransparent = transparentCheckbox.checked;
    updatePreview();
  };
  solidSelector.onclick = () =>
    openColorPickerModal(solidColor, (newColor) => {
      solidColor = newColor;
      const swatch = solidSelector.querySelector(
        ".color-swatch",
      ) as HTMLElement;
      swatch.style.backgroundColor = solidColor;
      solidSelector.querySelector("span")!.textContent = solidColor;
      updatePreview();
    });

  const gradientSelector = document.getElementById("gradient-selector")!;
  gradientSelector.onclick = () =>
    openGradientPickerModal((grad) => {
      selectedGradient = grad;
      const previewDiv = gradientSelector.querySelector(
        ".gradient-preview-swatch",
      ) as HTMLElement;
      const span = gradientSelector.querySelector("span") as HTMLElement;
      previewDiv.style.background = grad.css;
      span.textContent = grad.name;
      updatePreview();
    });

  // slider
  const sizeSlider = document.getElementById("icon-size") as HTMLInputElement;
  const sizeVal = document.getElementById("size-val")!;
  sizeSlider.oninput = () => {
    iconSize = parseInt(sizeSlider.value);
    sizeVal.textContent = iconSize + "px";
    updatePreview();
  };

  // ---- preview update ----
  function updatePreview() {
    const previewDiv = document.getElementById("icon-preview")!;
    previewDiv.style.width = "auto";
    previewDiv.style.height = "auto";
    previewDiv.style.minWidth = `${iconSize + 40}px`;
    previewDiv.style.minHeight = `${iconSize + 40}px`;
    previewDiv.style.display = "flex";
    previewDiv.style.alignItems = "center";
    previewDiv.style.justifyContent = "center";
    if (!svgContent) {
      previewDiv.innerHTML = '<div class="no-icon">Select an icon</div>';
      return;
    }
    let coloredSvg = svgContent;
    if (colorType === "solid") {
      if (isTransparent) {
        if (coloredSvg.includes("fill="))
          coloredSvg = coloredSvg.replace(/fill="[^"]*"/g, 'fill="none"');
        else coloredSvg = coloredSvg.replace("<svg", '<svg fill="none"');
      } else {
        if (!coloredSvg.includes("fill="))
          coloredSvg = coloredSvg.replace("<svg", `<svg fill="${solidColor}"`);
        else
          coloredSvg = coloredSvg.replace(
            /fill="[^"]*"/g,
            `fill="${solidColor}"`,
          );
      }
    } else if (selectedGradient) {
      coloredSvg = applyGradientToSvg(coloredSvg, selectedGradient, "grad");
    }
    previewDiv.innerHTML = coloredSvg;
    const svgElem = previewDiv.querySelector("svg");
    if (svgElem) {
      svgElem.style.width = `${iconSize}px`;
      svgElem.style.height = `${iconSize}px`;
      svgElem.style.display = "block";
      svgElem.style.margin = "auto";
    }
  }

  // ---- copy & export with proper naming ----
  function getFinalSvg(): string {
    let finalSvg = svgContent;
    if (colorType === "solid") {
      if (isTransparent) {
        finalSvg = finalSvg.replace(/fill="[^"]*"/g, 'fill="none"');
      } else {
        if (!finalSvg.includes("fill="))
          finalSvg = finalSvg.replace("<svg", `<svg fill="${solidColor}"`);
        else
          finalSvg = finalSvg.replace(/fill="[^"]*"/g, `fill="${solidColor}"`);
      }
    } else if (selectedGradient) {
      finalSvg = applyGradientToSvg(finalSvg, selectedGradient, "grad");
    }
    return finalSvg;
  }

  document.getElementById("copy-svg-btn")!.onclick = () => {
    if (!selectedIcon) {
      showToast("Select an icon first");
      return;
    }
    const svg = getFinalSvg();
    navigator.clipboard.writeText(svg);
    showToast("SVG code copied!");
  };

  document.getElementById("export-svg-btn")!.onclick = () => {
    if (!selectedIcon) {
      showToast("Select an icon first");
      return;
    }
    const svg = getFinalSvg();
    const random = Math.floor(Math.random() * 90000) + 1000;
    const libName = selectedIcon.library.replace(/\s+/g, "-").toLowerCase();
    const iconName = selectedIcon.name.replace(/\s+/g, "-").toLowerCase();
    const fileName = `${libName}-${iconName}-${random}.svg`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = fileName;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    showToast("SVG file downloaded!");
  };

  // ---- helper modals (unchanged) ----
  function openColorPickerModal(
    currentColor: string,
    onSelect: (color: string) => void,
  ) {
    const modal = document.createElement("div");
    modal.className = "color-picker-modal";
    modal.innerHTML = `
            <div class="color-picker-modal-content">
                <div class="color-picker-header">
                    <span>Pick a color</span>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="manual-color-section">
                    <label>Manual Color</label>
                    <div style="display: flex; gap: 0.5rem;">
                        <input type="color" id="manual-color-input" value="${currentColor}">
                        <input type="text" id="manual-color-hex" placeholder="#rrggbb" value="${currentColor}">
                        <button id="apply-manual-color" class="btn-small">Apply</button>
                    </div>
                </div>
                <div class="color-categories"></div>
            </div>
        `;
    document.body.appendChild(modal);
    const manualColorInput = modal.querySelector(
      "#manual-color-input",
    ) as HTMLInputElement;
    const manualHexInput = modal.querySelector(
      "#manual-color-hex",
    ) as HTMLInputElement;
    manualColorInput.oninput = () => {
      manualHexInput.value = manualColorInput.value;
    };
    manualHexInput.oninput = () => {
      let val = manualHexInput.value.trim();
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) manualColorInput.value = val;
      else if (/^[0-9A-Fa-f]{6}$/.test(val)) {
        manualColorInput.value = "#" + val;
        manualHexInput.value = "#" + val;
      }
    };
    modal
      .querySelector("#apply-manual-color")
      ?.addEventListener("click", () => {
        let color = manualHexInput.value.trim();
        if (/^#[0-9A-Fa-f]{6}$/.test(color)) onSelect(color);
        else if (/^[0-9A-Fa-f]{6}$/.test(color)) onSelect("#" + color);
        else showToast("Invalid hex color", 1000);
        modal.remove();
      });
    const categoriesContainer = modal.querySelector(".color-categories")!;
    for (const [cat, colors] of Object.entries(colorCategories)) {
      if (!colors.length) continue;
      const catDiv = document.createElement("div");
      catDiv.className = "color-cat";
      catDiv.innerHTML = `<h4>${cat}</h4><div class="color-swatches"></div>`;
      const swatchesDiv = catDiv.querySelector(".color-swatches")!;
      for (const { hex } of colors.slice(0, 30)) {
        const swatch = document.createElement("div");
        swatch.className = "swatch";
        swatch.style.backgroundColor = hex;
        swatch.title = hex;
        swatch.onclick = () => {
          onSelect(hex);
          modal.remove();
        };
        swatchesDiv.appendChild(swatch);
      }
      categoriesContainer.appendChild(catDiv);
    }
    modal
      .querySelector(".close-modal")
      ?.addEventListener("click", () => modal.remove());
  }

  function openGradientPickerModal(onSelect: (gradient: Gradient) => void) {
    if (!gradientsList.length) {
      showToast("No gradients available");
      return;
    }
    const modal = document.createElement("div");
    modal.className = "gradient-picker-modal";
    modal.innerHTML = `
            <div class="gradient-picker-modal-content">
                <div class="gradient-picker-header">
                    <span>Select a Gradient</span>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="gradient-tabs">
                    <button class="gradient-tab-btn active" data-tab="preset">Preset Gradients</button>
                    <button class="gradient-tab-btn" data-tab="custom">Custom Builder</button>
                </div>
                <div id="gradient-preset-panel" class="gradient-panel"></div>
                <div id="gradient-custom-panel" class="gradient-panel" style="display: none;"></div>
            </div>
        `;
    document.body.appendChild(modal);
    const tabBtns = modal.querySelectorAll(".gradient-tab-btn");
    const presetPanel = modal.querySelector(
      "#gradient-preset-panel",
    ) as HTMLElement;
    const customPanel = modal.querySelector(
      "#gradient-custom-panel",
    ) as HTMLElement;
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tab = (e.target as HTMLElement).getAttribute("data-tab");
        tabBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        presetPanel.style.display = tab === "preset" ? "block" : "none";
        customPanel.style.display = tab === "custom" ? "block" : "none";
      });
    });
    // preset gradients grouped by usage
    const grouped: Record<string, Gradient[]> = {};
    gradientsList.forEach((g) => {
      if (!grouped[g.usage]) grouped[g.usage] = [];
      grouped[g.usage].push(g);
    });
    presetPanel.innerHTML = "";
    for (const [cat, grads] of Object.entries(grouped)) {
      const catDiv = document.createElement("div");
      catDiv.className = "gradient-category";
      const header = document.createElement("div");
      header.className = "gradient-category-header";
      header.innerHTML = `<h4>${cat} (${grads.length})</h4><span class="chevron">▼</span>`;
      const content = document.createElement("div");
      content.className = "gradient-category-content";
      const grid = document.createElement("div");
      grid.className = "gradient-grid-list";
      grads.slice(0, 20).forEach((grad) => {
        const card = document.createElement("div");
        card.className = "gradient-card-item";
        card.innerHTML = `<div class="gradient-preview" style="background: ${grad.css}; height: 60px;"></div><div class="gradient-name">${grad.name}</div>`;
        card.onclick = () => {
          onSelect(grad);
          modal.remove();
        };
        grid.appendChild(card);
      });
      content.appendChild(grid);
      catDiv.appendChild(header);
      catDiv.appendChild(content);
      header.onclick = () => {
        content.classList.toggle("collapsed");
        header.classList.toggle("collapsed");
      };
      presetPanel.appendChild(catDiv);
    }
    // custom builder (simplified)
    customPanel.innerHTML = `
            <div class="custom-gradient-builder">
                <div class="builder-row"><label>Direction</label><select id="custom-dir"><option>to right</option><option>to bottom</option><option>135deg</option><option>45deg</option></select></div>
                <div class="builder-row"><label>Colors</label><div id="custom-color-list"></div><button id="add-custom-color" class="btn-small">+ Add Color</button></div>
                <div id="custom-preview" style="height:60px; border-radius:12px; margin:1rem 0;"></div>
                <button id="use-custom-gradient" class="btn-primary">Use This Gradient</button>
            </div>
        `;
    let customColors = [
      { color: "#ff0000", pos: 0 },
      { color: "#0000ff", pos: 100 },
    ];
    function renderCustomColors() {
      const containerDiv = customPanel.querySelector("#custom-color-list")!;
      containerDiv.innerHTML = "";
      customColors.forEach((c, idx) => {
        const row = document.createElement("div");
        row.className = "color-row";
        row.innerHTML = `
                    <input type="color" value="${c.color}" data-index="${idx}">
                    <input type="range" min="0" max="100" value="${c.pos}" data-index="${idx}">
                    <span class="position-value">${c.pos}%</span>
                    <button class="remove-color-btn" data-index="${idx}" ${customColors.length <= 2 ? "disabled" : ""}>✖</button>
                `;
        containerDiv.appendChild(row);
      });
      containerDiv.querySelectorAll('input[type="color"]').forEach((inp) =>
        inp.addEventListener("input", (e) => {
          const idx = parseInt(
            (e.target as HTMLElement).getAttribute("data-index")!,
          );
          customColors[idx].color = (e.target as HTMLInputElement).value;
          updateCustomPreview();
        }),
      );
      containerDiv.querySelectorAll('input[type="range"]').forEach((slider) =>
        slider.addEventListener("input", (e) => {
          const idx = parseInt(
            (e.target as HTMLElement).getAttribute("data-index")!,
          );
          customColors[idx].pos = parseInt(
            (e.target as HTMLInputElement).value,
          );
          (
            slider.parentElement!.querySelector(
              ".position-value",
            ) as HTMLElement
          ).innerText = customColors[idx].pos + "%";
          customColors.sort((a, b) => a.pos - b.pos);
          renderCustomColors();
          updateCustomPreview();
        }),
      );
      containerDiv.querySelectorAll(".remove-color-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => {
          const idx = parseInt(
            (e.target as HTMLElement).getAttribute("data-index")!,
          );
          if (customColors.length > 2) {
            customColors.splice(idx, 1);
            renderCustomColors();
            updateCustomPreview();
          }
        }),
      );
    }
    function updateCustomPreview() {
      const dir = (
        customPanel.querySelector("#custom-dir") as HTMLSelectElement
      ).value;
      const stops = customColors.map((c) => `${c.color} ${c.pos}%`).join(", ");
      (
        customPanel.querySelector("#custom-preview") as HTMLElement
      ).style.background = `linear-gradient(${dir}, ${stops})`;
    }
    renderCustomColors();
    updateCustomPreview();
    (customPanel.querySelector("#add-custom-color") as HTMLElement).onclick =
      () => {
        if (customColors.length < 6) {
          customColors.push({ color: "#00ff00", pos: 50 });
          renderCustomColors();
          updateCustomPreview();
        } else showToast("Max 6 colors", 1000);
      };
    (customPanel.querySelector("#custom-dir") as HTMLSelectElement).onchange =
      updateCustomPreview;
    (customPanel.querySelector("#use-custom-gradient") as HTMLElement).onclick =
      () => {
        const dir = (
          customPanel.querySelector("#custom-dir") as HTMLSelectElement
        ).value;
        const stops = customColors
          .map((c) => `${c.color} ${c.pos}%`)
          .join(", ");
        const css = `linear-gradient(${dir}, ${stops})`;
        const customGrad: Gradient = {
          id: Date.now(),
          usage: "Custom",
          colorCount: customColors.length,
          name: `Custom (${customColors.length} colors)`,
          css,
          stops: customColors.map((c) => ({ color: c.color, position: c.pos })),
          direction: dir,
          type: "linear",
        };
        onSelect(customGrad);
        modal.remove();
      };
    modal
      .querySelector(".close-modal")
      ?.addEventListener("click", () => modal.remove());
  }

  renderIconGrid();
  updatePreview();
}