// Service worker for background tasks
chrome.runtime.onInstalled.addListener(() => {
    console.log('Northwestern Portal Enhancer installed');
    
    // Set default settings
    chrome.storage.sync.get('theme', (result) => {
      if (!result.theme) {
        chrome.storage.sync.set({
          theme: 'auto',
          enableCustomColors: false,
          enableTileOrganizer: false,
          enableCompactMode: false,
          primaryColor: '#168be8',
          secondaryColor: '#f0f1f5'
        });
      }
    });
  });
  