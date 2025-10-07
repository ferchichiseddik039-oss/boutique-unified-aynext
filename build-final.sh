#!/bin/bash
# Script de build simple et fonctionnel pour Render

set -e  # Arrêter en cas d'erreur

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
chmod +x node_modules/.bin/* || true

# Build simple avec plus de debug
echo "🏗️ Build React..."
echo "📁 Répertoire actuel: $(pwd)"
echo "📄 Contenu avant build:"
ls -la

CI=false GENERATE_SOURCEMAP=false npx react-scripts build

echo "📄 Contenu après build:"
ls -la

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
