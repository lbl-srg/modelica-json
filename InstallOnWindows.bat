@echo off

::*******************************************************************
:: Download and Install Node.js
::*******************************************************************
:: Download and install Node.js: https://nodejs.org/en/download/
:: Add nodejs folder to your "Path" environment

:: set MODELICAPATH

cd..
:: Install node package
echo ----------- Installing node package -----------
CALL npm install --save

:: Now you should be able to run the modelica-json parse. But firstly, need to make sure your system has
:: memory larger than 2048m
:: see in lib\modelicaToJSON.js: line 36-37

pause
