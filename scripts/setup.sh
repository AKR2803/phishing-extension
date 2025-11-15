#!/bin/bash

# Phishing Guardian Setup Script

echo "🛡️  Setting up Phishing Guardian..."

# Check Python version
python_version=$(python3 --version 2>&1 | grep -o '[0-9]\+\.[0-9]\+')
# if [[ $(echo "$python_version < 3.8" | bc -l 2>/dev/null || echo "0") -eq 1 ]]; then
#     echo "❌ Python 3.8+ required. Current version: $python_version"
#     exit 1
# fi
echo "✅ Python $python_version detected"

# Setup backend
echo "📦 Setting up backend..."
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Download NLTK data
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

echo "✅ Backend setup complete"

# Setup extension
echo "📦 Setting up extension..."
cd ../extension

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required for extension development"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Install dependencies (if package.json exists)
if [ -f "package.json" ]; then
    npm install
fi

echo "✅ Extension setup complete"

# Create environment file
cd ..
if [ ! -f ".env" ]; then
    echo "📝 Creating environment file..."
    cat > .env << EOF
# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-here

# Model Configuration
MODEL_PATH=distilbert-base-uncased
MODEL_CACHE_DIR=./cache

# AWS Bedrock Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0

# Gmail API (Optional)
GMAIL_API_CREDENTIALS=path/to/credentials.json

# Logging
LOG_LEVEL=INFO
EOF
    echo "✅ Environment file created. Please update with your credentials."
else
    echo "ℹ️  Environment file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your AWS credentials"
echo "2. Start the backend: cd backend && source venv/bin/activate && python run.py"
echo "3. Load extension in Chrome: chrome://extensions/ -> Load unpacked -> select extension folder"
echo ""