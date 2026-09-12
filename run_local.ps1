<#
.SYNOPSIS
    PropLedger Enterprise - Local Full-Stack Launcher
.DESCRIPTION
    Launches the Spring Boot 3.3 Backend and React 19 Frontend locally.
#>

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  PropLedger Enterprise - 100% Local Full-Stack Launcher   " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check PostgreSQL Connectivity
Write-Host "[1/4] Checking PostgreSQL database on port 5432..." -ForegroundColor Yellow
$pgTest = Test-NetConnection -ComputerName "localhost" -Port 5432 -InformationLevel Quiet -WarningAction SilentlyContinue

if ($pgTest) {
    Write-Host "  -> PostgreSQL is listening on port 5432. [OK]" -ForegroundColor Green
} else {
    Write-Host "  -> [NOTICE] PostgreSQL does not appear to be listening on localhost:5432." -ForegroundColor Yellow
    Write-Host "     Please ensure PostgreSQL is started with a database named 'propledger'." -ForegroundColor Yellow
    Write-Host "     Credentials configured in .env (DB_USERNAME=postgres, DB_PASSWORD=postgres)." -ForegroundColor Yellow
}

# 2. Check Java Version
Write-Host "[2/4] Checking Java installation..." -ForegroundColor Yellow
$javaVer = java -version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  -> Java runtime detected. [OK]" -ForegroundColor Green
} else {
    Write-Host "  -> [WARNING] 'java' command not found in PATH. Please install JDK 21+." -ForegroundColor Red
}

# 3. Launch Spring Boot Backend
Write-Host "[3/4] Starting Spring Boot Backend (http://localhost:8080)..." -ForegroundColor Yellow
$backendDir = Join-Path $PSScriptRoot "propledger-backend"
$mvnCmd = Join-Path $PSScriptRoot "apache-maven-3.9.6\bin\mvn.cmd"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting PropLedger Backend...' -ForegroundColor Green; cd '$backendDir'; & '$mvnCmd' spring-boot:run"

# 4. Launch React Frontend
Write-Host "[4/4] Starting React Vite Frontend (http://localhost:5173)..." -ForegroundColor Yellow
$frontendDir = Join-Path $PSScriptRoot "propledger-frontend"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting PropLedger Frontend...' -ForegroundColor Green; cd '$frontendDir'; npm run dev"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  PropLedger is starting in dedicated console windows!       " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  * React Web Application:  http://localhost:5173" -ForegroundColor White
Write-Host "  * Spring Boot REST API:   http://localhost:8080" -ForegroundColor White
Write-Host "  * Swagger API Docs:       http://localhost:8080/swagger-ui.html" -ForegroundColor White
Write-Host ""
Write-Host "  DEFAULT LOGIN CREDENTIALS:" -ForegroundColor Yellow
Write-Host "  * Username / Email:       admin  OR  admin@propledger.io" -ForegroundColor White
Write-Host "  * Password:               Password@123" -ForegroundColor White
Write-Host "  * Role:                   ROLE_ADMIN" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Green
