# Dockerfile

# Use the official PostgreSQL image
FROM postgres:15

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

RUN curl -LsSf https://astral.sh/uv/install.sh | sh

ENV PATH="/root/.local/bin/:$PATH"

COPY pyproject.toml uv.lock ./

RUN uv sync --only-group testytesty

#RUN pwd && ls -la /.venv/bin

#RUN source /.venv/bin/activate

#RUN echo 'ohhi' && pwd && ls -la /.venv/bin

# Install PostGIS and dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    postgis postgresql-15-postgis-3 \
    && rm -rf /var/lib/apt/lists/*

# Copy init scripts if necessary
COPY alembic alembic.ini .
COPY database/initdb-postgis.sh /docker-entrypoint-initdb.d/
COPY database/update-postgis.sh /docker-entrypoint-initdb.d/


RUN echo 'ohhiiiii' && pwd && ls -la 

# Make init scripts executable
RUN chmod +x /docker-entrypoint-initdb.d/initdb-postgis.sh \
    && chmod +x /docker-entrypoint-initdb.d/update-postgis.sh

# Expose the default Postgres port
EXPOSE 5432

# Start the database server with PostGIS enabled
#CMD ["postgres"]
CMD ["sh", "-c", "echo 'homey' && uv run alembic show current && postgres"]
