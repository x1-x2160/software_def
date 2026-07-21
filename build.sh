#!/usr/bin/env bash
# Build script for Render deployment
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Build the React frontend
cd dashboard
npm install
npm run build
cd ..
