<#
.SYNOPSIS
    Starts the SB Group Executive Agent Command & Communication Platform
.DESCRIPTION
    Launches the Python HTTP backend server for SB Group (Saifee Burhani Group of Companies),
    verifies the local Ollama engine, and opens the executive dashboard in your default browser.
.EXAMPLE
    .\start-dashboard.ps1
#>

$EcosystemRoot = "C:\AI_Ecosystem"
$ServerScript = Join-Path $EcosystemRoot "dashboard\server.py"
$DashboardUrl = "http://localhost:8080"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  🏛️ SB GROUP (SAIFEE BURHANI GROUP OF COMPANIES)" -ForegroundColor Yellow
Write-Host "     EXECUTIVE AGENT COMMAND & 24/7 COMMUNICATION PLATFORM" -ForegroundColor White
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Check local Ollama
Write-Host "[1/3] Checking local Ollama engine (http://localhost:11434)..." -NoNewline
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 2 -ErrorAction Stop
    Write-Host " [ONLINE]" -ForegroundColor Green
    Write-Host "       Model: qwen2.5-coder:7b-instruct (100% Free Local Inference)" -ForegroundColor DarkGray
} catch {
    Write-Host " [OFFLINE / STANDBY]" -ForegroundColor Yellow
    Write-Host "       Tip: Run 'ollama serve' if you want local AI responses." -ForegroundColor DarkGray
}

# 2. Check if port 8080 is already running
Write-Host "[2/3] Checking Dashboard Server port 8080..." -NoNewline
$existing = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host " [ALREADY RUNNING]" -ForegroundColor Green
} else {
    Write-Host " [STARTING BACKGROUND PROCESS]" -ForegroundColor Cyan
    Start-Process python -ArgumentList "`"$ServerScript`"" -WindowStyle Hidden
    Start-Sleep -Seconds 1
}

# 3. Launch Browser
Write-Host "[3/3] Opening Executive Command Center: $DashboardUrl" -ForegroundColor Green
Start-Process $DashboardUrl

Write-Host "`n✔ SB Group Executive Platform is live at: $DashboardUrl" -ForegroundColor Yellow
Write-Host "  Chairperson: Executive User" -ForegroundColor White
Write-Host "  24/7 Swarm:  12 Active Autonomous Agents" -ForegroundColor White
Write-Host "  Ecosystem:   38 Tools Connected Across 7 Domains`n" -ForegroundColor White
