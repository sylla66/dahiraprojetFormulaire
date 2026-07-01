# Dahira Gestion

Application web de gestion d'un Dahira (association religieuse) — gestion des membres, événements, inscriptions, cotisations récurrentes et formulaires dynamiques.

---

## Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | React 18 + Vite + Bootstrap 5 + React Router 6 |
| Backend | Node.js + Express 4 |
| Base de données | SQLite (via Sequelize ORM) |
| Authentification | JWT (24h) |
| Captcha | maison (addition HMAC) |
| PDF | PDFKit |
| Déploiement | Render (Node 20) |

---

## Structure du projet

```
dahiraprojetFormulaire/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Connexion SQLite / Sequelize
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT auth, adminRequired, superAdminRequired
│   │   ├── models/
│   │   │   ├── index.js             # Associations entre modèles
│   │   │   ├── User.js              # Utilisateurs (admin, super_admin)
│   │   │   ├── Membre.js            # Membres du dahira
│   │   │   ├── Localite.js          # Localités (villes/régions)
│   │   │   ├── Evenement.js         # Événements (ziarra, gala, causerie...)
│   │   │   ├── Formulaire.js        # Formulaires dynamiques (champs JSON)
│   │   │   ├── Inscription.js       # Inscriptions aux événements
│   │   │   ├── Cotisation.js        # Cotisations par événement
│   │   │   ├── TypeCotisation.js    # Types de cotisation récurrente
│   │   │   ├── PaiementCotisation.js# Paiements des cotisations récurrentes
│   │   │   ├── Activite.js          # Journal d'activité
│   │   │   ├── Configuration.js     # Configuration clé/valeur
│   │   │   └── Notification.js      # Notifications
│   │   ├── routes/
│   │   │   ├── auth.js              # Login, register, me
│   │   │   ├── admin.js             # CRUD membres, événements, inscriptions, cotisations
│   │   │   ├── superAdmin.js        # Dashboard global, utilisateurs, localités, export PDF
│   │   │   ├── cotisations.js       # Types + paiements récurrents, export PDF
│   │   │   ├── forms.js             # CRUD formulaires dynamiques
│   │   │   ├── dashboard.js         # Stats dashboard admin
│   │   │   ├── public.js            # Routes publiques (inscription, captcha)
│   │   │   ├── notifications.js     # Gestion des notifications
│   │   │   ├── export.js            # Export PDF membres
│   │   │   └── backup.js            # Backup/restore base de données
│   │   └── server.js                # Point d'entrée Express
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx           # Navbar, notifications, layout général
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx       # Contexte d'authentification (JWT)
│   │   ├── services/
│   │   │   └── api.js               # Client Axios, toutes les API
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardHome.jsx
│   │   │   │   └── DashboardEvenement.jsx
│   │   │   ├── admin/
│   │   │   │   ├── ListeMembres.jsx
│   │   │   │   ├── AjouterMembre.jsx
│   │   │   │   ├── ModifierMembre.jsx
│   │   │   │   ├── ListeEvenements.jsx
│   │   │   │   ├── CreerEvenement.jsx
│   │   │   │   ├── ModifierEvenement.jsx
│   │   │   │   ├── GererEvenement.jsx
│   │   │   │   ├── SuiviCotisations.jsx
│   │   │   │   ├── GererTypesCotisation.jsx
│   │   │   │   ├── PaiementsTypeCotisation.jsx
│   │   │   │   ├── ParametresInscription.jsx
│   │   │   │   └── Historique.jsx
│   │   │   ├── superAdmin/
│   │   │   │   ├── SuperDashboard.jsx
│   │   │   │   ├── GestionUtilisateurs.jsx
│   │   │   │   ├── ListeMembresGlobal.jsx
│   │   │   │   ├── GestionLocalites.jsx
│   │   │   │   ├── VueCompile.jsx
│   │   │   │   └── ActivitesLog.jsx
│   │   │   ├── forms/
│   │   │   │   ├── ListeFormulaires.jsx
│   │   │   │   ├── CreerFormulaire.jsx
│   │   │   │   └── ModifierFormulaire.jsx
│   │   │   └── public/
│   │   │       ├── InscriptionPublique.jsx
│   │   │       ├── ConfirmationInscription.jsx
│   │   │       ├── InscriptionMembre.jsx
│   │   │       └── ConfirmationMembre.jsx
│   │   ├── styles/
│   │   │   └── custom.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── render.yaml                     # Configuration déploiement Render
├── package.json                    # Scripts racine (heroku-postbuild)
└── README.md
```

