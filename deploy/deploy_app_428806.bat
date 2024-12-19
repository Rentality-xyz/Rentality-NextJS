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

echo Checking .env files ...
if exist .env.backup (	 
	echo %ESC%[91mFile .env.backup already exists. Maybe some deployment script runs in parallel!!!%ESC%[0m 
	pause
    exit /B 0    
) else (
	echo Creating backup env file 
	ren .env .env.backup 
)

set PROJECT_ENV_FILENANE=.env.%PROJECT_ID%.local
echo Coping "deploy\%PROJECT_ENV_FILENANE%" to ".env" ...
copy deploy\%PROJECT_ENV_FILENANE% .env 

call firebase use %PROJECT_ID%
call firebase deploy

if exist .env.backup (	 
	echo Returning backup env file...
	del .env 
	ren .env.backup .env 
) else ( 
	echo %ESC%[91mFile .env.backup already isn't exist!!!%ESC%[0m 
	pause
    exit /B 0
)

echo:
echo %PROJECT_ID% deployed successfully
pause

:setESC
for /F "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do (
  set ESC=%%b
  exit /B 0
)
exit /B 0