"""Phishing Guardian Flask Application."""
from flask import Flask
from flask_cors import CORS
from .api import api_bp
from .config import Config


def create_app(config_class=Config):
    """Application factory pattern."""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Enable CORS for browser extension and Gmail
    CORS(app, origins=[
        "chrome-extension://*",
        "https://mail.google.com",
        "https://outlook.live.com",
        "https://outlook.office.com",
        "http://localhost:*"
    ], supports_credentials=True)
    
    # Register blueprints
    app.register_blueprint(api_bp, url_prefix='/api')
    
    return app