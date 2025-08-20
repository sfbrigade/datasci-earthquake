#!/bin/bash
set -e

python backend/database/init_db.py
python backend/etl/liquefaction_data_handler.py
python backend/etl/soft_story_properties_data_handler.py
python backend/etl/tsunami_data_handler.py

# Start FastAPI
RELOAD_FLAG=""
if [ "${ENVIRONMENT}" = "development" ]; then
  RELOAD_FLAG="--reload"
fi
uvicorn api.index:app --host 0.0.0.0 --port 8000 $RELOAD_FLAG