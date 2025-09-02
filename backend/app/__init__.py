from flask import Flask
from flask_login import LoginManager
from .models import db, User
from .routes_auth import bp_auth
from .routes_admin import bp_admin

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:postgres@db:5432/membres"
    app.config["SECRET_KEY"] = "changeme"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    db.init_app(app)
    
    login_manager = LoginManager()
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(user_id)
    
    app.register_blueprint(bp_auth)
    app.register_blueprint(bp_admin)
    return app
