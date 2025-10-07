#!/bin/bash
# Script de build final et définitif pour Render

set -e  # Arrêter en cas d'erreur

echo "🚀 Démarrage du build final..."

# Installation des dépendances backend
echo "📦 Installation backend..."
cd backend
npm install --production
cd ..

# Build du frontend
echo "📦 Build frontend..."
cd frontend

# Nettoyage complet
echo "🧹 Nettoyage complet..."
rm -rf node_modules package-lock.json

# Installation avec configuration optimisée
echo "📥 Installation frontend..."
npm install --legacy-peer-deps --force --no-audit --no-fund

# Vérification des permissions
echo "🔐 Vérification permissions..."
chmod +x node_modules/.bin/* || true

# Build avec configuration minimale
echo "🏗️ Build React..."
SKIP_PREFLIGHT_CHECK=true \
CI=false \
GENERATE_SOURCEMAP=false \
DISABLE_ESLINT_PLUGIN=true \
npm run build

cd ..

echo "✅ Build terminé avec succès!"
echo "🎉 Application prête pour le déploiement!"
