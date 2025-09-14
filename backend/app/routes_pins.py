from flask import Blueprint, request, jsonify
import os, json, time

bp_pins = Blueprint("pins", __name__, url_prefix="/api/pins")

DATA_FILE = "pins.json"

UPLOAD_FOLDER = "/app/frontend/public/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def read_pins():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_pins(pins):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(pins, f, indent=2, ensure_ascii=False)

# --- Routes Blueprint ---
@bp_pins.get("/")
def get_pins():
    return jsonify(read_pins())

@bp_pins.post("/")
def add_pin():
    title = request.form.get("title")
    price = request.form.get("price")
    description = request.form.get("description")
    image = request.files.get("image")

    if not title or not price or not description or not image:
        return jsonify({"error": "Missing fields"}), 400

    filename = f"{int(time.time())}-{image.filename}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    image.save(filepath)

    pins = read_pins()
    new_pin = {
        "id": int(time.time()),
        "title": title,
        "price": price,
        "description": description,
        "imageUrl": f"/uploads/{filename}"
    }
    pins.append(new_pin)
    save_pins(pins)

    return jsonify(new_pin), 201

@bp_pins.put("/<int:pin_id>")
def update_pin(pin_id):
    pins = read_pins()
    pin = next((p for p in pins if p["id"] == pin_id), None)
    if not pin:
        return jsonify({"error": "Pin not found"}), 404

    title = request.form.get("title", pin["title"])
    price = request.form.get("price", pin["price"])
    description = request.form.get("description", pin["description"])
    image = request.files.get("image")

    if image:
        filename = f"{int(time.time())}-{image.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        image.save(filepath)
        pin["imageUrl"] = f"/uploads/{filename}"

    pin["title"] = title
    pin["price"] = price
    pin["description"] = description

    save_pins(pins)
    return jsonify(pin)

@bp_pins.delete("/<int:pin_id>")
def delete_pin(pin_id):
    pins = read_pins()
    pin = next((p for p in pins if p["id"] == pin_id), None)
    if not pin:
        return jsonify({"error": "Pin not found"}), 404

    if "imageUrl" in pin:
        filename = os.path.basename(pin["imageUrl"])
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.exists(filepath):
            os.remove(filepath)


    pins = [p for p in pins if p["id"] != pin_id]
    save_pins(pins)

    return jsonify({"success": True, "deleted_id": pin_id})
