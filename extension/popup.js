document.addEventListener('DOMContentLoaded', function() {
  const testBtn = document.getElementById('testBtn');
  const scanBtn = document.getElementById('scanBtn');
  const quizBtn = document.getElementById('quizBtn');
  const chatBtn = document.getElementById('chatBtn');
  const status = document.getElementById('status');
  
  // Test connection button
  testBtn.addEventListener('click', async function() {
    status.innerHTML = '<p>Testing connection...</p>';
    
    try {
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      const tab = tabs[0];
      
      const response = await chrome.tabs.sendMessage(tab.id, {action: 'test'});
      
      if (response) {
        status.innerHTML = '<p>✅ Extension is working! Content script responded.</p>';
      } else {
        status.innerHTML = '<p>❌ No response from content script.</p>';
      }
    } catch (error) {
      status.innerHTML = `<p>❌ Test failed: ${error.message}</p>`;
    }
  });

  scanBtn.addEventListener('click', async function() {
    status.innerHTML = '<p>Scanning email...</p>';
    
    try {
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      const tab = tabs[0];
      
      if (!tab.url.includes('mail.google.com') && !tab.url.includes('outlook')) {
        status.innerHTML = '<p>⚠️ Please navigate to Gmail or Outlook first.</p>';
        return;
      }
      
      const response = await chrome.tabs.sendMessage(tab.id, {action: 'scanEmail'});
      
      if (response && response.success) {
        status.innerHTML = '<p>✅ Scan initiated! Check the Gmail page for results.</p>';
      } else {
        status.innerHTML = '<p>⚠️ No email content found. Open an email first, then try scanning.</p>';
      }
    } catch (error) {
      status.innerHTML = `<p>❌ Error: ${error.message}</p>`;
    }
  });

  quizBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: chrome.runtime.getURL('quiz.html') });
  });

  chatBtn.addEventListener('click', function() {
    window.open('https://mail.google.com', '_blank');
  });
});

// Email extraction is now handled by content script