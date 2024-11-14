// scripts/isolatedWorldScript.js

window.addEventListener("message", (event) => {
  if (event.source === window && event.data.type === "abtastyTagStatus") {
    console.log('J ai recu!')
    const { isPresent, results } = event.data;

    // Envoie directement le statut, ABTasty.results et une demande pour le cookie au background script
    chrome.runtime.sendMessage({ 
      type: "abtastyTagStatus", 
      isPresent: isPresent, 
      results: results 
    });
  }
});
