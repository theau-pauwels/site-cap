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
            return jsonify({"error":"Champs requis: nom, prenom, password + (member_id OU email)"}), 400
        if not member_id and not email:
            return jsonify({"error":"Fournir soit member_id (6 chiffres) soit email"}), 400
        if member_id and (len(member_id)!=6 or not member_id.isdigit()):
            return jsonify({"error":"member_id doit être 6 chiffres"}), 400
        if member_id and User.query.filter_by(member_id=member_id).first():
            return jsonify({"error":"member_id déjà utilisé"}), 409
        if email and User.query.filter_by(email=email).first():
            return jsonify({"error":"email déjà utilisé"}), 409

        user = User(
            nom=nom, prenom=prenom, email=email, member_id=member_id,
            password_hash=generate_password_hash(password),
            role=Role.MEMBER
        )
        db.session.add(user); db.session.commit()
        return jsonify({"ok": True, "id": user.id})

    # -------- GET: lister avec cartes (année -> code) --------
    users = (
        User.query
        .options(joinedload(User.memberships))  # si tu as une relation; sinon on reconstruit ci-dessous
        .order_by(User.nom.asc(), User.prenom.asc())
        .all()
    )

    # Si tu n’as pas défini de relation `User.memberships`, on peut récupérer à part :
    # from .models import Membership
    # all_members = Membership.query.all()
    # map_by_user = {}
    # for m in all_members:
    #     map_by_user.setdefault(m.user_id, {})[str(m.annee)] = m.annee_code

    result = []
    for u in users:
        # Construire le "dictionnaire { année: code }"
        cartes = {}
        # si pas de relation, remplace la boucle par l’accès map_by_user.get(u.id, {})
        for m in getattr(u, "memberships", []):
            cartes[str(m.annee)] = m.annee_code

        result.append({
            "id": u.id,
            "nom": u.nom,
            "prenom": u.prenom,
            "identifiant": (u.member_id or u.email),
            "cartes": cartes  # <= dictionnaire (clé = année -> valeur = code)
        })

    return jsonify(result)
