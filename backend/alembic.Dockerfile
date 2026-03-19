ARG PYTHON_VERSION=3.11.4
FROM python:${PYTHON_VERSION}-slim AS python_base

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

# Install curl and certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Download the uv installer
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# Ensure the installed uv binary is on the `PATH`
ENV PATH="/root/.local/bin/:$PATH"

COPY pyproject.toml uv.lock ./
COPY . /backend

RUN echo 'hi' && pwd && ls -la
RUN echo 'hiagain' && pwd && ls -l backend

# Install dependencies using uv
#RUN uv sync --only-group testytesty
RUN uv sync --frozen

RUN echo 'hiagainoh' && pwd && ls -la .venv/bin

# uv sync creates a virtual environment in the root directory, add it to PATH
ENV VIRTUAL_ENV=/.venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

#CMD ["uv run alembic --config backend/alembic.ini show current"]
#CMD ["uv run alembic show current"]

RUN echo 'OHBOY' && echo $PATH

#RUN . .venv/bin/activate

#CMD ["alembic", "--config", "backend/alembic.ini", "show", "current"]
CMD ["alembic", "--config", "backend/alembic.ini", "upgrade", "head"]

