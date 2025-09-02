from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from .models import db, Membership, User, Role

bp_mem = Blueprint("memberships", __name__)

@bp_mem.route("/api/memberships", methods=["GET"])
@login_required
def my_memberships():
    rows = (
        Membership.query
        .filter_by(user_id=current_user.id)
        .order_by(Membership.annee.desc())
        .all()
    )
    return jsonify([{"annee": r.annee, "annee_code": r.annee_code} for r in rows])


# -------- Helpers de validation/normalisation --------
ALLOWED_PREFIXES = {"A", "F", "E", "EA", "MI", "S"}

def normalize_card_code(raw: str) -> str:
    """
    Normalise 'prefix-num' :
      - uppercase, trim
      - prefix ∈ ALLOWED_PREFIXES
      - num entier >=1 (enlève les zéros de tête)
    """
    if not raw:
        raise ValueError("annee_code requis")
    s = raw.strip().upper()
    if "-" not in s:
        raise ValueError("Format attendu: PREFIX-NUM (ex: A-23)")
    prefix, num = s.split("-", 1)
    prefix = prefix.strip()
    num = num.strip()
    if prefix not in ALLOWED_PREFIXES:
        raise ValueError(f"Préfixe invalide. Autorisés: {', '.join(sorted(ALLOWED_PREFIXES))}")
    if not num.isdigit():
        raise ValueError("La partie numérique doit être un entier")
    n = int(num)
    if n < 1:
        raise ValueError("Le numéro doit être ≥ 1")
    return f"{prefix}-{n}"

def parse_year_range_to_start(raw) -> int:
    """
    Accepte '2025' ou '2025-2026' et retourne 2025.
    """
    s = str(raw or "").strip()
    if not s:
        raise ValueError("Année invalide")
    if "-" in s:
        s = s.split("-", 1)[0].strip()
    y = int(s)
    if y < 1900 or y > 2100:
        raise ValueError("Année hors plage")
    return y


# -------- Admin: upsert/list des cartes d'un user --------
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
        rows = (
            Membership.query
            .filter_by(user_id=user_id)
            .order_by(Membership.annee.desc())
            .all()
        )
        return jsonify([{"annee": r.annee, "annee_code": r.annee_code} for r in rows])

    # PUT
    data = request.json or {}
    try:
        annee_start = parse_year_range_to_start(data.get("annee"))
        code = normalize_card_code(data.get("annee_code", ""))
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    # 1 carte max pour ce user et cette année
    row = Membership.query.filter_by(user_id=u.id, annee=annee_start).first()

    # code unique dans la même année (mais peut exister sur d'autres années)
    existing_same_year = Membership.query.filter_by(annee=annee_start, annee_code=code).first()
    if existing_same_year and (not row or existing_same_year.id != row.id):
        return jsonify({"error": "Ce numéro de carte est déjà utilisé pour cette année."}), 409

    if row:
        row.annee_code = code
    else:
        row = Membership(user_id=u.id, annee=annee_start, annee_code=code)
        db.session.add(row)

    db.session.commit()
    return jsonify({"ok": True, "id": row.id})
