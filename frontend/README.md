# Frontend Boutique Vêtements - Vercel

## Déploiement sur Vercel

### Configuration requise

1. **Variables d'environnement** :
   ```
   REACT_APP_API_URL=https://votre-backend-railway.up.railway.app
   REACT_APP_ENVIRONMENT=production
   ```

### Déploiement

1. **Via Vercel CLI** :
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

2. **Via GitHub** :
   - Connectez votre repository GitHub à Vercel
   - Configurez les variables d'environnement dans l'interface Vercel
   - Le déploiement se fera automatiquement

3. **Via l'interface Vercel** :
   - Uploadez le dossier `frontend-vercel`
   - Configurez les variables d'environnement
   - Déployez

### Configuration

- **Build Command** : `npm run build`
- **Output Directory** : `build`
- **Install Command** : `npm install`

### Structure

- `src/` : Code source React
- `public/` : Fichiers statiques
- `build/` : Build de production (généré)
- `vercel.json` : Configuration Vercel

### API Backend

Ce frontend communique avec le backend déployé sur Railway.
Assurez-vous que l'URL du backend est correctement configurée dans les variables d'environnement.

