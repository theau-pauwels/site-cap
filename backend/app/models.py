from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
from enum import Enum
import uuid

db = SQLAlchemy()

class Role(Enum):
    MEMBER = "member"
    ADMIN  = "admin"

class User(UserMixin, db.Model):
    __tablename__ = "user"
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String, unique=True, nullable=False)
    prenom = db.Column(db.String, nullable=False)
    nom = db.Column(db.String, nullable=False)
    password_hash = db.Column(db.String, nullable=False)

    # IMPORTANT : nommer le type pour Postgres
    role = db.Column(db.Enum(Role, name="role_enum"), default=Role.MEMBER, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
