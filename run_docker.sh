#!/bin/bash
# Easy Docker deployment script

echo "🐳 Building and running Material Search System in Docker..."
echo ""

# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY not set in environment"
    echo ""
    echo "Please set it first:"
    echo "  export OPENAI_API_KEY='your-key-here'"
    echo ""
    echo "Or create .env file:"
    echo "  cp .env.example .env"
    echo "  nano .env  # Add your key"
    echo "  source .env"
    echo ""
    exit 1
fi

echo "✓ API key found"
echo ""

# Build the image
echo "📦 Building Docker image..."
docker build -t material-search:latest .

echo ""
echo "🚀 Starting container..."
docker run -d \
  -p 5001:5001 \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  --name material-search \
  --restart unless-stopped \
  material-search:latest

echo ""
echo "✅ Container started!"
echo ""
echo "🌐 Access the app at: http://localhost:5001"
echo ""
echo "📋 Useful commands:"
echo "  View logs:    docker logs -f material-search"
echo "  Stop:         docker stop material-search"
echo "  Remove:       docker rm material-search"
echo ""
