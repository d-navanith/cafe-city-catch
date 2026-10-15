@echo off
title Catch-a-Paw Game Server
echo ========================================================
echo       Starting Catch-a-Paw Game Server (Python)
echo ========================================================
echo.

if exist "venv\Scripts\python.exe" (
    echo [INFO] Activating virtual environment...
    call venv\Scripts\activate.bat
    start "" http://localhost:8000
    python server.py
) else (
    echo [INFO] Running with system Python...
    start "" http://localhost:8000
    python server.py
)

pause
