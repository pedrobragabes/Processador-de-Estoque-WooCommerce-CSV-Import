@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
node visualizar-logs.js
set "resultado=%errorlevel%"
echo Para historico: npm run logs -- historico 7
echo Para arquivo: npm run logs -- arquivo "execucao_DATA_IDENTIFICADOR\log_execucao_DATA.json"
pause
exit /b %resultado%
