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

// Gestion centralisée des messages provenant du background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "fetchABTastyData") {
    // Envoyer une demande au Main World
    window.postMessage({ type: "fetchABTastyData" }, "*");

    // Écoute la réponse unique du Main World
    const handleResponse = (event) => {
      if (event.source === window && event.data.type === "abtastyDataResponse") {
        sendResponse({ results: event.data.results, cookie: event.data.cookie });
        window.removeEventListener("message", handleResponse); // Supprime l'écoute après réception
      }
    };

    window.addEventListener("message", handleResponse);
    return true; // Indique un traitement asynchrone
  }

  if (message.type === "injectEditor") {
    const editorUrl = "https://teddytor.abtasty.com/dist/main.js";

    // Tente de charger et injecter le script
    fetch(editorUrl)
      .then(response => response.text())
      .then(scriptContent => {
        const script = document.createElement("script");
        script.textContent = scriptContent;
        script.setAttribute("id", "abtasty-editor");
        script.setAttribute("data-campaignid", message.campaignID);

        (document.head || document.documentElement).appendChild(script);
        sendResponse({ success: true });
      })
      .catch(error => {
        console.error("Failed to load editor script:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});
