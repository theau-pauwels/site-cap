from flask import Blueprint, request, jsonify, current_app
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash
from .models import db, User

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
