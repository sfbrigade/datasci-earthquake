#!/bin/bash
# filepath: scripts/start_db.sh

# Start only the main PostGIS database container in detached mode
docker compose up -d db

# Show status
docker compose ps db

#docker system prune -a --volumes
#PYTHONPATH=. bash backend/etl/startup.sh