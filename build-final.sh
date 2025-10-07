#!/bin/bash
# Script de build simple et fonctionnel pour Render

echo "🚀 Démarrage du build..."

# Installation des dépendances backend
echo "📦 Installation backend..."
cd backend
npm install
cd ..

# Build du frontend
echo "📦 Build frontend..."
cd frontend

# Nettoyage simple
echo "🧹 Nettoyage..."
rm -rf node_modules package-lock.json

# Installation simple
echo "📥 Installation frontend..."
npm install

# Permissions
echo "🔐 Permissions..."
chmod +x node_modules/.bin/*

# Build simple
echo "🏗️ Build React..."
CI=false GENERATE_SOURCEMAP=false npx react-scripts build

cd ..

echo "✅ Build terminé avec succès!"
