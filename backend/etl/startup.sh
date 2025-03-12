#!/bin/bash
set -e

# Clear data before running the app
rm -rf /public/data/*

# Start FastAPI
uvicorn api.index:app --host 0.0.0.0 --port 8000 &

python backend/database/init_db.py
python backend/etl/liquefaction_data_handler.py
python backend/etl/soft_story_properties_data_handler.py
python backend/etl/tsunami_data_handler.py

# Wait for the FastAPI process (to keep the container alive)
wait