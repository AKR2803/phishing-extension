"""Input validation utilities."""
from typing import Dict, Optional


def validate_email_data(data: Dict) -> Optional[str]:
    """Validate email classification request data."""
    if not isinstance(data, dict):
        return "Invalid request format"
    
    required_fields = ['subject', 'sender', 'body']
    for field in required_fields:
        if field not in data:
            return f"Missing required field: {field}"
    
    # Check field types and lengths
    if not isinstance(data['subject'], str) or len(data['subject']) > 1000:
        return "Invalid subject field"
    
    if not isinstance(data['sender'], str) or len(data['sender']) > 500:
        return "Invalid sender field"
    
    if not isinstance(data['body'], str) or len(data['body']) > 50000:
        return "Invalid body field (too long)"
    
    return None


def validate_chat_message(data: Dict) -> Optional[str]:
    """Validate chat message request data."""
    if not isinstance(data, dict):
        return "Invalid request format"
    
    if 'message' not in data:
        return "Missing message field"
    
    message = data['message']
    if not isinstance(message, str):
        return "Message must be a string"
    
    if len(message.strip()) == 0:
        return "Message cannot be empty"
    
    if len(message) > 2000:
        return "Message too long (max 2000 characters)"
    
    return None