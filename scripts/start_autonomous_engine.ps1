# SB Group — Autonomous Ecosystem Startup & Orchestration Engine
# Starts all core services with zero external dependencies and logs to disk for VS Code visibility.

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   SB GROUP SOVEREIGN AUTONOMOUS BUSINESS ECOSYSTEM         " -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

$WorkspaceRoot = "c:\AI_Ecosystem"
$LogsDir = Join-Path $WorkspaceRoot "logs"
if (-not (Test-Path $LogsDir)) { New-Item -ItemType Directory -Path $LogsDir | Out-Null }

# 1. Clean up existing processes on port 8080 and 8000
Write-Host "[*] Checking active ports 8080 and 8000..." -ForegroundColor Gray
Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Milliseconds 500

# 2. Launch SB Group Executive Dashboard (Port 8080)
Write-Host "[+] Launching SB Group Executive Dashboard on port 8080..." -ForegroundColor Green
$DashboardLog = Join-Path $LogsDir "dashboard.log"
$DashProc = Start-Process python -ArgumentList "$WorkspaceRoot\dashboard\server.py" -WorkingDirectory $WorkspaceRoot -RedirectStandardOutput $DashboardLog -RedirectStandardError $DashboardLog -PassThru -WindowStyle Hidden

# 3. Launch TITAN Labs Product Intelligence API (Port 8000)
Write-Host "[+] Launching TITAN Labs API & Affiliate Gateway on port 8000..." -ForegroundColor Green
$TitanLog = Join-Path $LogsDir "titan_backend.log"
$TitanProc = Start-Process python -ArgumentList "$WorkspaceRoot\titan_backend\server.py" -WorkingDirectory $WorkspaceRoot -RedirectStandardOutput $TitanLog -RedirectStandardError $TitanLog -PassThru -WindowStyle Hidden

Start-Sleep -Seconds 2

# 4. Verify Endpoints
$DashOnline = $false
$TitanOnline = $false

try {
    $res = Invoke-RestMethod -Uri "http://localhost:8080/api/status" -TimeoutSec 3
    if ($res.status -eq "ONLINE") { $DashOnline = $true }
} catch {}

try {
    $res2 = Invoke-RestMethod -Uri "http://localhost:8000/api/status" -TimeoutSec 3
    if ($res2.status -eq "ONLINE") { $TitanOnline = $true }
} catch {}

Write-Host ""
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
if ($DashOnline) {
    Write-Host "[✓] Dashboard Hub:    http://localhost:8080 (ONLINE, PID: $($DashProc.Id))" -ForegroundColor Cyan
} else {
    Write-Host "[!] Dashboard Hub:    Starting on http://localhost:8080..." -ForegroundColor Yellow
}

if ($TitanOnline) {
    Write-Host "[✓] TITAN Labs API:   http://localhost:8000 (ONLINE, PID: $($TitanProc.Id))" -ForegroundColor Cyan
} else {
    Write-Host "[!] TITAN Labs API:   Starting on http://localhost:8000..." -ForegroundColor Yellow
}

Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "Logs live streaming to:" -ForegroundColor Gray
Write-Host "  - $DashboardLog" -ForegroundColor DarkCyan
Write-Host "  - $TitanLog" -ForegroundColor DarkCyan
Write-Host "Open folder in VS Code to watch live code and telemetry updates!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
