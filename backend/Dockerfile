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

WORKDIR /app

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

# Install curl (needed for health check in compose.yaml)
# and ca-certificates (lets the container verify HTTPS connections).
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Create public/data directory. Make appuser owner. Give write permission.
RUN mkdir -p /public/data && \
    chown -R appuser:appuser /public/data && \
    chmod -R 775 /public/data

# Install uv (fast Python package manager) from its official Docker image.
# (more secure and faster than the curl | sh installer)
COPY --from=ghcr.io/astral-sh/uv:0.11.2 /uv /usr/local/bin/uv

# Copy package manifests (pyproject.toml lists required packages, uv.lock pins exact versions).
# Note: copied before rest of backend so Docker can cache the installed dependencies layer. 
# On later builds, changes to app code will rebuild while packages will be reused, not reinstalled.
COPY backend/pyproject.toml backend/uv.lock ./

# Control whether development dependencies are installed at build time.
# Default is production mode (no dev dependencies) to keep the image small and
# reduce the runtime attack surface. Set `--build-arg INSTALL_DEV=true` to
# include dev deps when you need a development/CI image.
ARG INSTALL_DEV=false

# Install packages from uv.lock. When INSTALL_DEV=true the build includes
# dev dependencies; otherwise `--no-dev` is passed to omit them. `--no-install-project`
# keeps the dependency layer separate from the project install to improve caching.
# --frozen fails the build if lockfile is out of sync with pyproject.toml.
# --no-install-project skips installing the project itself, further isolating the dependency layer.
RUN --mount=type=cache,target=/root/.cache/uv \
    if [ "$INSTALL_DEV" = "true" ]; then \
        uv sync --frozen --no-install-project; \
    else \
        uv sync --frozen --no-install-project --no-dev; \
    fi

# Add the virtual environment, created above by uv sync, to PATH 
# (so Python uses the installed packages)
ENV VIRTUAL_ENV=/app/.venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Ensure Python can resolve backend and api packages regardless of how the container is run
# (e.g. docker run directly, Railway, CI — not just via compose.yaml)
ENV PYTHONPATH=/app

# Copy application source code after dependency install for Docker layer caching.
# Changes to source files won't invalidate the cached dependency layer above.
# --chown ensures appuser owns the files and can write to them (e.g. pytest cache, temp files)
COPY --chown=appuser:appuser api ./api
COPY --chown=appuser:appuser backend ./backend

# Copy pytest config so log capture (used by some tests) works inside the container.
COPY --chown=appuser:appuser pytest.ini .

# Make startup script executable (called by compose.yaml at container start).
RUN chmod +x ./backend/etl/startup.sh

# Switch from root to the non-privileged user to run app.
USER appuser

# Document the app's listening port (actual port mapping is in compose.yaml).
EXPOSE 8000
