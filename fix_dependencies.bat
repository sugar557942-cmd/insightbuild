@echo off
echo Cleaning up environment...
del package-lock.json
if exist node_modules rmdir /s /q node_modules
echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo npm install failed! trying with legacy-peer-deps...
    call npm install --legacy-peer-deps
)
if %errorlevel% neq 0 (
    echo Installation failed again. Please check your network or npm configuration.
    pause
    exit /b %errorlevel%
)
echo Dependencies installed successfully.
echo Starting development server...
npm run dev
pause
