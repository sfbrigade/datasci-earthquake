# ========================================
# Dockerfile for PostGIS database
# ========================================

# Get the official PostgreSQL 15 image from Docker Hub library.
FROM postgres:15

# Install PostGIS and its PostgreSQL 15 integration.
# (spatial db extension for geographic queries)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    postgis postgresql-15-postgis-3 \
    && rm -rf /var/lib/apt/lists/*

# Copy init scripts that enable PostGIS on first container start.
COPY initdb-postgis.sh /docker-entrypoint-initdb.d/
COPY update-postgis.sh /docker-entrypoint-initdb.d/

# verify row counts from ETL; only used in the "dbscripts" workflow
COPY verify.sql .

# Make init scripts executable (called automatically by Postgres on first boot).
RUN chmod +x /docker-entrypoint-initdb.d/initdb-postgis.sh \
    && chmod +x /docker-entrypoint-initdb.d/update-postgis.sh

RUN mkdir dbscripts

# Expose the default Postgres port
# Document the default Postgres port (actual port mapping is in compose.yaml).
EXPOSE 5432

# Start the Postgres server. PostGIS is enabled by the init scripts above.
CMD ["postgres"]
