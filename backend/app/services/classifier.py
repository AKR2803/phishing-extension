"""DistilBERT-based phishing classifier."""
import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
from typing import Dict, List
import re
import nltk
from nltk.corpus import stopwords
from ..utils.logger import get_logger

logger = get_logger(__name__)


class PhishingClassifier:
    """DistilBERT-based phishing email classifier."""
    
    def __init__(self, model_path: str = None):
        self.model_path = model_path or "distilbert-base-uncased"
        self.tokenizer = None
        self.model = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self._load_model()
        self._download_nltk_data()
    
    def _download_nltk_data(self):
        """Download required NLTK data."""
        try:
            nltk.download('stopwords', quiet=True)
            nltk.download('punkt', quiet=True)
        except Exception as e:
            logger.warning("Failed to download NLTK data", error=str(e))
    
    def _load_model(self):
        """Load DistilBERT model and tokenizer."""
        try:
            self.tokenizer = DistilBertTokenizer.from_pretrained(self.model_path)
            self.model = DistilBertForSequenceClassification.from_pretrained(
                self.model_path, 
                num_labels=2
            )
            self.model.to(self.device)
            self.model.eval()
            logger.info("Model loaded successfully", device=str(self.device))
        except Exception as e:
            logger.error("Failed to load model", error=str(e))
            raise
    
    def is_loaded(self) -> bool:
        """Check if model is loaded."""
        return self.model is not None and self.tokenizer is not None
    
    def _preprocess_text(self, text: str) -> str:
        """Preprocess email text."""
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        # Remove URLs
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '[URL]', text)
        # Remove emails
        text = re.sub(r'\S+@\S+', '[EMAIL]', text)
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    
    def _extract_features(self, email_content: Dict) -> List[str]:
        """Extract risk factors from email content."""
        risk_factors = []
        
        subject = email_content.get('subject', '').lower()
        body = email_content.get('body', '').lower()
        sender = email_content.get('sender', '').lower()
        
        # Suspicious keywords
        phishing_keywords = [
            'urgent', 'verify', 'suspend', 'click here', 'act now',
            'limited time', 'congratulations', 'winner', 'prize',
            'bank account', 'credit card', 'social security'
        ]
        
        for keyword in phishing_keywords:
            if keyword in subject or keyword in body:
                risk_factors.append(f"Suspicious keyword: {keyword}")
        
        # Sender analysis
        if 'noreply' in sender or 'no-reply' in sender:
            risk_factors.append("No-reply sender")
        
        # URL analysis
        url_count = len(re.findall(r'http[s]?://', body))
        if url_count > 3:
            risk_factors.append(f"Multiple URLs ({url_count})")
        
        return risk_factors
    
    def classify(self, email_content: Dict) -> Dict:
        """Classify email content."""
        try:
            # Combine email parts
            text = f"{email_content.get('subject', '')} {email_content.get('body', '')}"
            text = self._preprocess_text(text)
            
            # Tokenize
            inputs = self.tokenizer(
                text,
                return_tensors='pt',
                truncation=True,
                padding=True,
                max_length=512
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Predict
            with torch.no_grad():
                outputs = self.model(**inputs)
                probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
                confidence = float(torch.max(probabilities))
                prediction = int(torch.argmax(probabilities))
            
            is_phishing = prediction == 1
            risk_factors = self._extract_features(email_content)
            
            # Generate recommendation
            if is_phishing and confidence > 0.8:
                recommendation = "High risk - Do not interact with this email"
            elif is_phishing and confidence > 0.6:
                recommendation = "Medium risk - Exercise caution"
            else:
                recommendation = "Low risk - Email appears safe"
            
            return {
                'is_phishing': is_phishing,
                'confidence': confidence,
                'risk_factors': risk_factors,
                'recommendation': recommendation
            }
            
        except Exception as e:
            logger.error("Classification failed", error=str(e))
            return {
                'is_phishing': False,
                'confidence': 0.0,
                'risk_factors': ['Classification error'],
                'recommendation': 'Unable to analyze - please review manually'
            }