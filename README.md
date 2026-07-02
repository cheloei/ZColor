<img width="947" height="415" alt="preview" src="https://github.com/user-attachments/assets/28627bef-a9de-47a2-a9d8-5c124a9e41f6" />

# 🎨 ZColor

> Professional color toolkit – Chrome extension & cross‑platform desktop app

**ZColor** is a complete color toolbox for front‑end developers and designers.  
It gives you instant access to **2,200+ curated colors**, **2,000+ gradients**, and an **SVG icon builder** that pulls from 7 popular icon libraries – all in one clean, dark‑themed interface.

Whether you work in the browser or on the desktop, Z‑Color helps you pick, generate, and export the perfect color assets for your projects.

---

## ✨ Features

- **🎨 Color Palette** – 2,200+ colors, organised into 13 categories (red, blue, pastel, dark, etc.). Click any color to copy its hex code.
- **🌈 Gradient Generator** – 2,000+ linear and radial gradients, grouped by colour count (2–6 colours) and by usage (Nature, Technology, Romantic, etc.). Also includes a **drag‑and‑drop custom builder**.
- **🖌️ Icon Builder** – Browse and search 7 icon libraries (Font Awesome, Bootstrap, Remix, Lucide, Phosphor, Material, Feather). Customise colour (solid or gradient), size, and transparency. Export as SVG or copy the raw code.
- **⭐ Favourites** – Save your preferred colors and gradients. Stored persistently via `chrome.storage` (Chrome) or `localStorage` (Electron).
- **🔍 Image colour picker** – Upload any image and click to grab a colour. (Chrome extension also provides an **EyeDropper** via the right‑click context menu.)
- **🌑 Dark theme** – Easy on the eyes, designed for long working sessions.
- **📱 Responsive** – Works on desktop and mobile devices.

---

## 🚀 Installation

### As a Chrome extension
1. Download or clone this repository.
2. Run `npm install` to install dependencies.
3. Open `chrome://extensions` in your browser.
4. Enable **Developer mode** (toggle in the top‑right corner).
5. Click **Load unpacked** and select the project folder.
6. The extension icon appears in your toolbar – click it to open the main menu.

### As a desktop app (Electron)
```bash
npm run dist
```
The executable will be generated inside the `release/` folder (Windows `.exe`, Linux `AppImage`).

### Development server (for testing the web version)
```bash
npm start
```
Then open `http://localhost:3000` in your browser.

---

## 🧰 How to use

### Color Palette
- Navigate to **Color Palette** from the main menu.
- Click any colour block to copy its hex code.
- Hover over a colour and click the star ⭐ to add/remove it from your favourites.
- Click the **🔍 Pick from image** button to upload an image and select a colour.

### Gradient Generator
- Browse gradients by colour count (2–6 colours) and sub‑categories.
- Click any gradient card to open a detailed modal.
- In the modal you can:
  - Copy individual colour stops.
  - Copy the full CSS as `background`, `background-image`, a text‑gradient, or a ready‑to‑use CSS class.
- Click the **➕** floating button to open the custom builder: add your own colours, choose a direction, and generate previews.

### Icon Builder
- Select an icon library from the tabs on the left.
- Search for an icon by name (e.g. “home”, “star”, “camera”).
- Choose between **Solid** (with colour picker or manual hex) or **Gradient** fill.
- Adjust icon size with the slider.
- Click **Copy SVG Code** or **Export as SVG** to use the icon in your projects.

### Favourites
- All your saved colors and gradients are available under the **Favourites** menu.
- Remove any item by clicking the trash icon 🗑️.

---

## 🤖 Built with AI

This project was developed with the assistance of **artificial intelligence** (GitHub Copilot, Claude, and ChatGPT).  
The AI helped with:
- Code structure and refactoring.
- Generating the 2,200+ colour set and 2,000+ gradients.
- Building the SVG icon crawler and customisation logic.
- Writing documentation and configuration files.

Nevertheless, every line has been reviewed and fine‑tuned by a human developer to ensure quality, performance, and usability.

---

## 🧪 Build from source

```bash
# Clone the repository
git clone https://github.com/cheloei/ZColor.git
cd ZColor

# Install dependencies
npm install

# Build the web version (extension)
npm run build

# Build the desktop application
npm run dist
```

The build process will:
- Generate `colors.json`, `gradients.json`, and `icons.json` in the `dist/data/` folder.
- Copy HTML, CSS, and asset files.
- Bundle TypeScript code.
- For Electron, package the app into platform‑specific installers.

---

## 📁 Project structure

```
ZColor/
├── src/
│   ├── chrome/            # Extension background & manifest
│   ├── common/            # Shared code (HTML, CSS, TS, generators)
│   ├── desktop/           # Electron main & preload scripts
│   └── entry/             # Page‑specific entry points
├── scripts/               # Build utilities
├── dist/                  # Compiled output (ignored by git)
├── release/               # Packaged executables (ignored)
└── package.json
```

---

## 📄 License

This project is released under the **MIT License**.  
See the [LICENSE](LICENSE) file for full details.

---

## 👤 Author

**Abolfazl Cheloei** – [GitHub](https://github.com/cheloei)

---

## 🤝 Contributing

Contributions are welcome!  
Please open an **issue** first to discuss what you would like to change.

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a **Pull Request**.

---

## 🙏 Acknowledgements

- All icon libraries included under their respective licenses.
- The open‑source community for providing excellent tools.
- AI models that helped accelerate development.

---

**Enjoy designing with Z‑Color!** 🎨✨
