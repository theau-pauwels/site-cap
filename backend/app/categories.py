from flask import Blueprint, request, jsonify
import os, json

from .routes_pins import read_pins, save_pins  # Pour pouvoir mettre à jour les pins si catégorie supprimée

CATEGORIES_FILE = "categories.json"

def read_categories():
    if not os.path.exists(CATEGORIES_FILE):
        return []
    with open(CATEGORIES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_categories(categories):
    with open(CATEGORIES_FILE, "w", encoding="utf-8") as f:
        json.dump(categories, f, indent=2, ensure_ascii=False)

bp_categories = Blueprint("categories", __name__, url_prefix="/api/categories")

@bp_categories.get("/")
def get_categories():
    return jsonify(read_categories())

@bp_categories.post("/")
def add_category():
    name = request.json.get("name")
    if not name:
        return jsonify({"error": "Missing name"}), 400

    categories = read_categories()
    if name in categories:
        return jsonify({"error": "Category already exists"}), 400

    categories.append(name)
    save_categories(categories)
    return jsonify({"success": True, "category": name}), 201

@bp_categories.delete("/<name>")
def delete_category(name):
    from urllib.parse import unquote
    name = unquote(name)

    if name == "Autre":
        return jsonify({"error": "Cannot delete default category"}), 400

    categories = read_categories()
    if name not in categories:
        return jsonify({"error": "Category not found"}), 404

    # Réaffecter les pins existants à "Autre"
    pins = read_pins()
    for pin in pins:
        if pin.get("category") == name:
            pin["category"] = "Autre"
    save_pins(pins)

    categories = [c for c in categories if c != name]
    save_categories(categories)
    return jsonify({"success": True, "deleted": name})

