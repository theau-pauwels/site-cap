from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from .models import db, User

bp_auth = Blueprint("auth", __name__)

@bp_auth.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json or {}
    email = (data.get("email") or "").lower()
    password = data.get("password") or ""
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401
    login_user(user)
    return jsonify({"ok": True, "user": {"email": user.email, "role": user.role.value}})

@bp_auth.route("/api/auth/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"ok": True})

@bp_auth.route("/api/auth/change-password", methods=["POST"])
@login_required
def change_password():
    data = request.json or {}
    old = data.get("old_password") or ""
    new = data.get("new_password") or ""
    if not check_password_hash(current_user.password_hash, old):
        return jsonify({"error":"Ancien mot de passe invalide"}), 400
    if len(new) < 8:
        return jsonify({"error":"Nouveau mot de passe trop court (min 8)"}), 400
    current_user.password_hash = generate_password_hash(new)
    db.session.commit()
    return jsonify({"ok": True})
