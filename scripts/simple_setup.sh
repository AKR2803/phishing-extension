#!/bin/bash

# Simple setup without version checks
echo "🛡️  Setting up Phishing Guardian..."

# Setup backend
echo "📦 Setting up backend..."
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install minimal dependencies
pip install --upgrade pip
pip install flask flask-cors requests

echo "✅ Backend setup complete"

# Create environment file
cd ..
if [ ! -f ".env" ]; then
    echo "📝 Creating environment file..."
    cat > .env << EOF
FLASK_ENV=development
SECRET_KEY=test-secret-key
LOG_LEVEL=INFO
EOF
    echo "✅ Environment file created"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start:"
echo "1. cd backend && source venv/bin/activate && python run.py"
echo "2. Load extension: chrome://extensions/ -> Load unpacked -> select extension folder"
echo "3. Test: python test_system.py"
echo ""