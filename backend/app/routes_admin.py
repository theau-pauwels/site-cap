from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from werkzeug.security import generate_password_hash
from .models import db, User, Role

bp_admin = Blueprint("admin", __name__)

def is_admin():
    return current_user.is_authenticated and current_user.role == Role.ADMIN

@bp_admin.route("/api/admin/users", methods=["POST"])
@login_required
def create_user():
    if not is_admin():
        return jsonify({"error": "Forbidden"}), 403
    data = request.json or {}
    user = User(
        email=data["email"].lower(),
        prenom=data["prenom"],
        nom=data["nom"],
        password_hash=generate_password_hash(data["password"]),
        role=Role.MEMBER
    )
    db.session.add(user); db.session.commit()
    return jsonify({"ok": True, "id": user.id})
    
@bp_admin.route("/api/admin/users", methods=["GET"])
@login_required
def list_users():
    if not is_admin():
        return jsonify({"error": "Forbidden"}), 403
    users = User.query.order_by(User.nom.asc(), User.prenom.asc()).all()

    def identifiant(u):
        # si plus tard vous ajoutez un champ `member_id` (6 chiffres), renvoyez-le ici,
        # sinon fallback sur l'email :
        return getattr(u, "member_id", None) or u.email

    return jsonify([
        {
            "id": u.id,                 # l'UUID interne (utile pour des actions)
            "nom": u.nom,
            "prenom": u.prenom,
            "identifiant": identifiant(u)
        }
        for u in users
    ])
