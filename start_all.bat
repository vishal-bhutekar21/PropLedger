@echo off
title PropLedger - Local Full-Stack Launcher
color 0A

echo ============================================================
echo   PropLedger Enterprise - 100%% Local Full-Stack Launcher
echo ============================================================
echo.

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%propledger-backend"
set "FRONTEND_DIR=%ROOT_DIR%propledger-frontend"
set "MVN_CMD=%ROOT_DIR%apache-maven-3.9.6\bin\mvn.cmd"

echo [1/3] Starting Spring Boot 3.3 Backend on port 8080...
start "PropLedger Backend [Spring Boot :8080]" cmd /k "cd /d ""%BACKEND_DIR%"" && ""%MVN_CMD%"" spring-boot:run"

echo [2/3] Starting React 19 Frontend on port 5173...
start "PropLedger Frontend [Vite React :5173]" cmd /k "cd /d ""%FRONTEND_DIR%"" && npm run dev"

echo [3/3] Initializing local servers...
timeout /t 3 /nobreak >nul

echo.
echo ============================================================
echo   PropLedger is running in dedicated console windows!
echo ============================================================
echo   * React Web Application: http://localhost:5173
echo   * Spring Boot REST API:  http://localhost:8080
echo   * Swagger API Docs:      http://localhost:8080/swagger-ui.html
echo.
echo   DEFAULT LOGIN CREDENTIALS:
echo   * Username / Email:      admin  (or admin@propledger.io)
echo   * Password:              Password@123
echo   * Role:                  ROLE_ADMIN
echo ============================================================
echo.
echo Press any key to open http://localhost:5173 in your default browser...
pause >nul
start http://localhost:5173
