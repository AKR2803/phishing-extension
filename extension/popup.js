document.addEventListener('DOMContentLoaded', function() {
  console.log('[PhishingGuardian Popup] Popup loaded');
  const scanBtn = document.getElementById('scanBtn');
  const chatBtn = document.getElementById('chatBtn');
  const status = document.getElementById('status');

  scanBtn.addEventListener('click', async function() {
    console.log('[PhishingGuardian Popup] Scan button clicked');
    status.innerHTML = '<p>Scanning email...</p>';
    
    try {
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      console.log(`[PhishingGuardian Popup] Active tab: ${tab.url}`);
      
      // Send message to content script to scan email
      console.log('[PhishingGuardian Popup] Sending scan message to content script');
      const response = await chrome.tabs.sendMessage(tab.id, {action: 'scanEmail'});
      console.log('[PhishingGuardian Popup] Content script response:', response);
      
      if (response && response.success && response.data) {
        status.innerHTML = '<p>Email scanned successfully! Check the page for results.</p>';
      } else {
        status.innerHTML = '<p>No email content found. Make sure you\'re on Gmail or Outlook.</p>';
      }
    } catch (error) {
      console.error('[PhishingGuardian Popup] Scan error:', error);
      status.innerHTML = '<p>Error scanning email. Make sure you\'re on Gmail or Outlook.</p>';
    }
  });

  chatBtn.addEventListener('click', function() {
    console.log('[PhishingGuardian Popup] Chat button clicked');
    window.open('https://mail.google.com', '_blank');
  });
});

// Email extraction is now handled by content script