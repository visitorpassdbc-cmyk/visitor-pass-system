@echo off
title Visitor Pass System - 24/7 Online Server
cd /d "C:\.gemini\antigravity\scratch\visitor-pass-system"
cls
echo ====================================================================
echo        VISITOR PASS MANAGEMENT SYSTEM - ONLINE SERVER
echo ====================================================================
echo.
echo Starting Backend API and Local Database...

:: Start Node Server in background
start /B "VPS-Node-Server" "C:\Program Files\nodejs\node.exe" server.js

echo Server running on http://localhost:8080
echo.
echo Starting Secure Cloudflare Tunnel for Free Public HTTPS Access...
echo ====================================================================
echo.

:: Start Cloudflare Tunnel
"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:8080

pause
