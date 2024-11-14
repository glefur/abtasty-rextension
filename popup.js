// popup.js

document.addEventListener("DOMContentLoaded", async () => {
  const status = document.getElementById("status");
  const propertyTable = document.getElementById("propertyTable");
  const sessionTable = document.getElementById("sessionTable");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = tab.id;

  chrome.runtime.sendMessage({ type: "requestTagStatus", tabId }, (response) => {
    status.textContent = response.isPresent ? "AB Tasty Tag: Present" : "AB Tasty Tag: Not Present";

    if (response.isPresent) {
      chrome.runtime.sendMessage({ type: "fetchABTastyData", tabId }, (data) => {
        if (data.cookie) {
          // Affiche le cookie de manière formatée
          populateCookieData(data.cookie, propertyTable, sessionTable);
        } else {
          propertyTable.insertAdjacentHTML("beforeend", "<tr><td colspan='2'>No cookie found</td></tr>");
        }
      });
    } else {
      propertyTable.insertAdjacentHTML("beforeend", "<tr><td colspan='2'>N/A</td></tr>");
      sessionTable.style.display = "none";
    }
  });
});

// Fonction pour afficher les données du cookie dans les tables
function populateCookieData(cookie, propertyTable, sessionTable) {
  // Mappage des clés aux libellés explicites pour les propriétés connues
  const propertyLabels = {
    uid: "Unique Visitor ID",
    fst: "First Session Timestamp",
    pst: "Previous Session Timestamp",
    cst: "Current Session Timestamp",
    ns: "Number of Sessions",
    pvt: "Total Pages Viewed",
    pvis: "Pages Viewed in Current Session"
  };

  // Analyse les données du cookie en deux parties
  const properties = {};
  const sessions = [];

  // Séparer les propriétés principales et les sessions
  const pairs = cookie.split("&");
  pairs.forEach(pair => {
    const [key, value] = pair.split("=");
    if (key === "th") {
      // Cas des sessions listées sous la clé `th`
      if (value) {
        const sessionEntries = value.split("_");
        sessionEntries.forEach(entry => {
          const sessionData = entry.split(".");
          sessions.push({
            campaignID: sessionData[0],
            variationID: sessionData[1],
            pagesSeen: sessionData[2],
            currentSessionPagesSeen: sessionData[3],
            sessionCount: sessionData[4],
            variationApplied: sessionData[5] === "1" ? "Yes" : "No",
            firstSeen: new Date(parseInt(sessionData[6])).toLocaleString(),
            lastSeen: new Date(parseInt(sessionData[7])).toLocaleString(),
            randomAllocation: sessionData[8] === "1" ? "Yes" : "No",
            lastSeenSession: sessionData[9]
          });
        });
      }
    } else {
      // Propriétés principales
      properties[key] = value;
    }
  });

  // Remplir la table des propriétés avec des libellés explicites
  for (const [key, value] of Object.entries(properties)) {
    const row = document.createElement("tr");
    const label = propertyLabels[key] || key; // Utilise le libellé explicite si connu, sinon la clé
    row.innerHTML = `<td>${label}</td><td>${value}</td>`;
    propertyTable.appendChild(row);
  }

  // Remplir la table des sessions, ou masquer la table si aucune session n'est présente
  if (sessions.length > 0) {
    sessionTable.style.display = "table";
    sessions.forEach(session => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${session.campaignID}</td><td>${session.variationID}</td><td>${session.pagesSeen}</td>
        <td>${session.currentSessionPagesSeen}</td><td>${session.sessionCount}</td>
        <td>${session.variationApplied}</td><td>${session.firstSeen}</td>
        <td>${session.lastSeen}</td><td>${session.randomAllocation}</td><td>${session.lastSeenSession}</td>
      `;
      sessionTable.appendChild(row);
    });
  } else {
    sessionTable.style.display = "none"; // Masque la table si `th` est vide ou nulle
  }
}
