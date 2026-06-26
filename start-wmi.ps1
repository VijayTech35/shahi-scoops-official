# Use WMI to spawn truly detached processes
$backendCmd = "cmd.exe /c cd /d C:\Users\yadav\Downloads\shahi-scoops-production\shahi-final\server && node index.js > server.log 2>&1"
$frontendCmd = "cmd.exe /c cd /d C:\Users\yadav\Downloads\shahi-scoops-production\shahi-final && npx vite --port 5173 --host > vite.log 2>&1"

# Kill existing
Get-WmiObject -Class Win32_Process -Filter "Name='node.exe'" | ForEach-Object { $_.Terminate() | Out-Null }
Start-Sleep -Seconds 2

# Spawn via WMI (truly detached from parent shell)
$backendProc = ([WMICLASS]"\\.\root\cimv2:Win32_Process").Create($backendCmd)
$frontendProc = ([WMICLASS]"\\.\root\cimv2:Win32_Process").Create($frontendCmd)

Write-Host "Backend PID: $($backendProc.ProcessId)"
Write-Host "Frontend PID: $($frontendProc.ProcessId)"

Start-Sleep -Seconds 10

$backendUp = Test-NetConnection -ComputerName 127.0.0.1 -Port 5000 -InformationLevel Quiet
$frontendUp = Test-NetConnection -ComputerName 127.0.0.1 -Port 5173 -InformationLevel Quiet
Write-Host "Backend (5000): $backendUp"
Write-Host "Frontend (5173): $frontendUp"

Get-Process node -ErrorAction SilentlyContinue | Format-Table Id, ProcessName, StartTime
