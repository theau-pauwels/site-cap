from flask import Flask
from flask_login import LoginManager
from .models import db, User
from .routes_auth import bp_auth
from .routes_admin import bp_admin

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:postgres@db:5432/membres"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = "changeme"
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"pool_pre_ping": True}
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"   # par défaut OK
    app.config["SESSION_COOKIE_SECURE"] = False     # en local (HTTP). Passe à True en prod HTTPS.


    db.init_app(app)

    login_manager = LoginManager()
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(user_id)

    # Route de santé (doit exister)
    @app.get("/api/health")
    def health():
        return {"ok": True}

    from flask_login import current_user

    @app.get("/api/me")
    def me():
        if current_user.is_authenticated:
            return {"authenticated": True, "email": current_user.email, "role": current_user.role.value}
        return {"authenticated": False}, 401

    
    # Enregistrer les blueprints
    app.register_blueprint(bp_auth)
    app.register_blueprint(bp_admin)
    return app
