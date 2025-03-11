#!/bin/bash
set -e

# Start FastAPI
uvicorn api.index:app --host 0.0.0.0 --port 8000 &

python backend/database/init_db.py
python backend/etl/liquefaction_data_handler.py
python backend/etl/soft_story_properties_data_handler.py
python backend/etl/tsunami_data_handler.py

