#!/bin/bash
set -e

echo "🚀 Building complete application for Render..."

# Install backend dependencies first
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies and build
echo "📦 Installing frontend dependencies..."
cd frontend
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

echo "✅ Complete build finished successfully!"
