@echo off
cd /d "%~dp0"
echo Starting ATHT_devv3 (ASP.NET Core + Microsoft SQL Server)...
echo Database: Server=localhost;Database=ATHT_StudentProjectDB
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:5080"
dotnet run --urls "http://localhost:5080"
pause
