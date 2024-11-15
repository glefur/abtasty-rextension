// popup.js

document.addEventListener("DOMContentLoaded", async () => {
  const status = document.getElementById("status");
  const abtastyResultsTable = document.getElementById("abtastyResultsTable");
  const propertyTable = document.getElementById("propertyTable");
  const sessionTable = document.getElementById("sessionTable");
  const sessionTitle = document.querySelector("h3:nth-of-type(3)");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = tab.id;

  chrome.runtime.sendMessage({ type: "requestTagStatus", tabId }, (response) => {
    status.textContent = response.isPresent ? "AB Tasty Tag: Present" : "AB Tasty Tag: Not Present";

    if (response.isPresent) {
      chrome.runtime.sendMessage({ type: "fetchABTastyData", tabId }, (data) => {
        if (data.results) {
          populateABTastyResults(data.results, abtastyResultsTable);
        } else {
          abtastyResultsTable.insertAdjacentHTML("beforeend", "<tr><td colspan='4'>No data available</td></tr>");
        }

        if (data.cookie) {
          populateCookieData(data.cookie, propertyTable, sessionTable, sessionTitle);
        } else {
          propertyTable.insertAdjacentHTML("beforeend", "<tr><td colspan='2'>No cookie found</td></tr>");
        }
      });
    } else {
      propertyTable.insertAdjacentHTML("beforeend", "<tr><td colspan='2'>N/A</td></tr>");
      sessionTable.style.display = "none";
      sessionTitle.style.display = "none";
      abtastyResultsTable.insertAdjacentHTML("beforeend", "<tr><td colspan='4'>No data available</td></tr>");
    }
  });
});

// Fonction pour afficher AB Tasty Results dans la table
function populateABTastyResults(results, abtastyResultsTable) {
  Object.values(results).forEach(result => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${result.name}</td>
      <td>${result.type}</td>
      <td>${result.campaignID}</td>
      <td>${result.status}</td>
    `;
    abtastyResultsTable.appendChild(row);
  });
}

// Fonction pour afficher les données du cookie dans les tables
function populateCookieData(cookie, propertyTable, sessionTable, sessionTitle) {
  const propertyLabels = {
    uid: "Unique Visitor ID",
    fst: "First Session Timestamp",
    pst: "Previous Session Timestamp",
    cst: "Current Session Timestamp",
    ns: "Number of Sessions",
    pvt: "Total Pages Viewed",
    pvis: "Pages Viewed in Current Session"
  };

  const properties = {};
  const sessions = [];

  const pairs = cookie.split("&");
  pairs.forEach(pair => {
    const [key, value] = pair.split("=");
    if (key === "th") {
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
      properties[key] = value;
    }
  });

  for (const [key, value] of Object.entries(properties)) {
    const row = document.createElement("tr");
    const label = propertyLabels[key] || key;
    row.innerHTML = `<td>${label}</td><td>${value}</td>`;
    propertyTable.appendChild(row);
  }

  if (sessions.length > 0) {
    sessionTable.style.display = "table";
    sessionTitle.style.display = "block";
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
    sessionTable.style.display = "none";
    sessionTitle.style.display = "none";
  }
}
