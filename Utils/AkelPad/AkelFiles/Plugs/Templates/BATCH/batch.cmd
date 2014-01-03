::::CARET
@ECHO OFF 
:: < Script definition > 

:: check parameters 
IF "%1"=="" GOTO :NoParam 

:: main stuff here 
::::CARET

EXIT /B %ERRORLEVEL% 

:NoParam 
ECHO %~n0. Command line error: "%*" 
EXIT /B 1