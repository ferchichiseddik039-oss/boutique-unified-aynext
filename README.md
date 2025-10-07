# Boutique Vêtements - AYNEXT

Application e-commerce complète avec personnalisation de vêtements.

## 🚀 Démarrage Rapide

### Installation
```bash
# Installer les dépendances backend
cd backend
npm install

# Installer les dépendances frontend
cd ../frontend
npm install
```

### Développement
```bash
# Démarrer le backend (port 5001)
cd backend
npm run dev

# Démarrer le frontend (port 3000)
cd frontend
npm start
```

### Production
```bash
# Build du frontend
cd frontend
npm run build

# Démarrer le serveur unifié
npm start
```

## 🛠️ Technologies

- **Frontend**: React 18, Tailwind CSS
- **Backend**: Node.js, Express
- **Base de données**: MongoDB Atlas
- **Authentification**: JWT

## 📁 Structure

```
boutique-unified/
├── backend/          # API Express
├── frontend/         # Application React
└── README.md
```

## 🔧 Configuration

1. Créer un fichier `.env` dans le dossier `backend/` :
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
```

2. Créer un fichier `.env` dans le dossier `frontend/` :
```
REACT_APP_API_URL=http://localhost:5001
```