/**
 * Content script for email extraction and banner display
 */

// Prevent multiple injections
if (window.phishingGuardianLoaded) {
    console.log('🛡️ PhishingGuardian already loaded, skipping...');
} else {
    window.phishingGuardianLoaded = true;

    // Wrap everything in an IIFE to avoid global scope issues
    (function() {

// IMMEDIATE TEST - This should show up in Gmail console if content script loads
console.log('🛡️ PHISHING GUARDIAN CONTENT SCRIPT LOADED!');
console.log('🛡️ Current URL:', window.location.href);
console.log('🛡️ Document ready state:', document.readyState);

// Test if we're on Gmail
if (window.location.hostname.includes('mail.google.com')) {
    console.log('🛡️ Gmail detected!');
} else {
    console.log('🛡️ Not on Gmail:', window.location.hostname);
}

class PhishingGuardian {
    constructor() {
        this.apiUrl = 'http://localhost:8080/api';
        this.currentEmail = null;
        this.banner = null;
        this.chatbot = null;
        console.log('[PhishingGuardian] Extension initialized');
        this.init();
    }

    init() {
        this.detectEmailProvider();
        this.createChatbotButton();
        // Remove automatic scanning to prevent infinite calls
    }

    detectEmailProvider() {
        const hostname = window.location.hostname;
        console.log(`[PhishingGuardian] Detecting email provider for: ${hostname}`);
        
        if (hostname.includes('mail.google.com')) {
            this.provider = 'gmail';
            this.emailSelector = '[data-message-id], .adn';
            this.subjectSelector = 'h2, [data-thread-perm-id] h2, .hP';
            this.senderSelector = '[email], .go .g2, .gD';
            this.bodySelector = '.ii.gt div, .a3s.aiL, .ii.gt';
            console.log('[PhishingGuardian] Gmail provider detected');
        } else if (hostname.includes('outlook')) {
            this.provider = 'outlook';
            this.emailSelector = '[role="main"], .wide-content-host';
            this.subjectSelector = '[role="main"] h1, [data-testid="message-subject"]';
            this.senderSelector = '[data-testid="message-header-from-single"], [title*="@"]';
            this.bodySelector = '[data-testid="message-body-content"], [role="document"]';
            console.log('[PhishingGuardian] Outlook provider detected');
        } else {
            console.warn(`[PhishingGuardian] Unsupported email provider: ${hostname}`);
        }
    }

    // Removed automatic email observation to prevent infinite API calls

    async scanCurrentEmail() {
        console.log('[PhishingGuardian] Starting email scan...');
        try {
            const emailData = this.extractEmailData();
            
            if (emailData) {
                console.log('[PhishingGuardian] Email data extracted:', {
                    subject: emailData.subject?.substring(0, 50) + '...',
                    sender: emailData.sender,
                    bodyLength: emailData.body?.length,
                    provider: this.provider
                });
                this.currentEmail = emailData;
                await this.analyzeEmail(emailData);
                return emailData;
            } else {
                console.warn('[PhishingGuardian] No email data found');
            }
            return null;
        } catch (error) {
            console.error('[PhishingGuardian] Error scanning email:', error);
            return null;
        }
    }

    extractEmailData() {
        console.log(`[PhishingGuardian] Extracting email data using selectors for ${this.provider}`);
        
        // Try multiple selectors for email container
        const selectors = this.emailSelector.split(', ');
        let emailElement = null;
        for (const sel of selectors) {
            emailElement = document.querySelector(sel.trim());
            if (emailElement) break;
        }
        
        if (!emailElement) {
            console.warn(`[PhishingGuardian] Email element not found with selectors: ${this.emailSelector}`);
            // For Gmail, try to extract from current page anyway
            if (this.provider === 'gmail') {
                console.log('[PhishingGuardian] Attempting Gmail fallback extraction');
            }
        }

        const subject = this.extractText(this.subjectSelector);
        const sender = this.extractSender();
        const body = this.extractText(this.bodySelector);

        console.log('[PhishingGuardian] Extraction results:', {
            subjectFound: !!subject,
            senderFound: !!sender,
            bodyFound: !!body,
            subjectSelector: this.subjectSelector,
            senderSelector: this.senderSelector,
            bodySelector: this.bodySelector
        });

        if (!subject && !sender && !body) {
            console.warn('[PhishingGuardian] No email content extracted');
            return null;
        }

        return {
            subject: subject || '',
            sender: sender || '',
            body: body || '',
            headers: this.extractHeaders(),
            timestamp: Date.now()
        };
    }

    extractText(selector) {
        // Try multiple selectors separated by comma
        const selectors = selector.split(', ');
        for (const sel of selectors) {
            const element = document.querySelector(sel.trim());
            if (element && element.textContent.trim()) {
                return element.textContent.trim();
            }
        }
        return '';
    }

    extractSender() {
        // Try multiple selectors
        const selectors = this.senderSelector.split(', ');
        for (const sel of selectors) {
            const senderElement = document.querySelector(sel.trim());
            if (senderElement) {
                // Try different attributes for email
                const email = senderElement.getAttribute('email') || 
                             senderElement.getAttribute('title') || 
                             senderElement.textContent.trim();
                if (email) return email;
            }
        }
        return '';
    }

    extractHeaders() {
        // Extract additional metadata
        return {
            url: window.location.href,
            provider: this.provider,
            timestamp: new Date().toISOString()
        };
    }

    isNewEmail(emailData) {
        return !this.currentEmail || 
               this.currentEmail.timestamp !== emailData.timestamp ||
               this.currentEmail.subject !== emailData.subject;
    }

    async analyzeEmail(emailData) {
        console.log('[PhishingGuardian] Starting email analysis...');
        try {
            this.showLoadingBanner();

            console.log(`[PhishingGuardian] Making API request to: ${this.apiUrl}/classify`);
            const response = await fetch(`${this.apiUrl}/classify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData)
            });

            console.log(`[PhishingGuardian] API response status: ${response.status}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('[PhishingGuardian] Analysis result:', {
                is_phishing: result.is_phishing,
                confidence: result.confidence,
                risk_factors_count: result.risk_factors?.length || 0
            });
            
            this.showResultBanner(result);

            // Update stats
            chrome.runtime.sendMessage({
                action: 'updateStats',
                is_phish: result.is_phishing
            });

        } catch (error) {
            console.error('[PhishingGuardian] Analysis failed:', error);
            this.showErrorBanner();
        }
    }

    showLoadingBanner() {
        this.removeBanner();
        
        this.banner = document.createElement('div');
        this.banner.className = 'phishing-guardian-banner loading';
        this.banner.innerHTML = `
            <div class="banner-content">
                <div class="spinner"></div>
                <span>Analyzing email security...</span>
            </div>
        `;
        
        this.insertBanner();
    }

    showResultBanner(result) {
        this.removeBanner();
        
        const bannerClass = result.is_phishing ? 'danger' : 'safe';
        const icon = result.is_phishing ? '⚠️' : '✅';
        const title = result.is_phishing ? 'SUSPICIOUS EMAIL DETECTED' : 'EMAIL APPEARS SAFE';
        
        this.banner = document.createElement('div');
        this.banner.className = `phishing-guardian-banner ${bannerClass}`;
        this.banner.innerHTML = `
            <div class="banner-content">
                <button class="banner-close" data-action="close-banner">×</button>
                <div class="banner-header">
                    <span class="banner-icon">${icon}</span>
                    <span class="banner-title">${title}</span>
                </div>
                <div class="banner-details">
                    <p><strong>Confidence:</strong> ${Math.round(result.confidence * 100)}%</p>
                    <p><strong>Recommendation:</strong> ${result.recommendation}</p>
                    ${result.risk_factors.length > 0 ? `
                        <details>
                            <summary>Risk Factors (${result.risk_factors.length})</summary>
                            <ul>
                                ${result.risk_factors.map(factor => `<li>${factor}</li>`).join('')}
                            </ul>
                        </details>
                    ` : ''}
                </div>
                ${result.is_phishing ? `
                    <div class="banner-actions">
                        <button class="btn-report" data-action="report-email">Report & Delete</button>
                        <button class="btn-ignore" data-action="ignore-warning">Ignore Warning</button>
                    </div>
                ` : ''}
            </div>
        `;
        
        this.insertBanner();
        this.addBannerEventListeners();
    }

    showErrorBanner() {
        this.removeBanner();
        
        this.banner = document.createElement('div');
        this.banner.className = 'phishing-guardian-banner error';
        this.banner.innerHTML = `
            <div class="banner-content">
                <span class="banner-icon">⚠️</span>
                <span>Unable to analyze email. Please review manually.</span>
                <button class="banner-close" data-action="close-banner">×</button>
            </div>
        `;
        
        this.insertBanner();
        this.addBannerEventListeners();
    }

    insertBanner() {
        // Try multiple insertion points for Gmail
        const insertionPoints = [
            '.adn', // Gmail conversation view
            '[data-message-id]', // Gmail message
            '.ii.gt', // Gmail message body area
            '[role="main"]', // Outlook main area
            'body' // Fallback
        ];
        
        for (const selector of insertionPoints) {
            const container = document.querySelector(selector);
            if (container) {
                console.log(`[PhishingGuardian] Inserting banner at: ${selector}`);
                container.insertBefore(this.banner, container.firstChild);
                return;
            }
        }
        
        console.warn('[PhishingGuardian] Could not find suitable container for banner');
    }

    removeBanner() {
        if (this.banner && this.banner.parentNode) {
            this.banner.parentNode.removeChild(this.banner);
        }
    }

    addBannerEventListeners() {
        if (!this.banner) return;
        
        this.banner.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            
            if (action === 'close-banner') {
                this.removeBanner();
            } else if (action === 'report-email') {
                this.reportEmail();
            } else if (action === 'ignore-warning') {
                this.removeBanner();
            }
        });
    }

    createChatbotButton() {
        const button = document.createElement('div');
        button.className = 'phishing-guardian-chatbot-btn';
        button.innerHTML = '🛡️';
        button.title = 'Security Assistant';
        button.addEventListener('click', () => this.toggleChatbot());
        
        document.body.appendChild(button);
    }

    toggleChatbot() {
        if (this.chatbot) {
            this.closeChatbot();
        } else {
            this.openChatbot();
        }
    }

    openChatbot() {
        this.chatbot = document.createElement('div');
        this.chatbot.className = 'phishing-guardian-chatbot';
        this.chatbot.innerHTML = `
            <div class="chatbot-header">
                <span>🛡️ Security Assistant</span>
                <button data-action="close-chatbot">×</button>
            </div>
            <div class="chatbot-messages" id="chatbot-messages"></div>
            <div class="chatbot-input">
                <input type="text" id="chatbot-input" placeholder="Ask about email security...">
                <button data-action="send-message">Send</button>
            </div>
        `;
        
        document.body.appendChild(this.chatbot);
        
        // Add event listeners
        this.chatbot.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            if (action === 'close-chatbot') {
                this.closeChatbot();
            } else if (action === 'send-message') {
                this.sendMessage();
            }
        });
        
        // Add enter key listener
        document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Welcome message
        this.addChatMessage('assistant', 'Hello! I\'m your security assistant. Ask me about phishing, email security, or online safety.');
    }

    closeChatbot() {
        if (this.chatbot) {
            this.chatbot.remove();
            this.chatbot = null;
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        input.value = '';
        this.addChatMessage('user', message);
        
        try {
            // Include current email context in the chat
            const chatPayload = {
                message: message,
                session_id: 'extension-' + Date.now(),
                email_context: this.currentEmail ? {
                    subject: this.currentEmail.subject,
                    sender: this.currentEmail.sender,
                    body: this.currentEmail.body?.substring(0, 500) // Limit body length
                } : null
            };
            
            const response = await fetch(`${this.apiUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chatPayload)
            });
            
            const result = await response.json();
            this.addChatMessage('assistant', result.response);
            
        } catch (error) {
            this.addChatMessage('assistant', 'Sorry, I\'m having trouble right now. Please try again later.');
        }
    }

    addChatMessage(sender, message) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        messageDiv.textContent = message;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async reportEmail() {
        if (!this.currentEmail) return;
        
        try {
            const response = await fetch(`${this.apiUrl}/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.currentEmail)
            });
            
            if (response.ok) {
                alert('Email reported successfully. Thank you for helping improve security!');
                this.removeBanner();
            } else {
                alert('Failed to report email. Please try again.');
            }
            
        } catch (error) {
            console.error('Report failed:', error);
            alert('Failed to report email. Please try again.');
        }
    }
}

