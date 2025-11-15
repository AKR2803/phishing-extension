---
noteId: "a73c0240c25211f099322da580a057d0"
tags: []

---

# Phishing Guardian

Production-ready phishing detection system with browser extension and AI-powered backend.

## Architecture

```
Browser Extension → Flask Backend → DistilBERT (Classification) + Bedrock (Chatbot)
```

## Features

- Real-time email phishing detection
- AI-powered security chatbot
- Email reporting and deletion
- Production-ready architecture
- Comprehensive testing

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python run.py
```

### Extension
```bash
cd extension
npm install
npm run build
# Load dist/ folder in Chrome
```

## API Endpoints

- `POST /api/classify` - Phishing detection
- `POST /api/chat` - Security chatbot
- `POST /api/report` - Report phishing email
- `DELETE /api/email/{id}` - Delete email

## Tech Stack

- **Backend**: Flask, DistilBERT, Amazon Bedrock
- **Frontend**: Vanilla JS, Chrome Extension APIs
- **ML**: Transformers, NLTK, PyTorch
- **Testing**: pytest, Jest