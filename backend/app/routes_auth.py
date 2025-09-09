from flask import Blueprint, request, jsonify, current_app
from flask_login import login_user, logout_user, login_required, current_user
from .models import db, User, Role
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import IntegrityError


bp_auth = Blueprint("auth", __name__)

@bp_auth.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()
        password = (data.get("password") or "")

        user = None
        if email:
            user = User.query.filter_by(email=email).first()
        else:
            ident = (data.get("identifiant") or "").strip()
            if ident and ident.isdigit() and len(ident) == 6:
                user = User.query.filter_by(member_id=ident).first()

        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({"error": "Invalid credentials"}), 401

        login_user(user)
        role_value = getattr(user.role, "value", user.role)
        return jsonify({"ok": True, "user": {
            "email": user.email or "",
            "member_id": user.member_id or "",
            "role": role_value
        }})
    except Exception:
        current_app.logger.exception("Login error")
        return jsonify({"error": "Server error"}), 500

@bp_auth.route("/api/auth/logout", methods=["POST"])
@login_required
def logout():
    print("Logout user:", current_user)
    logout_user()
    return jsonify({"ok": True})


@bp_auth.route("/api/me", methods=["GET"])
@login_required
def me():
    user = current_user
    role_value = getattr(user.role, "value", user.role)
    return jsonify({
        "email": user.email or "",
        "member_id": user.member_id or "",
        "role": role_value
    })

@bp_auth.route("/api/auth/register", methods=["POST"])
def register():
    try:
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()
        password = (data.get("password") or "")
        nom = (data.get("nom") or "").strip()
        prenom = (data.get("prenom") or "").strip()

        # Validation minimale
        if not email or not password or not nom or not prenom:
            return jsonify({"error": "Tous les champs sont requis"}), 400

        if len(password) < 6:
            return jsonify({"error": "Le mot de passe doit contenir au moins 6 caractères"}), 400

        # Vérifie que l'email n'est pas déjà utilisé
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Un compte existe déjà avec cet email"}), 400

        # Création de l'utilisateur avec Enum Role
        user = User(
            email=email,
            nom=nom,
            prenom=prenom,
            password_hash=generate_password_hash(password),
            role=Role.MEMBER, 
        )

        db.session.add(user)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return jsonify({"error": "Un compte existe déjà avec cet email"}), 400

        # Connecte automatiquement après inscription
        login_user(user)

        return jsonify({
            "ok": True,
            "user": {
                "email": user.email or "",
                "member_id": user.member_id or "",
                "nom": user.nom,
                "prenom": user.prenom,
                "role": user.role.value  # renvoie "member", "admin", ou "verifier"
            }
        })
    except Exception as e:
        current_app.logger.exception("Register error")
        return jsonify({"error": str(e)}), 500
