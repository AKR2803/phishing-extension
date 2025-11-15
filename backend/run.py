"""Flask application entry point."""
from app import create_app
from app.config import DevelopmentConfig, ProductionConfig
import os

# Determine configuration
config_class = ProductionConfig if os.environ.get('FLASK_ENV') == 'production' else DevelopmentConfig

# Create application
app = create_app(config_class)

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=app.config.get('DEBUG', False)
    )