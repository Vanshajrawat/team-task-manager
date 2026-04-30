@echo off
REM Setup script for Team Task Manager (Windows)

echo.
echo Updating Team Task Manager application...
echo.

REM Setup Backend
echo Installing backend dependencies...
cd backend
call npm install

if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo Please update backend\.env with your configuration:
    echo    - MONGODB_URI
    echo    - JWT_SECRET
)

cd ..

REM Setup Frontend
echo.
echo Installing frontend dependencies...
cd frontend
call npm install

if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo Frontend .env is configured to use local backend
)

cd ..

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Update backend\.env with your MongoDB URI and JWT secret
echo 2. Make sure MongoDB is running
echo 3. Run: npm run dev
echo.
echo Happy coding!
