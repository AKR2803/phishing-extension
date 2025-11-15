"""Email classification API routes."""
from flask import Blueprint, request, jsonify
try:
    from ...services.classifier import PhishingClassifier
except ImportError:
    # Fallback to mock classifier for testing
    from ...services.mock_classifier import MockPhishingClassifier as PhishingClassifier
from ...utils.validators import validate_email_data
from ...utils.logger import get_logger

bp = Blueprint('classify', __name__)
logger = get_logger(__name__)
classifier = PhishingClassifier()


@bp.route('/classify', methods=['POST'])
def classify_email():
    """Classify email as phishing or safe."""
    try:
        data = request.get_json()
        
        # Validate input
        validation_error = validate_email_data(data)
        if validation_error:
            return jsonify({'error': validation_error}), 400
        
        # Extract email content
        email_content = {
            'subject': data.get('subject', ''),
            'sender': data.get('sender', ''),
            'body': data.get('body', ''),
            'headers': data.get('headers', {})
        }
        
        # Classify
        result = classifier.classify(email_content)
        
        logger.info("Email classified", 
                   sender=email_content['sender'],
                   is_phishing=result['is_phishing'],
                   confidence=result['confidence'])
        
        return jsonify({
            'is_phishing': result['is_phishing'],
            'confidence': result['confidence'],
            'risk_factors': result['risk_factors'],
            'recommendation': result['recommendation']
        })
        
    except Exception as e:
        logger.error("Classification failed", error=str(e))
        return jsonify({'error': 'Classification failed'}), 500


@bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'model_loaded': classifier.is_loaded(),
        'version': '1.0.0'
    })