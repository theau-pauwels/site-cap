from flask import Flask, jsonify
from flask_login import LoginManager
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_mail import Message

from .extensions import db, migrate, mail  # ← importe mail ici
from .routes_auth import bp_auth
from .routes_admin import bp_admin, bp_admin_orders, bp_orders
from .routes_memberships import bp_mem
from .routes_pins import bp_pins
from .routes_pins_request import bp_requests

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:postgres@db:5432/membres"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = "changeme"
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"pool_pre_ping": True}
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["SESSION_COOKIE_SECURE"] = True
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    
    from . import config
    
    app.config.update(
        MAIL_SERVER="smtp.gmail.com",
        MAIL_PORT=587,
        MAIL_USE_TLS=True,
        MAIL_USERNAME=config.MAIL_ADDRESS,
        MAIL_PASSWORD=config.MAIL_PASSWORD,
        MAIL_DEFAULT_SENDER=config.MAIL_ADDRESS
    )

    db.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)  # ← initialise mail ici

    login_manager = LoginManager()
    login_manager.init_app(app)

    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify({"error": "unauthorized"}), 401

    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

    # lazy import après db
    from .models import User

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(user_id)

    @app.get("/api/health")
    def health():
        return {"ok": True}

    @app.route("/api/test-mail")
    def test_mail():
        try:
            from . import config
            msg = Message(
                "Test mail",
                recipients=[config.MAIL_TEST],  # mets ton vrai email ici
                body="Si tu reçois ce mail, Flask-Mail fonctionne."
            )
            mail.send(msg)
            return "Mail envoyé !"
        except Exception as e:
            return f"Erreur mail: {e}"

    app.register_blueprint(bp_auth)
    app.register_blueprint(bp_admin)
    app.register_blueprint(bp_mem)
    app.register_blueprint(bp_pins)
    app.register_blueprint(bp_admin_orders)
    app.register_blueprint(bp_orders)
    app.register_blueprint(bp_requests)

    return app
