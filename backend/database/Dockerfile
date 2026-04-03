# Dockerfile

# Use the official PostgreSQL image
FROM postgres:15


# Install PostGIS and dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    postgis postgresql-15-postgis-3 \
    && rm -rf /var/lib/apt/lists/*

# Expose the default Postgres port
EXPOSE 5432

# Start the database server with PostGIS enabled
CMD ["postgres"]
