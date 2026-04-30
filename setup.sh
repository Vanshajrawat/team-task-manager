#!/bin/bash
# Setup script for Team Task Manager

echo "🚀 Setting up Team Task Manager application..."
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend
echo "Installing backend dependencies..."
npm install

if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update backend/.env with your configuration:"
    echo "   - MONGODB_URI"
    echo "   - JWT_SECRET"
fi

cd ..

# Setup Frontend
echo ""
echo "📦 Setting up Frontend..."
cd frontend
echo "Installing frontend dependencies..."
npm install

if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "ℹ️  Frontend .env is configured to use local backend"
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update backend/.env with your MongoDB URI and JWT secret"
echo "2. Make sure MongoDB is running"
echo "3. Run: npm run dev (or npm run server & npm run client in separate terminals)"
echo ""
echo "Happy coding! 🎉"
