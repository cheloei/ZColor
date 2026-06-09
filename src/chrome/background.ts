// src/background.ts
/// <reference types="chrome" />

// Open main page in a new tab when extension icon is clicked
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL('/HTML/index.html') });
});

// Add context menu item on installation
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "pick-color",
        title: "Pick color with EyeDropper",
        contexts: ["all"]
    });
});

// Handle context menu click – inject EyeDropper script into the current tab
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "pick-color" && tab?.id) {
        // Skip chrome:// pages for security
        if (tab.url?.startsWith('chrome://')) return;
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                if (!window.EyeDropper) {
                    alert("EyeDropper not supported");
                    return;
                }
                new EyeDropper().open()
                    .then(result => navigator.clipboard.writeText(result.sRGBHex))
                    .catch(e => console.log(e));
            }
        });
    }
});