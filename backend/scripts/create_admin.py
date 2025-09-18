from app import create_app
from app.models import db, User, Role
from werkzeug.security import generate_password_hash

app = create_app()
with app.app_context():
    email = "admin@example.com"
    user = User.query.filter_by(email=email.lower()).first()
    if user:
        print("Admin déjà existant:", email)
    else:
        u = User(
            email=email.lower(),
            prenom="Admin",
            nom="Root",
            password_hash=generate_password_hash("monpass"),
            role=Role.ADMIN,
            is_active=True  # 🔹 permet login immédiat
        )
        db.session.add(u)
        db.session.commit()
        print("Admin créé:", email, "/ monpass")
