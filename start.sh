#!/bin/bash
# Startup script for Construction Materials Search System

echo "🚀 Starting Construction Materials Search System..."
echo ""
echo "📍 API will be available at: http://localhost:5001"
echo "🌐 Frontend will be available at: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$(dirname "$0")"
python api.py

