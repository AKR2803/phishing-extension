---
noteId: "67f1cf60c25311f099322da580a057d0"
tags: []

---

# Quick Start Guide

## 1. Setup (5 minutes)

```bash
cd /Users/miteshpanchal/Desktop/POC-2/phishing-guardian
./scripts/setup.sh
```

## 2. Configure Environment

Edit `.env` file:
```bash
# Minimal config for testing
FLASK_ENV=development
SECRET_KEY=test-secret-key
AWS_REGION=us-east-1

# Add your AWS credentials (for chatbot)
AWS_ACCESS_KEY_ID=your-key-here
AWS_SECRET_ACCESS_KEY=your-secret-here
```

## 3. Start Backend

```bash
cd backend
source venv/bin/activate
python run.py
```

Backend runs at: http://localhost:8080

## 4. Test API Endpoints

### Test Classification (without ML model)
```bash
curl -X POST http://localhost:8080/api/classify \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "URGENT: Verify your account now!",
    "sender": "security@fake-bank.com",
    "body": "Click here immediately to verify your account or it will be suspended!"
  }'
```

### Test Health Check
```bash
curl http://localhost:8080/api/health
```

### Test Chatbot (requires AWS)
```bash
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How can I identify phishing emails?",
    "session_id": "test-session"
  }'
```

## 5. Load Extension in Chrome

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select: `/Users/miteshpanchal/Desktop/POC-2/phishing-guardian/extension`

## 6. Test Extension

1. Go to Gmail or Outlook
2. Open any email
3. Look for security banner
4. Click shield icon (🛡️) for chatbot

## Troubleshooting

**Backend won't start?**
```bash
cd backend
pip install flask flask-cors
python run.py
```

**Extension not working?**
- Check Chrome console for errors
- Verify backend is running on port 8080
- Check extension permissions

**Chatbot not responding?**
- Verify AWS credentials in `.env`
- Check AWS Bedrock model access
- Test with security-related questions only