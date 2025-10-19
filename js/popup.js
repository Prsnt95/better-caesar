document.addEventListener('DOMContentLoaded', loadSettings);

document.getElementById('saveBtn').addEventListener('click', saveSettings);
document.getElementById('resetBtn').addEventListener('click', resetSettings);

function loadSettings() {
  chrome.storage.sync.get(
    {
      theme: 'auto',
      enableCustomColors: false,
      enableTileOrganizer: false,
      enableCompactMode: false,
      primaryColor: '#168be8',
      secondaryColor: '#f0f1f5',
    },
    (items) => {
      document.getElementById('themeSelect').value = items.theme;
      document.getElementById('enableCustomColors').checked =
        items.enableCustomColors;
      document.getElementById('enableTileOrganizer').checked =
        items.enableTileOrganizer;
      document.getElementById('enableCompactMode').checked =
        items.enableCompactMode;
      document.getElementById('primaryColor').value = items.primaryColor;
      document.getElementById('secondaryColor').value = items.secondaryColor;
    }
  );
}

function saveSettings() {
  const settings = {
    theme: document.getElementById('themeSelect').value,
    enableCustomColors: document.getElementById('enableCustomColors').checked,
    enableTileOrganizer: document.getElementById('enableTileOrganizer').checked,
    enableCompactMode: document.getElementById('enableCompactMode').checked,
    primaryColor: document.getElementById('primaryColor').value,
    secondaryColor: document.getElementById('secondaryColor').value,
  };

  chrome.storage.sync.set(settings, () => {
    showStatus('Settings saved successfully!', 'success');

    // Notify content script of settings change
    chrome.tabs.query(
      { url: 'https://caesar.ent.northwestern.edu/*' },
      (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs
            .sendMessage(tab.id, {
              action: 'settingsUpdated',
              settings: settings,
            })
            .catch(() => {
              // Tab might not have content script loaded
            });
        });
      }
    );
  });
}

function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to default?')) {
    chrome.storage.sync.clear(() => {
      loadSettings();
      showStatus('Settings reset to default', 'success');
    });
  }
}

function showStatus(message, type) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;

  setTimeout(() => {
    statusEl.className = 'status-message';
    statusEl.textContent = '';
  }, 3000);
}
