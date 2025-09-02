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

# --- helpers ---
ALLOWED_PREFIXES = {"A", "F", "E", "EA", "MI", "S"}

def normalize_card_code(raw: str):
    """
    Normalise un code 'prefix-num' :
      - espaces retirés, majuscules,
      - préfixe ∈ ALLOWED_PREFIXES,
      - partie numérique sans zéro de tête (>=1).
    Retourne 'PREFIX-N' ou lève ValueError.
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
    n = int(num)  # supprime les zéros initiaux et valide >= 0
    if n < 1:
        raise ValueError("Le numéro doit être ≥ 1")
    return f"{prefix}-{n}"

def parse_year_range_to_start(raw: str):
    """
    Accepte soit '2025' soit '2025-2026'. Retourne l'année de début (int).
    """
    s = str(raw).strip()
    if "-" in s:
        left, _ = s.split("-", 1)
        s = left.strip()
    try:
        y = int(s)
    except:
        raise ValueError("Année invalide")
    if y < 1900 or y > 2100:
        raise ValueError("Année hors plage")
    return y

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
        # le front envoie annee sous forme "YYYY-YYYY+1" OU juste "YYYY"
        annee_start = parse_year_range_to_start(data.get("annee"))
        code = normalize_card_code(data.get("annee_code", ""))
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    row = Membership.query.filter_by(user_id=u.id, annee=annee_start).first()
    if row:
        row.annee_code = code
    else:
        row = Membership(user_id=u.id, annee=annee_start, annee_code=code)
        db.session.add(row)
    db.session.commit()
    return jsonify({"ok": True, "id": row.id})
