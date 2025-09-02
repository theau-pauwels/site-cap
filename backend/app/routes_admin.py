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
        return jsonify({"error":"Forbidden"}), 403
    data = request.json or {}

    # Champs requis
    nom = (data.get("nom") or "").strip()
    prenom = (data.get("prenom") or "").strip()
    email = (data.get("email") or "").strip().lower() or None
    member_id = (data.get("member_id") or "").strip() or None
    password = (data.get("password") or "").strip()

    if not nom or not prenom or not password:
        return jsonify({"error":"Champs requis: nom, prenom, password + (member_id OU email)"}), 400
    if not member_id and not email:
        return jsonify({"error":"Fournir soit member_id (6 chiffres) soit email"}), 400
    if member_id and (len(member_id)!=6 or not member_id.isdigit()):
        return jsonify({"error":"member_id doit être 6 chiffres"}), 400

    if member_id and User.query.filter_by(member_id=member_id).first():
        return jsonify({"error":"member_id déjà utilisé"}), 409
    if email and User.query.filter_by(email=email).first():
        return jsonify({"error":"email déjà utilisé"}), 409

    user = User(nom=nom, prenom=prenom, email=email, member_id=member_id,
                password_hash=generate_password_hash(password), role=Role.MEMBER)
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
