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
COPY . /backend 
RUN echo 'pran' && pwd && ls -la
RUN echo 'prank' && pwd && ls -la backend
COPY database/initdb-postgis.sh /docker-entrypoint-initdb.d/
COPY database/update-postgis.sh /docker-entrypoint-initdb.d/


RUN echo 'ohhiiiii' && pwd && ls -la 

# Make init scripts executable
RUN chmod +x /docker-entrypoint-initdb.d/initdb-postgis.sh \
    && chmod +x /docker-entrypoint-initdb.d/update-postgis.sh

# Expose the default Postgres port
EXPOSE 5432


RUN useradd goldenwhoopi
RUN grep 'goldenwhoopi' /etc/passwd
RUN ls -l /var/lib/postgresql/data
#USER goldenwhoopi
# Start the database server with PostGIS enabled
#WORKDIR /backend
#CMD ["sh", "-c", "echo 'homey' && postgres && uv run alembic --config backend/alembic.ini show current"]
RUN whoami

CMD ["postgres"]
#CMD ["sh", "-c", "echo 'homey' && postgres"]
