#!/bin/bash
set -e

# Create /public/data if it doesn't exist
mkdir -p /public/data

# Optionally set permissions (only if needed)
# Uncomment the lines below if you run into permission issues.
chown -R appuser:appuser /public/data
chmod -R 750 /public/data

python backend/database/init_db.py
python backend/etl/liquefaction_data_handler.py
python backend/etl/soft_story_properties_data_handler.py
python backend/etl/tsunami_data_handler.py

# Start FastAPI
uvicorn api.index:app --host 0.0.0.0 --port 8000 