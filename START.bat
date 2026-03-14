@echo off
echo.
echo  =========================================
echo    PhoneWheel - Starting Server...
echo  =========================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
  echo  ERROR: Node.js is not installed!
  echo.
  echo  Please download and install it from:
  echo  https://nodejs.org
  echo.
  pause
  exit /b 1
)

echo  Installing dependencies...
call npm install
echo.
echo  Starting server...
echo.
node server/server.js
pause
