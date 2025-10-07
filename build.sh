#!/bin/bash
# Script de build pour Render

echo "🔧 Installation des dépendances..."
npm install

echo "📦 Build du frontend..."
cd frontend

# Nettoyer les dépendances pour éviter les conflits
echo "🧹 Nettoyage des dépendances..."
rm -rf node_modules package-lock.json

echo "📥 Installation des dépendances avec résolutions forcées..."
npm install --force

# Forcer l'installation des bonnes versions
echo "🔧 Installation des versions compatibles..."
npm install ajv@6.12.6 ajv-keywords@3.5.2 schema-utils@3.3.0 --save --force

# Corriger les permissions
echo "🔐 Correction des permissions..."
chmod +x node_modules/.bin/*

echo "🏗️ Build avec npx..."
SKIP_PREFLIGHT_CHECK=true CI=false GENERATE_SOURCEMAP=false npx react-scripts build

cd ..

echo "✅ Build terminé avec succès!"