# syntax=docker/dockerfile:1

#Dockerfile for FastAPI

ARG PYTHON_VERSION=3.11.4
FROM python:${PYTHON_VERSION}-slim as python_base

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

WORKDIR /

# Create a non-privileged user that the app will run under.
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

# Install curl
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Ensure the public/data directory exists and is writeable
RUN mkdir -p /public/data && chmod -R 777 /public/data

COPY requirements.txt /backend/requirements.txt

COPY api /api

# Install Python dependencies using a cache mount
RUN --mount=type=cache,target=/root/.cache/pip \
    python -m pip install --no-cache-dir -r /backend/requirements.txt

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

# Run the FastAPI application
CMD ["uvicorn", "api.index:app", "--host", "0.0.0.0", "--port", "8000"]
