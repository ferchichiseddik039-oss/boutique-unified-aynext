#!/bin/bash
# Script de build pour Render

echo "🔧 Installation des dépendances..."
npm install

echo "📦 Build du frontend..."
cd frontend
npm install
npm run build
cd ..

echo "📁 Copie des fichiers build..."
mkdir -p build
cp -r frontend/build/* build/

echo "✅ Build terminé avec succès!"