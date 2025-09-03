from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from werkzeug.security import generate_password_hash
from sqlalchemy.orm import joinedload
from .models import db, User, Role, Membership

bp_admin = Blueprint("admin", __name__)

def is_admin():
    return current_user.is_authenticated and current_user.role == Role.ADMIN

@bp_admin.route("/api/admin/users", methods=["GET", "POST"])
@login_required
def users_collection():
    if not is_admin():
        return jsonify({"error": "Forbidden"}), 403

    if request.method == "POST":
        data = request.json or {}
        nom = (data.get("nom") or "").strip()
        prenom = (data.get("prenom") or "").strip()
        email = (data.get("email") or "").strip().lower() or None
        member_id = (data.get("member_id") or "").strip() or None
        password = (data.get("password") or "").strip()

        if not nom or not prenom or not password:
            return jsonify({"error": "Champs requis: nom, prenom, password + (member_id OU email)"}), 400
        if not member_id and not email:
            return jsonify({"error": "Fournir soit member_id (6 chiffres) soit email"}), 400
        if member_id and (len(member_id) != 6 or not member_id.isdigit()):
            return jsonify({"error": "member_id doit être 6 chiffres"}), 400
        if member_id and User.query.filter_by(member_id=member_id).first():
            return jsonify({"error": "member_id déjà utilisé"}), 409
        if email and User.query.filter_by(email=email).first():
            return jsonify({"error": "email déjà utilisé"}), 409

        user = User(
            nom=nom,
            prenom=prenom,
            email=email,
            member_id=member_id,
            password_hash=generate_password_hash(password),
            role=Role.MEMBER,
        )
        db.session.add(user)
        db.session.commit()
        return jsonify({"ok": True, "id": user.id})

    # GET: lister avec dictionnaire {annee: code} + rôle
    users = (
        User.query
        .options(joinedload(User.memberships))
        .order_by(User.nom.asc(), User.prenom.asc())
        .all()
    )
    result = []
    for u in users:
        cartes = {str(m.annee): m.annee_code for m in (u.memberships or [])}
        result.append({
            "id": u.id,
            "nom": u.nom,
            "prenom": u.prenom,
            "identifiant": (u.member_id or u.email),
            "role": (u.role.value if hasattr(u.role, "value") else str(u.role)),  # "member" | "admin" | "verifier"
            "cartes": cartes,
        })
    return jsonify(result)

@bp_admin.route("/api/admin/users/<user_id>/role", methods=["PUT"])
@login_required
def set_user_role(user_id):
    """Changer le rôle d'un utilisateur (admin only)."""
    if not is_admin():
        return jsonify({"error": "Forbidden"}), 403

    target = User.query.get(user_id)
    if not target:
        return jsonify({"error": "User introuvable"}), 404

    data = request.get_json() or {}
    role_str = str(data.get("role", "")).lower().strip()
    allowed = {"member": Role.MEMBER, "admin": Role.ADMIN, "verifier": Role.VERIFIER}
    if role_str not in allowed:
        return jsonify({"error": "Rôle invalide"}), 400

    # (optionnel) éviter que l'admin courant se rétrograde par accident
    if target.id == current_user.id and role_str != "admin":
        return jsonify({"error": "Impossible de rétrograder votre propre compte."}), 400

    target.role = allowed[role_str]
    db.session.commit()
    return jsonify({"ok": True, "id": target.id, "role": role_str})