---

## Installation

### Prérequis
- Node.js >= 18
- npm

### Backend

```bash
cd backend
npm install
npm run seed        # optionnel : peuple la base avec des données de démo
npm run dev         # démarre sur http://localhost:5000
```

### Frontend (développement)

```bash
cd frontend
npm install
npm run dev         # démarre sur http://localhost:5173
```

### Production

```bash
npm install         # installe les dépendances racine + backend
npm run build       # build le frontend
npm start           # démarre le serveur (backend + frontend statique)
```

---

## Modèles de données (Sequelize)

### User
| Champ | Type | Description |
|-------|------|-------------|
| id | INTEGER PK | Auto-incrément |
| username | STRING(80) UNIQUE | Identifiant de connexion |
| email | STRING(120) UNIQUE | Email |
| password | STRING(256) | Hash bcrypt |
| role | STRING(20) | `admin` ou `super_admin` |
| nom, prenom | STRING(100) | Nom complet |
| telephone | STRING(20) | |
| localite | STRING(100) | |
| isActive | BOOLEAN | Compte actif/inactif |
| lastLogin | DATE | Dernière connexion |

### Membre
| Champ | Type | Description |
|-------|------|-------------|
| id | INTEGER PK | |
| nom, prenom | STRING(100) | |
| telephone | STRING(20) UNIQUE | |
| email | STRING(120) | |
| adresse | STRING(255) | |
| dateNaissance | DATEONLY | |
| profession | STRING(100) | |
| estActif | BOOLEAN | |
| dateInscription | DATE | |
| localiteId | FK → Localite | |

### Evenement
| Champ | Type | Description |
|-------|------|-------------|
| id | INTEGER PK | |
| titre | STRING(200) | |
| description | TEXT | |
| dateEvenement | DATE | |
| dateFin | DATE | |
| dateDebutInscription | DATE | |
| dateFinInscription | DATE | |
| lieu | STRING(200) | |
| montantObjectif | FLOAT | |
| montantMinimum | INTEGER | |
| estCloture | BOOLEAN | |
| formulaireId | FK → Formulaire | |
| userId | FK → User | Organisateur |
| localiteId | FK → Localite | |

### Formulaire
| Champ | Type | Description |
|-------|------|-------------|
| id | INTEGER PK | |
| titre | STRING(200) | |
| description | TEXT | |
| typeEvenement | STRING(50) | `cotisation`, `gala`, etc. |
| champsJson | TEXT | Définition JSON des champs du formulaire |
| estActif | BOOLEAN | |
| userId | FK → User | Créateur |
| localiteId | FK → Localite | |

### Inscription
| Champ | Type | Description |
|-------|------|-------------|
| id | INTEGER PK | |
| donneesJson | TEXT | Données saisies dans le formulaire |
| estPresent | BOOLEAN | |
| evenementId | FK → Evenement | |
| membreId | FK → Membre | |

### Cotisation (par événement)
| Champ | Type | Description |
|-------|------|-------------|
| id | INTEGER PK | |
| montant | FLOAT | |
| datePaiement | DATE | |
| modePaiement | STRING(50) | `especes`, `wave`, `orange_money`, `cheque` |
| notes | TEXT | |
| estValide | BOOLEAN | |
| evenementId | FK → Evenement | |
| membreId | FK → Membre | |
| confirmePar | FK → User | Validateur |

