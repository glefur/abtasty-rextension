// scripts/mainWorldScript.js

(function() {
  // Fonction pour vérifier la présence du tag AB Tasty
  function checkABTastyTag() {
    console.log(`Checking AB Tasty tag on ${window.location}`);
    const isABTastyPresent = Array.from(document.scripts).some(script => script.src.includes("try.abtasty.com"));

    if (isABTastyPresent) {
      // Envoie la présence du tag au background script via le content script
      console.log('AB Tasty tag found!');
      window.postMessage({ type: "abtastyTagStatus", isPresent: isABTastyPresent }, "*");
      observer.disconnect(); // Arrête d'observer si le tag est trouvé
    } else {
      console.log('AB Tasty tag not found...');
    }
  }

  // Ecoute les demandes pour récupérer ABTasty.results et le cookie
  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "fetchABTastyData") {
      console.log(`Fetching AB Tasty data for ${window.location}`);
      
      // Récupère les données
      const abtastyResults = typeof ABTasty !== "undefined" ? ABTasty.results : null;
      const abtastyCookie = document.cookie
        .split("; ")
        .find(row => row.startsWith("ABTasty="))
        ?.split("=")[1] || "Cookie not found";

      // Envoie les données au background script via le content script
      window.postMessage({ type: "abtastyDataResponse", results: abtastyResults, cookie: abtastyCookie }, "*");
    }
  });

  // Utilise MutationObserver pour détecter le chargement asynchrone du tag
  const observer = new MutationObserver(checkABTastyTag);
  observer.observe(document, { childList: true, subtree: true });

  // Lance une première vérification immédiatement
  checkABTastyTag();
})();
