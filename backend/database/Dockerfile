# Dockerfile

# Use the official PostgreSQL image
FROM postgres:15

# Install PostGIS and dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    postgis postgresql-15-postgis-3 \
    && rm -rf /var/lib/apt/lists/*

RUN echo 'crazysteak1' && pwd && ls -l var/cache
RUN echo 'crazysteak2' && pwd && ls -l var/cache/apt
RUN echo 'crazysteak3' && pwd && ls -l var/cache/apt/archives
RUN echo 'crazysteak4' && pwd && ls -l var/cache/apt/archives/partial


# Copy init scripts if necessary
COPY initdb-postgis.sh /docker-entrypoint-initdb.d/
COPY update-postgis.sh /docker-entrypoint-initdb.d/
COPY populate_db.sql .

# Make init scripts executable
RUN chmod +x /docker-entrypoint-initdb.d/initdb-postgis.sh \
    && chmod +x /docker-entrypoint-initdb.d/update-postgis.sh

# Expose the default Postgres port
EXPOSE 5432


# Start the database server with PostGIS enabled
CMD ["postgres"]