### TypeCotisation (récurrent)
| Champ | Type | Description |
|-------|------|-------------|
| id | INTEGER PK | |
| nom | STRING(200) | Ex: "Caisse sociale" |
| description | TEXT | |
| periodicite | STRING(50) | `mensuel`, `trimestriel`, `annuel` |
| montant | FLOAT | Montant de base |
| estActif | BOOLEAN | |
| userId | FK → User | Créateur |

### PaiementCotisation (récurrent)
| Champ | Type | Description |
|-------|------|-------------|
| id | INTEGER PK | |
| typeCotisationId | FK → TypeCotisation | |
| membreId | FK → Membre | |
| montant | FLOAT | |
| mois | INTEGER | (1-12) |
| annee | INTEGER | |
| modePaiement | STRING(50) | |
| confirmePar | FK → User | |
| notes | TEXT | |

### Relations principales
```
Localite ──┬── Membre
           ├── Evenement
           └── Formulaire

User ──┬── Evenement (organisateur)
       ├── Formulaire (créateur)
       ├── Activite
       ├── Cotisation (valideur)
       ├── TypeCotisation (créateur)
       └── PaiementCotisation (valideur)

Formulaire ── Evenement

Evenement ──┬── Cotisation
            └── Inscription

Membre ──┬── Cotisation
         ├── Inscription
         └── PaiementCotisation

TypeCotisation ── PaiementCotisation
```

---

## API — Toutes les routes

### Authentification (`/api/auth`)
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/login` | Public | Connexion, reçoit JWT |
| GET | `/me` | auth | Profil utilisateur courant |
| POST | `/register` | superAdmin | Créer un compte admin |
| GET | `/localites` | Public | Liste des localités |

### Admin (`/api/admin`)
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/membres` | admin | Liste des membres (filtrable par localiteId, q) |
| POST | `/membres` | admin | Créer un membre |
| PUT | `/membres/:id` | admin | Modifier un membre |
| DELETE | `/membres/:id` | admin | Supprimer un membre |
| GET | `/evenements` | admin | Liste des événements |
| POST | `/evenements` | admin | Créer un événement |
| GET | `/evenements/:id` | admin | Détail d'un événement |
| PUT | `/evenements/:id` | admin | Modifier un événement |
| POST | `/evenements/:id/inscrire` | admin | Inscrire un membre |
| POST | `/evenements/:id/cotisation` | admin | Ajouter une cotisation |
| POST | `/evenements/:id/cloturer` | admin | Clôturer un événement |
| DELETE | `/cotisations/:id` | admin | Supprimer une cotisation |
| DELETE | `/inscriptions/:id` | admin | Supprimer une inscription |
| GET | `/historique` | admin | Historique des actions |
| GET | `/config` | admin | Configuration (dates inscription) |
| PUT | `/config` | admin | Mettre à jour la configuration |

