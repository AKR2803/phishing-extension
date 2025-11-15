"""Phishing Guardian Flask Application."""
from flask import Flask
from flask_cors import CORS
from .api import api_bp
from .config import Config


def create_app(config_class=Config):
    """Application factory pattern."""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Enable CORS for browser extension
    CORS(app, origins=["chrome-extension://*"])
    
    # Register blueprints
    app.register_blueprint(api_bp, url_prefix='/api')
    
    return app