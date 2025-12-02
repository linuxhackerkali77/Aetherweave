@echo off
echo Starting AetherDash Development Environment...
echo.

echo Installing dependencies...
call npm install
cd backend
call npm install
cd ..

echo.
echo Starting development servers...
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:4000
echo.

call npm run dev