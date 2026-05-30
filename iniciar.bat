@echo off
title MozWork - Servidor
cd /d "%~dp0"

:: Adicionar Node.js ao PATH
set "PATH=C:\Program Files\nodejs;%PATH%"

echo.
echo  ================================
echo   MozWork - Configurando...
echo  ================================
echo.

:: Verificar se next existe
if not exist "node_modules\next\package.json" (
    echo [1/2] A instalar dependencias... aguarda 2-3 minutos...
    "C:\Program Files\nodejs\npm.cmd" install
    echo.
)

echo [2/2] A iniciar servidor...
echo.
"C:\Program Files\nodejs\npm.cmd" run dev

pause
