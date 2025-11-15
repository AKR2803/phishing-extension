/**
 * Content script for email extraction and banner display
 */

class PhishingGuardian {
    constructor() {
        this.apiUrl = 'http://localhost:8080';
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
            this.emailSelector = '[data-message-id]';
            this.subjectSelector = 'h2[data-legacy-thread-id]';
            this.senderSelector = '[email]';
            this.bodySelector = '[data-message-id] .ii.gt div';
            console.log('[PhishingGuardian] Gmail provider detected');
        } else if (hostname.includes('outlook')) {
            this.provider = 'outlook';
            this.emailSelector = '[role="main"] [aria-label*="message"]';
            this.subjectSelector = '[role="main"] h1';
            this.senderSelector = '[role="main"] [title*="@"]';
            this.bodySelector = '[role="main"] [role="document"]';
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
        const emailElement = document.querySelector(this.emailSelector);
        
        if (!emailElement) {
            console.warn(`[PhishingGuardian] Email element not found with selector: ${this.emailSelector}`);
            return null;
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
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : '';
    }

    extractSender() {
        const senderElement = document.querySelector(this.senderSelector);
        if (!senderElement) return '';

        // Try different attributes for email
        return senderElement.getAttribute('email') || 
               senderElement.getAttribute('title') || 
               senderElement.textContent.trim();
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
                <div class="banner-header">
                    <span class="banner-icon">${icon}</span>
                    <span class="banner-title">${title}</span>
                    <button class="banner-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
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
                        <button class="btn-report" onclick="phishingGuardian.reportEmail()">Report & Delete</button>
                        <button class="btn-ignore" onclick="this.parentElement.parentElement.remove()">Ignore Warning</button>
                    </div>
                ` : ''}
            </div>
        `;
        
        this.insertBanner();
    }

    showErrorBanner() {
        this.removeBanner();
        
        this.banner = document.createElement('div');
        this.banner.className = 'phishing-guardian-banner error';
        this.banner.innerHTML = `
            <div class="banner-content">
                <span class="banner-icon">⚠️</span>
                <span>Unable to analyze email. Please review manually.</span>
                <button class="banner-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        this.insertBanner();
    }

    insertBanner() {
        const emailContainer = document.querySelector(this.emailSelector);
        if (emailContainer) {
            emailContainer.insertBefore(this.banner, emailContainer.firstChild);
        }
    }

    removeBanner() {
        if (this.banner && this.banner.parentNode) {
            this.banner.parentNode.removeChild(this.banner);
        }
    }

    createChatbotButton() {
        const button = document.createElement('div');
        button.className = 'phishing-guardian-chatbot-btn';
        button.innerHTML = '🛡️';
        button.title = 'Security Assistant';
        button.onclick = () => this.toggleChatbot();
        
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
                <button onclick="phishingGuardian.closeChatbot()">×</button>
            </div>
            <div class="chatbot-messages" id="chatbot-messages"></div>
            <div class="chatbot-input">
                <input type="text" id="chatbot-input" placeholder="Ask about email security...">
                <button onclick="phishingGuardian.sendMessage()">Send</button>
            </div>
        `;
        
        document.body.appendChild(this.chatbot);
        
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
            const response = await fetch(`${this.apiUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    session_id: 'extension-' + Date.now()
                })
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

// Initialize when page loads
const phishingGuardian = new PhishingGuardian();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[PhishingGuardian] Message received:', request);
    
    if (request.action === 'scanEmail') {
        console.log('[PhishingGuardian] Processing scan request...');
        phishingGuardian.scanCurrentEmail().then(result => {
            console.log('[PhishingGuardian] Scan completed, sending response');
            sendResponse({success: true, data: result});
        }).catch(error => {
            console.error('[PhishingGuardian] Scan failed:', error);
            sendResponse({success: false, error: error.message});
        });
        return true; // Keep message channel open
    }
});