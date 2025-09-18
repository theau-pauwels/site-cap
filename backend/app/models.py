# app/models.py
from flask_login import UserMixin
from datetime import datetime
from enum import Enum
from sqlalchemy.orm import relationship
import uuid

from .extensions import db

class Role(Enum):
    MEMBER = "member"
    ADMIN  = "admin"
    VERIFIER = "verifier"
    ATTENTE = "en attente"

class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nom = db.Column(db.String, nullable=False)
    prenom = db.Column(db.String, nullable=False)
    member_id = db.Column(db.String(6), unique=True, nullable=True)
    email = db.Column(db.String, unique=True, nullable=True)
    password_hash = db.Column(db.String, nullable=False)

    reset_token = db.Column(db.String(36), nullable=True)
    reset_token_expiry = db.Column(db.DateTime, nullable=True)

    role = db.Column(db.Enum(Role, name="role_enum"), default=Role.MEMBER, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    memberships = relationship(
        "Membership",
        backref="user",
        cascade="all, delete-orphan"
    )
    orders = relationship(
        "Order",
        backref="user",
        cascade="all, delete-orphan"
    )
    activation_token = db.Column(db.String, nullable=True)
    activation_token_expiry = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=False)


class Membership(db.Model):
    __tablename__ = "membership"

    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(
        db.String,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    annee = db.Column(db.Integer, nullable=False)
    annee_code = db.Column(db.String, nullable=False)

    __table_args__ = (
        db.UniqueConstraint("user_id", "annee", name="uq_user_annee"),
        db.UniqueConstraint("annee", "annee_code", name="uq_annee_code_year")
    )


class Order(db.Model):
    __tablename__ = "order"

    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(
        db.String,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    status = db.Column(db.String, default="en attente")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    items = relationship(
        "OrderItem",
        backref="order",
        cascade="all, delete-orphan"
    )


class OrderItem(db.Model):
    __tablename__ = "order_item"

    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = db.Column(
        db.String,
        db.ForeignKey("order.id", ondelete="CASCADE"),
        nullable=False
    )
    pin_id = db.Column(db.String, nullable=False)
    title = db.Column(db.String, nullable=False)
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, default=1)
