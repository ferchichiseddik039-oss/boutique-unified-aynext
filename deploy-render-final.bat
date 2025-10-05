@echo off
echo 🚀 DÉPLOIEMENT RENDER - ACCESSIBLE SUR INTERNET
echo ================================================

echo.
echo 📋 OBJECTIF : Rendre votre boutique accessible sur Internet
echo.

echo 🌐 OUVERTURE DU GUIDE DE DÉPLOIEMENT...
start DEPLOIEMENT-RENDER-IMMEDIAT.md

echo.
echo 📋 ÉTAPES À SUIVRE SUR RENDER :
echo.
echo 1. 🌐 Allez sur https://render.com
echo 2. 📦 Cliquez sur "New +" → "Web Service"
echo 3. 🔗 Connectez le repository : ferchichiseddik039-oss/boutique-unified-aynext
echo 4. ⚙️ Configuration :
echo    - Name: boutique-aynext-unified
echo    - Language: Node
echo    - Branch: main
echo    - Root Directory: (LAISSER VIDE)
echo    - Build Command: npm run build
echo    - Start Command: npm start
echo    - Instance Type: Free
echo 5. 🔑 Variables d'environnement :
echo    - MONGODB_URI: mongodb+srv://ferchichiseddik039:52141707@cluster0.6rx5.mongodb.net/boutique-vetements?retryWrites=true&w=majority
echo    - JWT_SECRET: aynext_jwt_secret_2024_secure_key
echo    - NODE_ENV: production
echo    - PORT: 10000
echo 6. 🚀 Cliquez sur "Create Web Service"
echo 7. ⏱️ Attendez 5-8 minutes
echo.
echo 🎯 RÉSULTAT : Votre boutique sera accessible sur :
echo https://boutique-aynext-unified.onrender.com
echo.
echo ✅ VOTRE BOUTIQUE SERA ACCESSIBLE SUR INTERNET !
echo Tous les utilisateurs pourront y accéder depuis n'importe où.
echo.
pause
