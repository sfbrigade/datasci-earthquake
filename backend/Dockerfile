# syntax=docker/dockerfile:1

# Dockerfile for FastAPI

ARG PYTHON_VERSION=3.11.4
FROM python:${PYTHON_VERSION}-slim AS python_base

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

WORKDIR /

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
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Ensure the public/data directory exists and has correct permissions
RUN mkdir -p /public/data && \
    chown -R appuser:appuser /public/data && \
    chmod -R 775 /public/data

COPY api /api

# Download the uv installer
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# Ensure the installed uv binary is on the `PATH`
ENV PATH="/root/.local/bin/:$PATH"

# Copy dependency files first for caching
COPY backend/pyproject.toml backend/uv.lock ./

# Install dependencies using uv
RUN uv sync --frozen

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
