from flask import Flask
from flask_cors import CORS
from flask_session import Session
import os
import redis

from .chat import bp as chat_bp

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)

    app.config.from_pyfile("config.py")
    app.secret_key = os.urandom(24)

    # Configure server-side session storage with Redis
    redis_host = os.getenv('REDIS_HOST', 'localhost')
    redis_port = os.getenv('REDIS_PORT', 6379)
    redis_url = f"redis://{redis_host}:{redis_port}"

    app.config["SESSION_TYPE"] = "redis"
    app.config["SESSION_PERMANENT"] = False
    app.config["SESSION_USE_SIGNER"] = True
    app.config["SESSION_REDIS"] = redis.from_url(redis_url)

    Session(app)

    app.register_blueprint(chat_bp)

    return app