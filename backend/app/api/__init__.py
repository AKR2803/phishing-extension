"""API Blueprint."""
from flask import Blueprint
from .routes import classify, chat, email

api_bp = Blueprint('api', __name__)

# Register route modules
api_bp.register_blueprint(classify.bp)
api_bp.register_blueprint(chat.bp)
api_bp.register_blueprint(email.bp)