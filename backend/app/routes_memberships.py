from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from .models import db, Membership, Role

bp_mem = Blueprint("memberships", __name__)

@bp_mem.route("/api/memberships", methods=["GET"])
@login_required
def my_memberships():
    """Retourne les paires {annee -> annee_code} du user connecté."""
    rows = (Membership.query
            .filter_by(user_id=current_user.id)
            .order_by(Membership.annee.desc())
            .all())
    return jsonify([
        {"annee": r.annee, "annee_code": r.annee_code}
        for r in rows
    ])
