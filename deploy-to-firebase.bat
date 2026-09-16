@echo off
echo ========================================
echo Deploying Visitor Pass to Firebase Hosting...
echo ========================================
cd /d "%~dp0"
node deploy.js
pause
