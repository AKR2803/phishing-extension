"""Amazon Bedrock-powered security chatbot."""
import boto3
import json
from typing import Dict, List
from ..utils.logger import get_logger

logger = get_logger(__name__)


class SecurityChatbot:
    """Security-focused chatbot using Amazon Bedrock."""
    
    def __init__(self):
        self.bedrock_client = boto3.client('bedrock-runtime', region_name='us-east-1')
        self.model_id = 'anthropic.claude-3-haiku-20240307-v1:0'
        self.sessions = {}  # In-memory session storage
        
        self.security_keywords = [
            'phishing', 'malware', 'virus', 'security', 'password',
            'hack', 'breach', 'scam', 'fraud', 'suspicious', 'threat',
            'cybersecurity', 'email', 'spam', 'firewall', 'antivirus'
        ]
    
    def _is_security_related(self, message: str) -> bool:
        """Check if message is security-related."""
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in self.security_keywords)
    
    def _get_system_prompt(self) -> str:
        """Get system prompt for security chatbot."""
        return """You are a cybersecurity expert assistant focused on email security and phishing detection.

IMPORTANT RULES:
1. ONLY answer questions related to cybersecurity, email security, phishing, malware, or online safety
2. If asked about non-security topics, respond with: "I can only help with cybersecurity and email security questions. Please ask about phishing, malware, online safety, or related security topics."
3. Provide practical, actionable advice
4. Keep responses concise but informative
5. Always prioritize user safety

You can help with:
- Identifying phishing emails
- Email security best practices
- Password security
- Malware protection
- Online safety tips
- Suspicious link analysis
- Security software recommendations"""
    
    def get_response(self, message: str, session_id: str = 'default', email_context: Dict = None) -> Dict:
        """Get chatbot response."""
        try:
            # Check if security-related
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
            
            # Get conversation history
            history = self.sessions.get(session_id, [])
            
            # Enhance message with email context if provided
            enhanced_message = message
            if email_context:
                context_info = f"\n\nCurrent email context:\nSubject: {email_context.get('subject', 'N/A')}\nSender: {email_context.get('sender', 'N/A')}\nBody preview: {email_context.get('body', 'N/A')[:200]}..."
                enhanced_message = message + context_info
            
            # Prepare messages for Bedrock
            messages = [
                {"role": "user", "content": enhanced_message}
            ]
            
            # Add recent history (last 5 exchanges)
            for exchange in history[-5:]:
                messages.insert(-1, {"role": "user", "content": exchange['user']})
                messages.insert(-1, {"role": "assistant", "content": exchange['assistant']})
            
            # Call Bedrock
            body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 500,
                "system": self._get_system_prompt(),
                "messages": messages
            }
            
            response = self.bedrock_client.invoke_model(
                modelId=self.model_id,
                body=json.dumps(body)
            )
            
            response_body = json.loads(response['body'].read())
            assistant_message = response_body['content'][0]['text']
            
            # Store in session
            if session_id not in self.sessions:
                self.sessions[session_id] = []
            
            self.sessions[session_id].append({
                'user': message,
                'assistant': assistant_message
            })
            
            # Keep only last 10 exchanges per session
            if len(self.sessions[session_id]) > 10:
                self.sessions[session_id] = self.sessions[session_id][-10:]
            
            return {
                'message': assistant_message,
                'is_security_related': True,
                'suggestions': self._get_suggestions(message)
            }
            
        except Exception as e:
            logger.error("Chatbot error", error=str(e))
            return {
                'message': "I'm having trouble right now. Please try again later.",
                'is_security_related': True,
                'suggestions': []
            }
    
    def _get_suggestions(self, message: str) -> List[str]:
        """Get follow-up suggestions based on message."""
        message_lower = message.lower()
        
        if 'phishing' in message_lower:
            return [
                "How to report phishing emails?",
                "What to do if I clicked a phishing link?",
                "Signs of phishing attempts?"
            ]
        elif 'password' in message_lower:
            return [
                "How to use password managers?",
                "Two-factor authentication setup?",
                "Password security best practices?"
            ]
        elif 'malware' in message_lower:
            return [
                "How to remove malware?",
                "Preventing malware infections?",
                "Best antivirus software?"
            ]
        else:
            return [
                "Email security tips?",
                "How to stay safe online?",
                "Identifying suspicious emails?"
            ]
    
    def get_history(self, session_id: str) -> List[Dict]:
        """Get chat history for session."""
        return self.sessions.get(session_id, [])