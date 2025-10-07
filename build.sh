#!/bin/bash
# Script de build pour Render

echo "🔧 Installation des dépendances..."
npm install

echo "📦 Build du frontend..."
cd frontend
npm install

# Corriger les permissions
echo "🔐 Correction des permissions..."
chmod +x node_modules/.bin/*

echo "🏗️ Build avec npx..."
CI=false npx react-scripts build

cd ..

echo "✅ Build terminé avec succès!"