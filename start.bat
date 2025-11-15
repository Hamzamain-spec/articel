
@echo off
echo Installing dependencies...
call npm install

echo.
echo Starting the application...
echo The app will be available at http://localhost:5000
echo.
call npm run dev
