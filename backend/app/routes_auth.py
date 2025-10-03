import uuid
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app, url_for
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Message


from .extensions import db, mail
from .models import User, Role

bp_auth = Blueprint("auth", __name__)



# -------------------- LOGIN --------------------
@bp_auth.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        user = None
        if email:
            user = User.query.filter_by(email=email).first()
        else:
            ident = (data.get("identifiant") or "").strip()
            if ident.isdigit() and len(ident) == 6:
                user = User.query.filter_by(member_id=ident).first()

        if user and not user.is_active:
            return jsonify({"error": "Compte non activé. Vérifie ton email."}), 403

        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({"error": "Identifiants invalides"}), 401

        login_user(user)
        return jsonify({"ok": True, "user": {
            "email": user.email or "",
            "member_id": user.member_id or "",
            "role": user.role.value
        }})
    except Exception:
        current_app.logger.exception("Login error")
        return jsonify({"error": "Erreur serveur"}), 500

# -------------------- LOGOUT --------------------
@bp_auth.route("/api/auth/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"ok": True})

# -------------------- CURRENT USER --------------------
@bp_auth.route("/api/me", methods=["GET"])
@login_required
def me():
    identifiant = current_user.member_id or current_user.email
    return jsonify({
        "member_id": current_user.member_id or "",
        "email": current_user.email or "",
        "role": current_user.role.value,
        "identifiant": identifiant
    })


@bp_auth.route("/api/me/info", methods=["GET", "PATCH"])
@login_required
def me_info():
    if request.method == "GET":
        identifiant = current_user.member_id or current_user.email
        return jsonify({
            "nom": current_user.nom or "",
            "prenom": current_user.prenom or "",
            "email": current_user.email or "",
            "member_id": current_user.member_id or "",
            "identifiant": identifiant,
        })
    elif request.method == "PATCH":
        data = request.get_json()
        current_user.nom = data.get("nom", current_user.nom)
        current_user.prenom = data.get("prenom", current_user.prenom)
        current_user.email = data.get("email", current_user.email)
        db.session.commit()
        return jsonify({"success": True})



# -------------------- REGISTER --------------------
@bp_auth.route("/api/auth/register", methods=["POST"])
def register():
    try:
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        nom = (data.get("nom") or "").strip()
        prenom = (data.get("prenom") or "").strip()

        if not email or not password or not nom or not prenom:
            return jsonify({"error": "Tous les champs sont requis"}), 400
        if len(password) < 6:
            return jsonify({"error": "Le mot de passe doit contenir au moins 6 caractères"}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Un compte existe déjà avec cet email"}), 400

        activation_token = str(uuid.uuid4())
        activation_expiry = datetime.utcnow() + timedelta(hours=24)

        user = User(
            email=email,
            nom=nom,
            prenom=prenom,
            password_hash=generate_password_hash(password),
            role=Role.MEMBER,
            is_active=False,
            activation_token=activation_token,
            activation_token_expiry=activation_expiry
        )
        db.session.add(user)
        db.session.commit()

        activation_link = f"https://cap.fede.fpms.ac.be/activation?token={activation_token}"
        msg = Message(
            subject="Confirme ton inscription",
            recipients=[user.email],
            html=f"Bonjour {user.prenom},<br><br>"
                f"Clique sur ce lien pour activer ton compte (valable 24h) : "
                f"<a href='{activation_link}'>Activer mon compte</a>"
        )
        mail.send(msg)

        return jsonify({"ok": True, "message": "Un email d'activation a été envoyé à ton adresse."})
    except Exception as e:
        current_app.logger.exception("Register error")
        return jsonify({"error": str(e)}), 500

# -------------------- ACTIVATE ACCOUNT --------------------
@bp_auth.route("/api/auth/activate/<token>", methods=["GET"])
def activate(token):
    user = User.query.filter_by(activation_token=token).first()
    if not user:
        return jsonify({"error": "Token invalide"}), 400
    if user.activation_token_expiry < datetime.utcnow():
        return jsonify({"error": "Token expiré"}), 400

    user.is_active = True
    user.activation_token = None
    user.activation_token_expiry = None
    db.session.commit()
    return jsonify({"ok": True, "message": "Compte activé ! Tu peux maintenant te connecter."})

# -------------------- CHANGE PASSWORD --------------------
@bp_auth.route("/api/auth/change-password", methods=["POST"])
@login_required
def change_password():
    data = request.json or {}
    old_password = data.get("old_password", "").strip()
    new_password = data.get("new_password", "").strip()

    if not old_password or not new_password or len(new_password) < 8:
        return jsonify({"error": "Champs invalides ou mot de passe trop court"}), 400

    if not check_password_hash(current_user.password_hash, old_password):
        return jsonify({"error": "Ancien mot de passe incorrect"}), 403

    current_user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({"ok": True})
# -------------------- PASSWORD RESET REQUEST --------------------
@bp_auth.route("/api/auth/reset-password/<token>", methods=["POST"])
def reset_password(token):
    try:
        data = request.get_json(silent=True) or {}
        new_password = data.get("password")

        if not new_password:
            return jsonify({"error": "Mot de passe requis"}), 400

        user = User.query.filter_by(reset_token=token).first()

        if not user or not user.reset_token_expiry or user.reset_token_expiry < datetime.utcnow():
            return jsonify({"error": "Lien invalide ou expiré"}), 400

        # Mise à jour du mot de passe
        user.password_hash = generate_password_hash(new_password)
        user.reset_token = None
        user.reset_token_expiry = None
        db.session.commit()

        return jsonify({"ok": True, "message": "Mot de passe réinitialisé avec succès"})

    except Exception:
        current_app.logger.exception("Erreur lors de la réinitialisation du mot de passe")
        return jsonify({"error": "Erreur serveur"}), 500


@bp_auth.route("/api/auth/request-password-reset", methods=["POST"])
def request_password_reset():
    try:
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()

        if not email:
            return jsonify({"error": "Email requis"}), 400

        user = User.query.filter_by(email=email).first()

        if user and user.is_active:
            # Génération d’un token unique et d’une date d’expiration
            reset_token = str(uuid.uuid4())
            reset_expiry = datetime.utcnow() + timedelta(hours=1)

            # Sauvegarde dans la DB
            user.reset_token = reset_token
            user.reset_token_expiry = reset_expiry
            db.session.commit()

            # Création du lien vers ta page front (Astro/React)
            reset_link = f"https://cap.fede.fpms.ac.be/reset-password?token={reset_token}"

            # Email
            msg = Message(
                subject="Réinitialisation de ton mot de passe",
                recipients=[user.email],
                html=f"""
                    Bonjour {user.prenom},<br><br>
                    Clique sur ce lien pour réinitialiser ton mot de passe (valable 1h) :<br>
                    <a href="{reset_link}">{reset_link}</a>
                """
            )
            mail.send(msg)

        # On répond toujours "ok" pour ne pas divulguer si l’email existe ou non
        return jsonify({"ok": True, "message": "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."})

    except Exception:
        current_app.logger.exception("Erreur lors de la demande de reset password")
        return jsonify({"error": "Erreur serveur"}), 500