// Initialize when page loads (only if not already loaded)
if (!window.phishingGuardian) {
    console.log('[PhishingGuardian] Content script loading...');
    window.phishingGuardian = new PhishingGuardian();
    console.log('[PhishingGuardian] PhishingGuardian instance created');
} else {
    console.log('[PhishingGuardian] Using existing instance');
}

// Test if chrome.runtime is available
if (typeof chrome !== 'undefined' && chrome.runtime) {
    console.log('[PhishingGuardian] Chrome runtime available');
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('[PhishingGuardian] Message received:', request);
        console.log('[PhishingGuardian] Sender:', sender);
        
        if (request.action === 'test') {
            console.log('[PhishingGuardian] Test request received');
            sendResponse({
                success: true,
                message: 'Content script is working!',
                url: window.location.href,
                provider: window.phishingGuardian ? window.phishingGuardian.provider : 'unknown'
            });
            return;
        }
        
        if (request.action === 'scanEmail') {
            console.log('[PhishingGuardian] Processing scan request...');
            
            // Test immediate response
            console.log('[PhishingGuardian] Sending immediate test response');
            sendResponse({success: true, test: 'immediate response working'});
            
            // Then do actual scan
            window.phishingGuardian.scanCurrentEmail().then(result => {
                console.log('[PhishingGuardian] Scan completed with result:', result);
                // Send another message since we already sent immediate response
                chrome.runtime.sendMessage({
                    action: 'scanComplete',
                    success: true,
                    data: result
                });
            }).catch(error => {
                console.error('[PhishingGuardian] Scan failed:', error);
                chrome.runtime.sendMessage({
                    action: 'scanComplete',
                    success: false,
                    error: error.message
                });
            });
            
            return true; // Keep message channel open
        }
        
        console.log('[PhishingGuardian] Unknown action:', request.action);
        sendResponse({success: false, error: 'Unknown action'});
    });
    
    console.log('[PhishingGuardian] Message listener registered');
} else {
    console.error('[PhishingGuardian] Chrome runtime not available!');
}

// Test DOM ready state
console.log('[PhishingGuardian] Document ready state:', document.readyState);
console.log('[PhishingGuardian] Current URL:', window.location.href);

// Add window load event for additional debugging
window.addEventListener('load', () => {
    console.log('[PhishingGuardian] Window loaded');
});

// Test if we can find Gmail elements
setTimeout(() => {
    console.log('[PhishingGuardian] Testing element detection after 3 seconds...');
    const testSelectors = [
        '[data-message-id]',
        '.adn',
        'h2',
        '.hP',
        '[email]',
        '.go .g2',
        '.gD',
        '.ii.gt div',
        '.a3s.aiL',
        '.ii.gt'
    ];
    
    testSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        console.log(`[PhishingGuardian] Selector '${selector}' found ${elements.length} elements`);
        if (elements.length > 0) {
            console.log(`[PhishingGuardian] First element text preview:`, elements[0].textContent?.substring(0, 100));
        }
    });
}, 3000);

    })(); // Close IIFE
}