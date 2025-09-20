from flask import Blueprint, request, jsonify
import os, json
from flask_login import login_required, current_user
from .models import Role

PENNE_FILE = "penne_requests.json"

def read_penne_requests():
    if not os.path.exists(PENNE_FILE):
        return []
    with open(PENNE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_penne_requests(requests):
    with open(PENNE_FILE, "w", encoding="utf-8") as f:
        json.dump(requests, f, indent=2, ensure_ascii=False)

bp_admin_penne = Blueprint("admin_penne_requests", __name__, url_prefix="/api/admin/penne-requests")
bp_user_penne = Blueprint("user_penne_requests", __name__, url_prefix="/api/penne-requests")


# GET : toutes les demandes pour l'admin
@bp_admin_penne.get("/")
@login_required
def get_requests_admin():
    requests_list = read_penne_requests()
    # optionnel : filtrer selon role
    if current_user.role != Role.ADMIN:
        return jsonify({"error": "Non autorisé"}), 403
    return jsonify(requests_list)


# PATCH : mettre à jour le statut
@bp_admin_penne.patch("/<int:req_id>")
def update_status(req_id):
    data = request.json
    if "status" not in data or data["status"] not in ["en attente", "traitée"]:
        return jsonify({"error": "Statut invalide"}), 400

    requests_list = read_penne_requests()
    for req in requests_list:
        if req["id"] == req_id:
            req["status"] = data["status"]
            save_penne_requests(requests_list)
            return jsonify(req)
    return jsonify({"error": "Demande non trouvée"}), 404

# DELETE : supprimer une demande
@bp_admin_penne.delete("/<int:req_id>")
def delete_request(req_id):
    requests_list = read_penne_requests()
    new_list = [r for r in requests_list if r["id"] != req_id]
    if len(new_list) == len(requests_list):
        return jsonify({"error": "Demande non trouvée"}), 404
    save_penne_requests(new_list)
    return jsonify({"success": True})

# POST : ajouter une nouvelle demande
@bp_user_penne.post("/")
@login_required
def add_request():
    data = request.json
    required_fields = ["couleur", "liseré", "broderie", "tourDeTete"]
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({"error": "Champs manquants"}), 400

    requests_list = read_penne_requests()
    new_id = max([r["id"] for r in requests_list], default=0) + 1
    new_request = {
        "id": new_id,
        "user_id": current_user.id,
        "user_nom": current_user.nom,
        "user_prenom": current_user.prenom,
        "couleur": data["couleur"],
        "liseré": data["liseré"],
        "broderie": data["broderie"],
        "tourDeTete": data["tourDeTete"],
        "status": "en attente"
    }
    requests_list.append(new_request)
    save_penne_requests(requests_list)
    return jsonify(new_request), 201

# GET : toutes les demandes de l'utilisateur
@bp_user_penne.get("/")
@login_required
def get_user_requests():
    requests_list = read_penne_requests()
    user_requests = [r for r in requests_list if r["user_id"] == current_user.id]
    return jsonify(user_requests)

# PATCH : modifier une demande de penne (seulement si en attente)
@bp_user_penne.patch("/<int:req_id>")
@login_required
def update_user_request(req_id):
    data = request.json
    requests_list = read_penne_requests()
    for req in requests_list:
        if req["id"] == req_id and req["user_id"] == current_user.id:
            if req["status"] != "en attente":
                return jsonify({"error": "Impossible de modifier une demande déjà traitée"}), 403
            # On met à jour seulement les champs autorisés
            for field in ["couleur", "liseré", "broderie", "tourDeTete"]:
                if field in data:
                    req[field] = data[field]
            save_penne_requests(requests_list)
            return jsonify(req)
    return jsonify({"error": "Demande non trouvée"}), 404