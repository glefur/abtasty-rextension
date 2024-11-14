// background.js

const tabData = {}; // Objet pour stocker les données spécifiques à chaque onglet

// Écoute les messages envoyés par isolatedWorldScript.js et popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = message.tabId || (sender.tab ? sender.tab.id : null);

  console.log("Message reçu :", message);  // Affiche le contenu du message reçu
  console.log("ID de l'onglet :", tabId);  // Affiche l'ID de l'onglet d'origine

  if (message.type === "abtastyTagStatus") {
    // Stocke le statut et ABTasty.results pour l'onglet spécifique
    if (tabId) {
      tabData[tabId] = {
        isPresent: message.isPresent,
        results: message.results,
        cookie: null // Initialiser à null, le cookie sera récupéré ensuite
      };

      // Log des données stockées pour cet onglet
      console.log("Données stockées pour l'onglet", tabId, ":", tabData[tabId]);

      // Récupère le cookie ABTasty si le tag est présent
      if (message.isPresent) {
        chrome.cookies.get({ url: sender.url, name: "ABTasty" }, (cookie) => {
          if (tabData[tabId]) {
            tabData[tabId].cookie = cookie ? cookie.value : "Cookie not found";
            console.log("Cookie récupéré pour l'onglet", tabId, ":", tabData[tabId].cookie);
          }
        });
      }
    }
  } else if (message.type === "requestTagStatus") {
    // Assure la réponse asynchrone en renvoyant true
    console.log("Requête de statut pour l'onglet", tabId);
    console.log("Données actuelles pour l'onglet", tabId, ":", tabData[tabId]);

    if (tabId !== null) {
      sendResponse(tabData[tabId] || { isPresent: false, results: null, cookie: null });
    } else {
      sendResponse({ isPresent: false, results: null, cookie: null });
    }
    return true; // Indique que sendResponse sera appelé de façon asynchrone
  }
});

// Nettoie les données de l'onglet fermé
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log("Onglet fermé :", tabId);
  delete tabData[tabId];
});

// Réinitialise les données de l'onglet lorsque la page est rechargée ou changée
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    console.log("Onglet rechargé :", tabId);
    delete tabData[tabId];
  }
});
