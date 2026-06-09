import { app, BrowserWindow } from "electron";
import path from "path";
import { Menu } from "electron";

function createWindow(): void {
  Menu.setApplicationMenu(null);
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const indexPath = path.join(
    app.getAppPath(),
    "dist",
    "html",
    "index.html"
  );

  console.log("cwd:", process.cwd());
  console.log("appPath:", app.getAppPath());
  console.log("__dirname:", __dirname);
  console.log("indexPath:", indexPath);

  win.loadFile(indexPath);
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});