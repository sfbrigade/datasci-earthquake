#!/bin/bash
set -e
set -x   # Trace each command as it executes

echo "===== Starting startup.sh ====="

# uv automatically creates a virtual environment called .venv in the backend Dockerfile
VENV_PYTHON="/.venv/bin/python"
echo "Using virtual environment python at $VENV_PYTHON"

# Check if the python interpreter exists
if [ ! -f "$VENV_PYTHON" ]; then
    echo "Error: Python interpreter not found at $VENV_PYTHON. The virtual environment might not have been created correctly." >&2
    exit 1
fi

# Run each Python script with diagnostics
echo "Running init_db.py"
$VENV_PYTHON backend/database/init_db.py || { echo "init_db.py failed"; exit 1; }

echo "Running liquefaction_data_handler.py"
$VENV_PYTHON backend/etl/liquefaction_data_handler.py || { echo "liquefaction_data_handler.py failed"; exit 1; }

echo "Running soft_story_properties_data_handler.py"
$VENV_PYTHON backend/etl/soft_story_properties_data_handler.py || { echo "soft_story_properties_data_handler.py failed"; exit 1; }

echo "Running tsunami_data_handler.py"
$VENV_PYTHON backend/etl/tsunami_data_handler.py || { echo "tsunami_data_handler.py failed"; exit 1; }

echo "===== startup.sh finished ====="

# Start FastAPI
RELOAD_FLAG=""
if [ "${ENVIRONMENT}" = "development" ]; then
  RELOAD_FLAG="--reload"
fi
echo "Starting FastAPI server"
$VENV_PYTHON -m uvicorn api.index:app --host 0.0.0.0 --port 8000 $RELOAD_FLAG || { echo "FastAPI failed to start"; exit 1; }
