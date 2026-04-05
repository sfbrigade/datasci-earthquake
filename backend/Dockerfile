# syntax=docker/dockerfile:1

# Dockerfile for FastAPI

FROM python:3.11.4-slim AS mystage

# Install curl and certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

RUN echo 'ohboy' && dpkg -L curl

# Download the uv installer
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

COPY backend/pyproject.toml backend/uv.lock ./

# Ensure the installed uv binary is on the `PATH`
ENV PATH="/root/.local/bin/:$PATH"

# Install dependencies using uv
RUN uv sync --frozen
RUN touch mystage.txt
RUN echo 'mystage1' && pwd && ls -la 
RUN echo 'mystage2' && pwd && ls -la .venv

FROM python:3.11.4-slim AS python_base

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

WORKDIR /

COPY --from=mystage mystage.txt .
COPY --from=mystage .venv /.venv
RUN echo 'curly1' && pwd && ls -la usr/bin
COPY --from=curlimages/curl /usr/bin/curl /usr/bin
RUN echo 'curly2' && pwd && ls -la usr/bin

# Create a non-privileged user that the app will run under.
ARG UID=1001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

# Install curl and certificates
#RUN apt-get update && apt-get install -y --no-install-recommends \
#    curl ca-certificates && \
#    rm -rf /var/lib/apt/lists/*

# Ensure the public/data directory exists and has correct permissions
RUN mkdir -p /public/data && \
    chown -R appuser:appuser /public/data && \
    chmod -R 775 /public/data

COPY api /api

# Download the uv installer
#RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# Ensure the installed uv binary is on the `PATH`
ENV PATH="/root/.local/bin/:$PATH"

# Copy dependency files first for caching
#COPY backend/pyproject.toml backend/uv.lock ./

# Install dependencies using uv
#RUN uv sync --frozen

RUN echo 'regular stage0' && pwd && ls -la 
RUN echo 'regular stage1' && pwd && ls -la .venv

# uv sync creates a virtual environment in the root directory, add it to PATH
ENV VIRTUAL_ENV=/.venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Copy the source code into the container.
COPY backend ./backend

# Copy the pytest configuration file to ensure pytest logs are captured
# in the container to assert test results.
COPY pytest.ini .

RUN chmod +x ./backend/etl/startup.sh

# Switch to the non-privileged user to run the application.
USER appuser

# Expose the port that the application listens on.
EXPOSE 8000
