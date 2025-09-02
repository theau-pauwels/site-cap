from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from .models import db, Membership, User, Role

bp_mem = Blueprint("memberships", __name__)

@bp_mem.route("/api/memberships", methods=["GET"])
@login_required
def my_memberships():
    rows = (Membership.query
            .filter_by(user_id=current_user.id)
            .order_by(Membership.annee.desc())
            .all())
    return jsonify([{"annee": r.annee, "annee_code": r.annee_code} for r in rows])

# Admin: upsert (année -> code) pour un user
@bp_mem.route("/api/admin/users/<user_id>/annees", methods=["PUT", "GET"])
@login_required
def upsert_or_list_year(user_id):
    # admin only
    u = User.query.get(user_id)
    if not u:
        return jsonify({"error": "User introuvable"}), 404
    if getattr(current_user, "role", None) != Role.ADMIN:
        return jsonify({"error": "Forbidden"}), 403

    if request.method == "GET":
        rows = Membership.query.filter_by(user_id=user_id).order_by(Membership.annee.desc()).all()
        return jsonify([{ "annee": r.annee, "annee_code": r.annee_code } for r in rows])

    data = request.json or {}
    try:
        annee = int(data.get("annee"))
    except:
        return jsonify({"error":"annee (int) requis"}), 400
    code = (data.get("annee_code") or "").strip()
    if not code:
        return jsonify({"error":"annee_code requis"}), 400

    row = Membership.query.filter_by(user_id=u.id, annee=annee).first()
    if row:
        row.annee_code = code
    else:
        row = Membership(user_id=u.id, annee=annee, annee_code=code)
        db.session.add(row)
    db.session.commit()
    return jsonify({"ok": True, "id": row.id})
