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

# Helper function to run a python script with logging and error handling
run_python_script() {
    local script_path="$1"
    echo "Running ${script_path}..."
    if ! "$VENV_PYTHON" "$script_path"; then
        echo "Error: ${script_path} failed." >&2
        exit 1
    fi
}

# Run init_db.py and check for SKIP_ETL in its output
ETL_SIGNAL=$($VENV_PYTHON backend/database/init_db.py | grep SKIP_ETL || true)

# Run Python ETL scripts with diagnostics, unless SKIP_ETL is indicated
if [ "$ETL_SIGNAL" != "SKIP_ETL" ]; then
    run_python_script backend/etl/liquefaction_data_handler.py
    run_python_script backend/etl/soft_story_properties_data_handler.py
    run_python_script backend/etl/tsunami_data_handler.py
fi

echo "===== startup.sh finished ====="

# Start FastAPI
RELOAD_FLAG=""
if [ "${ENVIRONMENT}" = "development" ]; then
  RELOAD_FLAG="--reload"
fi
echo "Starting FastAPI server"
$VENV_PYTHON -m uvicorn api.index:app --host 0.0.0.0 --port 8000 $RELOAD_FLAG || { echo "FastAPI failed to start"; exit 1; }
