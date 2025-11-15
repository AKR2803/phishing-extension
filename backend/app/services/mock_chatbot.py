"""Mock chatbot for testing without AWS Bedrock."""
from typing import Dict, List
from ..utils.logger import get_logger

logger = get_logger(__name__)


class MockSecurityChatbot:
    """Mock security chatbot for testing without AWS."""
    
    def __init__(self):
        self.sessions = {}
        self.security_keywords = [
            'phishing', 'malware', 'virus', 'security', 'password',
            'hack', 'breach', 'scam', 'fraud', 'suspicious', 'threat',
            'cybersecurity', 'email', 'spam', 'firewall', 'antivirus'
        ]
        
        self.responses = {
            'phishing': "Phishing emails often have urgent language, suspicious links, and request personal information. Look for spelling errors, generic greetings, and mismatched sender domains.",
            'password': "Use strong, unique passwords for each account. Enable two-factor authentication and consider using a password manager like Bitwarden or 1Password.",
            'malware': "Keep your software updated, use reputable antivirus, avoid suspicious downloads, and be cautious with email attachments.",
            'security': "Practice good cybersecurity hygiene: regular updates, strong passwords, backup data, and stay informed about current threats.",
            'default': "I can help with cybersecurity questions about phishing, passwords, malware, and online safety. What would you like to know?"
        }
    
    def _is_security_related(self, message: str) -> bool:
        """Check if message is security-related."""
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in self.security_keywords)
    
    def get_response(self, message: str, session_id: str = 'default', email_context: Dict = None) -> Dict:
        """Get mock chatbot response with email context."""
        try:
            is_security_related = self._is_security_related(message)
            
            if not is_security_related:
                return {
                    'message': "I can only help with cybersecurity and email security questions. Please ask about phishing, malware, online safety, or related security topics.",
                    'is_security_related': False,
                    'suggestions': [
                        "How can I identify phishing emails?",
                        "What are signs of a suspicious email?",
                        "How to create strong passwords?",
                        "Best practices for email security?"
                    ]
                }
            
            # Handle email context questions
            message_lower = message.lower()
            
            if email_context and ('why' in message_lower or 'not flagged' in message_lower or 'safe' in message_lower):
                response_text = self._analyze_email_context(email_context, message)
            else:
                # Simple keyword matching for responses
                response_text = self.responses['default']
                
                for keyword, response in self.responses.items():
                    if keyword != 'default' and keyword in message_lower:
                        response_text = response
                        break
            
            # Store in session
            if session_id not in self.sessions:
                self.sessions[session_id] = []
            
            self.sessions[session_id].append({
                'user': message,
                'assistant': response_text
            })
            
            return {
                'message': response_text,
                'is_security_related': True,
                'suggestions': self._get_suggestions(message)
            }
            
        except Exception as e:
            logger.error("Mock chatbot error", error=str(e))
            return {
                'message': "I'm having trouble right now. Please try again later.",
                'is_security_related': True,
                'suggestions': []
            }
    
    def _analyze_email_context(self, email_context: Dict, message: str) -> str:
        """Analyze email context and provide specific feedback."""
        subject = email_context.get('subject', '')
        sender = email_context.get('sender', '')
        body = email_context.get('body', '')
        
        analysis = []
        risk_level = "LOW"
        
        # Check for common phishing indicators
        if any(word in subject.lower() for word in ['urgent', 'verify', 'suspend', 'action required', 'immediate', 'expires']):
            analysis.append("⚠️ Subject uses urgent/threatening language")
            risk_level = "MEDIUM"
        
        if any(word in body.lower() for word in ['click here', 'verify account', 'suspended', 'expires', 'confirm identity', 'update payment']):
            analysis.append("⚠️ Body contains suspicious action requests")
            risk_level = "HIGH"
        
        if sender and any(indicator in sender.lower() for indicator in ['noreply', 'no-reply', 'security-alert']):
            analysis.append("⚠️ Generic sender address")
        
        # Check for domain spoofing
        if sender and any(char in sender for char in ['0', '1', '-', '_']) and 'gmail' not in sender and 'outlook' not in sender:
            analysis.append("⚠️ Potentially spoofed sender domain")
            risk_level = "HIGH"
        
        if analysis:
            return f"**EMAIL ANALYSIS - {risk_level} RISK**\n\nSubject: {subject}\nFrom: {sender}\n\n**Red Flags Found:**\n" + "\n".join(analysis) + "\n\n**Recommendation:** Be cautious with this email. Verify sender through alternative means before taking any action."
        else:
            return f"**EMAIL ANALYSIS - LOW RISK**\n\nSubject: {subject}\nFrom: {sender}\n\n**Assessment:** This email appears legitimate with no obvious red flags. However, always remain vigilant and verify unexpected requests through official channels."
    
    def _get_suggestions(self, message: str) -> List[str]:
        """Get follow-up suggestions."""
        return [
            "How to report phishing emails?",
            "Password security best practices?",
            "Signs of malware infection?"
        ]
    
    def get_history(self, session_id: str) -> List[Dict]:
        """Get chat history for session."""
        return self.sessions.get(session_id, [])