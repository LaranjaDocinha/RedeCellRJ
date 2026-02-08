# RedecellRJ - Automated Deploy Script (Windows PowerShell)

Write-Host "🚀 Starting Deployment Process..." -ForegroundColor Cyan

$root = Get-Location

# 1. Backend Preparation
Write-Host "`n📦 Preparing Backend..." -ForegroundColor Yellow
Set-Location "$root\backend"
Write-Host "  - Installing dependencies..."
npm install --quiet
Write-Host "  - Running Database Migrations..."
npm run migrate:up
Write-Host "  - Generating Swagger Documentation..."
npm run swagger
Write-Host "  - Building Backend (TypeScript)..."
npm run build

# 2. Frontend Preparation
Write-Host "`n📦 Preparing Frontend..." -ForegroundColor Yellow
Set-Location "$root\frontend"
Write-Host "  - Installing dependencies..."
npm install --quiet
Write-Host "  - Building Frontend (Vite)..."
npm run build

# 3. Finalization
Set-Location $root
Write-Host "`n✅ Deployment successfully prepared!" -ForegroundColor Green
Write-Host "To start the services:" -ForegroundColor White
Write-Host "  Backend: cd backend; npm run dev" -ForegroundColor Gray
Write-Host "  Frontend: cd frontend; npm run dev" -ForegroundColor Gray
Write-Host "  Check the build folder in frontend/dist" -ForegroundColor Gray
