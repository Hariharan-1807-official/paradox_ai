@echo off
cd server
if not exist "node_modules" (
    echo Installing Server Dependencies...
    npm install
)
start "Paradox Backend" npm start
cd ..
if not exist "node_modules" (
    echo Installing Client Dependencies...
    npm install
)
echo Starting Paradox Frontend...
npm run dev
