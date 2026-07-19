@echo off
echo Backend start ho raha hai...
start cmd /k "cd C:\Users\Dell\OneDrive\Desktop\FYP\backend && python -m uvicorn main:app --reload --port 8000"

echo Frontend start ho raha hai...
start cmd /k "cd C:\Users\Dell\OneDrive\Desktop\FYP\Frontend && npm run dev"

echo Browser khul raha hai...
timeout /t 5
start http://localhost:5173
