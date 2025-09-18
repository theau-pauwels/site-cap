from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from werkzeug.security import generate_password_hash
from sqlalchemy.orm import joinedload
from .models import db, User, Role, Membership, Order, OrderItem
import re

bp_admin = Blueprint("admin", __name__)
bp_orders = Blueprint("orders", __name__)
bp_admin_orders = Blueprint("admin_orders", __name__)

# -------------------- Helpers --------------------
def is_admin():
    return current_user.is_authenticated and current_user.role == Role.ADMIN

@bp_admin.before_request
@login_required
def require_admin():
    if not is_admin():
        return jsonify({"error": "Forbidden"}), 403

# -------------------- Users --------------------
@bp_admin.route("/api/admin/users", methods=["GET", "POST"])
@login_required
def users_collection():
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

        role_str = (data.get("role") or "member").lower()
        allowed = {"member": Role.MEMBER, "admin": Role.ADMIN, "verifier": Role.VERIFIER, "en attente": Role.ATTENTE}
        if role_str not in allowed:
            return jsonify({"error": "Rôle invalide"}), 400
        role = allowed[role_str]

        user = User(
            nom=nom,
            prenom=prenom,
            email=email,
            member_id=member_id,
            password_hash=generate_password_hash(password),
            role=role
        )
        db.session.add(user)
        db.session.flush()

        cartes = data.get("cartes", [])
        for c in cartes:
            annee = c.get("annee")
            annee_code = c.get("annee_code")
            if annee and annee_code:
                m = Membership(user_id=user.id, annee=annee, annee_code=annee_code)
                db.session.add(m)

        db.session.commit()
        return jsonify({"ok": True, "id": user.id})

    # GET: liste tous les users
    users = User.query.options(joinedload(User.memberships)).order_by(User.nom.asc(), User.prenom.asc()).all()
    result = []
    for u in users:
        cartes = {str(m.annee): m.annee_code for m in (u.memberships or [])}
        result.append({
            "id": u.id,
            "nom": u.nom,
            "prenom": u.prenom,
            "identifiant": u.member_id or u.email,
            "role": u.role.value if u.role else None,
            "cartes": cartes,
        })
    return jsonify(result)

@bp_admin.route("/api/admin/users/<user_id>/role", methods=["PUT"])
@login_required
def set_user_role(user_id):
    target = User.query.get(user_id)
    if not target:
        return jsonify({"error": "Utilisateur introuvable"}), 404

    data = request.get_json() or {}
    role_str = str(data.get("role", "")).lower().strip()
    allowed = {"member": Role.MEMBER, "admin": Role.ADMIN, "verifier": Role.VERIFIER, "en attente": Role.ATTENTE}
    if role_str not in allowed:
        return jsonify({"error": "Rôle invalide"}), 400

    if target.id == current_user.id and role_str != "admin":
        return jsonify({"error": "Impossible de rétrograder votre propre compte."}), 400

    target.role = allowed[role_str]
    db.session.commit()
    return jsonify({"ok": True, "id": target.id, "role": role_str})

@bp_admin.route("/api/admin/users/<user_id>", methods=["PUT"])
@login_required
def update_user(user_id):
    target = User.query.get(user_id)
    if not target:
        return jsonify({"error": "Utilisateur introuvable"}), 404

    data = request.get_json()
    nom = data.get("nom")
    prenom = data.get("prenom")
    identifiant = data.get("identifiant")

    if identifiant and not re.match(r"^\d{6}$", identifiant):
        return jsonify({"error": "Le member_id doit faire 6 chiffres"}), 400

    if nom: target.nom = nom
    if prenom: target.prenom = prenom
    if identifiant: target.member_id = identifiant

    db.session.commit()
    return jsonify({"ok": True})

@bp_admin.route("/api/admin/users/<user_id>", methods=["DELETE"])
@login_required
def delete_user(user_id):
    if not is_admin():
        return jsonify({"error": "Forbidden"}), 403

    target = User.query.get(user_id)
    if not target:
        return jsonify({"error": "Utilisateur introuvable"}), 404

    if target.id == current_user.id:
        return jsonify({"error": "Impossible de supprimer votre propre compte."}), 400

    try:
        # Supprimer toutes les commandes et leurs items
        for order in target.orders:
            for item in order.items:
                db.session.delete(item)
            db.session.delete(order)

        # Supprimer toutes les memberships
        for membership in target.memberships:
            db.session.delete(membership)

        # Supprimer l'utilisateur
        db.session.delete(target)
        db.session.commit()
        return jsonify({"ok": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erreur lors de la suppression"}), 500

# -------------------- Orders (admin) --------------------
@bp_admin_orders.route("/api/admin/orders", methods=["GET"])
@login_required
def list_orders():
    if not is_admin():
        return jsonify({"error": "Unauthorized"}), 403

    orders = Order.query.order_by(Order.created_at.desc()).all()
    data = []
    for o in orders:
        data.append({
            "id": o.id,
            "user_id": o.user_id,
            "user_nom": o.user.nom,
            "user_prenom": o.user.prenom,
            "status": o.status,
            "created_at": o.created_at.isoformat(),
            "items": [{"title": i.title, "price": i.price, "quantity": i.quantity} for i in o.items]
        })
    return jsonify(data)

@bp_admin_orders.route("/api/admin/orders/<order_id>", methods=["PATCH"])
@login_required
def update_order_status(order_id):
    if not is_admin():
        return jsonify({"error": "Unauthorized"}), 403

    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Commande introuvable"}), 404

    data = request.get_json()
    status = data.get("status")
    if status:
        order.status = status
        db.session.commit()
    return jsonify({"ok": True, "status": order.status})

@bp_admin_orders.route("/api/admin/orders/<order_id>", methods=["DELETE"])
@login_required
def delete_order(order_id):
    if not is_admin():
        return jsonify({"error": "Unauthorized"}), 403

    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Commande introuvable"}), 404

    db.session.delete(order)
    db.session.commit()
    return jsonify({"ok": True})

# -------------------- Orders (user) --------------------
@bp_orders.route("/api/orders", methods=["POST"])
@login_required
def create_order():
    data = request.get_json()
    items = data.get("items", [])
    if not items:
        return jsonify({"error": "Le panier est vide"}), 400

    order = Order(user_id=current_user.id)
    db.session.add(order)
    db.session.flush()

    for it in items:
        order_item = OrderItem(
            order_id=order.id,
            pin_id=it["id"],
            title=it["title"],
            price=float(it["price"]),
            quantity=int(it.get("quantity", 1))
        )
        db.session.add(order_item)

    db.session.commit()
    return jsonify({"ok": True, "order_id": order.id})

@bp_orders.route("/api/orders", methods=["GET"])
@login_required
def list_user_orders():
    orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.created_at.desc()).all()
    data = []
    for o in orders:
        data.append({
            "id": o.id,
            "status": o.status,
            "created_at": o.created_at.isoformat(),
            "items": [{"title": i.title, "price": i.price, "quantity": i.quantity} for i in o.items]
        })
    return jsonify(data)