### Super Admin (`/api/super-admin`)
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/dashboard` | superAdmin | Stats globales (membres, events, cotisations, etc.) |
| GET | `/utilisateurs` | superAdmin | Liste des utilisateurs |
| POST | `/utilisateurs/:id/toggle` | superAdmin | Activer/désactiver un compte |
| PUT | `/utilisateurs/:id/role` | superAdmin | Changer le rôle |
| DELETE | `/utilisateurs/:id` | superAdmin | Supprimer un utilisateur |
| GET | `/membres` | superAdmin | Tous les membres (toutes localités) |
| DELETE | `/membres/:id` | superAdmin | Supprimer un membre (avec ses paiements) |
| GET | `/compile` | superAdmin | Vue compilée (stats par événement) |
| GET | `/localites` | superAdmin | Liste des localités |
| POST | `/localites` | superAdmin | Créer une localité |
| DELETE | `/localites/:id` | superAdmin | Supprimer une localité |
| GET | `/activites` | superAdmin | Journal d'activités (filtrable) |
| GET | `/export` | superAdmin | Export JSON des stats |
| GET | `/export/membres-pdf` | superAdmin | PDF annuaire des membres |
| GET | `/stats/cotisations-recurrentes` | superAdmin | Stats détaillées par type |
| POST | `/seed` | superAdmin | Initialiser/peupler la base (option `?force=true`) |

### Cotisations récurrentes (`/api/cotisations`)
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/types` | admin | Types de cotisation |
| POST | `/types` | admin | Créer un type |
| PUT | `/types/:id` | admin | Modifier un type |
| DELETE | `/types/:id` | admin | Supprimer un type |
| GET | `/types/:id/paiements` | admin | Paiements d'un type |
| POST | `/paiements` | admin | Enregistrer un paiement |
| DELETE | `/paiements/:id` | admin | Supprimer un paiement |
| GET | `/membres/:id/paiements` | admin | Paiements d'un membre |
| GET | `/paiements/recents` | admin | 50 derniers paiements |
| GET | `/stats` | admin | Stats par type |
| GET | `/export/:typeId` | admin | PDF par type de cotisation |
| GET | `/export-membre/:membreId` | admin | PDF par membre |

### Routes publiques (`/api/public`)
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/captcha` | Public | Générer un captcha (addition) |
| POST | `/inscription` | Public | S'inscrire à un événement |
| GET | `/evenements` | Public | Liste des événements ouverts |
| GET | `/evenements/:id` | Public | Détail d'un événement public |
| POST | `/membres` | Public | Devenir membre (avec captcha + rate limit) |
| GET | `/localites` | Public | Liste des localités |
| GET | `/config/membre` | Public | Statut inscription membre (ouvert/pas_encore/termine) |

### Autres
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/dashboard` | admin | Stats du dashboard admin |
| GET | `/dashboard/evenement/:id` | admin | Stats détaillées d'un événement |
| GET | `/dashboard/export/:id/:type` | admin | Export CSV/JSON d'un événement |
| GET/POST/PUT/DELETE | `/forms` | admin | CRUD formulaires dynamiques |
| GET | `/notifications` | admin | Notifications |
| GET | `/notifications/non-lues` | admin | Compteur non lues |
| PUT | `/notifications/:id/lire` | admin | Marquer comme lue |
| PUT | `/notifications/lire-toutes` | admin | Tout marquer lu |
| GET | `/export/membres` | Public | PDF liste des membres |
| GET | `/backup/info` | superAdmin | Infos sur la base |
| GET | `/backup/database` | superAdmin | Télécharger la base |
| GET | `/health` | Public | Healthcheck |

---

## Comptes par défaut (seed)

| Rôle | Username | Mot de passe |
|------|----------|-------------|
| Super Admin | `superadmin` | `admin123` |
| Admin | `admin1` | `admin123` |
| Admin | `admin2` | `admin123` |

---

## Captcha anti-bot

Le captcha maison génère une addition simple (ex: `3 + 7 = ?`).  
Le résultat est signé avec HMAC-SHA256 + sel horaire.  
Validé côté serveur avant toute inscription publique.  
Rate limiting : 10 requêtes/heure pour l'inscription membre.

---

## Export PDF

Bibliothèque PDFKit utilisée avec fonction utilitaire `drawTable()` pour les tableaux.  
Disponible pour :
- Annuaire des membres (super admin)
- Cotisations par type (admin)
- Cotisations par membre (admin)

---

## Déploiement (Render)

1. Créer un service Web sur Render (Node 20, région Frankfurt)
2. Build command : `npm install && npm run build`
3. Start command : `npm start`
4. Variable d'environnement : `JWT_SECRET` (auto-généré si absent)
5. Fichier `render.yaml` fourni pour déploiement automatique

---

## Scripts

```bash
npm run seed                  # Peupler la base avec des données de démo
npm run seed -- force         # Réinitialiser + peupler
cd frontend && npm run build  # Build production du frontend
cd backend && npm run dev     # Démarrer le backend en dev
```
