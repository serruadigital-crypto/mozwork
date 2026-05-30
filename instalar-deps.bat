@echo off
title Instalando dependencias MozWork
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"

echo A instalar @supabase/ssr, @supabase/supabase-js, lucide-react, clsx, tailwind-merge...
echo.

"C:\Program Files\nodejs\npm.cmd" install @supabase/ssr @supabase/supabase-js lucide-react clsx tailwind-merge

echo.
echo Instalacao concluida! Fecha esta janela e clica em "iniciar.bat"
pause
