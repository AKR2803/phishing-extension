---
noteId: "28c1f7c0c25311f099322da580a057d0"
tags: []

---

# API Contract Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
No authentication required for development. Production should implement API keys.

## Endpoints

### 1. Email Classification

**POST** `/classify`

Classify email content as phishing or safe.

**Request Body:**
```json
{
  "subject": "Urgent: Verify your account",
  "sender": "security@bank-alert.com",
  "body": "Your account will be suspended unless you verify immediately...",
  "headers": {
    "url": "https://mail.google.com/...",
    "provider": "gmail",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Response:**
```json
{
  "is_phishing": true,
  "confidence": 0.92,
  "risk_factors": [
    "Suspicious keyword: urgent",
    "Suspicious keyword: verify",
    "Multiple URLs (4)"
  ],
  "recommendation": "High risk - Do not interact with this email"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request data
- `500` - Classification failed

---

### 2. Security Chatbot

**POST** `/chat`

Get response from security-focused chatbot.

**Request Body:**
```json
{
  "message": "How can I identify phishing emails?",
  "session_id": "extension-1642234567890"
}
```

**Response:**
```json
{
  "response": "Here are key signs of phishing emails: 1) Urgent language demanding immediate action...",
  "is_security_related": true,
  "suggestions": [
    "What are signs of a suspicious email?",
    "How to report phishing emails?",
    "Best practices for email security?"
  ]
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid message
- `500` - Chat service unavailable

---

### 3. Chat History

**GET** `/chat/history/{session_id}`

Retrieve chat history for a session.

**Response:**
```json
{
  "history": [
    {
      "user": "How can I identify phishing emails?",
      "assistant": "Here are key signs of phishing emails..."
    }
  ]
}
```

---

### 4. Report Phishing Email

**POST** `/report`

Report a phishing email for analysis and potential deletion.

**Request Body:**
```json
{
  "subject": "Urgent: Verify your account",
  "sender": "security@bank-alert.com",
  "body": "Your account will be suspended...",
  "headers": {
    "message_id": "gmail-message-id-123",
    "provider": "gmail"
  }
}
```

**Response:**
```json
{
  "status": "reported",
  "message": "Email reported successfully",
  "report_id": "rpt_1642234567890"
}
```

---

### 5. Delete Email

**DELETE** `/email/{email_id}`

Delete a reported phishing email from the user's mailbox.

**Parameters:**
- `email_id` - Email provider's message ID

**Response:**
```json
{
  "status": "deleted",
  "message": "Email deleted successfully"
}
```

---

### 6. Health Check

**GET** `/health`

Check API and model status.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "version": "1.0.0"
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Description of the error"
}
```

## Rate Limiting

- Classification: 100 requests/minute per IP
- Chat: 50 requests/minute per session
- Report: 10 requests/minute per IP

## CORS

All endpoints support CORS for browser extension origins:
- `chrome-extension://*`
- `moz-extension://*`