"""Configuration settings."""
import os
from dataclasses import dataclass


@dataclass
class Config:
    """Base configuration."""
    SECRET_KEY: str = os.environ.get('SECRET_KEY', 'dev-secret-key')
    
    # Model settings
    MODEL_PATH: str = os.environ.get('MODEL_PATH', './models/distilbert-phishing')
    MODEL_CACHE_DIR: str = os.environ.get('MODEL_CACHE_DIR', './cache')
    
    # AWS Bedrock settings
    AWS_REGION: str = os.environ.get('AWS_REGION', 'us-east-1')
    BEDROCK_MODEL_ID: str = os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-3-haiku-20240307-v1:0')
    
    # Email provider settings
    GMAIL_API_CREDENTIALS: str = os.environ.get('GMAIL_API_CREDENTIALS')
    
    # Logging
    LOG_LEVEL: str = os.environ.get('LOG_LEVEL', 'INFO')


@dataclass
class ProductionConfig(Config):
    """Production configuration."""
    DEBUG: bool = False
    TESTING: bool = False


@dataclass
class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG: bool = True
    TESTING: bool = False


@dataclass
class TestingConfig(Config):
    """Testing configuration."""
    DEBUG: bool = True
    TESTING: bool = True