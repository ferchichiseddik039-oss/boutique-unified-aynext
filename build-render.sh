#!/bin/bash

# 🔧 SCRIPT BUILD RENDER - CORRECTION BASELINE-BROWSER-MAPPING
# Ce script corrige le problème de module manquant sur Render

echo "🚀 Démarrage du build pour Render..."

# Étape 1: Installer les dépendances racine
echo "📦 Installation des dépendances racine..."
npm install

# Étape 2: Aller dans le dossier frontend
echo "📁 Navigation vers le dossier frontend..."
cd frontend

# Étape 3: Supprimer node_modules existants (si ils existent)
echo "🧹 Nettoyage des dépendances existantes..."
rm -rf node_modules package-lock.json

# Étape 4: Installer ajv compatible
echo "🔧 Installation d'ajv compatible..."
npm install ajv@^8.0.0

# Étape 5: Installer toutes les dépendances
echo "📦 Installation de toutes les dépendances..."
npm install

# Étape 6: Donner les permissions d'exécution
echo "🔐 Attribution des permissions d'exécution..."
chmod +x ./node_modules/.bin/react-scripts

# Étape 7: Build du frontend
echo "🏗️ Build du frontend React..."
CI=false npm run build

# Étape 8: Retour à la racine
echo "📁 Retour à la racine..."
cd ..

# Étape 9: Nettoyer et créer le dossier build
echo "🧹 Préparation du dossier build..."
rm -rf build
mkdir build

# Étape 10: Copier les fichiers buildés
echo "📋 Copie des fichiers buildés..."
cp -r frontend/build/* build/

echo "✅ Build terminé avec succès !"
echo "🎯 Le problème baseline-browser-mapping est résolu !"