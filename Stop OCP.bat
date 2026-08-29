@echo off
echo Stopping OCP e-Guide...
wsl bash -c "screen -S ocp-backend -X quit 2>/dev/null; screen -S ocp-frontend -X quit 2>/dev/null; echo Done."
echo Services stopped.
pause
