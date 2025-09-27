@echo off
echo Starting KOL Platform Development Environment...

echo.
echo Starting Backend Server...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend Server...
start "Frontend" cmd /k "cd frontend-nextjs && npm run dev"

echo.
echo Development servers starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul