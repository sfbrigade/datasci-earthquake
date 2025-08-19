#!/bin/bash
set -e

# uv automatically creates a virtual environment called .venv in the backend Dockerfile
# when we run uv sync there. In order to use .venv and all the packages we have installed
# into it via this backend Dockerfile, we must specify the path to the python interpreter
# inside .venv
VENV_PYTHON="/.venv/bin/python"

# Check if the python interpreter exists
if [ ! -f "$VENV_PYTHON" ]; then
    echo "Error: Python interpreter not found at $VENV_PYTHON. The virtual environment might not have been created correctly." >&2
    exit 1
fi

# We then use this virtual environment python, rather than the system python
$VENV_PYTHON backend/database/init_db.py
$VENV_PYTHON backend/etl/liquefaction_data_handler.py
$VENV_PYTHON backend/etl/soft_story_properties_data_handler.py
$VENV_PYTHON backend/etl/tsunami_data_handler.py

# Start FastAPI
$VENV_PYTHON -m uvicorn api.index:app --host 0.0.0.0 --port 8000