# ====================================================================
# Visitor Pass System - Local Web Server (PowerShell)
# Zero-dependency static server. Run this by double-clicking or running
# in PowerShell: .\start-server.ps1
# ====================================================================

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Visitor Pass System - Local Web Server   " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$port = 8080
$started = $false
$listener = $null

# Loop to find an available port if 8080 is already in use
while (-not $started -and $port -lt 8100) {
    $listener = New-Object System.Net.HttpListener
    try {
        $localIp = "http://localhost:$port/"
        $listener.Prefixes.Add($localIp)
        $listener.Start()
        $started = $true
    }
    catch {
        $listener.Close()
        $port++
    }
}

if (-not $started) {
    Write-Host "Error: Could not find an open port between 8080 and 8100." -ForegroundColor Red
    exit
}

try {
    Write-Host "Server successfully started!" -ForegroundColor Green
    Write-Host "Access the system here: $localIp" -ForegroundColor Green
    Write-Host "---------------------------------------------"
    Write-Host "To STOP the server: Press Ctrl+C in this window" -ForegroundColor Yellow
    Write-Host "---------------------------------------------"

    # Automatically launch default browser
    Start-Process $localIp

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") {
            $urlPath = "/index.html"
        }

        # Convert URL path to a local file path
        $filePath = Join-Path $PSScriptRoot $urlPath.Replace("/", "\")

        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Identify MIME types
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".gif"  { "image/gif" }
                ".svg"  { "image/svg+xml" }
                ".json" { "application/json" }
                ".ico"  { "image/x-icon" }
                default { "application/octet-stream" }
            }

            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            # File not found (404)
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found")
            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $errBytes.Length
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.OutputStream.Close()
    }
}
catch {
    Write-Host "Server stopped or encountered an error: $_" -ForegroundColor Red
}
finally {
    if ($listener -ne $null) {
        $listener.Close()
    }
}
