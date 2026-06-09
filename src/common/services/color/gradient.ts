// =============================================
// Gradient Module – Full Implementation
// Includes: gallery rendering, favorites, modal, floating builder (draggable)
// No external font icons – uses emoji
// =============================================

import { loadJSON, showToast } from "../common/common.js";
import {
  addFavorite,
  isFavorite,
  removeFavorite,
} from "../common/favorites/favorites.js";

export interface GradientStop {
  color: string;
  position: number;
}

export interface Gradient {
  id: number;
  usage: string;
  colorCount: number;
  name: string;
  css: string;
  stops: GradientStop[];
  direction: string;
  type: "linear" | "radial";
}

let gradientsData: Gradient[] | null = null;
let currentModalGradient: Gradient | null = null;

/**
 * Load gradient data from pre‑generated JSON.
 */
export async function loadGradientData(): Promise<Gradient[]> {
  gradientsData = await loadJSON<Gradient[]>("/data/gradients.json");
  return gradientsData;
}

// ===================== Gradient Card Creator =====================
function createGradientCard(grad: Gradient): HTMLElement {
  const card = document.createElement("div");
  card.className = "gradient-card";
  card.style.position = "relative";

  const preview = document.createElement("div");
  preview.className = "gradient-preview";
  preview.style.background = grad.css;

  const info = document.createElement("div");
  info.className = "gradient-info";
  info.textContent = grad.name;

  card.appendChild(preview);
  card.appendChild(info);

  // Favorite star (emoji)
  const star = document.createElement("span");
  star.className = "favorite-star";
  star.textContent = "⭐";
  star.style.cssText =
    "position:absolute; top:8px; right:8px; font-size:18px; cursor:pointer; display:none; z-index:10; text-shadow:0 0 2px black;";
  card.appendChild(star);

  card.addEventListener("mouseenter", async () => {
    const fav = await isFavorite(`gradient-${grad.id}`);
    star.style.display = "block";
    star.style.opacity = fav ? "1" : "0.7";
  });
  card.addEventListener("mouseleave", async () => {
    const fav = await isFavorite(`gradient-${grad.id}`);
    if (!fav) star.style.display = "none";
  });
  (async () => {
    if (await isFavorite(`gradient-${grad.id}`)) star.style.display = "block";
  })();

  star.addEventListener("click", async (e) => {
    e.stopPropagation();
    const fav = await isFavorite(`gradient-${grad.id}`);
    if (fav) {
      await removeFavorite(`gradient-${grad.id}`);
      star.style.display = "none";
      showToast("Removed from favorites", 1000);
    } else {
      await addFavorite({
        id: `gradient-${grad.id}`,
        type: "gradient",
        data: grad,
      });
      star.style.display = "block";
      showToast("Added to favorites ❤️", 1000);
    }
  });

  card.addEventListener("click", () => openGradientModal(grad));
  return card;
}

// ===================== Render Gallery =====================
export function renderGradientGallery(container: HTMLElement): void {
  if (!gradientsData) return;
  container.innerHTML = "";

  // Group by colorCount then usage
  const byCount: Record<number, Record<string, Gradient[]>> = {
    2: {},
    3: {},
    4: {},
    5: {},
    6: {},
  };
  for (const g of gradientsData) {
    if (!byCount[g.colorCount][g.usage]) byCount[g.colorCount][g.usage] = [];
    byCount[g.colorCount][g.usage].push(g);
  }

  for (const count of [2, 3, 4, 5, 6] as const) {
    const usageGroups = byCount[count];
    if (Object.keys(usageGroups).length === 0) continue;

    // Parent category (e.g., "2-Color Gradients")
    const countDiv = document.createElement("div");
    countDiv.className = "gradient-category hide";
    const countHeader = document.createElement("div");
    countHeader.className = "gradient-category-header";
    let total = 0;
    for (const arr of Object.values(usageGroups)) total += arr.length;
    countHeader.innerHTML = `<h3>🎨 ${count}-Color Gradients <small>(${total})</small></h3><span class="chevron">▼</span>`;
    countHeader.addEventListener("click", () =>
      countDiv.classList.toggle("hide"),
    );

    const countBody = document.createElement("div");
    countBody.style.padding = "0.5rem";

    // Subcategories (Nature, Technology, etc.)
    for (const [usageName, gradList] of Object.entries(usageGroups)) {
      const subcatDiv = document.createElement("div");
      subcatDiv.style.marginBottom = "1rem";

      const subcatHeader = document.createElement("div");
      subcatHeader.className = "subcategory-header";
      subcatHeader.innerHTML = `<span class="chevron">▼</span> ${usageName} <small>(${gradList.length})</small>`;

      const subcatContent = document.createElement("div");
      subcatContent.className = "subcategory-content";
      const grid = document.createElement("div");
      grid.className = "gradient-grid";

      for (const grad of gradList.slice(0, 40)) {
        grid.appendChild(createGradientCard(grad));
      }

      subcatContent.appendChild(grid);
      subcatDiv.appendChild(subcatHeader);
      subcatDiv.appendChild(subcatContent);

      // Toggle this subcategory only
      subcatHeader.addEventListener("click", (e) => {
        e.stopPropagation();
        // If parent is hidden, show it first
        if (countDiv.classList.contains("hide"))
          countDiv.classList.remove("hide");
        subcatHeader.classList.toggle("collapsed");
        subcatContent.classList.toggle("collapsed");
      });

      countBody.appendChild(subcatDiv);
    }

    countDiv.appendChild(countHeader);
    countDiv.appendChild(countBody);
    container.appendChild(countDiv);
  }
}

