# syntax=docker/dockerfile:1
# (tells Docker to use the latest stable Dockerfile parser)

# ========================================
# Dockerfile for FastAPI backend
# ========================================

# Get a slim Linux OS with only Python and its dependencies.
# (from Docker Hub official library)
ARG PYTHON_VERSION=3.11.4
FROM python:${PYTHON_VERSION}-slim AS python_base

# Prevents Python from writing .pyc files.
# (no cache reuse benefit in a short-lived container)
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

# Install curl (needed for uv installer and health check) 
# and ca-certificates (lets the container verify HTTPS connections).
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Create public/data directory. Make appuser owner. Give write permission.
RUN mkdir -p /public/data && \
    chown -R appuser:appuser /public/data && \
    chmod -R 775 /public/data

# Copy the FastAPI app entry point (api/index.py).
COPY api /api

# Download and execute uv installer
# (uv is a fast, Rust-based Python package manager)
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# Add uv to PATH for "uv sync" later.
ENV PATH="/root/.local/bin/:$PATH"

# Copy package manifests (pyproject.toml lists required packages, uv.lock pins exact versions).
# Note: copied before rest of backend so Docker can cache the installed dependencies layer. 
# On later builds, changes to app code will rebuild while packages will be reused, not reinstalled.
COPY backend/pyproject.toml backend/uv.lock ./

# Install packages from uv.lock.
# The --frozen flag makes the build fail if lockfile is out of sync with pyproject.toml.
RUN uv sync --frozen

# Add the virtual environment, created above by uv sync, to PATH 
# (so Python uses the installed packages)
ENV VIRTUAL_ENV=/.venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Copy backend source code now that dependencies were installed in previous layer.
COPY backend ./backend

# Copy pytest config so log capture (used by some tests) works inside the container.
COPY pytest.ini .

# Make startup script executable (called by compose.yaml at container start).
RUN chmod +x ./backend/etl/startup.sh

# Switch from root to the non-privileged user to run app.
USER appuser

# Document the app's listening port (actual port mapping is in compose.yaml).
EXPOSE 8000
