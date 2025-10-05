#!/bin/bash
set -e

echo "🚀 Building frontend for Render (Alternative method)..."

# Install dependencies in frontend
cd frontend
echo "📦 Installing frontend dependencies..."
npm install

# Make react-scripts executable
echo "🔧 Setting permissions..."
chmod +x node_modules/.bin/react-scripts

# Build frontend using direct path
echo "🏗️ Building React app..."
./node_modules/.bin/react-scripts build

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