// ===================== Gradient Detail Modal =====================
export function openGradientModal(gradient: Gradient): void {
  currentModalGradient = gradient;
  const modal = document.getElementById("gradient-modal") as HTMLElement;
  const preview = document.getElementById("modal-preview") as HTMLElement;
  const stopsDiv = document.getElementById("modal-stops") as HTMLElement;
  const cssCode = document.getElementById("modal-css-code") as HTMLElement;

  preview.style.background = gradient.css;
  stopsDiv.innerHTML = "";
  gradient.stops.forEach((stop) => {
    const stopEl = document.createElement("div");
    stopEl.className = "stop-item";
    stopEl.innerHTML = `
            <div class="stop-color" style="background: ${stop.color};"></div>
            <div class="stop-details">${stop.color} - ${stop.position.toFixed(1)}%</div>
            <button class="copy-stop-btn" data-color="${stop.color}">Copy Color</button>
        `;
    stopsDiv.appendChild(stopEl);
  });
  cssCode.textContent = gradient.css;
  modal.style.display = "block";

  // Attach copy color buttons
  document.querySelectorAll(".copy-stop-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const color = btn.getAttribute("data-color")!;
      navigator.clipboard.writeText(color);
      showToast(`✅ ${color} copied!`);
    });
  });

  // Extra copy options
  const existingOptions = document.querySelector(".copy-options");
  if (existingOptions) existingOptions.remove();
  const optionsDiv = document.createElement("div");
  optionsDiv.className = "copy-options";
  optionsDiv.innerHTML = `
        <button class="copy-option-btn" data-type="bg">Copy as background</button>
        <button class="copy-option-btn" data-type="bg-image">Copy as background-image</button>
        <button class="copy-option-btn" data-type="text">Copy as text-gradient</button>
        <button class="copy-option-btn" data-type="class">Copy as CSS class</button>
    `;
  document.querySelector(".modal-css")!.appendChild(optionsDiv);

  optionsDiv.querySelectorAll(".copy-option-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      let output = "";
      switch (btn.getAttribute("data-type")) {
        case "bg":
          output = `background: ${gradient.css};`;
          break;
        case "bg-image":
          output = `background-image: ${gradient.css};`;
          break;
        case "text":
          output = `background: ${gradient.css};\n-webkit-background-clip: text;\nbackground-clip: text;\ncolor: transparent;`;
          break;
        case "class":
          const className = `grad-${Math.random().toString(36).substr(2, 6)}`;
          output = `.${className} {\n  background: ${gradient.css};\n}`;
          break;
      }
      navigator.clipboard.writeText(output);
      showToast(`✅ ${btn.getAttribute("data-type")} copied!`);
    });
  });
}

export function setupModal(): void {
  const modal = document.getElementById("gradient-modal") as HTMLElement;
  const closeSpan = document.querySelector(".modal-close") as HTMLElement;
  const copyCssBtn = document.getElementById("copy-css-btn") as HTMLElement;
  if (closeSpan) closeSpan.onclick = () => (modal.style.display = "none");
  window.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
  };
  if (copyCssBtn)
    copyCssBtn.onclick = () => {
      if (currentModalGradient) {
        navigator.clipboard.writeText(currentModalGradient.css);
        showToast("✅ CSS copied!");
      }
    };
}

// ===================== Floating Panel (Draggable Custom Builder) =====================
let isBuilderInit = false;

