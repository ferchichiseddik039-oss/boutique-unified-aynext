#!/bin/bash
set -e

echo "🚀 Building frontend..."
cd frontend
npm install
npm run build

echo "📦 Copying build to root..."
cd ..
rm -rf build
mkdir -p build
cp -r frontend/build/* build/

echo "✅ Build completed successfully!"
