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

// Extension loaded

class PhishingGuardian {
    constructor() {
        this.apiUrl = 'http://localhost:8080/api';
        this.currentEmail = null;
        this.banner = null;
        this.chatbot = null;

        this.init();
    }

    init() {
        this.detectEmailProvider();
        this.createChatbotButton();
        // Remove automatic scanning to prevent infinite calls
    }

    detectEmailProvider() {
        const hostname = window.location.hostname;
        if (hostname.includes('mail.google.com')) {
            this.provider = 'gmail';
            this.emailSelector = '[data-message-id], .adn';
            this.subjectSelector = 'h2, [data-thread-perm-id] h2, .hP';
            this.senderSelector = '[email], .go .g2, .gD';
            this.bodySelector = '.ii.gt div, .a3s.aiL, .ii.gt';
        } else if (hostname.includes('outlook')) {
            this.provider = 'outlook';
            this.emailSelector = '[role="main"], .wide-content-host';
            this.subjectSelector = '[role="main"] h1, [data-testid="message-subject"]';
            this.senderSelector = '[data-testid="message-header-from-single"], [title*="@"]';
            this.bodySelector = '[data-testid="message-body-content"], [role="document"]';
        }
    }

    // Removed automatic email observation to prevent infinite API calls

    async scanCurrentEmail() {
        try {
            const emailData = this.extractEmailData();
            
            if (emailData) {
                this.currentEmail = emailData;
                await this.analyzeEmail(emailData);
                return emailData;
            }
            return null;
        } catch (error) {
            console.error('[PhishingGuardian] Error scanning email:', error);
            return null;
        }
    }

    extractEmailData() {
        // Try multiple selectors for email container
        const selectors = this.emailSelector.split(', ');
        let emailElement = null;
        for (const sel of selectors) {
            emailElement = document.querySelector(sel.trim());
            if (emailElement) break;
        }

        const subject = this.extractText(this.subjectSelector);
        const sender = this.extractSender();
        const body = this.extractText(this.bodySelector);

        if (!subject && !sender && !body) {
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
        try {
            this.showLoadingBanner();

            const response = await fetch(`${this.apiUrl}/classify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
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
                <div class="banner-header">
                    <span class="banner-icon">${icon}</span>
                    <span class="banner-title">${title}</span>
                </div>
                <div class="banner-details">
                    <p><strong>Confidence:</strong> ${Math.round(result.confidence * 100)}%</p>
                    <p><strong>Recommendation:</strong> ${result.recommendation}</p>
                </div>
                ${result.is_phishing ? `
                    <div class="banner-actions">
                        <button class="btn-report" data-action="report-email">Report</button>
                        <button class="btn-ignore" data-action="ignore-warning">Ignore</button>
                    </div>
                ` : ''}
                <button class="banner-close" data-action="close-banner">×</button>
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
        // Try to insert above subject line in Gmail
        const subjectSelectors = [
            'h2[data-legacy-thread-id]', // Gmail subject
            '.hP', // Gmail subject alternative
            'h2', // Generic subject
            '[role="main"] h1' // Outlook subject
        ];
        
        // First try to insert above subject
        for (const selector of subjectSelectors) {
            const subjectElement = document.querySelector(selector);
            if (subjectElement) {
                subjectElement.parentNode.insertBefore(this.banner, subjectElement);
                return;
            }
        }
        
        // Fallback to conversation container
        const fallbackSelectors = [
            '.adn', // Gmail conversation view
            '[data-message-id]', // Gmail message
            '[role="main"]', // Outlook main area
            'body' // Final fallback
        ];
        
        for (const selector of fallbackSelectors) {
            const container = document.querySelector(selector);
            if (container) {
                container.insertBefore(this.banner, container.firstChild);
                return;
            }
        }
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
        
        // Load chat history and show welcome message
        this.loadChatHistory();
        
        // Add welcome message if no history
        const messagesContainer = document.getElementById('chatbot-messages');
        if (messagesContainer.children.length === 0) {
            this.addChatMessage('assistant', 'Hello! I\'m your security assistant. Ask me about phishing, email security, or online safety.');
        }
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
                session_id: this.getSessionId(),
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

    async loadChatHistory() {
        try {
            const sessionId = this.getSessionId();
            const response = await fetch(`${this.apiUrl}/chat/history/${sessionId}`);
            
            if (response.ok) {
                const data = await response.json();
                const history = data.history || [];
                
                // Display history
                history.forEach(exchange => {
                    this.addChatMessage('user', exchange.user);
                    this.addChatMessage('assistant', exchange.assistant);
                });
            }
        } catch (error) {
            // Chat history not available
        }
    }
    
    getSessionId() {
        // Use a consistent session ID based on current email or URL
        if (this.currentEmail && this.currentEmail.sender) {
            return 'session-' + btoa(this.currentEmail.sender).substring(0, 10);
        }
        return 'session-' + btoa(window.location.href).substring(0, 10);
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
    window.phishingGuardian = new PhishingGuardian();
}

// Listen for messages from popup
if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'test') {
            sendResponse({
                success: true,
                message: 'Content script is working!',
                url: window.location.href,
                provider: window.phishingGuardian ? window.phishingGuardian.provider : 'unknown'
            });
            return;
        }
        
        if (request.action === 'scanEmail') {
            sendResponse({success: true, test: 'immediate response working'});
            
            window.phishingGuardian.scanCurrentEmail().then(result => {
                chrome.runtime.sendMessage({
                    action: 'scanComplete',
                    success: true,
                    data: result
                });
            }).catch(error => {
                chrome.runtime.sendMessage({
                    action: 'scanComplete',
                    success: false,
                    error: error.message
                });
            });
            
            return true;
        }
        
        sendResponse({success: false, error: 'Unknown action'});
    });
}

    })(); // Close IIFE
}