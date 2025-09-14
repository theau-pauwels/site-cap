# Site CAP – Vente de Pin's Folkloriques

Application web pour la **Centrale d'Achat Polytech (CAP)** permettant de présenter et de réserver en ligne des pin's folkloriques.

Le site combine **Astro** pour le frontend et **Flask (Python)** pour le backend, avec une base **PostgreSQL** et un déploiement via **Docker Compose** derrière **Nginx**.

---

## ✨ Fonctionnalités actuelles

### 👀 Vitrine publique
- Accès libre à la liste des pin's disponibles.
- Fiches détaillées (photo, description, prix).
- Mise à jour dynamique des stocks.

### 🛒 Panier & Réservations
- Ajout de pin's au panier depuis la vitrine.
- Validation du panier → création d'une réservation auprès de la CAP.
- Gestion du panier par cookies/session.

### 🔐 Espace Administrateur
- Interface sécurisée de gestion des pin's (ajout, modification, suppression).
- Gestion des stocks et des prix.
- Consultation des réservations des étudiants.

### ⚙️ Technique
- Frontend : **Astro** (UI moderne, statique + API fetch).
- Backend : **Flask** + **Flask‑Login**.
- Base de données : **PostgreSQL** via **SQLAlchemy**.
- Reverse proxy : **Nginx**.
- Déploiement : **Docker Compose** (services : frontend, backend, db, nginx).

---

## 🚀 Installation & lancement

Cloner le dépôt et construire les services :

```bash
git clone git@github.com:theau-pauwels/site-cap.git
cd site-cap
docker compose up --build
```

Accès par défaut :

- Site public (vitrine) : http://localhost
- API Backend : http://localhost/api
- Espace admin : http://localhost/admin

> **Remarque :** adaptez les variables d’environnement (mots de passe DB, secrets Flask, hôtes autorisés) dans vos fichiers `.env` avant un déploiement de production.

---

## ✅ Ce qui fonctionne déjà
- Vitrine publique avec catalogue de pin's.
- Panier et réservation associée à une session.
- Interface d’administration des pin's et des réservations.
- Synchronisation DB avec SQLAlchemy (tables `Pin`, `Reservation`, `User`).

---

## 🧭 Roadmap / À faire
- Paiement en ligne (ex. intégration Stripe/PayPal).
- Historique des réservations pour chaque utilisateur.
- Gestion des catégories de pin's (folklore, édition limitée…).
- Notifications e‑mail lors d’une réservation confirmée.
- Optimisation UI mobile.
- Déploiement production (TLS, nom de domaine, CI/CD).
- Tests unitaires et end‑to‑end.

---

## 📁 Structure du dépôt

```
site-cap/
├── backend/           # Flask + API REST
│   ├── app/           # modèles, routes, logique
│   ├── scripts/       # scripts utilitaires (ex: ajout pin's en lot)
│   └── wsgi.py        # point d'entrée Gunicorn
├── frontend/          # Astro
│   ├── src/pages/     # pages (vitrine, panier, admin…)
│   └── src/components/# Header, Footer, CardPin, Layout…
├── nginx/             # configuration reverse proxy
├── docker-compose.yml
└── README.md
```

---

## 📝 Licence
Libre pour un usage associatif. Licence à définir pour une éventuelle redistribution (MIT, Apache‑2.0, GPL‑3.0, …).
