#!/bin/bash

echo "🚀 Setting up Reme IDE services..."

# Create required directories
mkdir -p screenshots/baselines
mkdir -p screenshots/test-results
mkdir -p logs

# Start ChromaDB (in background if not already running)
if ! pgrep -f "chroma" > /dev/null; then
    echo "📊 Starting ChromaDB..."
    # ChromaDB will be started by the application when needed
    echo "ChromaDB configured for startup"
else
    echo "✅ ChromaDB already running"
fi

# Check if Ollama is available (optional)
if command -v ollama &> /dev/null; then
    echo "🤖 Ollama detected, pulling recommended models..."
    ollama pull qwen2.5-coder:7b &
    ollama pull llama3.2:3b &
    ollama pull codegemma:7b &
else
    echo "ℹ️  Ollama not found - will use OpenAI models only"
fi

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
npx playwright install chromium firefox webkit

# Run database migrations
echo "📚 Setting up database..."
npm run db:push

echo "✅ Services setup complete!"
echo ""
echo "🎯 To get started:"
echo "1. Run: npm run dev (starts the development server)"
echo "2. Run: npm run test:visual (runs Playwright visual tests)"
echo "3. Access: http://localhost:5000"
echo ""
echo "📝 Required environment variables:"
echo "- OPENAI_API_KEY (for AI features)"
echo "- CHROMA_HOST (optional, defaults to localhost:8000)"
echo "- OLLAMA_HOST (optional, defaults to localhost:11434)"