from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from .models import db, User, Role

bp_admin = Blueprint("admin", __name__)

def require_admin():
    if not current_user.is_authenticated or current_user.role != Role.ADMIN:
        return False
    return True

@bp_admin.route("/api/admin/users", methods=["POST"])
@login_required
def create_user():
    if not require_admin():
        return jsonify({"error": "Forbidden"}), 403
    
    data = request.json
    new_user = User(
        email=data["email"],
        prenom=data["prenom"],
        nom=data["nom"],
        password_hash=generate_password_hash(data["password"]),
        role=Role.MEMBER
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"ok": True, "id": new_user.id})

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
