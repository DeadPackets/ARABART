REM Disable echoing of commands and clear the screen
@ECHO OFF
CLS
ECHO Loading libraries...

REM Most demos need ARABART running, so let's run it automatically
cd c:\ARCHIVE\ARABART
ARABART.EXE 2>/dev/null
cd c:\ARCHIVE

REM Welcome message
CLS
ECHO Welcome to ARABART!
ECHO A collection of my father's (Yasser Awad) old DOS programs
ECHO Each directory resembles a certain project, with a README.TXT explaining the project and how to run it.
ECHO Enjoy!
