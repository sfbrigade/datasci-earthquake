# Dockerfile

# Use the official PostgreSQL image
FROM postgres:15


ARG UID=1001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser


# Install PostGIS and dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    postgis postgresql-15-postgis-3 \
    && rm -rf /var/lib/apt/lists/*

COPY rrr.sql .
COPY mystart.sh .
RUN echo 'before' && ls -l
RUN chmod +x mystart.sh
RUN echo 'after' && ls -l
ENV PGPASSWORD=password

#CMD ["psql", "-f", "rrr.sql", "postgresql://postgres:password@db:5432/qsdatabase"]
#CMD ["pg_dump", "--inserts", "-h", "db", "-U", "postgres", "-f", "myiii.sql", "-t", "liquefaction_zones", "qsdatabase"]
#CMD echo 'hiiii' && pg_dump --data-only --inserts -h db -U postgres -f myiii.sql -t liquefaction_zones qsdatabase && echo 'dddone' && ls -la && pwd && postgres  
USER appuser

RUN mkdir haha

RUN pwd && ls -l
CMD ["./mystart.sh"]
