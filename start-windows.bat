@echo off
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo Node.js is not installed. Install Node.js 22 LTS and try again.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing dependencies. Internet access is required for the first launch.
  call npm install
  if %errorlevel% neq 0 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)
echo Starting Operation Riyaz at http://localhost:5173
call npm run dev
pause
