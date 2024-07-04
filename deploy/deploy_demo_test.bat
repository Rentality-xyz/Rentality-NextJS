@echo off 

setlocal
call :setESC

cd..
call firebase projects:list
set PROJECT_ID=rentality-demo-test
echo:
echo %ESC%[91mMAKE SURE THAT YOU HAVE UPDATED THE CONFIGURATION OF GOOGLE ANALYTICS!!!%ESC%[0m
echo Deploying %ESC%[93m%PROJECT_ID%%ESC%[0m... Press any key to deploy ...
pause >nul
call firebase use %PROJECT_ID%
call firebase deploy
echo:
echo %PROJECT_ID% deployed successfully
pause

:setESC
for /F "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do (
  set ESC=%%b
  exit /B 0
)
exit /B 0