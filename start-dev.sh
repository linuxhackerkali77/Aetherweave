#!/bin/bash

echo "Starting AetherDash Development Environment..."
echo ""

echo "Installing dependencies..."
npm install
cd backend
npm install
cd ..

echo ""
echo "Starting development servers..."
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo ""

npm run dev