// popup.js

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Popup chargée et demande de données envoyée.");
  const status = document.getElementById("status");
  const results = document.getElementById("results");
  const cookie = document.getElementById("cookie");

  // Récupère l'ID de l'onglet actif
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = tab.id;

  // Demande le statut actuel du tag AB Tasty, ABTasty.results et le cookie au background script
  chrome.runtime.sendMessage({ type: "requestTagStatus", tabId }, (response) => {
    console.log("Réponse reçue:", response);
    status.textContent = response.isPresent ? "AB Tasty Tag: Present" : "AB Tasty Tag: Not Present";
    results.textContent = response.isPresent ? JSON.stringify(response.results, null, 2) : "N/A";
    cookie.textContent = response.isPresent ? response.cookie : "N/A";
  });
});
