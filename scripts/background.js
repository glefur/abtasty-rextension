// background.js

const tabData = {}; // Stocke uniquement la présence du tag pour chaque onglet

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab ? sender.tab.id : message.tabId;

  if (message.type === "abtastyTagStatus") {
    if (tabId) {
      tabData[tabId] = { isPresent: message.isPresent };
    }
  } else if (message.type === "requestTagStatus") {
    const isPresent = tabData[tabId] ? tabData[tabId].isPresent : false;
    sendResponse({ isPresent });
    return true;
  } else if (message.type === "fetchABTastyData") {
    chrome.tabs.sendMessage(tabId, { type: "fetchABTastyData" }, (response) => {
      sendResponse(response);
    });
    return true; // Maintient la connexion pour la réponse asynchrone
  }
});

// Nettoie les données de l'onglet fermé
chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabData[tabId];
});

// Réinitialise les données de l'onglet lorsque la page est rechargée
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    delete tabData[tabId];
  }
});
