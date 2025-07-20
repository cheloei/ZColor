// Create context menu for EyeDropper tool on extension installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "pick-color",
    title: "Pick color with EyeDropper",
    contexts: ["all"]
  });
});

// Handle context menu click and run EyeDropper on the page
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "pick-color") {
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: () => {
        if (!window.EyeDropper) {
          alert("Your browser does not support the EyeDropper API.");
          return;
        }
        const eyeDropper = new EyeDropper();
        eyeDropper.open().then(result => {
          navigator.clipboard.writeText(result.sRGBHex);
          alert("Color picked and copied: " + result.sRGBHex);
        }).catch(e => {
          if (e && e.name === 'AbortError') {
            // User cancelled EyeDropper, do nothing
            return;
          }
          alert("Error: " + e);
        });
      }
    });
  }
}); 