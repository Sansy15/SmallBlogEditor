# Run the backend server
# Use: .\run.ps1  or  powershell -File run.ps1
Set-Location $PSScriptRoot
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
