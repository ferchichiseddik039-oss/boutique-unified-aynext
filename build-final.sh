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

# Vérifier que le build a réussi
if [ -d "build" ]; then
  echo "✅ Dossier build créé avec succès"
  echo "📄 Fichiers dans build:"
  ls -la build/
  
  # Vérifier les fichiers essentiels
  if [ -f "build/index.html" ]; then
    echo "✅ index.html trouvé"
  else
    echo "❌ index.html manquant"
  fi
  
  if [ -d "build/static" ]; then
    echo "✅ Dossier static trouvé"
    echo "📄 Fichiers JS dans static/js:"
    ls -la build/static/js/ || echo "Aucun fichier JS trouvé"
  else
    echo "❌ Dossier static manquant"
  fi
else
  echo "❌ Dossier build non créé - Build échoué"
  exit 1
fi

cd ..

echo "✅ Build terminé avec succès!"
