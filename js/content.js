let currentSettings = {};

// Load settings on page load
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
    currentSettings = items;
    initializeExtension();
  }
);

// Listen for settings updates from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'settingsUpdated') {
    currentSettings = request.settings;
    applySettings();
    sendResponse({ status: 'Settings applied' });
  }
});

function initializeExtension() {
  console.log('Northwestern Portal Enhancer loaded');

  // Wait for page to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onPageReady);
  } else {
    onPageReady();
  }
}

function onPageReady() {
  console.log('Page ready, applying settings...');
  applySettings();
  setupMutationObserver();
}

function applySettings() {
  applyTheme();

  if (currentSettings.enableCustomColors) {
    applyCustomColors();
  }

  if (currentSettings.enableCompactMode) {
    applyCompactMode();
  }

  if (currentSettings.enableTileOrganizer) {
    setupTileOrganizer();
  }
}

function applyTheme() {
  const theme = currentSettings.theme;

  if (theme === 'dark') {
    document.documentElement.setAttribute('data-portal-theme', 'dark');
  } else if (theme === 'light') {
    document.documentElement.setAttribute('data-portal-theme', 'light');
  } else {
    // Auto - detect system preference
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    document.documentElement.setAttribute(
      'data-portal-theme',
      prefersDark ? 'dark' : 'light'
    );
  }
}

function applyCustomColors() {
  const style =
    document.getElementById('nwu-custom-colors') ||
    document.createElement('style');
  style.id = 'nwu-custom-colors';

  const css = `
    :root {
      --portal-primary: ${currentSettings.primaryColor};
      --portal-secondary: ${currentSettings.secondaryColor};
    }
    
    #PT_HEADER,
    .ps_header {
      background-color: var(--portal-primary) !important;
    }
    
    .nuitile {
      border-color: var(--portal-primary) !important;
    }
    
    .ps_button,
    .ps-button {
      background-color: var(--portal-primary) !important;
    }
  `;

  style.textContent = css;
  if (!document.getElementById('nwu-custom-colors')) {
    document.head.appendChild(style);
  }
}

function applyCompactMode() {
  const style =
    document.getElementById('nwu-compact-mode') ||
    document.createElement('style');
  style.id = 'nwu-compact-mode';

  const css = `
    #PT_WRAPPER {
      --spacing-factor: 0.75;
    }
    
    .ps_header {
      padding: 8px 12px !important;
    }
    
    .nuitile {
      padding: 12px !important;
      margin: 6px !important;
    }
    
    .ps_groupleth {
      font-size: 13px !important;
    }
  `;

  style.textContent = css;
  if (!document.getElementById('nwu-compact-mode')) {
    document.head.appendChild(style);
  }
}

function setupTileOrganizer() {
  // Add tile organizer functionality
  const tiles = document.querySelectorAll('.nuitile');

  tiles.forEach((tile) => {
    tile.setAttribute('draggable', 'true');

    tile.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', tile.innerHTML);
    });

    tile.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      tile.style.opacity = '0.7';
    });

    tile.addEventListener('dragleave', () => {
      tile.style.opacity = '1';
    });

    tile.addEventListener('drop', (e) => {
      e.preventDefault();
      const fromTile = document.querySelector('[data-dragging]');
      if (fromTile && fromTile !== tile) {
        swapTiles(fromTile, tile);
      }
      tile.style.opacity = '1';
    });
  });
}

function swapTiles(tile1, tile2) {
  const temp = tile1.innerHTML;
  tile1.innerHTML = tile2.innerHTML;
  tile2.innerHTML = temp;
}

function setupMutationObserver() {
  // Watch for dynamic content changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Re-apply settings when new content is added
        if (currentSettings.enableTileOrganizer) {
          setupTileOrganizer();
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
  });
}
