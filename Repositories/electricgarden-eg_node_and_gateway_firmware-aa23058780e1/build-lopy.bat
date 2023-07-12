@echo off
REM Build Base Station website.
pushd basestation\www
set ERRORLEVEL=
CALL npm run build
if errorlevel 1 goto BuildFailure
popd
set ERRORLEVEL=
pushd basestation\lopy-src\www
if errorlevel 1 goto BuildFailure
set ERRORLEVEL=
gzip -f -9 *.js *.html
if errorlevel 1 goto BuildFailure
popd
REM Copy Py Src 
robocopy /S ./basestation/lopy-src ./tmp/basestation/lopy-src /XD __pycache__
robocopy /S ./sensornode/  ./tmp/sensornode  /XD __pycache__
robocopy /S ./shared/      ./tmp/basestation /XD __pycache__
robocopy /S ./shared/      ./tmp/sensornode  /XD __pycache__
rmdir /S /Q ./build/basestation/lopy-src/www
rmdir /S /Q ./tools/custom_firmware/src/flash/*
robocopy /S /MIR ./tmp/sensornode/lopy-src ./tools/custom_firmware/src/flash/node
robocopy /S /MIR ./tmp/basestation/lopy-src ./tools/custom_firmware/src/flash/gateway
rmdir /S /Q tmp
pushd tools\
CALL bash ./build_custom_firmware.sh
popd
goto BuildSuccess
:BuildFailure
popd
echo Failed to build basestation website
pause
:BuildSuccess
