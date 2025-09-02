#!/bin/bash

# Nova Shop Desk - Quick Start Script
# This script will help you start both frontend and backend services

echo "🚀 Nova Shop Desk - Quick Start"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to check if a port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $port is already in use"
        return 1
    else
        echo "✅ Port $port is available"
        return 0
    fi
}

# Check required ports
echo "🔍 Checking ports..."
check_port 8080 || exit 1
check_port 8000 || exit 1

# Check if .env file exists in backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  .env file not found in backend directory"
    if [ -f "backend/env.example" ]; then
        echo "📝 Creating .env from env.example..."
        cp backend/env.example backend/.env
        echo "✅ Created .env file"
        echo "⚠️  Please edit backend/.env and add your OpenAI API key"
        echo "   Then run this script again"
        exit 1
    else
        echo "❌ env.example not found. Please create backend/.env manually"
        exit 1
    fi
fi

# Check if OpenAI API key is configured
if grep -q "your_openai_api_key_here" backend/.env; then
    echo "❌ Please configure your OpenAI API key in backend/.env"
    echo "   Get your key from: https://platform.openai.com/api-keys"
    exit 1
fi

echo "✅ Environment configuration looks good"

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Install backend dependencies if needed
if [ ! -d "backend/__pycache__" ]; then
    echo "🐍 Installing backend dependencies..."
    cd backend
    pip install -r requirements.txt
    cd ..
fi

echo ""
echo "🎯 Starting services..."
echo ""

# Start backend in background
echo "🚀 Starting backend server..."
cd backend
python start.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "🌐 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Services started successfully!"
echo ""
echo "🌐 Frontend: http://localhost:8080"
echo "🔧 Backend: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "👋 All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for background processes
wait
