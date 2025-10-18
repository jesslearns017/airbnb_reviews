# PowerShell script to start both backend and frontend servers

Write-Host "Starting Airbnb Sentiment Analysis Application..." -ForegroundColor Green

# Start backend in a new window
Write-Host "`nStarting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python app.py"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend in a new window
Write-Host "Starting Frontend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"

Write-Host "`nBoth servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "`nPress any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
