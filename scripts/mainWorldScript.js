// scripts/mainWorldScript.js

(function() {
  let attempts = 0;
  const maxAttempts = 10; // Maximum de tentatives pour vérifier ABTasty.results
  const interval = 500;   // Intervalle entre les vérifications (en ms)

  function sendABTastyStatus() {
    console.log('Je teste')
    const isABTastyPresent = Array.from(document.scripts).some(script => script.src.includes("try.abtasty.com"));
    const abtastyResults = isABTastyPresent && typeof ABTasty !== "undefined" ? ABTasty.results : null;

    // Si le tag est présent et que ABTasty.results est défini, envoie les informations
    if (isABTastyPresent && abtastyResults) {
      console.log('J envoie');
      window.postMessage({ 
        type: "abtastyTagStatus", 
        isPresent: isABTastyPresent, 
        results: abtastyResults 
      }, "*");
      observer.disconnect(); // Arrête d'observer si tout est prêt
    } else if (isABTastyPresent && attempts < maxAttempts) {
      console.log('Je reesaierai');
      // Si le tag est présent mais pas ABTasty.results, attend et réessaie
      attempts++;
      setTimeout(sendABTastyStatus, interval);
    } else if (attempts >= maxAttempts) {
      console.log('J abandonne ');
      // Après un nombre maximal de tentatives, envoie un résultat sans ABTasty.results
      window.postMessage({ 
        type: "abtastyTagStatus", 
        isPresent: isABTastyPresent, 
        results: null 
      }, "*");
      observer.disconnect();
    }
  }

  // MutationObserver pour détecter le chargement asynchrone du tag
  const observer = new MutationObserver(sendABTastyStatus);
  observer.observe(document, { childList: true, subtree: true });

  // Lance une première vérification immédiatement
  sendABTastyStatus();
})();
