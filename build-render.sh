#!/bin/bash
set -e

echo "🚀 Building frontend for Render..."

# Install dependencies in frontend
cd frontend
echo "📦 Installing frontend dependencies..."
npm install

# Build frontend using npx
echo "🏗️ Building React app..."
npx react-scripts build

# Go back to root
cd ..

# Clean and create build directory
echo "📁 Preparing build directory..."
rm -rf build
mkdir -p build

# Copy frontend build to root build directory
echo "📋 Copying build files..."
cp -r frontend/build/* build/

echo "✅ Build completed successfully!"
