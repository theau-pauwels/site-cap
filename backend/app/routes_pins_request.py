from flask import Blueprint, request, jsonify
import os, json, time

bp_requests = Blueprint("pins_requests", __name__, url_prefix="/api/pins/requests")

DATA_FILE = "pins_requests.json"
UPLOAD_FOLDER = "/app/frontend/public/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def read_requests():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_requests(requests):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(requests, f, indent=2, ensure_ascii=False)


# --- Routes ---
@bp_requests.get("/")
def get_requests():
    """Lister toutes les demandes (admin)"""
    return jsonify(read_requests())


@bp_requests.post("/")
def add_request():
    """Créer une nouvelle demande (user)"""
    title = request.form.get("title")
    quantity = request.form.get("quantity")
    notes = request.form.get("notes", "")
    logo = request.files.get("logo")

    if not title or not quantity or not logo:
        return jsonify({"error": "Missing fields"}), 400

    filename = f"{int(time.time())}-{logo.filename}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    logo.save(filepath)

    requests = read_requests()
    new_request = {
        "id": int(time.time()),
        "title": title,
        "quantity": int(quantity),
        "notes": notes,
        "logoUrl": f"/uploads/{filename}",
        "status": "en attente",
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    requests.append(new_request)
    save_requests(requests)

    return jsonify(new_request), 201


@bp_requests.patch("/<int:req_id>")
def update_request(req_id):
    """Modifier uniquement le statut d’une demande"""
    requests = read_requests()
    req = next((r for r in requests if r["id"] == req_id), None)
    if not req:
        return jsonify({"error": "Request not found"}), 404

    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if not status:
        return jsonify({"error": "Missing status"}), 400

    req["status"] = status
    save_requests(requests)
    return jsonify(req)


@bp_requests.delete("/<int:req_id>")
def delete_request(req_id):
    """Supprimer une demande"""
    requests = read_requests()
    req = next((r for r in requests if r["id"] == req_id), None)
    if not req:
        return jsonify({"error": "Request not found"}), 404

    # supprimer le logo uploadé
    if "logoUrl" in req:
        filename = os.path.basename(req["logoUrl"])
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.exists(filepath):
            os.remove(filepath)

    requests = [r for r in requests if r["id"] != req_id]
    save_requests(requests)

    return jsonify({"success": True, "deleted_id": req_id})
