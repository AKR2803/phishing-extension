"""Security chatbot API routes."""
from flask import Blueprint, request, jsonify
try:
    from ...services.chatbot import SecurityChatbot
except ImportError:
    # Fallback to mock chatbot for testing
    from ...services.mock_chatbot import MockSecurityChatbot as SecurityChatbot
from ...utils.validators import validate_chat_message
from ...utils.logger import get_logger

bp = Blueprint('chat', __name__)
logger = get_logger(__name__)
chatbot = SecurityChatbot()


@bp.route('/chat', methods=['POST'])
def chat_message():
    """Handle chatbot conversation."""
    try:
        data = request.get_json()
        
        # Validate input
        validation_error = validate_chat_message(data)
        if validation_error:
            return jsonify({'error': validation_error}), 400
        
        message = data.get('message', '').strip()
        session_id = data.get('session_id', 'default')
        
        # Get chatbot response
        response = chatbot.get_response(message, session_id)
        
        logger.info(f"Chat interaction - session_id: {session_id}, message_length: {len(message)}, is_security_related: {response['is_security_related']}")
        
        return jsonify({
            'response': response['message'],
            'is_security_related': response['is_security_related'],
            'suggestions': response.get('suggestions', [])
        })
        
    except Exception as e:
        logger.error(f"Chat failed: {str(e)}")
        return jsonify({'error': 'Chat service unavailable'}), 500


@bp.route('/chat/history/<session_id>', methods=['GET'])
def get_chat_history(session_id: str):
    """Get chat history for session."""
    try:
        history = chatbot.get_history(session_id)
        return jsonify({'history': history})
    except Exception as e:
        logger.error(f"Failed to get chat history: {str(e)}")
        return jsonify({'error': 'Failed to retrieve history'}), 500