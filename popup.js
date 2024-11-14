// popup.js

document.addEventListener("DOMContentLoaded", async () => {
  const status = document.getElementById("status");
  const results = document.getElementById("results");
  const cookie = document.getElementById("cookie");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = tab.id;

  // Demande le statut du tag au background script
  chrome.runtime.sendMessage({ type: "requestTagStatus", tabId }, (response) => {
    status.textContent = response.isPresent ? "AB Tasty Tag: Present" : "AB Tasty Tag: Not Present";

    if (response.isPresent) {
      // Si le tag est présent, demande ABTasty.results et le cookie au mainWorldScript.js
      chrome.runtime.sendMessage({ type: "fetchABTastyData", tabId }, (data) => {
        results.textContent = data.results ? JSON.stringify(data.results, null, 2) : "No data available";
        cookie.textContent = data.cookie;
      });
    } else {
      results.textContent = "N/A";
      cookie.textContent = "N/A";
    }
  });
});
