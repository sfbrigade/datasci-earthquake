#!/bin/bash
set -e

echo "=== Starting Backend Service ==="

# Function to wait for database
wait_for_db() {
    echo "Waiting for database to be ready..."
    
    # Use pg_isready to check if database is accepting connections
    while ! pg_isready -h db -p 5432 -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" > /dev/null 2>&1; do
        echo "Database is not ready yet. Waiting 2 seconds..."
        sleep 2
    done
    
    echo "Database is ready!"
    
    # Additional check: try to connect with Python
    python -c "
import os
import time
import psycopg2
from psycopg2 import OperationalError

max_retries = 30
for i in range(max_retries):
    try:
        conn = psycopg2.connect(
            host='db',
            database=os.environ['POSTGRES_DB'],
            user=os.environ['POSTGRES_USER'],
            password=os.environ['POSTGRES_PASSWORD']
        )
        conn.close()
        print('Database connection test successful!')
        break
    except OperationalError as e:
        print(f'Database connection attempt {i+1}/{max_retries} failed: {e}')
        if i < max_retries - 1:
            time.sleep(2)
        else:
            raise
"
}

# Install postgresql-client if not present (for pg_isready)
if ! command -v pg_isready &> /dev/null; then
    echo "Installing postgresql-client..."
    apt-get update && apt-get install -y postgresql-client
fi

# Wait for database
wait_for_db

echo "=== Running Database Initialization ==="
# Use the virtual environment Python (adjust path as needed)
if [ -f "/.venv/bin/python" ]; then
    PYTHON="/.venv/bin/python"
else
    PYTHON="python"
fi

echo "Using Python: $PYTHON"

# Run database initialization with retry logic
$PYTHON backend/database/init_db.py

echo "=== Running ETL Scripts ==="
$PYTHON backend/etl/liquefaction_data_handler.py
$PYTHON backend/etl/soft_story_properties_data_handler.py
$PYTHON backend/etl/tsunami_data_handler.py

echo "=== Starting FastAPI Server ==="
$PYTHON -m uvicorn api.index:app --host 0.0.0.0 --port 8000