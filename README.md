# Carte Fédé Test

Application web de gestion de cartes pour la fédération des étudiants de la F.P.Ms.  
Elle combine **Astro** pour le frontend et **Flask** (Python) pour le backend, avec une base **PostgreSQL** et un déploiement via **Docker Compose**.

---

## ✨ Fonctionnalités actuelles

### 🔐 Authentification
- Connexion par **email** ou par **identifiant à 6 chiffres**.
- Mot de passe généré automatiquement lors de la création de l’utilisateur (modifiable par la suite).
- Gestion de session via cookies.

### 👤 Utilisateur (membre)
- Page **Mes cartes** listant ses cartes par période (ex: 2024-2025 → `A-23`).
- Connexion/déconnexion via interface.

### 🛠️ Administrateur
- Interface de gestion des utilisateurs.
- Création d’utilisateurs avec nom, prénom et identifiant.
- Attribution de cartes par période scolaire :
  - Choix d’une période dans une liste déroulante.
  - Numéro de carte généré automatiquement (plus petit libre).
  - Préfixes autorisés : `A`, `F`, `E`, `EA`, `MI`, `S`.
  - Normalisation des numéros (`023` → `23`).
- Suppression d’une carte avec confirmation.
- Liste de toutes les cartes attribuées à un utilisateur.

### ⚙️ Technique
- Frontend : [Astro](https://astro.build/) (pages statiques + fetch API).
- Backend : [Flask](https://flask.palletsprojects.com/) + [Flask-Login](https://flask-login.readthedocs.io/).
- Base de données : PostgreSQL + SQLAlchemy.
- Reverse proxy : Nginx.
- Déploiement : Docker Compose (3 services → frontend, backend, db, + nginx).

---

## 🚀 Installation & lancement

Cloner le dépôt et exécuter :

```bash
git clone https://github.com/theau-pauwels/carte-fede-test.git
cd carte-fede-test
docker compose up --build
```

Accès :
- Frontend : http://localhost  
- API Backend : http://localhost/api

---

## ✅ Ce qui fonctionne déjà
- Authentification email/ID.
- Gestion des sessions utilisateurs/admin.
- Création/suppression de cartes avec contraintes d’unicité par période.
- UI basique pour les membres et les administrateurs.
- Synchronisation DB avec SQLAlchemy (tables `User` et `Membership`).

---

## 🔜 Roadmap / À faire
- [ ] **Système d’email** : envoi automatique d’un mot de passe temporaire lors de la création du compte.
- [ ] **Améliorer l’UI** (style, responsivité).
- [ ] **Gestion des erreurs côté frontend** (messages plus clairs).
- [ ] **Page Admin → création utilisateur** directement depuis l’UI (clarification de l'interface et des options).
- [ ] **Page Admin → édition/suppression utilisateur**.
- [ ] **QR Code temporaire** des cartes pour une soirée/occasion.
- [ ] **Déploiement en prod** (config TLS, nom de domaine, CI/CD).
- [ ] **Tests unitaires & end-to-end** pour sécuriser le projet.

---

## 📂 Structure du dépôt

```
carte-fede-test/
├── backend/         # Flask + API REST
│   ├── app/         # modèles, routes, logique
│   ├── scripts/     # scripts utilitaires (création admin, reset mdp, etc.)
│   └── wsgi.py      # point d'entrée Gunicorn
├── frontend/        # Astro
│   ├── src/pages/   # pages (login, cartes, admin…)
│   └── src/components/ # Footer, Layout…
├── nginx/           # config reverse proxy
├── docker-compose.yml
└── README.md
```

---

## 📝 Licence
Libre pour un usage personnel ou associatif. À compléter pour la redistribution.
