"""Mock classifier for testing without DistilBERT model."""
import re
from typing import Dict, List
from ..utils.logger import get_logger

logger = get_logger(__name__)


class MockPhishingClassifier:
    """Mock classifier using rule-based detection for testing."""
    
    def __init__(self):
        self.phishing_keywords = [
            'urgent', 'verify', 'suspend', 'click here', 'act now',
            'limited time', 'congratulations', 'winner', 'prize',
            'bank account', 'credit card', 'social security',
            'confirm identity', 'update payment', 'expired'
        ]
        
        self.suspicious_domains = [
            'fake-bank.com', 'phishing-site.net', 'scam-alert.org',
            'suspicious-email.com', 'fake-security.net'
        ]
    
    def is_loaded(self) -> bool:
        """Mock model is always loaded."""
        return True
    
    def classify(self, email_content: Dict) -> Dict:
        """Mock classification using simple rules."""
        try:
            subject = email_content.get('subject', '').lower()
            body = email_content.get('body', '').lower()
            sender = email_content.get('sender', '').lower()
            
            risk_score = 0
            risk_factors = []
            
            # Check for phishing keywords
            for keyword in self.phishing_keywords:
                if keyword in subject or keyword in body:
                    risk_score += 0.2
                    risk_factors.append(f"Suspicious keyword: {keyword}")
            
            # Check sender domain
            for domain in self.suspicious_domains:
                if domain in sender:
                    risk_score += 0.4
                    risk_factors.append(f"Suspicious sender domain: {domain}")
            
            # Check for urgency indicators
            urgency_words = ['urgent', 'immediate', 'asap', 'now', 'today']
            urgency_count = sum(1 for word in urgency_words if word in subject or word in body)
            if urgency_count > 0:
                risk_score += urgency_count * 0.15
                risk_factors.append(f"Urgency indicators ({urgency_count})")
            
            # Check for multiple URLs
            url_count = len(re.findall(r'http[s]?://', body))
            if url_count > 2:
                risk_score += 0.2
                risk_factors.append(f"Multiple URLs ({url_count})")
            
            # Check for suspicious patterns
            if 'click' in body and ('here' in body or 'link' in body):
                risk_score += 0.15
                risk_factors.append("Suspicious click request")
            
            # Determine if phishing
            is_phishing = risk_score > 0.5
            confidence = min(risk_score, 0.95)  # Cap at 95%
            
            # Generate recommendation
            if is_phishing and confidence > 0.8:
                recommendation = "High risk - Do not interact with this email"
            elif is_phishing and confidence > 0.6:
                recommendation = "Medium risk - Exercise caution"
            elif risk_score > 0.2:
                recommendation = "Low risk - Some suspicious elements detected"
            else:
                recommendation = "Email appears safe"
            
            logger.info(f"Mock classification completed - is_phishing: {is_phishing}, confidence: {confidence:.2f}, risk_factors: {len(risk_factors)}")
            
            return {
                'is_phishing': is_phishing,
                'confidence': confidence,
                'risk_factors': risk_factors,
                'recommendation': recommendation
            }
            
        except Exception as e:
            logger.error(f"Mock classification failed: {str(e)}")
            return {
                'is_phishing': False,
                'confidence': 0.0,
                'risk_factors': ['Classification error'],
                'recommendation': 'Unable to analyze - please review manually'
            }