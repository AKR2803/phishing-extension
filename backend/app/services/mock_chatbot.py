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
    
    def get_response(self, message: str, session_id: str = 'default') -> Dict:
        """Get mock chatbot response."""
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
            
            # Simple keyword matching for responses
            message_lower = message.lower()
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