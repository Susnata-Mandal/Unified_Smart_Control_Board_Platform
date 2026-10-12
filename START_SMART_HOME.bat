@echo off
title Unified Smart Control Hub - Launch System
color 0B
echo ========================================================
echo   UNIFIED SMART CONTROL HUB v2.0 - STARTUP SYSTEM
echo ========================================================
echo.
echo [1/3] Navigating to web application directory...
cd /d "%~dp0\web"

if not exist "node_modules\" (
    echo [2/3] First-time setup detected. Installing dependencies ^(npm install^)...
    call npm install
) else (
    echo [2/3] Dependencies verified.
)

echo [3/3] Launching Web Application on http://localhost:5173 ...
echo.
echo --------------------------------------------------------
echo   Dashboard will open in your default browser.
echo   Login Credentials: admin / admin123
echo   Press Ctrl+C in this terminal window to stop the server.
echo --------------------------------------------------------
echo.

start "" "http://localhost:5173"
call npm run dev -- --host --port 5173
pause
