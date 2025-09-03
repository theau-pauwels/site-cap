from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
from enum import Enum
from sqlalchemy.orm import relationship
import uuid

db = SQLAlchemy()

class Role(Enum):
    MEMBER = "member"
    ADMIN  = "admin"
    VERIFIER = "verifier"

class User(UserMixin, db.Model):
    __tablename__ = "user"
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nom = db.Column(db.String, nullable=False)
    prenom = db.Column(db.String, nullable=False)

    # Identifiant au choix : id 6 chiffres OU email (au moins l'un des deux)
    member_id = db.Column(db.String(6), unique=True, nullable=True)  # 6 chiffres
    email = db.Column(db.String, unique=True, nullable=True)

    password_hash = db.Column(db.String, nullable=False)
    role = db.Column(db.Enum(Role, name="role_enum"), default=Role.MEMBER, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    memberships = relationship("Membership", backref="user", cascade="all, delete-orphan")

    __table_args__ = (
        db.CheckConstraint("(member_id IS NOT NULL) OR (email IS NOT NULL)", name="user_id_or_email_required"),
        db.CheckConstraint("(member_id ~ '^[0-9]{6}$') OR (member_id IS NULL)", name="member_id_six_digits"),
    )

class Membership(db.Model):
    __tablename__ = "membership"
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    annee = db.Column(db.Integer, nullable=False)       # année de début (2025 => 2025-2026)
    annee_code = db.Column(db.String, nullable=False)   # ex: EA-23

    __table_args__ = (
        db.UniqueConstraint("user_id", "annee", name="uq_user_annee"),        # 1 carte max par user et par année
        db.UniqueConstraint("annee", "annee_code", name="uq_annee_code_year") # code unique dans une même année
    )
