@echo off
echo 🚀 Building frontend...
cd frontend
npm install
npm run build

echo 📦 Copying build to root...
cd ..
if exist build rmdir /s /q build
mkdir build
xcopy /E /I frontend\build build

echo ✅ Build completed successfully!
