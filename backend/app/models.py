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
    # Champs demandés (français)
    nom = db.Column(db.String, nullable=False)       # Nom
    prenom = db.Column(db.String, nullable=False)    # Prenom

    # Identifiant au choix : id_6_chiffres OU adresse_mail
    member_id = db.Column(db.String(6), unique=True, nullable=True)  # "id_6_chiffres"
    email = db.Column(db.String, unique=True, nullable=True)         # "adresse_mail"

    # Sécurité / rôles (si tu gardes l’admin)
    password_hash = db.Column(db.String, nullable=False)
    role = db.Column(db.Enum(Role, name="role_enum"), default=Role.MEMBER, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        # Au moins l'un des deux doit être renseigné
        db.CheckConstraint("(member_id IS NOT NULL) OR (email IS NOT NULL)", name="user_id_or_email_required"),
        # Si présent, member_id doit être 6 chiffres
        db.CheckConstraint("(member_id ~ '^[0-9]{6}$') OR (member_id IS NULL)", name="member_id_six_digits"),
    )

class Membership(db.Model):
    """
    Le 'dictionnaire {année -> id-de-l'année}' est stocké
    sous forme de lignes : une par année de validité pour un user.
    """
    __tablename__ = "membership"
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False)

    # clé du dictionnaire
    annee = db.Column(db.Integer, nullable=False)              # année de validité (ex: 2025)
    annee_code = db.Column(db.String, nullable=False)          # "id-de-l'année" (valeur du dictionnaire)

    # Un seul enregistrement par (user, année)
    __table_args__ = (db.UniqueConstraint("user_id", "annee", name="uq_user_annee"),)
