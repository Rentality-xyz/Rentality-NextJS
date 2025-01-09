@echo off 

setlocal
call :setESC
cd..
set PROJECT_ID=rentality-app-428806

call firebase projects:list
echo:
echo %ESC%[91mMAKE SURE THAT YOU HAVE UPDATED THE CONFIGURATION OF GOOGLE ANALYTICS!!!%ESC%[0m
echo Deploying %ESC%[93m%PROJECT_ID%%ESC%[0m... Press any key to deploy ...
pause >nul

:: backup all .env* files
set backupFolder=.firebasebackup
echo Checking .env files ...
if not exist "%backupFolder%" (
    mkdir "%backupFolder%"
    echo Backup folder "%backupFolder%" created.
)
for %%f in (.env*) do (
    move "%%f" "%backupFolder%\"
    echo Moved %%f to %backupFolder%.
)

:: use project .env file
set PROJECT_ENV_FILENANE=.env.%PROJECT_ID%.local
echo Coping "deploy\%PROJECT_ENV_FILENANE%" to ".env" ...
copy deploy\%PROJECT_ENV_FILENANE% .env 

call firebase use %PROJECT_ID%
call firebase deploy
  
echo %PROJECT_ID% deployed successfully

:: restore .env* files
if not exist "%backupFolder%" (
    echo Backup folder "%backupFolder%" does not exist. No files to restore.
    pause
    exit /b
)
for %%f in ("%backupFolder%\*") do (
    move "%%f" ".\"
    echo Restored %%~nxf from %backupFolder%.
)

pause

:setESC
for /F "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do (
  set ESC=%%b
  exit /B 0
)
exit /B 0