export function initFloatingBuilder(): void {
  const panel = document.getElementById("floating-builder") as HTMLElement;
  const fab = document.getElementById("fab-custom-gradient");
  const closeBtn = document.getElementById("close-floating");
  const body = document.getElementById("floating-body");
  const header = document.getElementById("floating-header"); // important: must exist in HTML

  if (!panel || !fab || !body || !header) {
    console.warn("Floating panel elements missing");
    return;
  }

  // --- drag functionality ---
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  header.style.cursor = "move";
  header.onmousedown = dragMouseDown;

  function dragMouseDown(e: MouseEvent) {
    e.preventDefault();
    // get mouse position at startup
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
    // prevent text selection while dragging
    document.body.style.userSelect = "none";
  }

  function elementDrag(e: MouseEvent) {
    e.preventDefault();
    // calculate new position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    let top = panel.offsetTop - pos2;
    let left = panel.offsetLeft - pos1;
    // keep within window bounds
    if (top < 0) top = 0;
    if (left < 0) left = 0;
    if (left + panel.offsetWidth > window.innerWidth) {
      left = window.innerWidth - panel.offsetWidth;
    }
    panel.style.top = top + "px";
    panel.style.left = left + "px";
    panel.style.right = "auto";
    panel.style.bottom = "auto";
  }

  function closeDragElement() {
    // stop moving when mouse button is released
    document.onmouseup = null;
    document.onmousemove = null;
    document.body.style.userSelect = "";
  }

  // --- toggle panel on FAB click ---
  fab.addEventListener("click", () => {
    if (panel.style.display === "none" || panel.style.display === "") {
      if (!isBuilderInit) {
        buildFloatingContent(body);
        isBuilderInit = true;
      }
      panel.style.display = "flex";
    } else {
      panel.style.display = "none";
    }
  });

  if (closeBtn) {
    closeBtn.onclick = () => {
      panel.style.display = "none";
    };
  }
}

function buildFloatingContent(body: HTMLElement): void {
  body.innerHTML = `
        <div class="custom-gradient-section">
            <div class="custom-colors-input" id="custom-colors-container"></div>
            <button id="generate-custom-gradients" class="generate-custom-btn">Generate Gradients</button>
            <div id="custom-previews" class="custom-previews"></div>
        </div>
    `;
  const container = document.getElementById("custom-colors-container")!;
  const addBtn = document.createElement("button");
  addBtn.className = "add-color-btn";
  addBtn.textContent = "+ Add Color";
  const defaultColors = ["#ff0000", "#00ff00", "#0000ff"];
  defaultColors.forEach((col) => {
    container.appendChild(createColorInput(col));
  });
  container.appendChild(addBtn);
  addBtn.onclick = () => {
    container.insertBefore(createColorInput("#888888"), addBtn);
  };
  const generateBtn = document.getElementById("generate-custom-gradients")!;
  generateBtn.onclick = () => {
    const inputs = document.querySelectorAll(
      "#custom-colors-container .color-input",
    );
    const colors: string[] = [];
    inputs.forEach((inp) => {
      let val = (inp as HTMLInputElement).value.trim();
      if (/^#[0-9A-Fa-f]{6}$/i.test(val)) colors.push(val);
      else if (/^[0-9A-Fa-f]{6}$/i.test(val)) colors.push("#" + val);
    });
    if (colors.length < 2) {
      showToast("Enter at least 2 hex colors");
      return;
    }
    const previewDiv = document.getElementById("custom-previews")!;
    previewDiv.innerHTML = "";
    const dirs = ["135deg", "45deg", "90deg", "0deg", "to right", "to bottom"];
    for (const dir of dirs) {
      const stops = colors.map((c, idx) => ({
        color: c,
        position: (idx / (colors.length - 1)) * 100,
      }));
      const css = `linear-gradient(${dir}, ${stops.map((s) => `${s.color} ${s.position}%`).join(", ")})`;
      const customGrad: Gradient = {
        id: Date.now() + Math.random(),
        usage: "Custom",
        colorCount: colors.length,
        name: `Custom · ${colors.length}-color · ${dir}`,
        css,
        stops,
        direction: dir,
        type: "linear",
      };
      const card = createGradientCard(customGrad);
      const info = card.querySelector(".gradient-info") as HTMLElement;
      if (info) info.textContent = `${colors.length} colors · ${dir}`;
      previewDiv.appendChild(card);
    }
  };
}

function createColorInput(defaultValue: string): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "color-input-wrapper";
  const preview = document.createElement("div");
  preview.className = "color-preview";
  preview.style.backgroundColor = defaultValue;
  const input = document.createElement("input");
  input.type = "text";
  input.className = "color-input";
  input.value = defaultValue;
  input.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    if (!target) return;
    let val = target.value.trim();
    if (/^#[0-9A-Fa-f]{6}$/i.test(val)) {
      preview.style.backgroundColor = val;
    } else if (/^[0-9A-Fa-f]{6}$/i.test(val)) {
      preview.style.backgroundColor = "#" + val;
      target.value = "#" + val;
    } else {
      preview.style.backgroundColor = "#333";
    }
  });
  wrapper.appendChild(preview);
  wrapper.appendChild(input);
  return wrapper;
}
