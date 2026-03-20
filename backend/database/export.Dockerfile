# Dockerfile

# Use the official PostgreSQL image
FROM postgres:15


# Install PostGIS and dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    postgis postgresql-15-postgis-3 \
    && rm -rf /var/lib/apt/lists/*

COPY rrr.sql .

RUN echo 'whoopi' && pwd && ls -l

CMD ["psql", "-f", "rrr.sql", "postgresql://postgres:password@db:5432/qsdatabase"]
