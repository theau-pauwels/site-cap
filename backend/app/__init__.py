from flask import Flask, jsonify
from flask_login import LoginManager, current_user
from .models import db, User
from .routes_auth import bp_auth
from .routes_admin import bp_admin
from .routes_memberships import bp_mem
from werkzeug.middleware.proxy_fix import ProxyFix

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:postgres@db:5432/membres"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = "changeme"
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"pool_pre_ping": True}
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["SESSION_COOKIE_SECURE"] = True
    app.config["SESSION_COOKIE_HTTPONLY"] = True

    db.init_app(app)
    login_manager = LoginManager(); login_manager.init_app(app)
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)


    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(user_id)

    @app.get("/api/health")
    def health():
        return {"ok": True}

    @app.get("/api/me")
    def me():
        if current_user.is_authenticated:
            role_val = getattr(current_user.role, "value", current_user.role)
            return {"authenticated": True, "email": current_user.email, "role": role_val}
        return {"authenticated": False}, 401

    app.register_blueprint(bp_auth)
    app.register_blueprint(bp_admin)
    app.register_blueprint(bp_mem)
    return app
