#!/bin/bash
# Script de build pour Render

echo "🔧 Installation des dépendances..."
npm install

echo "📦 Build du frontend..."
cd frontend

# Nettoyer les dépendances pour éviter les conflits
echo "🧹 Nettoyage des dépendances..."
rm -rf node_modules package-lock.json

echo "📥 Installation des dépendances..."
npm install

# Corriger les permissions
echo "🔐 Correction des permissions..."
chmod +x node_modules/.bin/*

echo "🏗️ Build avec npx..."
SKIP_PREFLIGHT_CHECK=true CI=false GENERATE_SOURCEMAP=false npx react-scripts build

cd ..

echo "✅ Build terminé avec succès!"