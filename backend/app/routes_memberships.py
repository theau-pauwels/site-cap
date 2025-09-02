@bp_mem.route("/api/admin/users/<user_id>/annees", methods=["PUT"])
@login_required
def upsert_year_entry(user_id):
    # admin only
    if getattr(current_user, "role", None) != Role.ADMIN:
        return jsonify({"error":"Forbidden"}), 403
    data = request.json or {}
    try:
        annee = int(data.get("annee"))
    except:
        return jsonify({"error":"annee (int) requis"}), 400
    code = (data.get("annee_code") or "").strip()
    if not code:
        return jsonify({"error":"annee_code requis"}), 400

    u = User.query.get(user_id)
    if not u:
        return jsonify({"error":"User introuvable"}), 404

    row = Membership.query.filter_by(user_id=u.id, annee=annee).first()
    if row:
        row.annee_code = code
    else:
        row = Membership(user_id=u.id, annee=annee, annee_code=code)
        db.session.add(row)
    db.session.commit()
    return jsonify({"ok": True, "id": row.id})

@bp_mem.route("/api/admin/users/<user_id>/annees", methods=["GET"])
@login_required
def list_year_entries(user_id):
    if getattr(current_user, "role", None) != Role.ADMIN:
        return jsonify({"error":"Forbidden"}), 403
    rows = Membership.query.filter_by(user_id=user_id).order_by(Membership.annee.desc()).all()
    return jsonify([{ "annee": r.annee, "annee_code": r.annee_code } for r in rows])
