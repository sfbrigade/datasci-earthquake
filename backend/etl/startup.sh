#!/bin/bash
python backend/database/init_db.py
python backend/etl/address_data_handler.py
python backend/etl/landslide_data_handler.py
python backend/etl/liquefaction_data_handler.py
python backend/etl/seismic_data_handler.py
python backend/etl/soft_story_properties_data_handler.py
python backend/etl/tsunami_data_handler.py