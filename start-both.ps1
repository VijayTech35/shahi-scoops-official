Add-Type -AssemblyName System.Web
$ErrorActionPreference = 'Continue'

# Kill any existing node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

# Start backend
$backendPsi = New-Object System.Diagnostics.ProcessStartInfo
$backendPsi.FileName = "node"
$backendPsi.Arguments = "index.js"
$backendPsi.WorkingDirectory = "C:\Users\yadav\Downloads\shahi-scoops-production\shahi-final\server"
$backendPsi.UseShellExecute = $false
$backendPsi.CreateNoWindow = $true
$backendPsi.RedirectStandardOutput = $true
$backendPsi.RedirectStandardError = $true
$backendProc = [System.Diagnostics.Process]::Start($backendPsi)

# Start frontend (vite)
$frontendPsi = New-Object System.Diagnostics.ProcessStartInfo
$frontendPsi.FileName = "npx"
$frontendPsi.Arguments = "vite --port 5173 --host"
$frontendPsi.WorkingDirectory = "C:\Users\yadav\Downloads\shahi-scoops-production\shahi-final"
$frontendPsi.UseShellExecute = $false
$frontendPsi.CreateNoWindow = $true
$frontendPsi.RedirectStandardOutput = $true
$frontendPsi.RedirectStandardError = $true
$frontendProc = [System.Diagnostics.Process]::Start($frontendPsi)

# Save PIDs to file for later cleanup
@{ Backend = $backendProc.Id; Frontend = $frontendProc.Id } | ConvertTo-Json | Out-File "C:\Users\yadav\Downloads\shahi-scoops-production\shahi-final\server\pids.json"

Write-Host "Backend PID: $($backendProc.Id)"
Write-Host "Frontend PID: $($frontendProc.Id)"

# Wait for both to bind
Start-Sleep -Seconds 6

# Verify
$backendUp = Test-NetConnection -ComputerName 127.0.0.1 -Port 5000 -InformationLevel Quiet
$frontendUp = Test-NetConnection -ComputerName 127.0.0.1 -Port 5173 -InformationLevel Quiet
Write-Host "Backend (5000): $backendUp"
Write-Host "Frontend (5173): $frontendUp"
