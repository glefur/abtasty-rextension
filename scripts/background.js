const tabData = {};

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
    return true; // Maintient la connexion pour un traitement asynchrone
  } else if (message.type === "injectEditor") {
    chrome.tabs.sendMessage(tabId, { type: "injectEditor", campaignID: message.campaignID });
    return true; // Maintient la connexion pour un traitement asynchrone
  }
});

// Nettoyage des données d'onglet
chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabData[tabId];
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    delete tabData[tabId];
  }
});
