@echo off
REM Start backend in its own detached window
start "Shahi Backend" /MIN cmd /c "cd /d C:\Users\yadav\Downloads\shahi-scoops-production\shahi-final\server && node index.js > server.log 2>&1"

REM Start frontend in its own detached window
start "Shahi Frontend" /MIN cmd /c "cd /d C:\Users\yadav\Downloads\shahi-scoops-production\shahi-final && npx vite --port 5173 --host > vite.log 2>&1"
