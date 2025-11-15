document.addEventListener('DOMContentLoaded', function() {
  const scanBtn = document.getElementById('scanBtn');
  const chatBtn = document.getElementById('chatBtn');
  const status = document.getElementById('status');

  scanBtn.addEventListener('click', async function() {
    status.innerHTML = '<p>Scanning email...</p>';
    
    try {
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      
      const results = await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: extractEmailContent
      });
      
      if (results[0].result) {
        const emailData = results[0].result;
        const response = await fetch('http://localhost:8080/classify', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(emailData)
        });
        
        const result = await response.json();
        
        if (result.is_phishing) {
          status.innerHTML = `<div class="danger">⚠️ PHISHING DETECTED<br>Confidence: ${(result.confidence * 100).toFixed(1)}%</div>`;
        } else {
          status.innerHTML = `<div class="safe">✅ Email appears safe<br>Confidence: ${(result.confidence * 100).toFixed(1)}%</div>`;
        }
      } else {
        status.innerHTML = '<p>No email content found. Make sure you\'re on Gmail or Outlook.</p>';
      }
    } catch (error) {
      status.innerHTML = '<p>Error scanning email. Make sure API is running.</p>';
    }
  });

  chatBtn.addEventListener('click', function() {
    window.open('https://mail.google.com', '_blank');
  });
});

function extractEmailContent() {
  // Gmail extraction
  if (window.location.hostname === 'mail.google.com') {
    const subject = document.querySelector('[data-thread-perm-id] h2')?.textContent || '';
    const sender = document.querySelector('[data-thread-perm-id] .go span[email]')?.getAttribute('email') || '';
    const body = document.querySelector('[data-thread-perm-id] .ii.gt div')?.textContent || '';
    
    return { subject, sender, body };
  }
  
  // Outlook extraction
  if (window.location.hostname.includes('outlook')) {
    const subject = document.querySelector('[role="main"] h1')?.textContent || '';
    const sender = document.querySelector('[data-testid="message-header-from-single"]')?.textContent || '';
    const body = document.querySelector('[data-testid="message-body-content"]')?.textContent || '';
    
    return { subject, sender, body };
  }
  
  return null;
}