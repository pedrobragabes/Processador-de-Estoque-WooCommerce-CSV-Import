@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
echo Processador Athos - WooCommerce v4.1.1
node processador-estoque-v4.1.js
set "resultado=%errorlevel%"
if not "%resultado%"=="0" (
    echo A conversao falhou. Confira a mensagem acima; nao importe uma pasta pendente.
) else (
    echo Conversao concluida. A pasta desta execucao foi informada acima.
)
pause
exit /b %resultado%
