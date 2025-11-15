document.addEventListener('DOMContentLoaded', function() {
  console.log('[PhishingGuardian Popup] Popup loaded');
  const testBtn = document.getElementById('testBtn');
  const scanBtn = document.getElementById('scanBtn');
  const quizBtn = document.getElementById('quizBtn');
  const chatBtn = document.getElementById('chatBtn');
  const status = document.getElementById('status');
  
  // Test connection button
  testBtn.addEventListener('click', async function() {
    console.log('[PhishingGuardian Popup] Test button clicked');
    status.innerHTML = '<p>Testing connection...</p>';
    
    try {
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      const tab = tabs[0];
      console.log(`[PhishingGuardian Popup] Testing on: ${tab.url}`);
      
      // First try to inject content script manually
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        console.log('[PhishingGuardian Popup] Content script injected manually');
      } catch (injectError) {
        console.log('[PhishingGuardian Popup] Manual injection failed:', injectError);
      }
      
      // Wait a bit then test
      setTimeout(async () => {
        try {
          const response = await chrome.tabs.sendMessage(tab.id, {action: 'test'});
          console.log('[PhishingGuardian Popup] Test response:', response);
          
          if (response) {
            status.innerHTML = '<p>✅ Extension is working! Content script responded.</p>';
          } else {
            status.innerHTML = '<p>❌ No response from content script.</p>';
          }
        } catch (msgError) {
          console.error('[PhishingGuardian Popup] Message error:', msgError);
          status.innerHTML = `<p>❌ Test failed: ${msgError.message}</p>`;
        }
      }, 1000);
      
    } catch (error) {
      console.error('[PhishingGuardian Popup] Test error:', error);
      status.innerHTML = `<p>❌ Test failed: ${error.message}</p>`;
    }
  });

  scanBtn.addEventListener('click', async function() {
    console.log('[PhishingGuardian Popup] Scan button clicked');
    status.innerHTML = '<p>Scanning email...</p>';
    
    try {
      // Check if we have chrome.tabs API
      if (!chrome.tabs) {
        throw new Error('Chrome tabs API not available');
      }
      
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      console.log('[PhishingGuardian Popup] Query result:', tabs);
      
      if (!tabs || tabs.length === 0) {
        throw new Error('No active tab found');
      }
      
      const tab = tabs[0];
      console.log(`[PhishingGuardian Popup] Active tab: ${tab.url}`);
      console.log(`[PhishingGuardian Popup] Tab ID: ${tab.id}`);
      
      // Check if tab URL is supported
      if (!tab.url.includes('mail.google.com') && !tab.url.includes('outlook')) {
        status.innerHTML = '<p>⚠️ Please navigate to Gmail or Outlook first.</p>';
        return;
      }
      
      // Send message to content script to scan email
      console.log('[PhishingGuardian Popup] Sending scan message to content script');
      
      const message = {action: 'scanEmail', timestamp: Date.now()};
      console.log('[PhishingGuardian Popup] Message:', message);
      
      const response = await chrome.tabs.sendMessage(tab.id, message);
      console.log('[PhishingGuardian Popup] Content script response:', response);
      
      if (response) {
        if (response.success) {
          if (response.test) {
            status.innerHTML = '<p>✅ Communication working! Scanning email...</p>';
            // Wait for actual scan result
            setTimeout(() => {
              status.innerHTML = '<p>✅ Scan initiated! Check the Gmail page for results.</p>';
            }, 2000);
          } else if (response.data) {
            status.innerHTML = '<p>✅ Email scanned successfully! Check the Gmail page for analysis results.</p>';
          } else {
            status.innerHTML = '<p>⚠️ No email content found. Open an email first, then try scanning.</p>';
          }
        } else {
          const errorMsg = response.error || 'Unknown error';
          status.innerHTML = `<p>❌ Scan failed: ${errorMsg}</p>`;
        }
      } else {
        status.innerHTML = '<p>❌ No response from content script. Extension may not be loaded on this page.</p>';
      }
    } catch (error) {
      console.error('[PhishingGuardian Popup] Scan error:', error);
      status.innerHTML = `<p>❌ Error: ${error.message}</p>`;
    }
  });

  quizBtn.addEventListener('click', function() {
    console.log('[PhishingGuardian Popup] Quiz button clicked');
    chrome.tabs.create({ url: chrome.runtime.getURL('quiz.html') });
  });

  chatBtn.addEventListener('click', function() {
    console.log('[PhishingGuardian Popup] Chat button clicked');
    window.open('https://mail.google.com', '_blank');
  });
});

// Email extraction is now handled by content script