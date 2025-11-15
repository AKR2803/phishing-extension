---
noteId: "43726ee0c25f11f099322da580a057d0"
tags: []

---

# Chrome Extension Setup Guide

## Prerequisites
- Chrome browser
- Flask API running on `http://localhost:8080`
- Required icon files in `/icons/` folder

## Required Files
Ensure these files exist in the extension directory:
- `manifest.json` ✓
- `popup.html` ✓
- `popup.js` ✓
- `background.js` ✓
- `content.js` ✓
- `styles.css` ✓
- `icons/icon16.png` (16x16 pixels)
- `icons/icon48.png` (48x48 pixels)
- `icons/icon128.png` (128x128 pixels)

## Installation Steps

### 1. Open Chrome Extensions Page
- Type `chrome://extensions/` in address bar
- Or: Chrome Menu → More tools → Extensions

### 2. Enable Developer Mode
- Toggle "Developer mode" switch (top right corner)

### 3. Load Extension
- Click "Load unpacked" button
- Navigate to: `/Users/miteshpanchal/Desktop/POC-2/phishing-guardian/extension/`
- Select the extension folder
- Click "Select Folder"

### 4. Verify Installation
- Extension should appear in extensions list
- Pin extension to toolbar (click puzzle icon → pin)

## Usage

### 1. Start Flask API
```bash
cd /Users/miteshpanchal/Desktop/POC-2/phishing-guardian/backend
python run.py
```

### 2. Open Email Provider
- Go to Gmail (`https://mail.google.com`)
- Or Outlook (`https://outlook.live.com`)

### 3. Scan Email
- Open any email
- Click Phishing Guardian extension icon
- Click "Scan Current Email"
- View results

## Troubleshooting

**Extension not loading:**
- Check all required files exist
- Ensure icons are present
- Refresh extensions page

**API connection failed:**
- Verify Flask API is running on port 8080
- Check `http://localhost:8080/health` in browser

**No email content found:**
- Make sure you're on Gmail or Outlook
- Ensure email is fully loaded
- Try refreshing the page

## Features
- Real-time phishing detection
- Works with Gmail and Outlook
- Visual confidence scoring
- Secure local API communication