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

ENV PGPASSWORD=password

CMD ["psql", "-f", "rrr.sql", "postgresql://postgres:password@db:5432/qsdatabase"]
#CMD ["pg_dump", "--inserts", "-h", "db", "-U", "postgres", "-f", "myiii.sql", "-t", "liquefaction_zones", "qsdatabase"]
#CMD echo 'hiiii' && pg_dump --data-only --inserts -h db -U postgres -f myiii.sql -t liquefaction_zones qsdatabase && echo 'dddone' && ls -la && pwd && grep -i 'insert' myiii.sql && postgres  
