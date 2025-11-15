---
noteId: "31f5d6a0c25c11f099322da580a057d0"
tags: []

---

# Phishing Guardian API Documentation

## Overview
The Phishing Guardian API provides endpoints for email classification, security chatbot interactions, and email management. This RESTful API helps detect phishing emails and provides security guidance.

**Base URL:** `http://localhost:8080`  
**Version:** 1.0.0  
**Content-Type:** `application/json`

## Authentication
Currently, no authentication is required for API endpoints.

## Endpoints

### 1. Email Classification

#### POST /classify
Classify an email as phishing or safe using machine learning.

**Request Body:**
```json
{
  "subject": "string",
  "sender": "string", 
  "body": "string",
  "headers": {
    "key": "value"
  }
}
```

**Response:**
```json
{
  "is_phishing": boolean,
  "confidence": number,
  "risk_factors": ["string"],
  "recommendation": "string"
}
```

**Example:**
```bash
curl -X POST http://localhost:8080/classify \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Urgent: Verify your account",
    "sender": "noreply@suspicious-site.com",
    "body": "Click here to verify your account immediately or it will be suspended."
  }'
```

### 2. Health Check

#### GET /health
Check the health status of the classification service.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": boolean,
  "version": "1.0.0"
}
```

### 3. Security Chatbot

#### POST /chat
Interact with the security chatbot for phishing-related questions.

**Request Body:**
```json
{
  "message": "string",
  "session_id": "string" (optional)
}
```

**Response:**
```json
{
  "response": "string",
  "is_security_related": boolean,
  "suggestions": ["string"]
}
```

**Example:**
```bash
curl -X POST http://localhost:8080/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How can I identify phishing emails?",
    "session_id": "user123"
  }'
```

#### GET /chat/history/{session_id}
Retrieve chat history for a specific session.

**Parameters:**
- `session_id` (path): Session identifier

**Response:**
```json
{
  "history": [
    {
      "message": "string",
      "response": "string",
      "timestamp": "string"
    }
  ]
}
```

### 4. Email Management

#### POST /report
Report a phishing email to the system.

**Request Body:**
```json
{
  "sender": "string",
  "subject": "string",
  "body": "string",
  "headers": {}
}
```

**Response:**
```json
{
  "status": "reported",
  "message": "Email reported successfully",
  "report_id": "string"
}
```

#### DELETE /email/{email_id}
Delete an email (mock implementation for integration with email providers).

**Parameters:**
- `email_id` (path): Email identifier

**Response:**
```json
{
  "status": "deleted",
  "message": "Email deleted successfully"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 500 Internal Server Error
```json
{
  "error": "Service unavailable or internal error"
}
```

## Data Models

### Email Data
```json
{
  "subject": "string",
  "sender": "string",
  "body": "string", 
  "headers": {
    "key": "value"
  }
}
```

### Classification Result
```json
{
  "is_phishing": boolean,
  "confidence": number (0.0-1.0),
  "risk_factors": ["string"],
  "recommendation": "string"
}
```

### Chat Message
```json
{
  "message": "string",
  "session_id": "string"
}
```

## Configuration

The API can be configured using environment variables:

- `PORT`: Server port (default: 8080)
- `FLASK_ENV`: Environment (development/production)
- `MODEL_PATH`: Path to ML model
- `AWS_REGION`: AWS region for Bedrock
- `LOG_LEVEL`: Logging level (INFO, DEBUG, ERROR)

## Rate Limiting
Currently, no rate limiting is implemented.

## CORS
Cross-Origin Resource Sharing (CORS) is enabled for all origins.

## Logging
All API requests and responses are logged with appropriate log levels for monitoring and debugging.