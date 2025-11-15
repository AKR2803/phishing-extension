/**
 * Background script for extension statistics and messaging
 */

// Initialize storage on install
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
        totalScans: 0,
        phishDetected: 0,
        lastScan: null
    });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    (async () => {
        try {
            if (request.action === 'updateStats') {
                const result = await chrome.storage.local.get(['totalScans', 'phishDetected']);
                
                let totalScans = (result.totalScans || 0) + 1;
                let phishDetected = result.phishDetected || 0;
                
                if (request.is_phish) {
                    phishDetected += 1;
                }
                
                await chrome.storage.local.set({ 
                    totalScans, 
                    phishDetected,
                    lastScan: new Date().toISOString()
                });
                
                sendResponse({ status: 'success' });
            }
        } catch (error) {
            console.error("Background script error:", error);
            sendResponse({ status: 'error', message: error.toString() });
        }
    })();
    
    return true; // Keep message channel open for async response
});