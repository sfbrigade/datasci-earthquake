#!/bin/bash

set -e

# Perform all actions as $POSTGRES_USER
export PGUSER="$POSTGRES_USER"

POSTGIS_VERSION="${POSTGIS_VERSION%%+*}"

# Load PostGIS into both template_database and $POSTGRES_DB
for DB in template_postgis "$POSTGRES_DB" "${@}"; do
    echo "Ensuring PostGIS extensions in '$DB'"
    psql --dbname="$DB" -c "
        -- Upgrade PostGIS (includes raster)
        CREATE EXTENSION IF NOT EXISTS postgis;
        ALTER EXTENSION postgis UPDATE;

        -- Upgrade Topology
        CREATE EXTENSION IF NOT EXISTS postgis_topology;
        ALTER EXTENSION postgis_topology UPDATE;

        -- Install Tiger dependencies in case not already installed
        CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
        -- Upgrade US Tiger Geocoder
        CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder;
        ALTER EXTENSION postgis_tiger_geocoder UPDATE;
    "
done
