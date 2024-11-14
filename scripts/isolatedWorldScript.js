// scripts/isolatedWorldScript.js

// Relaye la présence du tag au background script
window.addEventListener("message", (event) => {
  if (event.source === window && event.data.type === "abtastyTagStatus") {
    chrome.runtime.sendMessage({ type: "abtastyTagStatus", isPresent: event.data.isPresent });
  }

  // Relaye les données de ABTasty.results et du cookie vers le background script
  if (event.source === window && event.data.type === "abtastyDataResponse") {
    chrome.runtime.sendMessage({
      type: "abtastyDataResponse",
      results: event.data.results,
      cookie: event.data.cookie
    });
  }
});

// Relaye les demandes du background script vers le Main World
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "fetchABTastyData") {
    window.postMessage({ type: "fetchABTastyData" }, "*");

    // Ecoute la réponse du Main World et renvoie les données au background script
    window.addEventListener("message", (event) => {
      if (event.source === window && event.data.type === "abtastyDataResponse") {
        sendResponse({ results: event.data.results, cookie: event.data.cookie });
      }
    });
    return true; // Indique que sendResponse est asynchrone
  }
});
