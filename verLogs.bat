@echo off
echo ============================================
echo   VISUALIZADOR DE LOGS - Legacy ERP CSV Converter
echo ============================================
echo.
echo 📋 Opcoes disponveis:
echo    1. Ver ultimo processamento (padrao)
echo    2. Ver historico dos ultimos 7 dias
echo    3. Ver historico personalizado
echo    4. Listar todos os logs
echo.

set /p opcao="Escolha uma opcao (1-4) ou Enter para padrao: "

if "%opcao%"=="" set opcao=1
if "%opcao%"=="1" goto ultimo
if "%opcao%"=="2" goto historico7
if "%opcao%"=="3" goto historico_custom
if "%opcao%"=="4" goto listar

:ultimo
echo.
echo 📊 Exibindo ultimo processamento...
node visualizar-logs.js
goto fim

:historico7
echo.
echo 📈 Exibindo historico dos ultimos 7 dias...
node visualizar-logs.js historico 7
goto fim

:historico_custom
echo.
set /p dias="Quantos dias? (1-30): "
if "%dias%"=="" set dias=7
echo 📈 Exibindo historico dos ultimos %dias% dias...
node visualizar-logs.js historico %dias%
goto fim

:listar
echo.
echo 📂 Listando todos os logs disponiveis...
node visualizar-logs.js
echo.
echo Para ver um log especifico, use:
echo node visualizar-logs.js arquivo nome_do_arquivo.json
goto fim

:fim
echo.
echo ============================================
echo   Visualizacao concluida!
echo ============================================
pause